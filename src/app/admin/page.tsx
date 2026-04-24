'use client';
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
