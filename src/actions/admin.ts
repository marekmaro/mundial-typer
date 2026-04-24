'use server';
import connectToDatabase from '@/lib/db';
import Player from '@/models/Player';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import Settings from '@/models/Settings';
import { calculatePoints } from '@/lib/scoring';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { syncMatchesFromAPI } from '@/lib/syncMundial';

// Inicjalizacja ustawień jeśli nie istnieją
async function getSettings() {
  await connectToDatabase();
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({ maintenanceMode: false, globalMessage: "", tournamentWinner: "" });
  return s;
}

export async function createPlayerLink(nick: string, company: string, adminSecret: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Błąd hasła' };
  await connectToDatabase();
  const rawToken = crypto.randomBytes(16).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await Player.create({ nick: nick.trim(), company: company.trim() || 'Ogólna', tokenHash, rawToken });
  revalidatePath('/admin');
  return { success: true, token: rawToken };
}

export async function updateGlobalSettings(adminSecret: string, data: any) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Błąd hasła' };
  await connectToDatabase();
  await Settings.findOneAndUpdate({}, data, { upsert: true });
  revalidatePath('/admin'); revalidatePath('/p/[token]', 'page');
  return { success: true, message: "Ustawienia zapisane!" };
}

export async function recalculateAllPoints(adminSecret: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Błąd hasła' };
  await connectToDatabase();
  const settings = await getSettings();
  const matches = await Match.find({ status: 'FINISHED' });
  
  const players = await Player.find();
  for (const player of players) {
    let total = 0;
    // 1. Punkty z meczów
    const preds = await Prediction.find({ playerId: player._id });
    for (const p of preds) {
      const m = matches.find(match => match._id.toString() === p.matchId.toString());
      if (m) {
        const hR = m.scoreOverride?.home ?? m.score.home;
        const aR = m.scoreOverride?.away ?? m.score.away;
        const pts = calculatePoints(p.home, p.away, hR, aR, p.isJoker);
        p.points = pts;
        await p.save();
      }
    }
    // 2. Bonus za mistrza (+10 pkt)
    if (settings.tournamentWinner && player.predictedWinner === settings.tournamentWinner) {
      // Logika punktów za mistrza jest doliczana w locie w Rankingu, 
      // lub możemy tu dodać pole 'bonusPoints' w modelu Player.
    }
  }
  revalidatePath('/leaderboard'); revalidatePath('/admin');
  return { success: true, message: "Ranking przeliczony!" };
}

export async function getAdminData(adminSecret: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Brak dostępu' };
  await connectToDatabase();
  const players = await Player.find().sort({ createdAt: -1 }).lean();
  const settings = await getSettings();
  const matches = await Match.find().sort({ kickoffUtc: 1 }).lean();
  return { success: true, players: JSON.parse(JSON.stringify(players)), settings: JSON.parse(JSON.stringify(settings)), matches: JSON.parse(JSON.stringify(matches)) };
}

export async function deletePlayerAction(adminSecret: string, id: string) {
  await connectToDatabase();
  await Prediction.deleteMany({ playerId: id });
  await Player.findByIdAndDelete(id);
  revalidatePath('/admin');
  return { success: true };
}

export async function togglePlayerBlock(id: string, status: boolean) {
  await connectToDatabase();
  await Player.findByIdAndUpdate(id, { blocked: !status });
  revalidatePath('/admin');
  return { success: true };
}

export async function updateWinnerSelection(adminSecret: string, playerId: string, team: string) {
  await connectToDatabase();
  await Player.findByIdAndUpdate(playerId, { predictedWinner: team });
  return { success: true };
}
