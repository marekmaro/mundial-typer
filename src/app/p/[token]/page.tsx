import connectToDatabase from '@/lib/db';
import Player from '@/models/Player';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import Settings from '@/models/Settings';
import crypto from 'crypto';
import { notFound } from 'next/navigation';
import PlayerDashboardClient from '@/components/PlayerDashboardClient';
import { Construction, Bell } from 'lucide-react';

export const revalidate = 0;

type Props = { params: Promise<{ token: string }> };

export default async function PlayerDashboard(props: Props) {
  const { token } = await props.params;
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
        <p className="text-slate-500 font-bold max-w-md text-lg">Administrator wprowadza aktualizacje. Wróć za chwilę!</p>
      </div>
    );
  }

  const matches = await Match.find().sort({ kickoffUtc: 1 }).lean();
  const predictions = await Prediction.find({ playerId: player._id }).lean();
  const totalPoints = predictions.reduce((sum, p) => sum + (p.points || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4">
      {settings.globalMessage && (
        <div className="bg-amber-100 border-2 border-amber-300 p-4 rounded-2xl flex items-center gap-4 text-amber-900 shadow-sm animate-pulse mb-6">
          <Bell className="shrink-0" size={24} />
          <p className="font-black text-sm">{settings.globalMessage}</p>
        </div>
      )}
      
      <PlayerDashboardClient 
        player={JSON.parse(JSON.stringify(player))} 
        matches={JSON.parse(JSON.stringify(matches))} 
        predictions={JSON.parse(JSON.stringify(predictions))} 
        totalPoints={totalPoints}
        appUrl={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
      />
    </div>
  );
}
