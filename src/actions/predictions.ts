'use server';

import connectToDatabase from '@/lib/db';
import Prediction from '@/models/Prediction';
import Match from '@/models/Match';
import Player from '@/models/Player';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Schemat walidacji danych przesyłanych z formularza
const predictionSchema = z.object({
  playerId: z.string(),
  matchId: z.string(),
  home: z.number().int().min(0),
  away: z.number().int().min(0),
});

export async function submitPrediction(formData: FormData) {
  await connectToDatabase();

  try {
    const rawData = {
      playerId: formData.get('playerId') as string,
      matchId: formData.get('matchId') as string,
      home: parseInt(formData.get('home') as string, 10),
      away: parseInt(formData.get('away') as string, 10),
    };

    // Walidacja danych z biblioteką Zod
    const parsedData = predictionSchema.parse(rawData);

    // 1. Sprawdź czy gracz istnieje i czy nie dostał bana
    const player = await Player.findById(parsedData.playerId);
    if (!player || player.blocked) {
      return { error: 'Gracz nie istnieje lub został zablokowany.' };
    }

    // 2. Sprawdź czy mecz istnieje i wylicz limit czasu
    const match = await Match.findById(parsedData.matchId);
    if (!match) {
      return { error: 'Mecz nie istnieje.' };
    }

    const now = new Date();
    // Odejmujemy 12 godzin w milisekundach od czasu rozpoczęcia meczu
    const deadline = new Date(match.kickoffUtc.getTime() - 12 * 60 * 60 * 1000);

    // 3. Weryfikacja blokady (Serwerowa, więc gracze nie oszukają zegarka w komputerze)
    if (now > deadline) {
      return { error: 'Typowanie zostało zamknięte (minął termin 12 godzin przed meczem).' };
    }

    // 4. Zapis (Upsert: jeśli gracz już typował ten mecz, nadpisz. Jeśli nie, stwórz nowy)
    await Prediction.findOneAndUpdate(
      { playerId: parsedData.playerId, matchId: parsedData.matchId },
      { home: parsedData.home, away: parsedData.away },
      { upsert: true, new: true }
    );

    // Odświeża stronę gracza, żeby pokazać nowy typ bez przeładowywania przeglądarki
    revalidatePath('/p/[token]', 'page'); 
    
    return { success: true, message: 'Twój typ został zapisany!' };
  } catch (error) {
    console.error("Błąd zapisu typu:", error);
    return { error: 'Nieprawidłowe dane formularza lub błąd serwera.' };
  }
}
