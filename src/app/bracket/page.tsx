import connectToDatabase from '@/lib/db';
import Match from '@/models/Match';
import TeamFlag from '@/components/TeamFlag';
import Link from 'next/link';
import { t } from '@/lib/translations';

export const dynamic = 'force-dynamic';

function calculateGroupStandings(groupMatches: any[]) {
  const teams: Record<string, { played: number, won: number, drawn: number, lost: number, gf: number, ga: number, points: number }> = {};
  groupMatches.forEach(m => {
    if (!teams[m.homeTeam]) teams[m.homeTeam] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 };
    if (!teams[m.awayTeam]) teams[m.awayTeam] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 };
    if (m.status === 'FINISHED' && m.score?.home !== null && m.score?.away !== null) {
      teams[m.homeTeam].played++; teams[m.awayTeam].played++;
      teams[m.homeTeam].gf += m.score.home; teams[m.homeTeam].ga += m.score.away;
      teams[m.awayTeam].gf += m.score.away; teams[m.awayTeam].ga += m.score.home;
      if (m.score.home > m.score.away) {
        teams[m.homeTeam].won++; teams[m.homeTeam].points += 3; teams[m.awayTeam].lost++;
      } else if (m.score.home < m.score.away) {
        teams[m.awayTeam].won++; teams[m.awayTeam].points += 3; teams[m.homeTeam].lost++;
      } else {
        teams[m.homeTeam].drawn++; teams[m.awayTeam].drawn++;
        teams[m.homeTeam].points += 1; teams[m.awayTeam].points += 1;
      }
    }
  });

  return Object.entries(teams)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
}

export default async function BracketPage() {
  await connectToDatabase();
  const allMatches = await Match.find().sort({ kickoffUtc: 1 }).lean();
  
  const groupMatches = allMatches.filter(m => m.group && m.group.startsWith('Grupa'));
  const groupsRaw = Array.from(new Set(groupMatches.map(m => m.group))).sort();
  
  // DODANO: 1/16 Finału, ponieważ turniej 2026 ma 48 drużyn
  const knockoutStages = ['1/16 Finału', '1/8 Finału', 'Ćwierćfinał', 'Półfinał', 'Finał', 'Mecz o 3. miejsce'];
  const knockoutMatches = allMatches.filter(m => knockoutStages.includes(m.stage));

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      
      {/* FAZA GRUPOVA */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-slate-800">Faza Grupowa</h1>
          <p className="text-slate-500 font-medium">Tabele turniejowe aktualizowane na żywo</p>
        </div>

        {groupsRaw.length === 0 ? (
           <div className="text-center py-10 bg-white rounded-xl border text-slate-500">Brak przypisanych grup w API.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupsRaw.map(groupName => {
              const matchesInThisGroup = groupMatches.filter(m => m.group === groupName);
              const standings = calculateGroupStandings(matchesInThisGroup);
              
              return (
                <div key={groupName as string} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-slate-800 text-white py-3 px-4 text-sm font-black tracking-widest uppercase text-center">
                    {groupName as string}
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-slate-400 uppercase">
                        <th className="py-2 px-3">Kraj</th>
                        <th className="py-2 px-2 text-center" title="Rozegrane Mecze">M</th>
                        <th className="py-2 px-2 text-center" title="Bilans Bramek">BB</th>
                        <th className="py-2 px-3 text-center font-bold text-slate-600">PKT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {standings.map((team, index) => (
                        <tr key={team.name} className={index < 2 ? 'bg-emerald-50/30' : ''}>
                          <td className="py-3 px-3 flex items-center gap-2">
                             <div className={`w-1 h-4 rounded-full ${index < 2 ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                             <TeamFlag teamName={team.name} className="w-5 h-3" />
                             <Link href={`/team/${encodeURIComponent(team.name)}`} className="font-bold text-slate-700 hover:text-emerald-600 truncate max-w-[100px]">{t(team.name)}</Link>
                          </td>
                          <td className="py-3 px-2 text-center font-medium text-slate-500">{team.played}</td>
                          <td className="py-3 px-2 text-center font-medium text-slate-500">{team.gf}:{team.ga}</td>
                          <td className="py-3 px-3 text-center font-black text-slate-800">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAZA PUCHAROWA */}
      <div className="space-y-10 border-t-4 border-slate-100 pt-16">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-slate-800">Faza Pucharowa</h2>
          <p className="text-slate-500 font-medium">Droga do finału Mistrzostw Świata</p>
        </div>
        
        {knockoutMatches.length === 0 ? (
           <div className="text-center py-10 text-slate-500">Mecze pucharowe pojawią się po wyjściu drużyn z grup.</div>
        ) : (
          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {knockoutStages.map(stage => {
              const stageMatches = knockoutMatches.filter(m => m.stage === stage);
              if (stageMatches.length === 0) return null;
              return (
                <div key={stage} className="relative z-10">
                  <div className="sticky top-20 flex items-center justify-center mb-6">
                    <h3 className="bg-emerald-600 text-white px-6 py-2 rounded-full font-bold shadow-md tracking-widest uppercase text-sm border-4 border-slate-50">{stage}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4">
                    {stageMatches.map((match: any) => (
                      <div key={match._id.toString()} className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm hover:border-emerald-400 transition-colors flex justify-between items-center">
                         <Link href={`/team/${encodeURIComponent(match.homeTeam)}`} className="flex-1 flex flex-col items-start gap-1 hover:text-emerald-600 truncate">
                            <TeamFlag teamName={match.homeTeam} className="w-8 h-5" />
                            <span className="font-bold text-sm truncate w-full">{t(match.homeTeam)}</span>
                         </Link>
                         <div className="px-4 text-center shrink-0">
                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">{new Date(match.kickoffUtc).toLocaleDateString('pl-PL')}</div>
                            <div className="bg-slate-100 rounded px-3 py-1 font-black text-lg">
                              {match.status !== 'SCHEDULED' ? `${match.score?.home ?? '-'} : ${match.score?.away ?? '-'}` : 'VS'}
                            </div>
                         </div>
                         <Link href={`/team/${encodeURIComponent(match.awayTeam)}`} className="flex-1 flex flex-col items-end gap-1 hover:text-emerald-600 truncate">
                            <TeamFlag teamName={match.awayTeam} className="w-8 h-5" />
                            <span className="font-bold text-sm text-right w-full truncate">{t(match.awayTeam)}</span>
                         </Link>
                      </div>
                    ))}
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
