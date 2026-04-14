import connectToDatabase from '@/lib/db';
import Match from '@/models/Match';
import Link from 'next/link';
import TeamFlag from '@/components/TeamFlag';
import { t } from '@/lib/translations';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ArrowRight, CalendarDays, Trophy } from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  await connectToDatabase();
  const upcomingMatches = await Match.find({ status: 'SCHEDULED' }).sort({ kickoffUtc: 1 }).limit(4).lean();

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 rounded-3xl p-8 md:p-16 text-white shadow-xl flex flex-col items-center text-center gap-8 border border-slate-800">
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Kto zdobędzie <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Puchar?</span>
          </h1>
          <p className="text-slate-100 text-lg md:text-xl font-light">
            Odbierz prywatny link, typuj wyniki i udowodnij znajomym, że znasz się na piłce najlepiej.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/leaderboard" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3.5 px-8 rounded-full flex items-center gap-2 text-lg">
              <Trophy size={20} /> Zobacz Ranking
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-300 pb-3">
          <CalendarDays className="text-emerald-600" /> Najbliższe Spotkania
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {upcomingMatches.map((match: any) => {
            const dateStr = format(new Date(match.kickoffUtc), "d MMMM (EEEE), HH:mm", { locale: pl });
            return (
              <div key={match._id.toString()} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition group">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center border-b border-slate-100 pb-2">
                  <span className="text-emerald-600">{dateStr}</span>
                </div>
                <div className="flex justify-between items-center font-black text-xl text-slate-800 pt-2">
                  <Link href={`/team/${encodeURIComponent(match.homeTeam)}`} className="flex-1 flex flex-col items-center gap-2 hover:text-emerald-600 truncate">
                    <TeamFlag teamName={match.homeTeam} className="w-10 h-7" />
                    <span className="truncate">{t(match.homeTeam)}</span>
                  </Link>
                  <div className="px-3 text-slate-300 font-light">VS</div>
                  <Link href={`/team/${encodeURIComponent(match.awayTeam)}`} className="flex-1 flex flex-col items-center gap-2 hover:text-emerald-600 truncate">
                    <TeamFlag teamName={match.awayTeam} className="w-10 h-7" />
                    <span className="truncate">{t(match.awayTeam)}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
