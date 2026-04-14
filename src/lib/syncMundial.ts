import connectToDatabase from './db';
import Match from '@/models/Match';

const API_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

// Dynamiczna funkcja tłumacząca
function translateStage(stage: string): string {
  if (stage.startsWith('Matchday')) {
    return stage.replace('Matchday', 'Kolejka'); // np. "Matchday 14" -> "Kolejka 14"
  }
  const dict: Record<string, string> = {
    'Round of 32': '1/16 Finału',
    'Round of 16': '1/8 Finału',
    'Quarter-finals': 'Ćwierćfinał',
    'Semi-finals': 'Półfinał',
    'Third place play-off': 'Mecz o 3. miejsce',
    'Final': 'Finał',
  };
  return dict[stage] || stage;
}

function parseApiDateToUTC(dateStr: string, timeStr: string): Date {
  try {
    const [time, utcOffset] = timeStr.split(' UTC');
    let offsetString = 'Z';
    if (utcOffset) {
      const sign = utcOffset.startsWith('-') ? '-' : '+';
      const hours = Math.abs(parseInt(utcOffset)).toString().padStart(2, '0');
      offsetString = `${sign}${hours}:00`;
    }
    return new Date(`${dateStr}T${time}:00.000${offsetString}`);
  } catch (e) { return new Date(); }
}

export async function syncMatchesFromAPI() {
  await connectToDatabase();
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Nie udało się pobrać danych z API');
  const data = await response.json();
  
  let added = 0, updated = 0;

  for (const [index, matchData] of data.matches.entries()) {
    const providerId = `wc26_${index}_${matchData.date}_${matchData.team1.replace(/\s/g, '')}`;
    const kickoff = parseApiDateToUTC(matchData.date, matchData.time);
    const translatedStage = translateStage(matchData.round);
    const groupTranslated = matchData.group ? matchData.group.replace('Group', 'Grupa') : null;

    let homeScore = null, awayScore = null, status = 'SCHEDULED';
    if (matchData.score && matchData.score.ft) {
      homeScore = matchData.score.ft[0]; awayScore = matchData.score.ft[1]; status = 'FINISHED';
    } else if (kickoff.getTime() < Date.now()) {
      status = 'LIVE';
    }

    const result = await Match.updateOne(
      { providerMatchId: providerId },
      { $set: {
          stage: translatedStage,
          group: groupTranslated,
          homeTeam: matchData.team1,
          awayTeam: matchData.team2,
          kickoffUtc: kickoff,
          status: status,
          'score.home': homeScore,
          'score.away': awayScore,
        }
      },
      { upsert: true }
    );
    if (result.upsertedCount > 0) added++;
    if (result.modifiedCount > 0) updated++;
  }
  return { added, updated };
}
