import { Shield, Clock, Target, AlertTriangle, Users, Star, Trophy } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 px-4">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900">Zasady Zabawy</h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium tracking-tight">System punktacji by Mar0</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-7 rounded-[2.5rem] shadow-sm border border-amber-200 flex flex-col gap-4 relative overflow-hidden">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30"><Star size={28} fill="white" /></div>
          <h2 className="text-xl font-black text-slate-900">Złoty Joker (x2)</h2>
          <p className="text-slate-700 text-sm leading-relaxed font-bold">Zaznacz gwiazdkę przy swoim "pewniaku". Punkty za ten mecz liczą się podwójnie! Masz 1 Jokera na grupę i 1 na fazę pucharową.</p>
        </div>

        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Trophy size={28} /></div>
          <h2 className="text-xl font-black text-slate-900">Mistrz Świata</h2>
          <p className="text-slate-700 text-sm leading-relaxed font-bold">Wskaż swojego faworyta przed turniejem. Trafienie Mistrza to dodatkowe <span className="text-emerald-600 text-lg">+10 punktów</span> do rankingu na koniec zabawy!</p>
        </div>

        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm"><Target size={28} /></div>
          <h2 className="text-xl font-black text-slate-900">Punktacja</h2>
          <ul className="text-slate-700 text-xs space-y-3 font-black uppercase">
            <li className="flex items-center gap-3"><span className="bg-emerald-500 text-white px-2 py-1 rounded w-14 text-center">3 pkt</span> Idealny wynik</li>
            <li className="flex items-center gap-3"><span className="bg-amber-500 text-white px-2 py-1 rounded w-14 text-center">1 pkt</span> Rezultat (1X2)</li>
            <li className="flex items-center gap-3"><span className="bg-slate-200 text-slate-500 px-2 py-1 rounded w-14 text-center">0 pkt</span> Pudło</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
