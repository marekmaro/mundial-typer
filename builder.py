import os

FILES = {
    # Aktualizacja wyglądu Panelu Admina (Super-Edytor Meczów z mocnym kontrastem)
    "src/app/admin/page.tsx": r"""'use client';
import { useState, useEffect } from 'react';
import { createPlayerLink, recalculateAllPoints, syncMatchesAction, getPlayersList, togglePlayerBlock, deletePlayerAction, getPlayerPredictionsForAdmin, adminOverridePrediction, exportLeaderboardCSV, getAllMatchesAdmin, superEditMatchAction } from '@/actions/admin';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, UserPlus, RefreshCw, Calculator, Copy, Check, LogIn, Users, Ban, Edit3, Trash2, ChevronLeft, Download, Search } from 'lucide-react';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nick, setNick] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState('');
  
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [matchSearch, setMatchSearch] = useState('');

  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [playerMatches, setPlayerMatches] = useState<any[]>([]);
  const [playerPreds, setPlayerPreds] = useState<any[]>([]);

  useEffect(() => { setAppUrl(window.location.origin); }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type }); setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const loadData = async () => {
    const pRes = await getPlayersList(secret);
    if (pRes.success) setPlayers(pRes.players);
    const mRes = await getAllMatchesAdmin(secret);
    if (mRes.success) setMatches(mRes.matches);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (secret) { setIsLoggedIn(true); await loadData(); }
  };

  const actionWrapper = async (actionFn: () => Promise<any>) => {
    setLoading(true); const res = await actionFn();
    if (res.error) showMessage(res.error, 'error');
    if (res.success && res.message) showMessage(res.message, 'success');
    setLoading(false); return res;
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await actionWrapper(() => createPlayerLink(nick, company, secret));
    if (res.success && res.token) {
      setGeneratedLink(`${appUrl}/p/${res.token}`); setNick(''); loadData();
    }
  };

  const handleSuperEditMatch = async (matchId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      homeTeam: f.get('homeTeam'),
      awayTeam: f.get('awayTeam'),
      kickoffUtc: f.get('kickoffUtc'),
      status: f.get('status'),
      homeScore: f.get('homeScore'),
      awayScore: f.get('awayScore')
    };
    await actionWrapper(() => superEditMatchAction(secret, matchId, payload));
    loadData();
  };

  const toLocalISOString = (dateStr: string) => {
    const d = new Date(dateStr);
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <Shield className="mx-auto text-emerald-600 mb-4" size={56} />
        <h1 className="text-3xl font-black text-center text-slate-900 mb-8">Panel Admina</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Wpisz hasło..." className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 outline-none focus:border-emerald-500 font-medium text-slate-800 transition-colors" required />
          <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-slate-800 transition flex justify-center items-center gap-2 shadow-lg shadow-slate-900/20"><LogIn size={20} /> Autoryzuj Dostęp</button>
        </form>
      </div>
    );
  }

  const filteredMatches = matches.filter(m => 
    m.homeTeam.toLowerCase().includes(matchSearch.toLowerCase()) || 
    m.awayTeam.toLowerCase().includes(matchSearch.toLowerCase()) ||
    m.stage.toLowerCase().includes(matchSearch.toLowerCase())
  );

  const uniqueCompanies = Array.from(new Set(players.map(p => p.company))).filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Shield className="text-emerald-600" size={36} />
          <h1 className="text-3xl font-black text-slate-900">Panel Dowodzenia</h1>
        </div>
        <button onClick={() => actionWrapper(() => exportLeaderboardCSV(secret)).then(res => { if(res.success){ const b = new Blob([res.csv],{type:'text/csv;charset=utf-8;'}); const l = document.createElement('a'); l.href=URL.createObjectURL(b); l.download=`ranking_${new Date().toISOString().split('T')[0]}.csv`; l.click(); } })} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 text-sm transition shadow-sm">
          <Download size={18} /> Pobierz CSV
        </button>
      </div>
      
      {message.text && (<div className={`p-4 rounded-xl font-bold border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{message.text}</div>)}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEWA KOLUMNA */}
        <div className="space-y-8">
          
          <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6"><UserPlus className="text-blue-500" size={28}/> Zaproś Gracza</h2>
            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nick Gracza</label>
                <input type="text" value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Wpisz nick..." className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800 font-bold transition" required disabled={loading} />
              </div>
              <div className="relative">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Firma / Dział (Opcjonalnie)</label>
                 <input type="text" list="companies" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Np. Dział IT, Marketing..." className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800 font-bold transition" disabled={loading} />
                 <datalist id="companies">{uniqueCompanies.map(c => <option key={c as string} value={c as string} />)}</datalist>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-3.5 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-500/20 mt-2">Wygeneruj Link</button>
            </form>
            {generatedLink && (
              <div className="mt-6 p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-4 text-center">
                <p className="text-sm font-black text-slate-800">Gotowe! Wyślij ten link graczowi:</p>
                <div className="flex bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <input type="text" readOnly value={generatedLink} className="w-full px-4 py-2.5 text-xs font-bold text-slate-600 outline-none bg-transparent" />
                  <button onClick={() => { navigator.clipboard.writeText(generatedLink); setCopied(true); setTimeout(()=>setCopied(false), 2000); }} className="px-5 bg-slate-100 hover:bg-slate-200 border-l-2 border-slate-200 transition">
                    {copied ? <Check size={20} className="text-emerald-600" /> : <Copy size={20} className="text-slate-700" />}
                  </button>
                </div>
                <div className="pt-3 flex justify-center"><QRCodeSVG value={generatedLink} size={160} /></div>
              </div>
            )}
          </div>

          <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200">
             <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3"><RefreshCw className="text-emerald-500" size={28}/> Serwer & Przeliczanie</h2>
             <div className="flex flex-col sm:flex-row gap-4">
               <button onClick={() => actionWrapper(async () => { await syncMatchesAction(secret); loadData(); return {success:true, message:"Zsynchronizowano!"};})} disabled={loading} className="flex-1 bg-emerald-600 text-white font-black py-3.5 rounded-xl hover:bg-emerald-700 flex justify-center items-center gap-2 shadow-md shadow-emerald-500/20 transition"><RefreshCw size={18} /> Pobierz API</button>
               <button onClick={() => actionWrapper(() => recalculateAllPoints(secret))} disabled={loading} className="flex-1 bg-purple-600 text-white font-black py-3.5 rounded-xl hover:bg-purple-700 flex justify-center items-center gap-2 shadow-md shadow-purple-500/20 transition"><Calculator size={18} /> Przelicz Punkty</button>
             </div>
             <p className="text-xs font-bold text-slate-500 mt-5 text-center leading-relaxed">Kliknij "Przelicz Punkty" po każdej edycji wyników lub aktualizacji API, aby zaktualizować ranking.</p>
          </div>

          {!editingPlayer && (
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Users className="text-slate-700" size={28}/> Twoi Gracze ({players.length})</h2>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {players.length === 0 ? <p className="text-slate-500 text-sm font-bold">Brak graczy.</p> : (
                  players.map(p => (
                    <div key={p._id} className={`p-4 border-2 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition ${p.blocked ? 'bg-red-50 border-red-200 opacity-80' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:shadow'}`}>
                      <div>
                        <div className="font-black text-slate-900 text-lg leading-tight">{p.nick}</div>
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{p.company}</div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => { setEditingPlayer(p); getPlayerPredictionsForAdmin(secret, p._id).then(r => { setPlayerMatches(r.matches); setPlayerPreds(r.predictions); }); }} className="flex-1 sm:flex-none bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-xl font-bold text-xs transition">Typy</button>
                        <button onClick={() => { actionWrapper(() => togglePlayerBlock(secret, p._id, p.blocked)); loadData(); }} className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs px-4 py-2 rounded-xl font-bold border transition-colors ${p.blocked ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'}`}><Ban size={14} /> {p.blocked ? 'Odblokuj' : 'Blokuj'}</button>
                        <button onClick={() => { if(confirm('Na pewno usunąć gracza i jego typy na stałe?')) { actionWrapper(() => deletePlayerAction(secret, p._id)); loadData(); } }} className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 px-3 py-2 rounded-xl transition"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* PRAWA KOLUMNA */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200 min-h-[600px]">
          
          {!editingPlayer ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Edit3 className="text-amber-500" size={28}/> Zarządzanie Meczami</h2>
              </div>
              <p className="text-sm text-slate-600 font-bold mb-6">Pełna kontrola nad terminarzem. Możesz zmieniać daty i nadpisywać wyniki API.</p>
              
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Wyszukaj państwo, fazę..." 
                  value={matchSearch} 
                  onChange={(e) => setMatchSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-slate-800 transition"
                />
              </div>

              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredMatches.length === 0 ? <p className="text-slate-800 font-bold">Brak wyników wyszukiwania.</p> : (
                  filteredMatches.map(m => {
                    const currentHome = m.scoreOverride?.home ?? m.score.home ?? '';
                    const currentAway = m.scoreOverride?.away ?? m.score.away ?? '';
                    const isOverridden = !!m.scoreOverride;

                    return (
                      <form key={m._id} onSubmit={(e) => handleSuperEditMatch(m._id, e)} className={`p-5 border-2 rounded-2xl flex flex-col gap-4 transition shadow-sm ${isOverridden ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                        <div className="flex justify-between items-center gap-3">
                          <input name="homeTeam" defaultValue={m.homeTeam} className="w-[45%] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black text-slate-800 text-right outline-none focus:border-blue-400 focus:bg-white transition" required />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">VS</span>
                          <input name="awayTeam" defaultValue={m.awayTeam} className="w-[45%] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black text-slate-800 text-left outline-none focus:border-blue-400 focus:bg-white transition" required />
                        </div>

                        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          <div className="flex w-full xl:w-auto items-center gap-2">
                             <input type="datetime-local" name="kickoffUtc" defaultValue={toLocalISOString(m.kickoffUtc)} className="flex-1 xl:w-auto text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-800 outline-none focus:border-blue-400 transition" required />
                             <select name="status" defaultValue={m.status} className="w-28 text-xs px-2 py-2 border border-slate-300 rounded-lg bg-white font-black text-slate-800 outline-none focus:border-blue-400 transition cursor-pointer">
                               <option value="SCHEDULED">Oczekuje</option>
                               <option value="LIVE">Na żywo</option>
                               <option value="FINISHED">Zakończony</option>
                             </select>
                          </div>
                          <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
                            <input type="number" min="0" name="homeScore" placeholder="-" defaultValue={currentHome} className="w-12 h-10 px-1 bg-white border-2 border-slate-200 rounded-lg text-center font-black text-lg text-slate-900 outline-none focus:border-emerald-500 transition" />
                            <span className="font-black text-slate-400">:</span>
                            <input type="number" min="0" name="awayScore" placeholder="-" defaultValue={currentAway} className="w-12 h-10 px-1 bg-white border-2 border-slate-200 rounded-lg text-center font-black text-lg text-slate-900 outline-none focus:border-emerald-500 transition" />
                            <button type="submit" disabled={loading} className="ml-2 text-xs font-black bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-600 transition-colors shadow-md shadow-slate-900/10">Zapisz</button>
                          </div>
                        </div>
                        {isOverridden && <div className="text-[10px] text-amber-600 font-black tracking-widest uppercase text-center bg-amber-100/50 py-1 rounded-md">Nadpisano z palca (Override)</div>}
                      </form>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button onClick={() => setEditingPlayer(null)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 font-black mb-2 transition bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl w-fit"><ChevronLeft size={18} /> Wróć do Meczów</button>
              <div>
                 <h2 className="text-2xl font-black text-slate-900 mb-1">Typy gracza: <span className="text-blue-600">{editingPlayer.nick}</span></h2>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tryb Administratora (Ignoruje blokadę 12h)</p>
              </div>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {playerMatches.map(m => {
                  const pred = playerPreds.find(p => p.matchId === m._id);
                  return (
                    <form key={m._id} onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); actionWrapper(() => adminOverridePrediction(secret, editingPlayer._id, m._id, parseInt(f.get('home') as string), parseInt(f.get('away') as string))); }} className="p-4 border-2 border-slate-100 hover:border-blue-200 transition rounded-2xl bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                      <div className="text-[10px] font-black text-slate-400 uppercase w-full sm:w-20 truncate text-center sm:text-left bg-slate-50 px-2 py-1 rounded" title={m.stage}>{m.stage}</div>
                      <div className="flex items-center justify-center gap-3 w-full sm:w-auto flex-1">
                        <div className="text-sm font-black text-slate-800 w-1/3 text-right truncate">{m.homeTeam}</div>
                        <div className="flex gap-2 shrink-0">
                          <input type="number" min="0" name="home" defaultValue={pred?.home ?? ''} className="w-12 h-10 border-2 border-slate-200 rounded-lg text-center font-black text-lg text-slate-900 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition" required />
                          <span className="self-center font-black text-slate-300">:</span>
                          <input type="number" min="0" name="away" defaultValue={pred?.away ?? ''} className="w-12 h-10 border-2 border-slate-200 rounded-lg text-center font-black text-lg text-slate-900 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition" required />
                        </div>
                        <div className="text-sm font-black text-slate-800 w-1/3 text-left truncate">{m.awayTeam}</div>
                      </div>
                      <button type="submit" disabled={loading} className="w-full sm:w-auto text-xs font-black bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-500/20">Zapisz</button>
                    </form>
                  )
                })}
              </div>
            </div>
          )}
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
        print(f"✅ Zaktualizowano interfejs Admina: {filepath}")

if __name__ == "__main__":
    print("Wgrywam ostateczny kontrast do Edytora Meczów...")
    build_project()