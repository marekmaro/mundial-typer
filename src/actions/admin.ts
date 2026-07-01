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

export async function getSettings() {
  await connectToDatabase();
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({ maintenanceMode: false, globalMessage: "", tournamentWinner: "" });
  return s;
}

export async function createPlayerLink(nick: string, company: string, adminSecret: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Nieprawidłowe hasło.' };
  await connectToDatabase();
  try {
    const rawToken = crypto.randomBytes(16).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await Player.create({ nick: nick.trim(), company: company.trim() || 'Ogólna', tokenHash, rawToken });
    revalidatePath('/admin'); revalidatePath('/leaderboard');
    return { success: true, token: rawToken };
  } catch (error) { return { error: 'Błąd tworzenia gracza.' }; }
}

export async function regeneratePlayerLink(adminSecret: string, playerId: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Nieprawidłowe hasło.' };
  await connectToDatabase();
  try {
    const rawToken = crypto.randomBytes(16).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await Player.findByIdAndUpdate(playerId, { tokenHash, rawToken });
    revalidatePath('/admin');
    return { success: true, token: rawToken };
  } catch (error) { return { error: 'Błąd podczas odnawiania linku.' }; }
}

export async function updateGlobalSettings(adminSecret: string, data: any) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Brak hasła' };
  await connectToDatabase();
  await Settings.findOneAndUpdate({}, data, { upsert: true });
  revalidatePath('/admin'); revalidatePath('/p/[token]', 'page');
  return { success: true, message: "Ustawienia zapisane!" };
}

export async function recalculateAllPoints(adminSecret: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Brak hasła.' };
  await connectToDatabase();
  const matches = await Match.find({ status: 'FINISHED' });
  for (const match of matches) {
    const homeScore = match.scoreOverride?.home ?? match.score.home;
    const awayScore = match.scoreOverride?.away ?? match.score.away;
    if (homeScore === null || awayScore === null) continue;
    const predictions = await Prediction.find({ matchId: match._id });
    for (const pred of predictions) {
      const pts = calculatePoints(pred.home, pred.away, homeScore, awayScore, pred.isJoker);
      if (pred.points !== pts) { pred.points = pts; await pred.save(); }
    }
  }
  revalidatePath('/admin'); revalidatePath('/leaderboard'); revalidatePath('/p/[token]', 'page');
  return { success: true, message: `Przeliczono punkty dla wszystkich graczy.` };
}

export async function syncMatchesAction(adminSecret: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Brak hasła.' };
  const result = await syncMatchesFromAPI();
  revalidatePath('/'); revalidatePath('/schedule'); revalidatePath('/admin'); revalidatePath('/bracket');
  return { success: true, message: `Zsynchronizowano! Dodano: ${result.added}, Info: ${result.updated}` };
}

export async function getAdminData(adminSecret: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Brak dostępu' };
  await connectToDatabase();
  const players = await Player.find().sort({ createdAt: -1 }).lean();
  const settings = await getSettings();
  const matches = await Match.find().sort({ kickoffUtc: 1 }).lean();
  return { success: true, players: JSON.parse(JSON.stringify(players)), settings: JSON.parse(JSON.stringify(settings)), matches: JSON.parse(JSON.stringify(matches)) };
}

export async function togglePlayerBlock(adminSecret: string, playerId: string, currentStatus: boolean) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Brak hasła' };
  await connectToDatabase();
  await Player.findByIdAndUpdate(playerId, { blocked: !currentStatus });
  revalidatePath('/admin'); revalidatePath('/leaderboard');
  return { success: true };
}

export async function deletePlayerAction(adminSecret: string, playerId: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Brak hasła' };
  await connectToDatabase();
  await Prediction.deleteMany({ playerId });
  await Player.findByIdAndDelete(playerId);
  revalidatePath('/admin'); revalidatePath('/leaderboard');
  return { success: true };
}

export async function getPlayerPredictionsForAdmin(adminSecret: string, playerId: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Brak hasła' };
  await connectToDatabase();
  const matches = await Match.find().sort({ kickoffUtc: 1 }).lean();
  const predictions = await Prediction.find({ playerId }).lean();
  return { success: true, matches: JSON.parse(JSON.stringify(matches)), predictions: JSON.parse(JSON.stringify(predictions)) };
}

export async function adminOverridePrediction(adminSecret: string, playerId: string, matchId: string, home: number, away: number) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Brak hasła' };
  await connectToDatabase();
  await Prediction.findOneAndUpdate({ playerId, matchId }, { home, away }, { upsert: true });
  return { success: true };
}

export async function exportLeaderboardCSV(adminSecret: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Brak hasła' };
  await connectToDatabase();
  const players = await Player.find({ blocked: false }).lean();
  const predictions = await Prediction.find({ points: { $ne: null } }).lean();
  const stats = players.map(player => {
    const pPreds = predictions.filter(p => p.playerId.toString() === player._id.toString());
    const totalPoints = pPreds.reduce((sum, p) => sum + (p.points || 0), 0);
    const exactHits = pPreds.filter(p => p.points === 3).length;
    return { nick: player.nick, company: player.company, totalPoints, exactHits };
  });
  stats.sort((a, b) => b.totalPoints - a.totalPoints || b.exactHits - a.exactHits || a.nick.localeCompare(b.nick));
  let csv = 'Pozycja,Nick,Firma,Punkty,DokladneTrafienia\n';
  stats.forEach((s, i) => { csv += `${i + 1},${s.nick},${s.company || 'Ogólna'},${s.totalPoints},${s.exactHits}\n`; });
  return { success: true, csv };
}

export async function superEditMatchAction(adminSecret: string, matchId: string, payload: any) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Odmowa dostępu' };
  await connectToDatabase();
  try {
    const updateData: any = {
      homeTeam: payload.homeTeam,
      awayTeam: payload.awayTeam,
      status: payload.status,
      kickoffUtc: new Date(payload.kickoffUtc)
    };
    if (payload.homeScore !== '' && payload.awayScore !== '') {
      updateData.scoreOverride = {
        home: parseInt(payload.homeScore),
        away: parseInt(payload.awayScore),
        updatedAt: new Date()
      };
      if (payload.status !== 'SCHEDULED') updateData.status = 'FINISHED';
    } else {
      updateData.scoreOverride = null;
    }
    await Match.findByIdAndUpdate(matchId, updateData);
    revalidatePath('/admin'); revalidatePath('/schedule'); revalidatePath('/bracket'); revalidatePath('/p/[token]', 'page');
    return { success: true, message: `Zapisano zmiany w meczu!` };
  } catch (error) { return { error: 'Błąd podczas aktualizacji meczu.' }; }
}

export async function adminOverridePlayerChampion(adminSecret: string, playerId: string, champion: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Brak hasła' };
  await connectToDatabase();
  await Player.findByIdAndUpdate(playerId, { champion });
  
  revalidatePath('/admin');
  revalidatePath('/p/[token]', 'page');

  return { success: true, message: 'Zapisano mistrza wybranego gracza!' };
}

export async function fixDatabaseDuplicates(adminSecret: string) {
  if (adminSecret !== process.env.ADMIN_SECRET) return { error: 'Brak hasła.' };
  await connectToDatabase();

  const matches = await Match.find();
  const groups = new Map<string, any[]>();

  // 1. Grupowanie meczów - szukamy duplikatów na podstawie numeru indeksu z API
  for (const m of matches) {
    const matchStr = m.providerMatchId.match(/wc26_(?:idx|match_)?(\d+)_/);
    if (matchStr && matchStr[1]) {
      const idx = matchStr[1];
      if (!groups.has(idx)) groups.set(idx, []);
      groups.get(idx)!.push(m);
    } else {
      // Fallback - jeśli mecz wpisano z palca, parujemy po czasie rozpoczęcia
      const fallbackKey = `${m.stage}_${m.kickoffUtc.getTime()}`;
      if (!groups.has(fallbackKey)) groups.set(fallbackKey, []);
      groups.get(fallbackKey)!.push(m);
    }
  }

  let removedMatches = 0;
  let movedPredictions = 0;

  // 2. Naprawianie i przenoszenie typów
  for (const [key, groupMatches] of groups.entries()) {
    if (groupMatches.length > 1) {
      // Sortujemy po dacie dodania do bazy. Najnowszy (ten z nowymi drużynami) zostaje.
      groupMatches.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());
      const keeper = groupMatches[0];
      const toRemove = groupMatches.slice(1);

      for (const oldMatch of toRemove) {
        // Znajdujemy wszystkie typy graczy, które wiszą na uszkodzonym duplikacie
        const oldPreds = await Prediction.find({ matchId: oldMatch._id });

        for (const op of oldPreds) {
          // Sprawdzamy, czy gracz nie ma już przypisanego typu w nowym meczu
          const existing = await Prediction.findOne({ matchId: keeper._id, playerId: op.playerId });
          if (!existing) {
            // Przypinamy stare typy gracza do nowego, poprawnego meczu
            op.matchId = keeper._id;
            await op.save();
            movedPredictions++;
          } else {
            // Czyścimy śmieci, jeśli gracz zdublował typ
            await Prediction.findByIdAndDelete(op._id);
          }
        }
        // Całkowicie usuwamy zduplikowany mecz
        await Match.findByIdAndDelete(oldMatch._id);
        removedMatches++;
      }
    }
  }

  // 3. Wymuszamy ostateczne przeliczenie wszystkich punktów dla zrekonstruowanej bazy
  await recalculateAllPoints(adminSecret);

  return { 
    success: true, 
    message: `Baza naprawiona! Usunięto ${removedMatches} starych duplikatów i uratowano ${movedPredictions} typów graczy. Punkty zostały zaktualizowane.` 
  };
}
