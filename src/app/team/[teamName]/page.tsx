import connectToDatabase from '@/lib/db';
import Match from '@/models/Match';
import TeamFlag from '@/components/TeamFlag';
import Link from 'next/link';
import { ArrowLeft, Activity, Target, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { t } from '@/lib/translations';

export const revalidate = 60;

// FIX dla Next.js 15 - params to teraz Promise
type Props = { params: Promise<{ teamName: string }> };

export default async function TeamPage(props: Props) {
  const resolvedParams = await props.params;
  if (!resolvedParams || !resolvedParams.teamName) return <div className="text-center py-20">Nie znaleziono drużyny.</div>;
  
  const rawTeamName = decodeURIComponent(resolvedParams.teamName);
  await connectToDatabase();

  const matches = await Match.find({
    $or: [{ homeTeam: rawTeamName }, { awayTeam: rawTeamName }]
  }).sort({ kickoffUtc: 1 }).lean();

  if (matches.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-4">
        <div className="text-6xl mb-4">🤷‍♂️</div>
        <h1 className="text-2xl font-bold text-slate-800">Brak danych dla drużyny: <span className="text-emerald-600">{t(rawTeamName)}</span></h1>
        <p className="text-slate-500">Prawdopodobnie API turniejowe nie zsynchronizowało jeszcze meczów tej grupy.</p>
        <Link href="/schedule" className="inline-block mt-4 bg-slate-800 text-white px-6 py-2 rounded-lg font-bold">Wróć do Terminarza</Link>
      </div>
    );
  }

  let played = 0, won = 0, drawn = 0, lost = 0, goalsScored = 0, goalsConceded = 0;

  matches.forEach(m => {
    if (m.status === 'FINISHED' && m.score.home !== null && m.score.away !== null) {
      played++;
      const isHome = m.homeTeam === rawTeamName;
      const scored = isHome ? m.score.home : m.score.away;
      const conceded = isHome ? m.score.away : m.score.home;
      goalsScored += scored; goalsConceded += conceded;
      if (scored > conceded) won++;
      else if (scored === conceded) drawn++;
      else lost++;
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/schedule" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft size={16} /> Wróć
      </Link>
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner flex items-center justify-center bg-slate-50 shrink-0 relative">
           <TeamFlag teamName={rawTeamName} className="w-[150%] h-[150%] object-cover opacity-90" />
        </div>
        <div className="text-center md:text-left flex-1">
           <div className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-2">Profil Reprezentacji</div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-6">{t(rawTeamName)}</h1>
           <div className="grid grid-cols-3 gap-4">
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center shadow-sm">
               <Activity className="text-blue-500 mb-2" />
               <span className="text-2xl font-black text-slate-700">{played}</span>
               <span className="text-[10px] uppercase font-bold text-slate-400">Rozegrane</span>
             </div>
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center shadow-sm">
               <Target className="text-emerald-500 mb-2" />
               <span className="text-2xl font-black text-slate-700">{goalsScored}</span>
               <span className="text-[10px] uppercase font-bold text-slate-400">Strzelone</span>
             </div>
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center shadow-sm">
               <ShieldAlert className="text-red-500 mb-2" />
               <span className="text-2xl font-black text-slate-700">{goalsConceded}</span>
               <span className="text-[10px] uppercase font-bold text-slate-400">Stracone</span>
             </div>
           </div>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 border-b pb-2">Mecze Drużyny</h2>
        <div className="grid grid-cols-1 gap-3">
          {matches.map((match: any) => {
             const isFinished = match.status === 'FINISHED';
             const dateStr = format(new Date(match.kickoffUtc), "d MMMM yyyy, HH:mm", { locale: pl });
             return (
               <div key={match._id.toString()} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 hover:shadow-md transition">
                 <div className="text-xs font-bold text-slate-400 uppercase w-full sm:w-1/4 text-center sm:text-left">
                   {dateStr} <br/> <span className="text-emerald-600">{match.stage}</span>
                 </div>
                 <div className="flex-1 flex justify-center items-center gap-4 w-full">
                   <div className={`flex-1 text-right font-bold truncate ${match.homeTeam === rawTeamName ? 'text-emerald-700 text-lg' : 'text-slate-600'}`}>
                     {t(match.homeTeam)} <TeamFlag teamName={match.homeTeam} className="ml-2" />
                   </div>
                   <div className="bg-slate-100 px-4 py-2 rounded-lg font-black text-slate-800 shrink-0 border border-slate-200">
                     {isFinished ? `${match.score.home} : ${match.score.away}` : 'VS'}
                   </div>
                   <div className={`flex-1 text-left font-bold truncate ${match.awayTeam === rawTeamName ? 'text-emerald-700 text-lg' : 'text-slate-600'}`}>
                     <TeamFlag teamName={match.awayTeam} className="mr-2" /> {t(match.awayTeam)}
                   </div>
                 </div>
               </div>
             )
          })}
        </div>
      </div>
    </div>
  );
}
