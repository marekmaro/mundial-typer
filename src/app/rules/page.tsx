import { Shield, Clock, Target, AlertTriangle, Users, Star, Trophy } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 px-4">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900">Zasady Zabawy</h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium">Przeczytaj uważnie, zaplanuj strategię i walcz o pierwsze miejsce w rankingu!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Złoty Joker */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-3xl shadow-sm border border-amber-200 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10"><Star size={100} /></div>
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Star size={28} fill="white" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Złoty Joker (x2)</h2>
          <p className="text-slate-700 text-sm leading-relaxed font-medium">
            Masz do dyspozycji <strong>dwa Jokery</strong> na cały turniej: jednego w fazie grupowej i jednego w fazie pucharowej. 
            Mecz oznaczony Jokerem <strong>mnoży zdobyte w nim punkty x2</strong> (np. za idealny wynik dostaniesz aż 6 punktów!). Wybieraj mądrze!
          </p>
        </div>

        {/* Typowanie Mistrza */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4 hover:border-emerald-300 transition">
          <div className="w-14 h-14 bg-slate-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Trophy size={28} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Mistrz Turnieju</h2>
          <p className="text-slate-700 text-sm leading-relaxed font-medium">
            Na samej górze Twojego panelu możesz wytypować drużynę, która według Ciebie zdobędzie Puchar Świata. 
            Za trafne wytypowanie Mistrza otrzymasz <strong>potężny bonus +15 punktów</strong> na sam koniec turnieju. Uwaga: Możliwość typowania blokuje się wraz z pierwszym gwizdkiem Mundialu!
          </p>
        </div>

        {/* Punktacja */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4 hover:border-blue-300 transition">
          <div className="w-14 h-14 bg-slate-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <Target size={28} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Punktacja Meczów</h2>
          <ul className="text-slate-700 text-sm space-y-3 font-medium">
            <li className="flex items-center gap-3">
              <span className="bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded text-xs w-12 text-center">3 pkt</span> 
              <span>Za <strong>idealne</strong> trafienie (np. dałeś 2:1, jest 2:1).</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-amber-100 text-amber-700 font-black px-2 py-1 rounded text-xs w-12 text-center">1 pkt</span> 
              <span>Za trafienie <strong>rezultatu/zwycięzcy</strong> (np. dałeś 1:0, a było 3:0).</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-slate-100 text-slate-500 font-black px-2 py-1 rounded text-xs w-12 text-center">0 pkt</span> 
              <span>Pudło. Całkowicie nietrafiony wynik.</span>
            </li>
          </ul>
        </div>

        {/* Deadline */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4 hover:border-red-300 transition">
          <div className="w-14 h-14 bg-slate-100 text-red-500 rounded-2xl flex items-center justify-center">
            <Clock size={28} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Deadline: 12 Godzin</h2>
          <p className="text-slate-700 text-sm leading-relaxed font-medium">
            Każdy mecz zamyka się do typowania na dokładnie <strong>12 godzin przed jego rozpoczęciem</strong>. 
            Po tym czasie kłódka się zamyka i Twój typ zostaje ostatecznie zatwierdzony. Nie przegap terminu!
          </p>
        </div>

        {/* Czas Regulaminowy */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4 hover:border-purple-300 transition">
          <div className="w-14 h-14 bg-slate-100 text-purple-600 rounded-2xl flex items-center justify-center">
            <Shield size={28} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Czas Regulaminowy</h2>
          <p className="text-slate-700 text-sm leading-relaxed font-medium">
            Gramy tylko i wyłącznie na <strong>wynik po 90 minutach</strong> gry (plus doliczony czas przez sędziego). 
            Wyniki ewentualnych dogrywek i rzutów karnych w fazie pucharowej nie są brane pod uwagę!
          </p>
        </div>

        {/* Twoje Konto */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4 hover:border-slate-400 transition">
          <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center">
            <Users size={28} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Twoje Konto</h2>
          <p className="text-slate-700 text-sm leading-relaxed font-medium">
            Dostęp do Twojego panelu to Twój unikalny link. Jeśli go zgubisz, poproś administratora (Mar0) o wygenerowanie nowego. 
            Nie udostępniaj go nikomu, w przeciwnym razie ktoś może zmienić Twoje typy!
          </p>
        </div>

      </div>

      <div className="bg-slate-900 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-sm text-slate-300 border border-slate-800 shadow-xl mt-8">
        <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={24} />
        <div className="text-center sm:text-left">
          <p className="font-bold text-white text-base mb-1">Zasady ustalania rankingu przy remisie:</p>
          <p>W przypadku równej ilości punktów, wyżej w tabeli będzie osoba z większą liczbą "idealnych trafień" (strzałów za 3 punkty). Jeśli nadal jest remis, decyduje kolejność alfabetyczna nicków.</p>
        </div>
      </div>
    </div>
  );
}
