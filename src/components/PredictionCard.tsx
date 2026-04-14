'use client';
import { useState } from 'react';
import { submitPrediction } from '@/actions/predictions';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import TeamFlag from './TeamFlag';
import { t, shortT } from '@/lib/translations';

export default function PredictionCard({ match, prediction, playerId }: { match: any, prediction: any, playerId: string }) {
  const [home, setHome] = useState(prediction?.home ?? '');
  const [away, setAway] = useState(prediction?.away ?? '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const isLocked = new Date() > new Date(new Date(match.kickoffUtc).getTime() - 12 * 60 * 60 * 1000) || match.status !== 'SCHEDULED';
  const dateStr = format(new Date(match.kickoffUtc), "d MMM, HH:mm", { locale: pl });

  const handleSave = async () => {
    if (home === '' || away === '') return;
    setLoading(true);
    const formData = new FormData();
    formData.append('playerId', playerId);
    formData.append('matchId', match._id.toString());
    formData.append('home', home.toString());
    formData.append('away', away.toString());
    const res = await submitPrediction(formData);
    
    // FIX TYPESCRIPTA: dodane || 'Wystąpił błąd' na wypadek gdyby res.error było undefined
    setMsg({ 
      text: res.success ? 'Zapisano!' : (res.error || 'Wystąpił błąd'), 
      type: res.success ? 'success' : 'error' 
    });
    
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    setLoading(false);
  };

  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm relative overflow-hidden transition-all ${isLocked ? 'border-slate-200 bg-slate-50 opacity-90' : 'border-emerald-200 hover:shadow-md'}`}>
      <div className="flex justify-between items-center mb-4 text-[10px] font-black tracking-wider text-slate-400 uppercase">
        <span>{match.stage} {match.group && <span className="text-slate-600">&bull; {match.group}</span>}</span>
        <span className={isLocked ? 'text-slate-400' : 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded'}>{isLocked ? 'ZABLOKOWANE' : 'OTWARTE'}</span>
      </div>
      <div className="flex justify-between items-center mb-5">
        <div className="flex-1 text-right flex flex-col items-end gap-1.5 truncate">
          <TeamFlag teamName={match.homeTeam} className="w-8 h-5" />
          <span className="font-bold text-xs sm:text-sm w-full leading-tight whitespace-pre-line" title={t(match.homeTeam)}>{shortT(match.homeTeam)}</span>
        </div>
        <div className="flex gap-1.5 px-3 shrink-0">
          <input type="number" value={home} onChange={(e) => setHome(e.target.value)} disabled={isLocked || loading} className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-black bg-slate-100 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
          <span className="self-center font-bold text-slate-300">:</span>
          <input type="number" value={away} onChange={(e) => setAway(e.target.value)} disabled={isLocked || loading} className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-black bg-slate-100 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div className="flex-1 text-left flex flex-col items-start gap-1.5 truncate">
          <TeamFlag teamName={match.awayTeam} className="w-8 h-5" />
          <span className="font-bold text-xs sm:text-sm w-full leading-tight whitespace-pre-line" title={t(match.awayTeam)}>{shortT(match.awayTeam)}</span>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100 text-[11px] font-bold">
        <span className="text-slate-400">{dateStr}</span>
        {!isLocked && <button onClick={handleSave} disabled={loading} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg transition-colors">Zapisz Typ</button>}
      </div>
      {msg.text && <div className={`absolute top-0 left-0 w-full py-1 text-center text-[10px] uppercase text-white font-black tracking-widest ${msg.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>{msg.text}</div>}
    </div>
  );
}
