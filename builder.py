import os

FILES = {
    # 1. Aktualizacja Modelu Prediction (Joker)
    "src/models/Prediction.ts": r"""import mongoose, { Schema, Document } from 'mongoose';

export interface IPrediction extends Document {
  playerId: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  home: number;
  away: number;
  points: number | null;
  isJoker: boolean; // NOWE POLE
  updatedAt: Date;
}

const PredictionSchema: Schema = new Schema({
  playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  home: { type: Number, required: true },
  away: { type: Number, required: true },
  points: { type: Number, default: null },
  isJoker: { type: Boolean, default: false },
}, { timestamps: true });

PredictionSchema.index({ playerId: 1, matchId: 1 }, { unique: true });
export default mongoose.models.Prediction || mongoose.model<IPrediction>('Prediction', PredictionSchema);
""",

    # 2. Aktualizacja Modelu Gracza (Mistrz + Odznaki)
    "src/models/Player.ts": r"""import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  nick: string;
  tokenHash: string;
  blocked: boolean;
  company: string;
  predictedWinner?: string; // Wytypowany mistrz
  badges: string[]; // Lista odznak (np. 'fire', 'shield')
  createdAt: Date;
}

const PlayerSchema: Schema = new Schema({
  nick: { type: String, required: true },
  tokenHash: { type: String, required: true, unique: true },
  blocked: { type: Boolean, default: false },
  company: { type: String, default: 'Ogólna' },
  predictedWinner: { type: String },
  badges: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);
""",

    # 3. Logika Punktacji (Mnożnik Jokera)
    "src/lib/scoring.ts": r"""export function calculatePoints(hP: number, aP: number, hR: number, aR: number, isJoker: boolean = false): number {
  let pts = 0;
  if (hP === hR && aP === aR) {
    pts = 3; // Idealny wynik
  } else if ((hP > aP && hR > aR) || (hP < aP && hR < aR) || (hP === aP && hR === aR)) {
    pts = 1; // Trafiony zwycięzca / remis
  }
  
  return isJoker ? pts * 2 : pts;
}
""",

    # 4. Tłumaczenia (Fix W.K.S. i Regulamin Jokera)
    "src/lib/translations.ts": r"""
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
""",

    # 5. UI: Optymalizacja Mobile + Joker (PredictionCard)
    "src/components/PredictionCard.tsx": r"""'use client';
import { useState } from 'react';
import { submitPrediction } from '@/actions/predictions';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import TeamFlag from './TeamFlag';
import { t } from '@/lib/translations';
import { Star } from 'lucide-react';

export default function PredictionCard({ match, prediction, playerId }: { match: any, prediction: any, playerId: string }) {
  const [home, setHome] = useState(prediction?.home ?? '');
  const [away, setAway] = useState(prediction?.away ?? '');
  const [isJoker, setIsJoker] = useState(prediction?.isJoker ?? false);
  const [loading, setLoading] = useState(false);

  const isLocked = new Date() > new Date(new Date(match.kickoffUtc).getTime() - 12 * 60 * 60 * 1000) || match.status !== 'SCHEDULED';
  const dateStr = format(new Date(match.kickoffUtc), "d MMM, HH:mm", { locale: pl });

  const handleSave = async () => {
    if (home === '' || away === '') return;
    setLoading(true);
    const res = await submitPrediction({
      playerId, matchId: match._id.toString(),
      home: parseInt(home), away: parseInt(away), isJoker
    });
    setLoading(false);
  };

  return (
    <div className={`bg-white rounded-3xl border-2 p-4 sm:p-6 transition-all shadow-sm ${isLocked ? 'border-slate-100 opacity-90' : 'border-slate-200 hover:border-emerald-400'}`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{match.stage}</span>
        {!isLocked && (
          <button 
            onClick={() => setIsJoker(!isJoker)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black transition-all ${isJoker ? 'bg-amber-400 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}
          >
            <Star size={12} fill={isJoker ? "white" : "none"} /> JOKER x2
          </button>
        )}
        {isJoker && isLocked && <Star size={16} className="text-amber-400 fill-amber-400" />}
      </div>

      {/* Układ mobilny: flex-col, Desktop: flex-row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-row sm:flex-col items-center gap-3 sm:flex-1 sm:text-center w-full">
          <TeamFlag teamName={match.homeTeam} className="w-10 h-7 rounded-md" />
          <span className="font-black text-slate-800 text-sm sm:text-base truncate">{t(match.homeTeam)}</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border-2 border-slate-100">
          <input type="number" value={home} onChange={(e) => setHome(e.target.value)} disabled={isLocked || loading} className="w-12 h-12 text-center text-xl font-black bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-500" />
          <span className="font-black text-slate-300">:</span>
          <input type="number" value={away} onChange={(e) => setAway(e.target.value)} disabled={isLocked || loading} className="w-12 h-12 text-center text-xl font-black bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-500" />
        </div>

        <div className="flex flex-row-reverse sm:flex-col items-center gap-3 sm:flex-1 sm:text-center w-full">
          <TeamFlag teamName={match.awayTeam} className="w-10 h-7 rounded-md" />
          <span className="font-black text-slate-800 text-sm sm:text-base truncate">{t(match.awayTeam)}</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center">
        <span className="text-[11px] font-bold text-slate-400 uppercase">{dateStr}</span>
        {!isLocked && <button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-xs hover:bg-emerald-600 transition-colors">ZAPISZ</button>}
        {isLocked && prediction?.points !== null && (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-black text-xs">+{prediction.points} pkt</span>
        )}
      </div>
    </div>
  );
}
""",

    # 6. Panel Gracza: Mistrz + WhatsApp Share
    "src/app/p/[token]/page.tsx": r"""import connectToDatabase from '@/lib/db';
import Player from '@/models/Player';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import crypto from 'crypto';
import { notFound } from 'next/navigation';
import PredictionCard from '@/components/PredictionCard';
import { Trophy, Share2 } from 'lucide-react';

export const revalidate = 0;

export default async function PlayerDashboard({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await connectToDatabase();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const player = await Player.findOne({ tokenHash, blocked: false }).lean();
  if (!player) notFound();

  const matches = await Match.find().sort({ kickoffUtc: 1 }).lean();
  const predictions = await Prediction.find({ playerId: player._id }).lean();
  const totalPoints = predictions.reduce((sum, p) => sum + (p.points || 0), 0);

  const waMessage = encodeURIComponent(`Hej! Typuję wyniki Mistrzostw FIFA 2026. Mam już ${totalPoints} pkt! Wejdź do gry: ${process.env.NEXT_PUBLIC_APP_URL}`);

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Zawodnik</p>
            <h1 className="text-4xl font-black">{player.nick}</h1>
            <div className="mt-4 flex gap-2">
               <a href={`https://wa.me/?text=${waMessage}`} className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full font-bold text-xs hover:scale-105 transition-transform">
                 <Share2 size={14}/> WhatsApp
               </a>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl flex items-center gap-4">
            <Trophy className="text-amber-400" size={40} />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Twój Wynik</p>
              <p className="text-5xl font-black leading-none">{totalPoints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mistrz Turnieju */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-[2rem] text-white shadow-lg">
         <h3 className="font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">🏆 Kto zostanie Mistrzem Świata? (+15 pkt)</h3>
         <div className="flex gap-4">
            <input type="text" placeholder="Wpisz nazwę państwa..." className="flex-1 bg-white/20 border border-white/30 rounded-2xl px-4 py-3 outline-none font-bold placeholder:text-white/50" />
            <button className="bg-white text-orange-600 px-6 py-3 rounded-2xl font-black text-sm">ZAPISZ</button>
         </div>
      </div>

      {/* Lista meczów */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match: any) => (
          <PredictionCard key={match._id.toString()} match={JSON.parse(JSON.stringify(match))} prediction={predictions.find(p => p.matchId.toString() === match._id.toString())} playerId={player._id.toString()} />
        ))}
      </div>
    </div>
  );
}
""",

    # 7. Stopka by Mar0
    "src/app/layout.tsx": r"""import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FIFA 2026 Typer",
  description: "By Mar0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex flex-col`}>
        <nav className="bg-white border-b border-slate-100 py-4 px-6 flex justify-between items-center sticky top-0 z-50">
           <Link href="/" className="font-black text-xl tracking-tighter text-slate-900">FIFA 2026</Link>
           <div className="flex gap-6 font-bold text-sm text-slate-500 uppercase tracking-widest">
              <Link href="/leaderboard" className="hover:text-emerald-600">Ranking</Link>
              <Link href="/rules" className="hover:text-emerald-600">Zasady</Link>
           </div>
        </nav>
        <main className="flex-grow py-8">{children}</main>
        <footer className="py-10 text-center border-t border-slate-100">
           <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Mistrzostwa FIFA 2026 &copy; by <span className="text-slate-900">Mar0</span></p>
        </footer>
      </body>
    </html>
  );
}
"""
}

def build_project():
    for filepath, content in FILES.items():
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"✅ Zaktualizowano: {filepath}")

if __name__ == "__main__":
    build_project()