'use server';
import connectToDatabase from '@/lib/db';
import Prediction from '@/models/Prediction';
import Player from '@/models/Player';
import { revalidatePath } from 'next/cache';

export async function submitPrediction(payload: { playerId: string, matchId: string, home: number, away: number, isJoker: boolean }) {
  await connectToDatabase();
  try {
    await Prediction.findOneAndUpdate(
      { playerId: payload.playerId, matchId: payload.matchId },
      { home: payload.home, away: payload.away, isJoker: payload.isJoker, updatedAt: new Date() },
      { upsert: true }
    );
    revalidatePath('/p/[token]', 'page');
    return { success: true };
  } catch (error) {
    return { error: 'Błąd zapisu.' };
  }
}

export async function saveWinnerPrediction(playerId: string, team: string) {
  await connectToDatabase();
  try {
    await Player.findByIdAndUpdate(playerId, { predictedWinner: team });
    revalidatePath('/p/[token]', 'page');
    return { success: true };
  } catch (error) {
    return { error: 'Błąd zapisu mistrza.' };
  }
}
