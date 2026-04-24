'use client';
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
