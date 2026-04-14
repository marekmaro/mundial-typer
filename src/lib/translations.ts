const TEAM_TRANSLATIONS: Record<string, string> = {
  'Mexico': 'Meksyk', 'South Korea': 'Korea Poł.', 'South Africa': 'RPA', 'Czech Republic': 'Czechy',
  'Canada': 'Kanada', 'Switzerland': 'Szwajcaria', 'Qatar': 'Katar', 'Bosnia and Herzegovina': 'Bośnia i Hercegowina',
  'Bosnia & Herzegovina': 'Bośnia i Hercegowina', 'Brazil': 'Brazylia', 'Morocco': 'Maroko', 'Scotland': 'Szkocja',
  'Haiti': 'Haiti', 'USA': 'USA', 'Australia': 'Australia', 'Paraguay': 'Paragwaj', 'Turkey': 'Turcja',
  'Germany': 'Niemcy', 'Ecuador': 'Ekwador', 'Ivory Coast': 'Wybrzeże Kości Sł.', 'Curaçao': 'Curacao',
  'Netherlands': 'Holandia', 'Japan': 'Japonia', 'Tunisia': 'Tunezja', 'Sweden': 'Szwecja',
  'Belgium': 'Belgia', 'Iran': 'Iran', 'Egypt': 'Egipt', 'New Zealand': 'Nowa Zelandia',
  'Spain': 'Hiszpania', 'Uruguay': 'Urugwaj', 'Saudi Arabia': 'Arabia Saudyjska', 'Cape Verde': 'Wyspy ZP',
  'France': 'Francja', 'Senegal': 'Senegal', 'Norway': 'Norwegia', 'Iraq': 'Irak',
  'Argentina': 'Argentyna', 'Austria': 'Austria', 'Algeria': 'Algieria', 'Jordan': 'Jordania',
  'Portugal': 'Portugalia', 'Colombia': 'Kolumbia', 'Uzbekistan': 'Uzbekistan', 'DR Congo': 'DR Konga',
  'Congo DR': 'DR Konga', 'England': 'Anglia', 'Croatia': 'Chorwacja', 'Panama': 'Panama', 'Ghana': 'Ghana',
  'Poland': 'Polska', 'Italy': 'Włochy', 'Denmark': 'Dania', 'Peru': 'Peru', 'Chile': 'Chile'
};

const SHORT_NAMES: Record<string, string> = {
  // Przełamanie długiej nazwy na dwie linie (używamy \n)
  'Bośnia i Hercegowina': 'Bośnia i\nHercegowina',
  'Wyspy Zielonego Przylądka': 'Wyspy\nZielonego P.',
  'Wybrzeże Kości Sł.': 'Wyb. Kości\nSłoniowej',
  'Arabia Saudyjska': 'Arabia\nSaudyjska',
  'Korea Południowa': 'Korea\nPołudniowa',
  'Nowa Zelandia': 'Nowa\nZelandia'
};

export function t(teamName: string | undefined): string {
  if (!teamName) return 'Nieznana';
  return TEAM_TRANSLATIONS[teamName] || teamName;
}

export function shortT(teamName: string | undefined): string {
  const translated = t(teamName);
  return SHORT_NAMES[translated] || translated;
}
