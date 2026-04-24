import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Trophy, CalendarDays, BookOpen, Home, Network } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mistrzostwa FIFA 2026",
  description: "Zabawa w typowanie wyników turnieju!",
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="pl">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/1/17/2026_FIFA_World_Cup_emblem.svg/1920px-2026_FIFA_World_Cup_emblem.svg.png" 
                alt="World Cup 2026 Logo" 
                className="h-10 w-auto object-contain invert brightness-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
              />
              <span className="text-xl md:text-2xl font-black tracking-wider text-emerald-400">
                Mistrzostwa FIFA 2026
              </span>
            </Link>
            <div className="flex gap-4 sm:gap-6 font-medium text-sm sm:text-base overflow-x-auto w-full md:w-auto justify-start md:justify-center pb-2 md:pb-0 scrollbar-hide">
              <Link href="/" className="hover:text-emerald-400 flex items-center gap-1 shrink-0 transition-colors"><Home size={18}/> Start</Link>
              <Link href="/schedule" className="hover:text-emerald-400 flex items-center gap-1 shrink-0 transition-colors"><CalendarDays size={18}/> Terminarz</Link>
              <Link href="/bracket" className="hover:text-emerald-400 flex items-center gap-1 shrink-0 transition-colors"><Network size={18}/> Drabinka</Link>
              <Link href="/leaderboard" className="hover:text-emerald-400 flex items-center gap-1 shrink-0 transition-colors"><Trophy size={18}/> Ranking</Link>
              <Link href="/rules" className="hover:text-emerald-400 flex items-center gap-1 shrink-0 transition-colors"><BookOpen size={18}/> Zasady</Link>
            </div>
          </div>
        </nav>
        <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <footer className="bg-slate-200 text-center py-8 text-slate-500 mt-auto border-t border-slate-300">
          <p className="font-black text-sm text-slate-800 tracking-widest uppercase mb-1">Mistrzostwa FIFA 2026 &copy; {new Date().getFullYear()}</p>
          <p className="text-xs font-bold">Stworzone by <span className="text-slate-900 font-black">Mar0</span></p>
        </footer>
      </body>
    </html>
  );
}
