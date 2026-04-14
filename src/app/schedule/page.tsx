import connectToDatabase from '@/lib/db';
import Match from '@/models/Match';
import TeamFlag from '@/components/TeamFlag';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { t } from '@/lib/translations';
import Link from 'next/link';

export const revalidate = 60;

export default async function SchedulePage() {
  await connectToDatabase();
  const matches = await Match.find().sort({ kickoffUtc: 1 }).lean();

  if (matches.length === 0) return <div className="text-center py-20 text-slate-500 font-medium">Brak meczów. Zsynchronizuj API.</div>;

  const groupedMatches: Record<string, any[]> = {};
  matches.forEach(m => {
    const dateKey = format(new Date(m.kickoffUtc), "d MMMM yyyy", { locale: pl });
    if (!groupedMatches[dateKey]) groupedMatches[dateKey] = [];
    groupedMatches[dateKey].push(m);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-black text-slate-800 mb-2">Terminarz Zawodów</h1>
      <div className="space-y-8">
        {Object.keys(groupedMatches).map(dateKey => (
          <div key={dateKey} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">{dateKey}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedMatches[dateKey].map((match: any) => {
                const timeStr = format(new Date(match.kickoffUtc), "HH:mm");
                const isLive = match.status === 'LIVE';
                return (
                  <div key={match._id.toString()} className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col hover:shadow-md transition ${isLive ? 'border-red-400 shadow-red-100 ring-1 ring-red-400' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                      <span>{match.stage} {match.group && <span className="text-emerald-500 ml-1">&bull; {match.group}</span>}</span>
                      <span className={isLive ? 'text-red-500 animate-pulse bg-red-50 px-2 py-0.5 rounded' : 'bg-slate-100 px-2 py-0.5 rounded text-slate-600'}>{isLive ? 'NA ŻYWO' : timeStr}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg text-slate-800 mt-auto">
                      <Link href={`/team/${encodeURIComponent(match.homeTeam)}`} className="flex-1 flex items-center justify-end gap-2 truncate hover:text-emerald-600">
                        <span className="truncate">{t(match.homeTeam)}</span>
                        <TeamFlag teamName={match.homeTeam} />
                      </Link>
                      <div className="px-3 mx-2 bg-slate-100 rounded-lg py-1 border border-slate-200 min-w-[3.5rem] text-center font-black text-slate-700">
                        {match.status !== 'SCHEDULED' ? <span>{match.score?.home ?? '-'} : {match.score?.away ?? '-'}</span> : <span className="text-slate-400 font-medium text-sm">VS</span>}
                      </div>
                      <Link href={`/team/${encodeURIComponent(match.awayTeam)}`} className="flex-1 flex items-center justify-start gap-2 truncate hover:text-emerald-600">
                        <TeamFlag teamName={match.awayTeam} />
                        <span className="truncate">{t(match.awayTeam)}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
