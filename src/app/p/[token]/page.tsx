import connectToDatabase from '@/lib/db';
import Player from '@/models/Player';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import crypto from 'crypto';
import { notFound } from 'next/navigation';
import PredictionCard from '@/components/PredictionCard';
import { Trophy, Share2 } from 'lucide-react';

export const revalidate = 0;

export default async function PlayerDashboard({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await connectToDatabase();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const player = await Player.findOne({ tokenHash, blocked: false }).lean();
  if (!player) notFound();

  const matches = await Match.find().sort({ kickoffUtc: 1 }).lean();
  const predictions = await Prediction.find({ playerId: player._id }).lean();
  const totalPoints = predictions.reduce((sum, p) => sum + (p.points || 0), 0);

  const waMessage = encodeURIComponent(`Hej! Typuję wyniki Mistrzostw FIFA 2026. Mam już ${totalPoints} pkt! Wejdź do gry: ${process.env.NEXT_PUBLIC_APP_URL}`);

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Zawodnik</p>
            <h1 className="text-4xl font-black">{player.nick}</h1>
            <div className="mt-4 flex gap-2">
               <a href={`https://wa.me/?text=${waMessage}`} className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full font-bold text-xs hover:scale-105 transition-transform">
                 <Share2 size={14}/> WhatsApp
               </a>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl flex items-center gap-4">
            <Trophy className="text-amber-400" size={40} />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Twój Wynik</p>
              <p className="text-5xl font-black leading-none">{totalPoints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mistrz Turnieju */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-[2rem] text-white shadow-lg">
         <h3 className="font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">🏆 Kto zostanie Mistrzem Świata? (+15 pkt)</h3>
         <div className="flex gap-4">
            <input type="text" placeholder="Wpisz nazwę państwa..." className="flex-1 bg-white/20 border border-white/30 rounded-2xl px-4 py-3 outline-none font-bold placeholder:text-white/50" />
            <button className="bg-white text-orange-600 px-6 py-3 rounded-2xl font-black text-sm">ZAPISZ</button>
         </div>
      </div>

      {/* Lista meczów */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match: any) => (
          <PredictionCard key={match._id.toString()} match={JSON.parse(JSON.stringify(match))} prediction={predictions.find(p => p.matchId.toString() === match._id.toString())} playerId={player._id.toString()} />
        ))}
      </div>
    </div>
  );
}
