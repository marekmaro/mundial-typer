'use client';
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
