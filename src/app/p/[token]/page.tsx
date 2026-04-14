import connectToDatabase from '@/lib/db';
import Player from '@/models/Player';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import crypto from 'crypto';
import { notFound } from 'next/navigation';
import PredictionCard from '@/components/PredictionCard';
import CopyLinkButton from '@/components/CopyLinkButton';
import { Trophy } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

type Props = { params: Promise<{ token: string }> };

export default async function PlayerDashboard(props: Props) {
  const resolvedParams = await props.params;
  await connectToDatabase();
  const tokenHash = crypto.createHash('sha256').update(resolvedParams.token).digest('hex');
  const player = await Player.findOne({ tokenHash, blocked: false }).lean();
  
  if (!player) notFound();

  const matches = await Match.find().sort({ kickoffUtc: 1 }).lean();
  const predictions = await Prediction.find({ playerId: player._id }).lean();
  const totalPoints = predictions.reduce((sum, p) => sum + (p.points || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
          <div className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">Zalogowany jako</div>
          <h1 className="text-3xl font-black">{player.nick}</h1>
          <CopyLinkButton />
        </div>
        <div className="bg-slate-950/50 border border-slate-700 px-8 py-4 rounded-xl flex items-center gap-3">
          <Trophy className="text-amber-400" size={32} />
          <div className="flex flex-col">
             <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Twoje Punkty</span>
             <span className="text-4xl font-black text-white leading-none">{totalPoints}</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-end border-b pb-2">
          <h2 className="text-2xl font-bold text-slate-800">Typuj Mecze</h2>
          <Link href="/leaderboard" className="text-sm font-semibold text-blue-600 hover:text-blue-800">Ranking &rarr;</Link>
        </div>
        {matches.length === 0 ? (
           <div className="text-center py-10 bg-white border rounded-xl text-slate-500">Poczekaj aż Organizator pobierze mecze.</div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {matches.map((match: any) => {
               const pred = predictions.find(p => p.matchId.toString() === match._id.toString());
               return (
                 <PredictionCard 
                   key={match._id.toString()} 
                   match={JSON.parse(JSON.stringify(match))} 
                   prediction={pred ? JSON.parse(JSON.stringify(pred)) : null} 
                   playerId={player._id.toString()} 
                 />
               );
             })}
           </div>
        )}
      </div>
    </div>
  );
}
