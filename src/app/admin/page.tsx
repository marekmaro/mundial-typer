'use client';
import { useState, useEffect } from 'react';
import { createPlayerLink, recalculateAllPoints, syncMatchesAction, getAdminData, deletePlayerAction, togglePlayerBlock, getPlayerPredictionsForAdmin, adminOverridePrediction, exportLeaderboardCSV, superEditMatchAction, regeneratePlayerLink, updateGlobalSettings, adminOverridePlayerChampion } from '@/actions/admin';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, UserPlus, RefreshCw, Calculator, Copy, Check, LogIn, Users, Ban, Edit3, Trash2, ChevronLeft, Download, Search, QrCode, X, LayoutDashboard, CalendarDays, Settings, Bell, Lock } from 'lucide-react';
import { t } from '@/lib/translations';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PLAYERS' | 'MATCHES' | 'SETTINGS'>('DASHBOARD');

  const [data, setData] = useState<any>({ players: [], settings: {}, matches: [] });
  const [matchSearch, setMatchSearch] = useState('');

  const [nick, setNick] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [copiedId, setCopiedId] = useState('');
  const [appUrl, setAppUrl] = useState('');

  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [playerMatches, setPlayerMatches] = useState<any[]>([]);
  const [playerPreds, setPlayerPreds] = useState<any[]>([]);

  const [qrModal, setQrModal] = useState<{ isOpen: boolean, link: string, nick: string }>({ isOpen: false, link: '', nick: '' });

  useEffect(() => { setAppUrl(window.location.origin); }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type }); setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const loadData = async () => {
    const res = await getAdminData(secret);
    if (res.success) setData(res);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (secret) {
      const res = await getAdminData(secret);
      if (res.success) { setIsLoggedIn(true); setData(res); }
      else { showMessage("Błędne hasło!", "error"); }
    }
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
      setQrModal({ isOpen: true, link: `${appUrl}/p/${res.token}`, nick: nick });
      setNick(''); setCompany(''); loadData();
    }
  };

  const handleRegenerateLink = async (playerId: string, playerNick: string) => {
    if (!confirm(`UWAGA: Stary link gracza ${playerNick} przestanie działać! Wygenerować nowy?`)) return;
    const res = await actionWrapper(() => regeneratePlayerLink(secret, playerId));
    if (res.success && res.token) {
      setQrModal({ isOpen: true, link: `${appUrl}/p/${res.token}`, nick: playerNick });
      loadData();
    }
  };

  const copyLink = (token: string, id: string) => {
    const link = `${appUrl}/p/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const downloadQR = (elementId: string, fileName: string) => {
    const svg = document.getElementById(elementId);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = fileName;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleSuperEditMatch = async (matchId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      homeTeam: f.get('homeTeam'), awayTeam: f.get('awayTeam'), kickoffUtc: f.get('kickoffUtc'),
      status: f.get('status'), homeScore: f.get('homeScore'), awayScore: f.get('awayScore')
    };
    await actionWrapper(() => superEditMatchAction(secret, matchId, payload));
    loadData();
  };

  const toLocalISOString = (dateStr: string) => {
    const d = new Date(dateStr); const pad = (num: number) => num.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
        <Shield className="mx-auto text-emerald-500 mb-6" size={60} />
        <h1 className="text-3xl font-black text-center text-slate-900 mb-8">Autoryzacja</h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Hasło panelu Mar0" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-emerald-400 font-bold text-center" required />
          <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/20">WEJDŹ</button>
        </form>
        {message.text && <p className="text-red-500 font-bold text-center mt-4 text-sm">{message.text}</p>}
      </div>
    );
  }

  // --- DYNAMICZNE LISTY DRUŻYN ---
  const filteredMatches = data.matches?.filter((m: any) =>
    m.homeTeam.toLowerCase().includes(matchSearch.toLowerCase()) ||
    m.awayTeam.toLowerCase().includes(matchSearch.toLowerCase()) ||
    m.stage.toLowerCase().includes(matchSearch.toLowerCase())
  ) || [];

  // Wyciągamy z bazy (z meczów) wszystkie unikalne reprezentacje
  const uniqueTeams = Array.from(new Set(
    data.matches?.flatMap((m: any) => [m.homeTeam, m.awayTeam])
  )).filter((team: any) => team && !team.toLowerCase().includes('winner'))
    .sort((a: any, b: any) => t(a).localeCompare(t(b)));

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 pb-20 relative">

      {qrModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setQrModal({ isOpen: false, link: '', nick: '' })} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><X size={24} /></button>
            <h3 className="text-2xl font-black text-slate-900 mb-1 text-center">Dostęp Gracza</h3>
            <p className="text-sm font-bold text-slate-500 text-center mb-6">Link dla: {qrModal.nick}</p>
            <div className="flex justify-center mb-6 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
              <QRCodeSVG id="qr-modal-svg" value={qrModal.link} size={200} />
            </div>
            <div className="flex bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm mb-4">
              <input type="text" readOnly value={qrModal.link} className="w-full px-3 py-3 text-[10px] font-bold text-slate-600 outline-none bg-transparent" />
              <button onClick={() => { navigator.clipboard.writeText(qrModal.link); setCopiedId('modal'); setTimeout(() => setCopiedId(''), 2000); }} className="px-4 bg-slate-100 hover:bg-slate-200 border-l-2 border-slate-200 transition">
                {copiedId === 'modal' ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} className="text-slate-700" />}
              </button>
            </div>
            <button onClick={() => downloadQR("qr-modal-svg", `Zaproszenie_${qrModal.nick}.svg`)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-xl flex justify-center items-center gap-2 transition shadow-lg shadow-slate-900/20">
              <Download size={18} /> Pobierz kod QR
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
          <button onClick={() => { setActiveTab('DASHBOARD'); setEditingPlayer(null); }} className={`flex items-center whitespace-nowrap gap-2 px-5 py-3 rounded-2xl font-black text-sm transition ${activeTab === 'DASHBOARD' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
            <LayoutDashboard size={18} /> GŁÓWNY
          </button>
          <button onClick={() => { setActiveTab('PLAYERS'); setEditingPlayer(null); }} className={`flex items-center whitespace-nowrap gap-2 px-5 py-3 rounded-2xl font-black text-sm transition ${activeTab === 'PLAYERS' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Users size={18} /> GRACZE ({data.players.length})
          </button>
          <button onClick={() => { setActiveTab('MATCHES'); setEditingPlayer(null); }} className={`flex items-center whitespace-nowrap gap-2 px-5 py-3 rounded-2xl font-black text-sm transition ${activeTab === 'MATCHES' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
            <CalendarDays size={18} /> MECZE
          </button>
          <button onClick={() => { setActiveTab('SETTINGS'); setEditingPlayer(null); }} className={`flex items-center whitespace-nowrap gap-2 px-5 py-3 rounded-2xl font-black text-sm transition ${activeTab === 'SETTINGS' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Settings size={18} /> USTAWIENIA
          </button>
        </div>
        <button onClick={() => actionWrapper(() => exportLeaderboardCSV(secret)).then(res => { if (res.success) { const b = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' }); const l = document.createElement('a'); l.href = URL.createObjectURL(b); l.download = `ranking.csv`; l.click(); } })} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 text-sm transition w-full lg:w-auto">
          <Download size={18} /> POBIERZ CSV
        </button>
      </div>

      {message.text && (<div className={`p-4 rounded-2xl font-black border-2 text-center ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{message.text}</div>)}

      {activeTab === 'DASHBOARD' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3"><Bell className="text-amber-500" /> Tablica Ogłoszeń</h2>
            <textarea
              defaultValue={data.settings?.globalMessage || ''}
              onBlur={(e) => updateGlobalSettings(secret, { globalMessage: e.target.value })}
              placeholder="Wpisz ważną wiadomość dla wszystkich graczy..."
              className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-400 font-bold text-slate-700 resize-none"
            />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-center gap-4">
            <button onClick={() => actionWrapper(() => recalculateAllPoints(secret)).then(() => loadData())} disabled={loading} className="w-full py-6 bg-emerald-500 text-white rounded-3xl font-black text-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"><Calculator size={24} /> PRZELICZ RANKING</button>
            <button onClick={() => actionWrapper(() => syncMatchesAction(secret)).then(() => loadData())} disabled={loading} className="w-full py-5 bg-slate-100 text-slate-600 rounded-3xl font-black hover:bg-slate-200 transition-colors flex items-center justify-center gap-3"><RefreshCw size={20} /> SYNCHRONIZUJ API</button>
          </div>
        </div>
      )}

      {activeTab === 'PLAYERS' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3"><UserPlus className="text-blue-500" /> Szybkie Zaproszenie</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input type="text" value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Nick..." className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-400 font-bold" />
              <input type="text" list="companies" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Firma..." className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-400 font-bold" />
              <button onClick={handleCreatePlayer} disabled={loading} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-md shadow-blue-500/20 hover:bg-blue-700 transition">DODAJ</button>
            </div>
          </div>

          {!editingPlayer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.players.map((p: any) => (
                <div key={p._id} className={`bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between gap-4 transition ${p.blocked ? 'border-red-200 bg-red-50/30' : 'border-slate-100 hover:border-slate-300'}`}>
                  <div>
                    <div className="font-black text-xl text-slate-900 flex justify-between items-start">
                      {p.nick}
                      {p.blocked && <Ban size={16} className="text-red-500" />}
                    </div>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{p.company}</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {p.rawToken ? (
                      <div className="flex gap-2 w-full">
                        <button onClick={() => copyLink(p.rawToken, p._id)} className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${copiedId === p._id ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 shadow-sm'}`}>
                          {copiedId === p._id ? 'SKOPIOWANO!' : 'KOPIUJ LINK'}
                        </button>
                        <button onClick={() => { setQrModal({ isOpen: true, link: `${appUrl}/p/${p.rawToken}`, nick: p.nick }); }} className="px-4 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 shadow-sm transition" title="Pokaż Kod QR"><QrCode size={18} /></button>
                      </div>
                    ) : (
                      <button onClick={() => handleRegenerateLink(p._id, p.nick)} className="w-full py-2.5 bg-amber-100 text-amber-700 rounded-xl font-black text-xs hover:bg-amber-200 transition flex justify-center items-center gap-2"><RefreshCw size={14} /> WYGENERUJ NOWY LINK</button>
                    )}

                    <div className="flex gap-2">
                      <button onClick={() => { setEditingPlayer(p); getPlayerPredictionsForAdmin(secret, p._id).then(r => { setPlayerMatches(r.matches); setPlayerPreds(r.predictions); }); }} className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 py-2.5 rounded-xl font-black text-xs transition">EDYTUJ TYPY</button>
                      <button onClick={() => actionWrapper(() => togglePlayerBlock(secret, p._id, p.blocked)).then(() => loadData())} className={`p-2.5 rounded-xl transition ${p.blocked ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`} title={p.blocked ? "Odblokuj" : "Zablokuj"}><Ban size={18} /></button>
                      <button onClick={() => { if (confirm('Usunąć całkowicie?')) actionWrapper(() => deletePlayerAction(secret, p._id)).then(() => loadData()); }} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition" title="Usuń Gracza"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <button onClick={() => {setEditingPlayer(null); loadData();}} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-black mb-6 transition bg-slate-50 hover:bg-slate-100 px-5 py-3 rounded-xl w-fit"><ChevronLeft size={18} /> Powrót do Graczy</button>
              
              <h2 className="text-2xl font-black text-slate-900 mb-1">Typy gracza: <span className="text-blue-600">{editingPlayer.nick}</span></h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Panel Administratora (Ignoruje blokady czasowe)</p>
              
              {/* EDYCJA TYPOWANEGO MISTRZA DLA GRACZA */}
              <div className="mb-8 bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <h3 className="text-sm font-black text-blue-900 mb-3 uppercase tracking-wider">Typowany Mistrz Świata (Gracza)</h3>
                <select
                  defaultValue={editingPlayer.champion || ''}
                  onChange={(e) => {
                    actionWrapper(() => adminOverridePlayerChampion(secret, editingPlayer._id, e.target.value))
                    .then(() => {
                       const updatedPlayer = {...editingPlayer, champion: e.target.value};
                       setEditingPlayer(updatedPlayer);
                    });
                  }}
                  className="w-full p-4 bg-white border border-blue-200 rounded-xl outline-none font-bold text-slate-800 focus:border-blue-500 cursor-pointer"
                >
                  <option value="">-- Gracz nie wybrał mistrza --</option>
                  {uniqueTeams.map((team: string) => (
                    <option key={team} value={team}>{t(team)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {playerMatches.map(m => {
                  const pred = playerPreds.find(p => p.matchId === m._id);
                  return (
                    <form key={m._id} onSubmit={(e) => { 
                      e.preventDefault(); 
                      const f = new FormData(e.currentTarget); 
                      actionWrapper(() => adminOverridePrediction(secret, editingPlayer._id, m._id, parseInt(f.get('home') as string), parseInt(f.get('away') as string)))
                      .then(() => {
                        // Odświeżenie widoku typów zaraz po zapisaniu
                        getPlayerPredictionsForAdmin(secret, editingPlayer._id).then(r => setPlayerPreds(r.predictions));
                      }); 
                    }} className="p-4 border-2 border-slate-100 hover:border-blue-200 transition rounded-2xl bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-[10px] font-black text-slate-400 uppercase w-full sm:w-24 truncate text-center sm:text-left bg-white px-2 py-1 rounded shadow-sm">{m.stage}</div>
                      <div className="flex items-center justify-center gap-3 w-full sm:w-auto flex-1">
                        <div className="text-sm font-black text-slate-800 w-1/3 text-right truncate">{t(m.homeTeam)}</div>
                        <div className="flex gap-2 shrink-0">
                          <input type="number" min="0" name="home" defaultValue={pred?.home ?? ''} className="w-12 h-10 border-2 border-slate-200 rounded-lg text-center font-black text-lg text-slate-900 outline-none focus:border-blue-500 bg-white transition" required />
                          <span className="self-center font-black text-slate-300">:</span>
                          <input type="number" min="0" name="away" defaultValue={pred?.away ?? ''} className="w-12 h-10 border-2 border-slate-200 rounded-lg text-center font-black text-lg text-slate-900 outline-none focus:border-blue-500 bg-white transition" required />
                        </div>
                        <div className="text-sm font-black text-slate-800 w-1/3 text-left truncate">{t(m.awayTeam)}</div>
                      </div>
                      <button type="submit" disabled={loading} className="w-full sm:w-auto text-xs font-black bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm">Zapisz</button>
                    </form>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'MATCHES' && (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[600px]">
          <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-3"><Edit3 className="text-amber-500" size={28} /> Super-Edytor Meczów</h2>
          <p className="text-sm text-slate-500 font-bold mb-6">Pełna kontrola nad terminarzem. Zmieniaj daty, drużyny i wpisuj wyniki z palca (Override).</p>

          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Wyszukaj mecz po nazwie państwa lub fazie..."
              value={matchSearch}
              onChange={(e) => setMatchSearch(e.target.value)}
              className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-amber-500 font-bold text-slate-800 transition"
            />
          </div>

          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredMatches.length === 0 ? <p className="text-slate-500 font-bold">Brak wyników.</p> : (
              filteredMatches.map((m: any) => {
                const currentHome = m.scoreOverride?.home ?? m.score.home ?? '';
                const currentAway = m.scoreOverride?.away ?? m.score.away ?? '';
                const isOverridden = !!m.scoreOverride;

                return (
                  <form key={m._id} onSubmit={(e) => handleSuperEditMatch(m._id, e)} className={`p-5 border-2 rounded-2xl flex flex-col gap-4 transition shadow-sm ${isOverridden ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                    <div className="flex justify-between items-center gap-3">
                      <input name="homeTeam" defaultValue={m.homeTeam} className="w-[45%] px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 text-right outline-none focus:border-amber-500 focus:bg-white transition" required />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">VS</span>
                      <input name="awayTeam" defaultValue={m.awayTeam} className="w-[45%] px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 text-left outline-none focus:border-amber-500 focus:bg-white transition" required />
                    </div>

                    <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                      <div className="flex w-full xl:w-auto items-center gap-3">
                        <input type="datetime-local" name="kickoffUtc" defaultValue={toLocalISOString(m.kickoffUtc)} className="flex-1 xl:w-auto text-xs px-3 py-2.5 border-2 border-slate-200 rounded-xl bg-white font-bold text-slate-800 outline-none focus:border-amber-500 transition" required />
                        <select name="status" defaultValue={m.status} className="w-32 text-xs px-3 py-2.5 border-2 border-slate-200 rounded-xl bg-white font-black text-slate-800 outline-none focus:border-amber-500 transition cursor-pointer">
                          <option value="SCHEDULED">Oczekuje</option>
                          <option value="LIVE">Na żywo</option>
                          <option value="FINISHED">Zakończony</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
                        <input type="number" min="0" name="homeScore" placeholder="-" defaultValue={currentHome} className="w-12 h-12 px-1 bg-white border-2 border-slate-200 rounded-xl text-center font-black text-xl text-slate-900 outline-none focus:border-amber-500 transition" />
                        <span className="font-black text-slate-400">:</span>
                        <input type="number" min="0" name="awayScore" placeholder="-" defaultValue={currentAway} className="w-12 h-12 px-1 bg-white border-2 border-slate-200 rounded-xl text-center font-black text-xl text-slate-900 outline-none focus:border-amber-500 transition" />
                        <button type="submit" disabled={loading} className="ml-3 text-xs font-black bg-slate-900 text-white px-6 py-3.5 rounded-xl hover:bg-slate-800 transition shadow-md">ZAPISZ</button>
                      </div>
                    </div>
                  </form>
                )
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-3"><Lock className="text-red-500" /> Pauza Turniejowa</h2>
            <p className="text-sm font-bold text-slate-500 mb-6">Blokuje graczom dostęp do ich panelu (widzą ekran prac technicznych).</p>
            <button
              onClick={() => updateGlobalSettings(secret, { maintenanceMode: !data.settings.maintenanceMode }).then(() => loadData())}
              className={`w-full py-5 rounded-2xl font-black transition-all ${data.settings.maintenanceMode ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'}`}
            >
              {data.settings.maintenanceMode ? 'WYŁĄCZ BLOKADĘ (PRZYWRÓĆ DOSTĘP)' : 'AKTYWUJ PRZERWĘ TECHNICZNĄ'}
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
            <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-3">🏆 Oficjalny Mistrz</h2>
            <p className="text-sm font-bold text-slate-500 mb-6">Wybierz zwycięzcę, aby rozliczyć dodatkowe punkty za finał.</p>
            <select
              defaultValue={data.settings?.tournamentWinner || ''}
              onChange={(e) => updateGlobalSettings(secret, { tournamentWinner: e.target.value }).then(() => loadData())}
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-slate-900 cursor-pointer mt-auto"
            >
              <option value="">-- Wybierz Mistrza z listy --</option>
              {uniqueTeams.map((team: string) => (
                <option key={team} value={team}>{t(team)}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
