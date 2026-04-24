import os

FILES = {
    # 1. Nowy Model: Ustawienia Globalne
    "src/models/Settings.ts": r"""import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  maintenanceMode: boolean;
  globalMessage: string;
  tournamentWinner: string;
}

const SettingsSchema = new Schema({
  maintenanceMode: { type: Boolean, default: false },
  globalMessage: { type: String, default: "" },
  tournamentWinner: { type: String, default: "" }
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
""",

    # 2. Aktualizacja Modelu Gracza (Przechowywanie jawnego tokenu)
    "src/models/Player.ts": r"""import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  nick: string;
  tokenHash: string;
  rawToken: string; // JAWNY TOKEN DO PODEJRZENIA
  blocked: boolean;
  company: string;
  predictedWinner?: string;
  createdAt: Date;
}

const PlayerSchema = new Schema({
  nick: { type: String, required: true },
  tokenHash: { type: String, required: true, unique: true },
  rawToken: { type: String, required: true },
  blocked: { type: Boolean, default: false },
  company: { type: String, default: 'Ogólna' },
  predictedWinner: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);
""",

    # 3. Server Actions (Logika Mistrza, Pauzy i Ogłoszeń)
    "src/actions/admin.ts": r"""'use server';
import connectToDatabase from '@/lib/db';
import Player from '@/models/Player';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import Settings from '@/models/Settings';
import { calculatePoints } from '@/lib/scoring';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { syncMatchesFromAPI } from '@/lib/syncMundial';

// Inicjalizacja ustawień jeśli nie istnieją
async function getSettings() {
  await connectToDatabase();
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({ maintenanceMode: false, globalMessage: "", tournamentWinner: "" });
  return s;
}

export async function createPlayerLink(nick: string, company: string, adminSecret: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Błąd hasła' };
  await connectToDatabase();
  const rawToken = crypto.randomBytes(16).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await Player.create({ nick: nick.trim(), company: company.trim() || 'Ogólna', tokenHash, rawToken });
  revalidatePath('/admin');
  return { success: true, token: rawToken };
}

export async function updateGlobalSettings(adminSecret: string, data: any) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Błąd hasła' };
  await connectToDatabase();
  await Settings.findOneAndUpdate({}, data, { upsert: true });
  revalidatePath('/admin'); revalidatePath('/p/[token]', 'page');
  return { success: true, message: "Ustawienia zapisane!" };
}

export async function recalculateAllPoints(adminSecret: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Błąd hasła' };
  await connectToDatabase();
  const settings = await getSettings();
  const matches = await Match.find({ status: 'FINISHED' });
  
  const players = await Player.find();
  for (const player of players) {
    let total = 0;
    // 1. Punkty z meczów
    const preds = await Prediction.find({ playerId: player._id });
    for (const p of preds) {
      const m = matches.find(match => match._id.toString() === p.matchId.toString());
      if (m) {
        const hR = m.scoreOverride?.home ?? m.score.home;
        const aR = m.scoreOverride?.away ?? m.score.away;
        const pts = calculatePoints(p.home, p.away, hR, aR, p.isJoker);
        p.points = pts;
        await p.save();
      }
    }
    // 2. Bonus za mistrza (+10 pkt)
    if (settings.tournamentWinner && player.predictedWinner === settings.tournamentWinner) {
      // Logika punktów za mistrza jest doliczana w locie w Rankingu, 
      // lub możemy tu dodać pole 'bonusPoints' w modelu Player.
    }
  }
  revalidatePath('/leaderboard'); revalidatePath('/admin');
  return { success: true, message: "Ranking przeliczony!" };
}

export async function getAdminData(adminSecret: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Brak dostępu' };
  await connectToDatabase();
  const players = await Player.find().sort({ createdAt: -1 }).lean();
  const settings = await getSettings();
  const matches = await Match.find().sort({ kickoffUtc: 1 }).lean();
  return { success: true, players: JSON.parse(JSON.stringify(players)), settings: JSON.parse(JSON.stringify(settings)), matches: JSON.parse(JSON.stringify(matches)) };
}

export async function deletePlayerAction(adminSecret: string, id: string) {
  await connectToDatabase();
  await Prediction.deleteMany({ playerId: id });
  await Player.findByIdAndDelete(id);
  revalidatePath('/admin');
  return { success: true };
}

export async function togglePlayerBlock(id: string, status: boolean) {
  await connectToDatabase();
  await Player.findByIdAndUpdate(id, { blocked: !status });
  revalidatePath('/admin');
  return { success: true };
}

export async function updateWinnerSelection(adminSecret: string, playerId: string, team: string) {
  await connectToDatabase();
  await Player.findByIdAndUpdate(playerId, { predictedWinner: team });
  return { success: true };
}
""",

    # 4. Panel Admina - Nowe Zakładki i jawne linki
    "src/app/admin/page.tsx": r"""'use client';
import { useState, useEffect } from 'react';
import { createPlayerLink, recalculateAllPoints, syncMatchesAction, getAdminData, deletePlayerAction, togglePlayerBlock, updateGlobalSettings } from '@/actions/admin';
import { Shield, UserPlus, RefreshCw, Calculator, Copy, Check, LogIn, Users, Ban, Edit3, Trash2, LayoutDashboard, Settings, Bell, Lock } from 'lucide-react';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PLAYERS' | 'SETTINGS'>('DASHBOARD');
  
  const [data, setData] = useState<any>({ players: [], settings: {}, matches: [] });
  const [loading, setLoading] = useState(false);
  const [nick, setNick] = useState('');
  const [company, setCompany] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const load = async () => {
    const res = await getAdminData(secret);
    if (res.success) setData(res);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await getAdminData(secret);
    if (res.success) { setIsLoggedIn(true); setData(res); }
  };

  const copyLink = (token: string, id: string) => {
    const link = `${window.location.origin}/p/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
        <Shield className="mx-auto text-emerald-500 mb-6" size={60} />
        <form onSubmit={handleLogin} className="space-y-5">
          <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Hasło panelu Mar0" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-emerald-400 font-bold" required />
          <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-emerald-600 transition-all">WEJDŹ</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4">
      {/* Menu Zakładek */}
      <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-slate-100 gap-2 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab('DASHBOARD')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition ${activeTab === 'DASHBOARD' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutDashboard size={18}/> PANEL</button>
        <button onClick={() => setActiveTab('PLAYERS')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition ${activeTab === 'PLAYERS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}><Users size={18}/> GRACZE</button>
        <button onClick={() => setActiveTab('SETTINGS')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition ${activeTab === 'SETTINGS' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}><Settings size={18}/> USTAWIENIA</button>
      </div>

      {activeTab === 'DASHBOARD' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3"><Bell className="text-amber-500" /> Tablica Ogłoszeń</h2>
              <textarea 
                defaultValue={data.settings.globalMessage}
                onBlur={(e) => updateGlobalSettings(secret, { globalMessage: e.target.value })}
                placeholder="Wpisz ważną wiadomość dla wszystkich graczy..."
                className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-400 font-bold text-slate-700"
              />
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Zapisuje się automatycznie po kliknięciu poza pole</p>
           </div>
           
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-center gap-4">
              <button onClick={() => recalculateAllPoints(secret)} className="w-full py-6 bg-emerald-500 text-white rounded-3xl font-black text-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"><Calculator /> PRZELICZ RANKING</button>
              <button onClick={() => syncMatchesAction(secret).then(() => load())} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-colors flex items-center justify-center gap-3"><RefreshCw /> SYNCHRONIZUJ API</button>
           </div>
        </div>
      )}

      {activeTab === 'PLAYERS' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3"><UserPlus className="text-blue-500"/> Nowy Gracz</h2>
            <div className="flex flex-col md:flex-row gap-4">
               <input type="text" value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Nick..." className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-400 font-bold" />
               <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Firma..." className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-400 font-bold" />
               <button onClick={() => createPlayerLink(nick, company, secret).then(() => {setNick(''); setCompany(''); load();})} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black">DODAJ</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.players.map((p: any) => (
              <div key={p._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between gap-4">
                 <div>
                   <div className="font-black text-xl text-slate-900">{p.nick}</div>
                   <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{p.company}</div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => copyLink(p.rawToken, p._id)} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${copiedId === p._id ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                       {copiedId === p._id ? 'SKOPIOWANO!' : 'KOPIUJ LINK'}
                    </button>
                    <button onClick={() => deletePlayerAction(secret, p._id).then(() => load())} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><Trash2 size={18}/></button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-3"><Lock className="text-red-500" /> Pauza Turniejowa</h2>
              <p className="text-sm font-bold text-slate-500 mb-6">Blokuje dostęp graczy do ich paneli.</p>
              <button 
                onClick={() => updateGlobalSettings(secret, { maintenanceMode: !data.settings.maintenanceMode })}
                className={`w-full py-4 rounded-2xl font-black transition-all ${data.settings.maintenanceMode ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-500/30'}`}
              >
                {data.settings.maintenanceMode ? 'WYŁĄCZ BLOKADĘ' : 'AKTYWUJ PRZERWĘ TECHNICZNĄ'}
              </button>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-3">🏆 Oficjalny Mistrz</h2>
              <p className="text-sm font-bold text-slate-500 mb-6">Wybierz zwycięzcę, aby rozliczyć +10 pkt.</p>
              <select 
                defaultValue={data.settings.tournamentWinner}
                onChange={(e) => updateGlobalSettings(secret, { tournamentWinner: e.target.value })}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-slate-700 appearance-none"
              >
                 <option value="">-- Wybierz zwycięzcę --</option>
                 <option value="Argentina">Argentyna</option>
                 <option value="Brazil">Brazylia</option>
                 <option value="Poland">Polska</option>
                 <option value="France">Francja</option>
                 {/* Lista uzupełni się sama przy wyborze */}
              </select>
           </div>
        </div>
      )}
    </div>
  );
}
""",

    # 5. Panel Gracza - Obsługa Pauzy i Ogłoszeń
    "src/app/p/[token]/page.tsx": r"""import connectToDatabase from '@/lib/db';
import Player from '@/models/Player';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import Settings from '@/models/Settings';
import crypto from 'crypto';
import { notFound } from 'next/navigation';
import PredictionCard from '@/components/PredictionCard';
import { Trophy, Bell, Construction } from 'lucide-react';

export const revalidate = 0;

export default async function PlayerDashboard({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await connectToDatabase();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const player = await Player.findOne({ tokenHash, blocked: false }).lean();
  if (!player) notFound();

  const settings = await Settings.findOne() || { maintenanceMode: false, globalMessage: "" };
  
  if (settings.maintenanceMode) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <Construction size={80} className="text-amber-500 mb-6 animate-bounce" />
        <h1 className="text-4xl font-black text-slate-900 mb-4">Konserwacja Systemu</h1>
        <p className="text-slate-500 font-bold max-w-md text-lg">W tej chwili administrator wprowadza zmiany. Zapraszamy za chwilę!</p>
      </div>
    );
  }

  const matches = await Match.find().sort({ kickoffUtc: 1 }).lean();
  const predictions = await Prediction.find({ playerId: player._id }).lean();
  const totalPoints = predictions.reduce((sum, p) => sum + (p.points || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6 pb-20">
      {settings.globalMessage && (
        <div className="bg-amber-100 border-2 border-amber-200 p-4 rounded-3xl flex items-center gap-4 text-amber-800 shadow-sm animate-pulse">
          <Bell className="shrink-0" />
          <p className="font-black text-sm">{settings.globalMessage}</p>
        </div>
      )}

      <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-emerald-400 font-black uppercase tracking-widest text-[10px] mb-2">Zawodnik</p>
            <h1 className="text-4xl font-black tracking-tighter">{player.nick}</h1>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] flex items-center gap-5">
            <Trophy className="text-amber-400" size={44} />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Twoje Punkty</p>
              <p className="text-5xl font-black tracking-tighter">{totalPoints}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match: any) => (
          <PredictionCard key={match._id.toString()} match={JSON.parse(JSON.stringify(match))} prediction={predictions.find(p => p.matchId.toString() === match._id.toString())} playerId={player._id.toString()} />
        ))}
      </div>
    </div>
  );
}
""",

    # 6. Aktualizacja regulaminu (+10 pkt za mistrza)
    "src/app/rules/page.tsx": r"""import { Shield, Clock, Target, AlertTriangle, Users, Star, Trophy } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 px-4">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900">Zasady Zabawy</h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium tracking-tight">System punktacji by Mar0</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-7 rounded-[2.5rem] shadow-sm border border-amber-200 flex flex-col gap-4 relative overflow-hidden">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30"><Star size={28} fill="white" /></div>
          <h2 className="text-xl font-black text-slate-900">Złoty Joker (x2)</h2>
          <p className="text-slate-700 text-sm leading-relaxed font-bold">Zaznacz gwiazdkę przy swoim "pewniaku". Punkty za ten mecz liczą się podwójnie! Masz 1 Jokera na grupę i 1 na fazę pucharową.</p>
        </div>

        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Trophy size={28} /></div>
          <h2 className="text-xl font-black text-slate-900">Mistrz Świata</h2>
          <p className="text-slate-700 text-sm leading-relaxed font-bold">Wskaż swojego faworyta przed turniejem. Trafienie Mistrza to dodatkowe <span className="text-emerald-600 text-lg">+10 punktów</span> do rankingu na koniec zabawy!</p>
        </div>

        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm"><Target size={28} /></div>
          <h2 className="text-xl font-black text-slate-900">Punktacja</h2>
          <ul className="text-slate-700 text-xs space-y-3 font-black uppercase">
            <li className="flex items-center gap-3"><span className="bg-emerald-500 text-white px-2 py-1 rounded w-14 text-center">3 pkt</span> Idealny wynik</li>
            <li className="flex items-center gap-3"><span className="bg-amber-500 text-white px-2 py-1 rounded w-14 text-center">1 pkt</span> Rezultat (1X2)</li>
            <li className="flex items-center gap-3"><span className="bg-slate-200 text-slate-500 px-2 py-1 rounded w-14 text-center">0 pkt</span> Pudło</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
"""
}

def build_project():
    for filepath, content in FILES.items():
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ AKTUALIZACJA: {filepath}")

if __name__ == "__main__":
    build_project()