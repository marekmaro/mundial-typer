import type { Metadata } from "next";
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
