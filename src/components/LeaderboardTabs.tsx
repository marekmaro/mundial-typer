'use client';
import { useState } from 'react';
import { Trophy, Users, Star } from 'lucide-react';

export default function LeaderboardTabs({ stats }: { stats: any[] }) {
  const companies = Array.from(new Set(stats.map(s => s.company))).filter(Boolean).sort();
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const filteredStats = activeTab === 'ALL' 
    ? stats 
    : stats.filter(s => s.company === activeTab);

  return (
    <div>
      {companies.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit mx-auto md:mx-0">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
          >
            <Trophy size={16} /> Klasyfikacja Ogólna
          </button>
          {companies.map((company: any) => (
            <button 
              key={company}
              onClick={() => setActiveTab(company)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === company ? 'bg-emerald-600 text-white shadow-md' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
            >
              <Users size={16} /> {company}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <th className="py-5 px-4 sm:px-6 w-16 text-center">Poz.</th>
              <th className="py-5 px-4 sm:px-6">Zawodnik</th>
              <th className="py-5 px-4 sm:px-6 text-center w-28 sm:w-32">Punkty</th>
              <th className="py-5 px-4 sm:px-6 text-center w-28 sm:w-32 hidden sm:table-cell" title="Dokładnie wytypowany wynik">Idealne traf.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStats.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-slate-500 font-medium">Brak danych do wyświetlenia.</td></tr>
            ) : (
              filteredStats.map((player, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;
                
                return (
                  <tr key={player.id} className={`transition-colors hover:bg-slate-50/80 ${isFirst ? 'bg-gradient-to-r from-amber-50 to-white' : isSecond ? 'bg-gradient-to-r from-slate-50 to-white' : isThird ? 'bg-gradient-to-r from-orange-50 to-white' : ''}`}>
                    <td className="py-4 px-4 sm:px-6 text-center">
                      {isFirst ? <div className="mx-auto w-8 h-8 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center text-white font-black shadow-md shadow-amber-500/30">1</div>
                       : isSecond ? <div className="mx-auto w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center text-white font-black shadow-md shadow-slate-500/20">2</div>
                       : isThird ? <div className="mx-auto w-8 h-8 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20">3</div>
                       : <div className="font-bold text-slate-400">{index + 1}</div>}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className={`font-black text-lg ${isFirst ? 'text-amber-700' : isSecond ? 'text-slate-700' : isThird ? 'text-orange-700' : 'text-slate-700'}`}>
                        {player.nick}
                      </div>
                      {activeTab === 'ALL' && player.company && player.company !== 'Ogólna' && (
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">{player.company}</div>
                      )}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="inline-flex items-center justify-center bg-slate-100 rounded-xl px-4 py-2 font-black text-xl text-slate-800 w-full">
                         {player.totalPoints}
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-center hidden sm:table-cell">
                      <div className="inline-flex items-center gap-1.5 text-slate-500 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                        <Star size={14} className={player.exactHits > 0 ? "text-amber-400 fill-amber-400" : "text-slate-300"} /> 
                        {player.exactHits}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
