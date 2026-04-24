import os

FILES = {
    "src/lib/translations.ts": r"""
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

// Przywrócona funkcja skracająca długie nazwy dla telefonów
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
  return TEAM_TRANSLATIONS[teamName] || teamName;
}

export function shortT(teamName: string | undefined): string {
  const translated = t(teamName);
  return SHORT_NAMES[translated] || translated;
}
"""
}

def build_project():
    for filepath, content in FILES.items():
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Przywrócono brakującą funkcję w: {filepath}")

if __name__ == "__main__":
    build_project()