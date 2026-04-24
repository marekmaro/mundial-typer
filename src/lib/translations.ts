const TEAM_TRANSLATIONS: Record<string, string> = {
  'Mexico': 'Meksyk', 'South Korea': 'Korea Poł.', 'South Africa': 'RPA', 'Czech Republic': 'Czechy',
  'Canada': 'Kanada', 'Switzerland': 'Szwajcaria', 'Qatar': 'Katar', 'Bosnia and Herzegovina': 'Bośnia',
  'Bosnia & Herzegovina': 'Bośnia', 'Brazil': 'Brazylia', 'Morocco': 'Maroko', 'Scotland': 'Szkocja',
  'Haiti': 'Haiti', 'USA': 'USA', 'Australia': 'Australia', 'Paraguay': 'Paragwaj', 'Turkey': 'Turcja',
  'Germany': 'Niemcy', 'Ecuador': 'Ekwador', 'Ivory Coast': 'W.K.S.', 'Curaçao': 'Curacao',
  'Netherlands': 'Holandia', 'Japan': 'Japonia', 'Tunisia': 'Tunezja', 'Sweden': 'Szwecja',
  'Belgium': 'Belgia', 'Iran': 'Iran', 'Egypt': 'Egipt', 'New Zealand': 'Nowa Zel.',
  'Spain': 'Hiszpania', 'Urugwaj': 'Urugwaj', 'Saudi Arabia': 'Arabia S.', 'Cape Verde': 'Wyspy ZP',
  'France': 'Francja', 'Senegal': 'Senegal', 'Norway': 'Norwegia', 'Iraq': 'Irak',
  'Argentina': 'Argentyna', 'Austria': 'Austria', 'Algeria': 'Algieria', 'Jordan': 'Jordania',
  'Portugal': 'Portugalia', 'Colombia': 'Kolumbia', 'Uzbekistan': 'Uzbekistan', 'DR Congo': 'DR Konga',
  'England': 'Anglia', 'Croatia': 'Chorwacja', 'Panama': 'Panama', 'Ghana': 'Ghana'
};

export function t(name: string | undefined): string {
  if (!name) return '???';
  return TEAM_TRANSLATIONS[name] || name;
}
