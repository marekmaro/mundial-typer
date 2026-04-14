import { Shield, Clock, Target, AlertTriangle, Users } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">Zasady Zabawy</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Krótko, zwięźle i na temat. Przeczytaj, zanim zaczniesz typować!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Karta 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3 hover:shadow-md transition">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Twoje Konto</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Nie potrzebujesz hasła. Logujesz się swoim <strong>unikalnym linkiem</strong>. Zapisz go! Nie udostępniaj go nikomu, bo inni będą mogli zmieniać Twoje typy.
          </p>
        </div>

        {/* Karta 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3 hover:shadow-md transition">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Deadline: 12 Godzin</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Typowanie zamyka się dokładnie <strong>12 godzin przed pierwszym gwizdkiem</strong>. Po tym czasie pole jest blokowane i typ zostaje zatwierdzony na stałe.
          </p>
        </div>

        {/* Karta 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3 hover:shadow-md transition">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <Target size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Punktacja</h2>
          <ul className="text-slate-600 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 w-12 shrink-0">3 pkt</span> 
              <span>Za <strong>idealne</strong> trafienie wyniku (np. dałeś 2:1, jest 2:1).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-amber-500 w-12 shrink-0">1 pkt</span> 
              <span>Za <strong>rezultat</strong> (np. dałeś 1:0, a było 3:0 - trafiłeś zwycięzcę).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-slate-400 w-12 shrink-0">0 pkt</span> 
              <span>Pudło (np. dałeś wygraną, a był remis).</span>
            </li>
          </ul>
        </div>

        {/* Karta 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3 hover:shadow-md transition">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <Shield size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Czas Regulaminowy</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Gramy tylko i wyłącznie na <strong>wynik po 90 minutach</strong> (plus doliczony czas). Dogrywki i rzuty karne w fazie pucharowej nas nie interesują!
          </p>
        </div>
      </div>

      <div className="bg-slate-100 rounded-xl p-5 flex items-start gap-4 text-sm text-slate-600 border border-slate-200 mt-8">
        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <p>W przypadku równej ilości punktów w rankingu, wygrywa osoba z większą liczbą "idealnych strzałów" (za 3 punkty). Jeśli nadal jest remis, decyduje kolejność alfabetyczna.</p>
      </div>
    </div>
  );
}
