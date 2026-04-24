import os

FILES = {
    # 1. Wymuszenie nowej ikony w Metadata
    "src/app/layout.tsx": r"""import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Trophy, CalendarDays, BookOpen, Home, Network } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mistrzostwa FIFA 2026",
  description: "Zabawa w typowanie wyników turnieju!",
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="pl">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/1/17/2026_FIFA_World_Cup_emblem.svg/1920px-2026_FIFA_World_Cup_emblem.svg.png" 
                alt="World Cup 2026 Logo" 
                className="h-10 w-auto object-contain invert brightness-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
              />
              <span className="text-xl md:text-2xl font-black tracking-wider text-emerald-400">
                Mistrzostwa FIFA 2026
              </span>
            </Link>
            <div className="flex gap-4 sm:gap-6 font-medium text-sm sm:text-base overflow-x-auto w-full md:w-auto justify-start md:justify-center pb-2 md:pb-0 scrollbar-hide">
              <Link href="/" className="hover:text-emerald-400 flex items-center gap-1 shrink-0 transition-colors"><Home size={18}/> Start</Link>
              <Link href="/schedule" className="hover:text-emerald-400 flex items-center gap-1 shrink-0 transition-colors"><CalendarDays size={18}/> Terminarz</Link>
              <Link href="/bracket" className="hover:text-emerald-400 flex items-center gap-1 shrink-0 transition-colors"><Network size={18}/> Drabinka</Link>
              <Link href="/leaderboard" className="hover:text-emerald-400 flex items-center gap-1 shrink-0 transition-colors"><Trophy size={18}/> Ranking</Link>
              <Link href="/rules" className="hover:text-emerald-400 flex items-center gap-1 shrink-0 transition-colors"><BookOpen size={18}/> Zasady</Link>
            </div>
          </div>
        </nav>
        <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <footer className="bg-slate-200 text-center py-8 text-slate-500 mt-auto border-t border-slate-300">
          <p className="font-black text-sm text-slate-800 tracking-widest uppercase mb-1">Mistrzostwa FIFA 2026 &copy; {new Date().getFullYear()}</p>
          <p className="text-xs font-bold">Stworzone by <span className="text-slate-900 font-black">Mar0</span></p>
        </footer>
      </body>
    </html>
  );
}
""",

    # 2. Akcje dla Jokera i Mistrza
    "src/actions/predictions.ts": r"""'use server';
import connectToDatabase from '@/lib/db';
import Prediction from '@/models/Prediction';
import Player from '@/models/Player';
import { revalidatePath } from 'next/cache';

export async function submitPrediction(payload: { playerId: string, matchId: string, home: number, away: number, isJoker: boolean }) {
  await connectToDatabase();
  try {
    await Prediction.findOneAndUpdate(
      { playerId: payload.playerId, matchId: payload.matchId },
      { home: payload.home, away: payload.away, isJoker: payload.isJoker, updatedAt: new Date() },
      { upsert: true }
    );
    revalidatePath('/p/[token]', 'page');
    return { success: true };
  } catch (error) {
    return { error: 'Błąd zapisu.' };
  }
}

export async function saveWinnerPrediction(playerId: string, team: string) {
  await connectToDatabase();
  try {
    await Player.findByIdAndUpdate(playerId, { predictedWinner: team });
    revalidatePath('/p/[token]', 'page');
    return { success: true };
  } catch (error) {
    return { error: 'Błąd zapisu mistrza.' };
  }
}
""",

    # 3. Karta Typowania z Jokerem
    "src/components/PredictionCard.tsx": r"""'use client';
import { useState } from 'react';
import { submitPrediction } from '@/actions/predictions';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import TeamFlag from './TeamFlag';
import { t, shortT } from '@/lib/translations';
import { Star } from 'lucide-react';

export default function PredictionCard({ match, prediction, playerId }: { match: any, prediction: any, playerId: string }) {
  const [home, setHome] = useState(prediction?.home ?? '');
  const [away, setAway] = useState(prediction?.away ?? '');
  const [isJoker, setIsJoker] = useState(prediction?.isJoker ?? false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const isLocked = new Date() > new Date(new Date(match.kickoffUtc).getTime() - 12 * 60 * 60 * 1000) || match.status !== 'SCHEDULED';
  const dateStr = format(new Date(match.kickoffUtc), "d MMM, HH:mm", { locale: pl });

  const handleSave = async () => {
    if (home === '' || away === '') return;
    setLoading(true);
    const res = await submitPrediction({
      playerId, matchId: match._id.toString(),
      home: parseInt(home), away: parseInt(away), isJoker
    });
    setMsg({ text: res.success ? 'Zapisano!' : (res.error || 'Błąd'), type: res.success ? 'success' : 'error' });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    setLoading(false);
  };

  return (
    <div className={`bg-white rounded-2xl border-2 p-5 shadow-sm relative overflow-hidden transition-all ${isLocked ? 'border-slate-100 opacity-90' : 'border-slate-200 hover:border-emerald-400'}`}>
      <div className="flex justify-between items-center mb-4 text-[10px] font-black tracking-wider text-slate-400 uppercase">
        <span>{match.stage} {match.group && <span className="text-slate-600">&bull; {match.group}</span>}</span>
        <div className="flex items-center gap-2">
          {!isLocked ? (
             <button onClick={() => setIsJoker(!isJoker)} className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${isJoker ? 'bg-amber-400 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-600'}`}>
               <Star size={12} fill={isJoker ? "white" : "none"} /> JOKER x2
             </button>
          ) : (
             isJoker && <div className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full flex items-center gap-1"><Star size={12} fill="currentColor" /> JOKER</div>
          )}
          <span className={isLocked ? 'text-slate-400' : 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded'}>{isLocked ? 'ZABLOKOWANE' : 'OTWARTE'}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex flex-row sm:flex-col items-center gap-3 sm:flex-1 sm:text-center w-full justify-start">
          <TeamFlag teamName={match.homeTeam} className="w-10 h-7 rounded-sm" />
          <span className="font-black text-sm sm:text-sm leading-tight whitespace-pre-line text-slate-800" title={t(match.homeTeam)}>{shortT(match.homeTeam)}</span>
        </div>
        <div className="flex gap-2 px-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <input type="number" value={home} onChange={(e) => setHome(e.target.value)} disabled={isLocked || loading} className="w-12 h-12 text-center text-xl font-black bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-500" />
          <span className="self-center font-black text-slate-300">:</span>
          <input type="number" value={away} onChange={(e) => setAway(e.target.value)} disabled={isLocked || loading} className="w-12 h-12 text-center text-xl font-black bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-500" />
        </div>
        <div className="flex flex-row-reverse sm:flex-col items-center gap-3 sm:flex-1 sm:text-center w-full justify-start">
          <TeamFlag teamName={match.awayTeam} className="w-10 h-7 rounded-sm" />
          <span className="font-black text-sm sm:text-sm leading-tight whitespace-pre-line text-slate-800" title={t(match.awayTeam)}>{shortT(match.awayTeam)}</span>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100 text-[11px] font-bold">
        <span className="text-slate-400">{dateStr}</span>
        <div className="flex items-center gap-3">
           {isLocked && prediction?.points !== null && prediction?.points !== undefined && (
             <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-black text-xs">+{prediction.points} pkt</span>
           )}
           {!isLocked && <button onClick={handleSave} disabled={loading} className="bg-slate-900 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl transition-colors font-black">Zapisz</button>}
        </div>
      </div>
      {msg.text && <div className={`absolute top-0 left-0 w-full py-1 text-center text-[10px] uppercase text-white font-black tracking-widest ${msg.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>{msg.text}</div>}
    </div>
  );
}
""",

    # 4. Klientowy Dashboard Gracza (Zakładki, Typowanie Mistrza)
    "src/components/PlayerDashboardClient.tsx": r"""'use client';
import { useState } from 'react';
import PredictionCard from './PredictionCard';
import { Trophy, Share2, Star, Check } from 'lucide-react';
import { saveWinnerPrediction } from '@/actions/predictions';

export default function PlayerDashboardClient({ player, matches, predictions, totalPoints, appUrl }: any) {
  const [activeTab, setActiveTab] = useState<'GROUPS' | 'KNOCKOUT'>('GROUPS');
  const [winner, setWinner] = useState(player.predictedWinner || '');
  const [savingWinner, setSavingWinner] = useState(false);
  const [winnerMsg, setWinnerMsg] = useState('');

  // Sprawdzenie, czy turniej się rozpoczął (blokada mistrza)
  const isTournamentStarted = matches.some((m: any) => m.status === 'LIVE' || m.status === 'FINISHED' || new Date() > new Date(new Date(m.kickoffUtc).getTime() - 12 * 60 * 60 * 1000));

  const groupMatches = matches.filter((m: any) => m.stage.includes('Kolejka') || m.group);
  const knockoutMatches = matches.filter((m: any) => !m.stage.includes('Kolejka') && !m.group);

  const handleSaveWinner = async () => {
    if (!winner) return;
    setSavingWinner(true);
    await saveWinnerPrediction(player._id, winner);
    setWinnerMsg('Zapisano!');
    setTimeout(() => setWinnerMsg(''), 3000);
    setSavingWinner(false);
  };

  const waMessage = encodeURIComponent(`Hej! Typuję Mistrzostwa FIFA 2026 i mam już ${totalPoints} pkt! Zobacz ranking: ${appUrl}/leaderboard`);

  return (
    <div className="space-y-8">
      {/* Nagłówek i WhatsApp */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Zawodnik</p>
            <h1 className="text-4xl md:text-5xl font-black">{player.nick}</h1>
            <div className="mt-5 flex justify-center md:justify-start">
               <a href={`https://wa.me/?text=${waMessage}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-xl font-black text-xs hover:scale-105 transition-transform shadow-lg shadow-[#25D366]/20">
                 <Share2 size={16}/> Wyślij na WhatsApp
               </a>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 rounded-[2rem] flex items-center gap-5">
            <Trophy className="text-amber-400" size={48} />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">Twoje Punkty</p>
              <p className="text-6xl font-black leading-none">{totalPoints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Typowanie Mistrza */}
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 sm:p-8 rounded-[2.5rem] text-white shadow-lg relative overflow-hidden border border-orange-400">
         <div className="absolute right-0 top-0 opacity-20"><Trophy size={150} /></div>
         <div className="relative z-10">
           <h3 className="font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2 drop-shadow-md">🏆 Kto wygra Mundial 2026? (+10 pkt)</h3>
           <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <input 
                type="text" 
                value={winner}
                onChange={(e) => setWinner(e.target.value)}
                disabled={isTournamentStarted || savingWinner}
                placeholder="Wpisz nazwę państwa (np. Brazylia)..." 
                className="flex-1 bg-white/20 border-2 border-white/40 rounded-xl px-5 py-4 outline-none font-black placeholder:text-white/60 text-white disabled:opacity-70 transition-colors focus:bg-white/30" 
              />
              <button 
                onClick={handleSaveWinner}
                disabled={isTournamentStarted || savingWinner || !winner}
                className="bg-white text-orange-600 px-8 py-4 rounded-xl font-black text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg"
              >
                {winnerMsg ? <><Check size={18}/> Zapisano</> : 'ZAPISZ'}
              </button>
           </div>
           {isTournamentStarted && <p className="text-xs font-black mt-3 text-white/80 bg-black/20 inline-block px-3 py-1 rounded-md">Turniej wystartował. Typowanie zablokowane.</p>}
         </div>
      </div>

      {/* Zakładki Meczów */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex gap-2 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab('GROUPS')} className={`flex-1 py-4 rounded-xl font-black text-sm transition ${activeTab === 'GROUPS' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Faza Grupowa</button>
        <button onClick={() => setActiveTab('KNOCKOUT')} className={`flex-1 py-4 rounded-xl font-black text-sm transition ${activeTab === 'KNOCKOUT' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Faza Pucharowa</button>
      </div>

      {/* Lista meczów */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {activeTab === 'GROUPS' && groupMatches.length === 0 && <p className="text-center text-slate-500 font-bold py-10 col-span-full">Brak meczów grupowych.</p>}
        {activeTab === 'GROUPS' && groupMatches.map((match: any) => (
          <PredictionCard key={match._id.toString()} match={match} prediction={predictions.find((p:any) => p.matchId.toString() === match._id.toString())} playerId={player._id.toString()} />
        ))}
        
        {activeTab === 'KNOCKOUT' && knockoutMatches.length === 0 && <p className="text-center text-slate-500 font-bold py-10 col-span-full">Brak meczów pucharowych.</p>}
        {activeTab === 'KNOCKOUT' && knockoutMatches.map((match: any) => (
          <PredictionCard key={match._id.toString()} match={match} prediction={predictions.find((p:any) => p.matchId.toString() === match._id.toString())} playerId={player._id.toString()} />
        ))}
      </div>
    </div>
  );
}
""",

    # 5. Aktualizacja Głównej Strony Gracza (Renderuje Komponent Klienta)
    "src/app/p/[token]/page.tsx": r"""import connectToDatabase from '@/lib/db';
import Player from '@/models/Player';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import Settings from '@/models/Settings';
import crypto from 'crypto';
import { notFound } from 'next/navigation';
import PlayerDashboardClient from '@/components/PlayerDashboardClient';
import { Construction, Bell } from 'lucide-react';

export const revalidate = 0;

type Props = { params: Promise<{ token: string }> };

export default async function PlayerDashboard(props: Props) {
  const { token } = await props.params;
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
        <p className="text-slate-500 font-bold max-w-md text-lg">Administrator wprowadza aktualizacje. Wróć za chwilę!</p>
      </div>
    );
  }

  const matches = await Match.find().sort({ kickoffUtc: 1 }).lean();
  const predictions = await Prediction.find({ playerId: player._id }).lean();
  const totalPoints = predictions.reduce((sum, p) => sum + (p.points || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4">
      {settings.globalMessage && (
        <div className="bg-amber-100 border-2 border-amber-300 p-4 rounded-2xl flex items-center gap-4 text-amber-900 shadow-sm animate-pulse mb-6">
          <Bell className="shrink-0" size={24} />
          <p className="font-black text-sm">{settings.globalMessage}</p>
        </div>
      )}
      
      <PlayerDashboardClient 
        player={JSON.parse(JSON.stringify(player))} 
        matches={JSON.parse(JSON.stringify(matches))} 
        predictions={JSON.parse(JSON.stringify(predictions))} 
        totalPoints={totalPoints}
        appUrl={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
      />
    </div>
  );
}
""",

    # 6. Ostateczna Aktualizacja Regulaminu
    "src/app/rules/page.tsx": r"""import { Shield, Clock, Target, AlertTriangle, Users, Star, Trophy } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 px-4 pb-20">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900">Zasady Zabawy</h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-bold tracking-widest uppercase text-sm">System punktacji by Mar0</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Mistrz Turnieju */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] shadow-xl flex flex-col gap-5 text-white">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20"><Trophy size={32} className="text-amber-400" /></div>
          <h2 className="text-2xl font-black">Mistrz Świata</h2>
          <p className="text-slate-300 text-sm leading-relaxed font-bold">W panelu głównym wytypuj, kto zdobędzie puchar. Trafienie Mistrza to potężny bonus <span className="text-emerald-400 text-lg font-black">+10 punktów</span> do rankingu! <strong>Uwaga:</strong> Zapis blokuje się w chwili startu pierwszego meczu na Mundialu.</p>
        </div>

        {/* Złoty Joker */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-[2.5rem] shadow-xl flex flex-col gap-5 text-white">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30"><Star size={32} fill="white" /></div>
          <h2 className="text-2xl font-black">Złoty Joker (x2)</h2>
          <p className="text-white/90 text-sm leading-relaxed font-bold">Masz do dyspozycji Jokera w fazie grupowej i fazie pucharowej. Kliknij przycisk "Joker" nad meczem, a zdobyte w nim punkty zostaną <strong>pomnożone x2</strong> (np. trafisz idealnie = 6 pkt). Używaj strategicznie!</p>
        </div>

        {/* Punktacja */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col gap-5 hover:border-blue-200 transition">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Target size={32} /></div>
          <h2 className="text-2xl font-black text-slate-900">Punktacja Meczów</h2>
          <ul className="text-slate-700 text-sm space-y-4 font-black">
            <li className="flex items-center gap-4"><span className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg w-16 text-center shadow-sm">3 pkt</span> Idealny wynik (np. dałeś 2:1, jest 2:1)</li>
            <li className="flex items-center gap-4"><span className="bg-amber-500 text-white px-3 py-1.5 rounded-lg w-16 text-center shadow-sm">1 pkt</span> Rezultat/Kierunek (np. dałeś 1:0, było 3:0)</li>
            <li className="flex items-center gap-4"><span className="bg-slate-200 text-slate-500 px-3 py-1.5 rounded-lg w-16 text-center">0 pkt</span> Pudło</li>
          </ul>
        </div>

        {/* Deadline */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col gap-5 hover:border-red-200 transition">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center"><Clock size={32} /></div>
          <h2 className="text-2xl font-black text-slate-900">Deadline: 12 Godzin</h2>
          <p className="text-slate-600 text-sm leading-relaxed font-bold">Każdy mecz zamyka się do typowania na <strong>12 godzin</strong> przed jego rozpoczęciem. Po tym czasie kłódka się zamyka i Twój typ jest ostateczny. Pilnuj czasu!</p>
        </div>

        {/* Czas Regulaminowy */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col gap-5 hover:border-purple-200 transition">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><Shield size={32} /></div>
          <h2 className="text-2xl font-black text-slate-900">Tylko 90 Minut</h2>
          <p className="text-slate-600 text-sm leading-relaxed font-bold">Gramy wyłącznie na <strong>wynik po 90 minutach gry</strong> (plus doliczony czas). Ewentualne dogrywki i rzuty karne w fazie pucharowej nie mają dla nas znaczenia!</p>
        </div>

        {/* Twoje Konto */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col gap-5 hover:border-slate-300 transition">
          <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center"><Users size={32} /></div>
          <h2 className="text-2xl font-black text-slate-900">Twoje Konto</h2>
          <p className="text-slate-600 text-sm leading-relaxed font-bold">Logujesz się z użyciem prywatnego linku. Zapisz go lub wyślij sobie na WhatsApp. Jeśli go zgubisz, Mar0 wygeneruje Ci nowy, ale stary przestanie działać.</p>
        </div>

      </div>

      <div className="bg-amber-100/50 rounded-3xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-sm text-amber-900 border-2 border-amber-200 shadow-sm mt-12">
        <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={36} />
        <div className="text-center sm:text-left">
          <p className="font-black text-lg mb-2 uppercase tracking-widest text-amber-600">Zasady Remisu w Rankingu:</p>
          <p className="font-bold leading-relaxed text-amber-800/80">W przypadku równej ilości punktów, wyżej w tabeli będzie osoba z większą liczbą "idealnych trafień" (strzałów za 3 punkty). Jeśli nadal jest remis, decyduje kolejność alfabetyczna nicków.</p>
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
        print(f"✅ AKTUALIZACJA ZAKOŃCZONA: {filepath}")

if __name__ == "__main__":
    build_project()