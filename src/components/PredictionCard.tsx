'use client';
import { useState } from 'react';
import { submitPrediction } from '@/actions/predictions';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import TeamFlag from './TeamFlag';
import { t } from '@/lib/translations';
import { Star } from 'lucide-react';

export default function PredictionCard({ match, prediction, playerId }: { match: any, prediction: any, playerId: string }) {
  const [home, setHome] = useState(prediction?.home ?? '');
  const [away, setAway] = useState(prediction?.away ?? '');
  const [isJoker, setIsJoker] = useState(prediction?.isJoker ?? false);
  const [loading, setLoading] = useState(false);

  const isLocked = new Date() > new Date(new Date(match.kickoffUtc).getTime() - 12 * 60 * 60 * 1000) || match.status !== 'SCHEDULED';
  const dateStr = format(new Date(match.kickoffUtc), "d MMM, HH:mm", { locale: pl });

  const handleSave = async () => {
    if (home === '' || away === '') return;
    setLoading(true);
    const res = await submitPrediction({
      playerId, matchId: match._id.toString(),
      home: parseInt(home), away: parseInt(away), isJoker
    });
    setLoading(false);
  };

  return (
    <div className={`bg-white rounded-3xl border-2 p-4 sm:p-6 transition-all shadow-sm ${isLocked ? 'border-slate-100 opacity-90' : 'border-slate-200 hover:border-emerald-400'}`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{match.stage}</span>
        {!isLocked && (
          <button 
            onClick={() => setIsJoker(!isJoker)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black transition-all ${isJoker ? 'bg-amber-400 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}
          >
            <Star size={12} fill={isJoker ? "white" : "none"} /> JOKER x2
          </button>
        )}
        {isJoker && isLocked && <Star size={16} className="text-amber-400 fill-amber-400" />}
      </div>

      {/* Układ mobilny: flex-col, Desktop: flex-row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-row sm:flex-col items-center gap-3 sm:flex-1 sm:text-center w-full">
          <TeamFlag teamName={match.homeTeam} className="w-10 h-7 rounded-md" />
          <span className="font-black text-slate-800 text-sm sm:text-base truncate">{t(match.homeTeam)}</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border-2 border-slate-100">
          <input type="number" value={home} onChange={(e) => setHome(e.target.value)} disabled={isLocked || loading} className="w-12 h-12 text-center text-xl font-black bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-500" />
          <span className="font-black text-slate-300">:</span>
          <input type="number" value={away} onChange={(e) => setAway(e.target.value)} disabled={isLocked || loading} className="w-12 h-12 text-center text-xl font-black bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-500" />
        </div>

        <div className="flex flex-row-reverse sm:flex-col items-center gap-3 sm:flex-1 sm:text-center w-full">
          <TeamFlag teamName={match.awayTeam} className="w-10 h-7 rounded-md" />
          <span className="font-black text-slate-800 text-sm sm:text-base truncate">{t(match.awayTeam)}</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center">
        <span className="text-[11px] font-bold text-slate-400 uppercase">{dateStr}</span>
        {!isLocked && <button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-xs hover:bg-emerald-600 transition-colors">ZAPISZ</button>}
        {isLocked && prediction?.points !== null && (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-black text-xs">+{prediction.points} pkt</span>
        )}
      </div>
    </div>
  );
}
