// src/lib/translations.ts

const TEAM_TRANSLATIONS: Record<string, string> = {
  'Mexico': 'Meksyk', 'South Korea': 'Korea Poł.', 'South Africa': 'RPA', 'Czech Republic': 'Czechy',
  'Canada': 'Kanada', 'Switzerland': 'Szwajcaria', 'Qatar': 'Katar', 'Bosnia and Herzegovina': 'Bośnia',
  'Bosnia & Herzegovina': 'Bośnia', 'Brazil': 'Brazylia', 'Morocco': 'Maroko', 'Scotland': 'Szkocja',
  'Haiti': 'Haiti', 'USA': 'USA', 'Australia': 'Australia', 'Paraguay': 'Paragwaj', 'Turkey': 'Turcja',
  'Germany': 'Niemcy', 'Ecuador': 'Ekwador', 'Ivory Coast': 'W.K.S.', 'Curaçao': 'Curacao',
  'Netherlands': 'Holandia', 'Japan': 'Japonia', 'Tunisia': 'Tunezja', 'Sweden': 'Szwecja',
  'Belgium': 'Belgia', 'Iran': 'Iran', 'Egypt': 'Egipt', 'New Zealand': 'Nowa Zel.',
  'Spain': 'Hiszpania', 'Uruguay': 'Urugwaj', 'Saudi Arabia': 'Arabia S.', 'Cape Verde': 'Wyspy ZP',
  'France': 'Francja', 'Senegal': 'Senegal', 'Norway': 'Norwegia', 'Iraq': 'Irak',
  'Argentina': 'Argentyna', 'Austria': 'Austria', 'Algeria': 'Algieria', 'Jordan': 'Jordania',
  'Portugal': 'Portugalia', 'Colombia': 'Kolumbia', 'Uzbekistan': 'Uzbekistan', 'DR Congo': 'DR Konga',
  'Congo DR': 'DR Konga', 'England': 'Anglia', 'Croatia': 'Chorwacja', 'Panama': 'Panama', 'Ghana': 'Ghana',
  'Poland': 'Polska', 'Italy': 'Włochy', 'Denmark': 'Dania', 'Peru': 'Peru', 'Chile': 'Chile'
};

const SHORT_NAMES: Record<string, string> = {
  'Bośnia i Hercegowina': 'Bośnia',
  'Wyspy Zielonego Przylądka': 'Wyspy Z.P.',
  'Wybrzeże Kości Sł.': 'W.K.S.',
  'Arabia Saudyjska': 'Arabia S.',
  'Korea Południowa': 'Korea Płd.',
  'Nowa Zelandia': 'Nowa Zel.',
  'Stany Zjednoczone': 'USA'
};

export function t(teamName: string | undefined): string {
  if (!teamName) return '???';

  // 1. Obsługa fazy pucharowej (placeholdery typu 1A, 2C, 3A/B/C...)
  // Zwycięzcy i drugie miejsca (np. 1C -> 1. miejsce Grupy C)
  if (/^[1-2][A-L]$/i.test(teamName)) {
    return `${teamName[0]}. miejsce (Grupa ${teamName[1].toUpperCase()})`;
  }
  
  // Trzecie miejsca z wieloma grupami (np. 3A/B/C/D/F -> 3. miejsce (A/B/C/D/F))
  if (teamName.startsWith('3') && teamName.includes('/')) {
    return `3. miejsce (${teamName.substring(1)})`;
  }

  // 2. Standardowe tłumaczenie z Twojego słownika
  return TEAM_TRANSLATIONS[teamName] || teamName;
}

export function shortT(teamName: string | undefined): string {
  if (!teamName) return '???';

  // Jeśli to placeholder drabinki, zostawiamy go krótkiego (np. "1C")
  if (/^[1-3][A-L\/]+$/i.test(teamName)) {
    return teamName.toUpperCase();
  }

  // Używamy tłumaczenia, a potem ewentualnego słownika nazw skróconych
  const translated = TEAM_TRANSLATIONS[teamName] || teamName;
  return SHORT_NAMES[translated] || translated;
}
