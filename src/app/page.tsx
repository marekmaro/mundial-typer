import connectToDatabase from '@/lib/db';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import Player from '@/models/Player';
import Link from 'next/link';
import TeamFlag from '@/components/TeamFlag';
import { t, shortT } from '@/lib/translations';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarDays, Trophy, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await connectToDatabase();
  const upcomingMatches = await Match.find({ status: 'SCHEDULED' }).sort({ kickoffUtc: 1 }).limit(4).lean();

  const matchIds = upcomingMatches.map(m => m._id);
  const predictions = await Prediction.find({ matchId: { $in: matchIds } }).lean();
  const playerIds = [...new Set(predictions.map(p => p.playerId.toString()))];
  const players = await Player.find({ _id: { $in: playerIds } }).lean();

  const matchesWithPredictors = upcomingMatches.map(m => {
     const predsForMatch = predictions.filter(p => p.matchId.toString() === m._id.toString());
     const predictorNicks = predsForMatch.map(p => {
         const player = players.find(pl => pl._id.toString() === p.playerId.toString());
         return player ? player.nick : 'Nieznany';
     });
     return { ...m, predictors: predictorNicks };
  });

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4 pb-20">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[3rem] p-8 md:p-16 text-white shadow-2xl flex flex-col items-center text-center gap-8 border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy size={200} /></div>
        <div className="space-y-6 max-w-3xl relative z-10">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight">
            Kto zdobędzie <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Puchar?</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-bold">
            Odbierz prywatny link, typuj wyniki (pamiętaj o Złotym Jokerze!) i udowodnij znajomym, że znasz się na piłce najlepiej.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/leaderboard" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-4 px-10 rounded-2xl flex items-center gap-2 text-lg transition-transform hover:scale-105 shadow-xl shadow-emerald-500/20">
              <Trophy size={20} /> Zobacz Ranking
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 border-b-2 border-slate-100 pb-4">
          <CalendarDays className="text-emerald-500" size={28} /> Najbliższe Spotkania
        </h2>
        
        {matchesWithPredictors.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border-2 border-slate-100 text-center text-slate-500 font-bold shadow-sm">Brak zaplanowanych spotkań w API.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matchesWithPredictors.map((match: any) => {
              const dateStr = format(new Date(match.kickoffUtc), "d MMMM (EEEE), HH:mm", { locale: pl });
              return (
                <div key={match._id.toString()} className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 shadow-sm hover:border-emerald-200 transition group flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-md">{match.stage} {match.group && `• ${match.group}`}</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md">{dateStr}</span>
                  </div>
                  
                  <div className="flex justify-between items-center font-black text-xl text-slate-800 mb-6">
                    <Link href={`/team/${encodeURIComponent(match.homeTeam)}`} className="flex-1 flex flex-col items-center gap-3 hover:text-emerald-600 transition">
                      <TeamFlag teamName={match.homeTeam} className="w-14 h-10 rounded-lg shadow-sm" />
                      <span className="truncate text-base" title={t(match.homeTeam)}>{shortT(match.homeTeam)}</span>
                    </Link>
                    <div className="px-5 py-2 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-400 text-sm">VS</div>
                    <Link href={`/team/${encodeURIComponent(match.awayTeam)}`} className="flex-1 flex flex-col items-center gap-3 hover:text-emerald-600 transition">
                      <TeamFlag teamName={match.awayTeam} className="w-14 h-10 rounded-lg shadow-sm" />
                      <span className="truncate text-base" title={t(match.awayTeam)}>{shortT(match.awayTeam)}</span>
                    </Link>
                  </div>

                  <div className="mt-auto pt-4 border-t-2 border-slate-50 flex items-center gap-3 text-xs font-bold text-slate-500">
                     <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0"><Users size={16}/></div>
                     {match.predictors.length === 0 ? (
                       <span>Jeszcze nikt nie wytypował. Bądź pierwszy!</span>
                     ) : (
                       <span className="truncate" title={match.predictors.join(', ')}>
                         Typy oddali: <span className="text-slate-800">{match.predictors.slice(0, 3).join(', ')}</span>
                         {match.predictors.length > 3 && ` i ${match.predictors.length - 3} innych`}
                       </span>
                     )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
