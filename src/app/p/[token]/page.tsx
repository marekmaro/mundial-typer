import connectToDatabase from '@/lib/db';
import Player from '@/models/Player';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import Settings from '@/models/Settings';
import crypto from 'crypto';
import { notFound } from 'next/navigation';
import PredictionCard from '@/components/PredictionCard';
import { Trophy, Bell, Construction } from 'lucide-react';

export const revalidate = 0;

export default async function PlayerDashboard({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await connectToDatabase();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const player = await Player.findOne({ tokenHash, blocked: false }).lean();
  if (!player) notFound();

  const settings = await Settings.findOne() || { maintenanceMode: false, globalMessage: "" };
  
  if (settings.maintenanceMode) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <Construction size={80} className="text-amber-500 mb-6 animate-bounce" />
        <h1 className="text-4xl font-black text-slate-900 mb-4">Konserwacja Systemu</h1>
        <p className="text-slate-500 font-bold max-w-md text-lg">W tej chwili administrator wprowadza zmiany. Zapraszamy za chwilę!</p>
      </div>
    );
  }

  const matches = await Match.find().sort({ kickoffUtc: 1 }).lean();
  const predictions = await Prediction.find({ playerId: player._id }).lean();
  const totalPoints = predictions.reduce((sum, p) => sum + (p.points || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6 pb-20">
      {settings.globalMessage && (
        <div className="bg-amber-100 border-2 border-amber-200 p-4 rounded-3xl flex items-center gap-4 text-amber-800 shadow-sm animate-pulse">
          <Bell className="shrink-0" />
          <p className="font-black text-sm">{settings.globalMessage}</p>
        </div>
      )}

      <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-emerald-400 font-black uppercase tracking-widest text-[10px] mb-2">Zawodnik</p>
            <h1 className="text-4xl font-black tracking-tighter">{player.nick}</h1>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] flex items-center gap-5">
            <Trophy className="text-amber-400" size={44} />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Twoje Punkty</p>
              <p className="text-5xl font-black tracking-tighter">{totalPoints}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match: any) => (
          <PredictionCard key={match._id.toString()} match={JSON.parse(JSON.stringify(match))} prediction={predictions.find(p => p.matchId.toString() === match._id.toString())} playerId={player._id.toString()} />
        ))}
      </div>
    </div>
  );
}
