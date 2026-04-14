import connectToDatabase from '@/lib/db';
import Player from '@/models/Player';
import Prediction from '@/models/Prediction';
import LeaderboardTabs from '@/components/LeaderboardTabs';

export const revalidate = 60;

export default async function LeaderboardPage() {
  await connectToDatabase();
  const players = await Player.find({ blocked: false }).lean();
  const predictions = await Prediction.find({ points: { $ne: null } }).lean();

  const stats = players.map(player => {
    const playerPreds = predictions.filter(p => p.playerId.toString() === player._id.toString());
    const totalPoints = playerPreds.reduce((sum, p) => sum + (p.points || 0), 0);
    const exactHits = playerPreds.filter(p => p.points === 3).length;
    return {
      id: player._id.toString(),
      nick: player.nick,
      company: player.company || 'Ogólna',
      totalPoints,
      exactHits
    };
  });

  stats.sort((a, b) => b.totalPoints - a.totalPoints || b.exactHits - a.exactHits || a.nick.localeCompare(b.nick));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center md:text-left mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800">Ranking Graczy</h1>
        <p className="text-slate-500 mt-2 font-medium">Klasyfikacja generalna i podział na firmy.</p>
      </div>
      <LeaderboardTabs stats={stats} />
    </div>
  );
}
