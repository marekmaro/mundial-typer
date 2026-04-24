import { Shield, Clock, Target, AlertTriangle, Users, Star, Trophy } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 px-4 pb-20">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900">Zasady Zabawy</h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-bold tracking-widest uppercase text-sm">System punktacji by Mar0</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Mistrz Turnieju */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] shadow-xl flex flex-col gap-5 text-white">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20"><Trophy size={32} className="text-amber-400" /></div>
          <h2 className="text-2xl font-black">Mistrz Świata</h2>
          <p className="text-slate-300 text-sm leading-relaxed font-bold">W panelu głównym wytypuj, kto zdobędzie puchar. Trafienie Mistrza to potężny bonus <span className="text-emerald-400 text-lg font-black">+10 punktów</span> do rankingu! <strong>Uwaga:</strong> Zapis blokuje się w chwili startu pierwszego meczu na Mundialu.</p>
        </div>

        {/* Złoty Joker */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-[2.5rem] shadow-xl flex flex-col gap-5 text-white">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30"><Star size={32} fill="white" /></div>
          <h2 className="text-2xl font-black">Złoty Joker (x2)</h2>
          <p className="text-white/90 text-sm leading-relaxed font-bold">Masz do dyspozycji Jokera w fazie grupowej i fazie pucharowej. Kliknij przycisk "Joker" nad meczem, a zdobyte w nim punkty zostaną <strong>pomnożone x2</strong> (np. trafisz idealnie = 6 pkt). Używaj strategicznie!</p>
        </div>

        {/* Punktacja */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col gap-5 hover:border-blue-200 transition">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Target size={32} /></div>
          <h2 className="text-2xl font-black text-slate-900">Punktacja Meczów</h2>
          <ul className="text-slate-700 text-sm space-y-4 font-black">
            <li className="flex items-center gap-4"><span className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg w-16 text-center shadow-sm">3 pkt</span> Idealny wynik (np. dałeś 2:1, jest 2:1)</li>
            <li className="flex items-center gap-4"><span className="bg-amber-500 text-white px-3 py-1.5 rounded-lg w-16 text-center shadow-sm">1 pkt</span> Rezultat/Kierunek (np. dałeś 1:0, było 3:0)</li>
            <li className="flex items-center gap-4"><span className="bg-slate-200 text-slate-500 px-3 py-1.5 rounded-lg w-16 text-center">0 pkt</span> Pudło</li>
          </ul>
        </div>

        {/* Deadline */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col gap-5 hover:border-red-200 transition">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center"><Clock size={32} /></div>
          <h2 className="text-2xl font-black text-slate-900">Deadline: 12 Godzin</h2>
          <p className="text-slate-600 text-sm leading-relaxed font-bold">Każdy mecz zamyka się do typowania na <strong>12 godzin</strong> przed jego rozpoczęciem. Po tym czasie kłódka się zamyka i Twój typ jest ostateczny. Pilnuj czasu!</p>
        </div>

        {/* Czas Regulaminowy */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col gap-5 hover:border-purple-200 transition">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><Shield size={32} /></div>
          <h2 className="text-2xl font-black text-slate-900">Tylko 90 Minut</h2>
          <p className="text-slate-600 text-sm leading-relaxed font-bold">Gramy wyłącznie na <strong>wynik po 90 minutach gry</strong> (plus doliczony czas). Ewentualne dogrywki i rzuty karne w fazie pucharowej nie mają dla nas znaczenia!</p>
        </div>

        {/* Twoje Konto */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col gap-5 hover:border-slate-300 transition">
          <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center"><Users size={32} /></div>
          <h2 className="text-2xl font-black text-slate-900">Twoje Konto</h2>
          <p className="text-slate-600 text-sm leading-relaxed font-bold">Logujesz się z użyciem prywatnego linku. Zapisz go lub wyślij sobie na WhatsApp. Jeśli go zgubisz, Mar0 wygeneruje Ci nowy, ale stary przestanie działać.</p>
        </div>

      </div>

      <div className="bg-amber-100/50 rounded-3xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-sm text-amber-900 border-2 border-amber-200 shadow-sm mt-12">
        <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={36} />
        <div className="text-center sm:text-left">
          <p className="font-black text-lg mb-2 uppercase tracking-widest text-amber-600">Zasady Remisu w Rankingu:</p>
          <p className="font-bold leading-relaxed text-amber-800/80">W przypadku równej ilości punktów, wyżej w tabeli będzie osoba z większą liczbą "idealnych trafień" (strzałów za 3 punkty). Jeśli nadal jest remis, decyduje kolejność alfabetyczna nicków.</p>
        </div>
      </div>
    </div>
  );
}
