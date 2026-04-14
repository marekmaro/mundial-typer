import React from 'react';

const FLAG_MAP: Record<string, string> = {
  'Mexico': 'mx', 'South Korea': 'kr', 'South Africa': 'za', 'Czech Republic': 'cz',
  'Canada': 'ca', 'Switzerland': 'ch', 'Qatar': 'qa', 'Bosnia and Herzegovina': 'ba', 'Bosnia & Herzegovina': 'ba',
  'Brazil': 'br', 'Morocco': 'ma', 'Scotland': 'gb-sct', 'Haiti': 'ht',
  'USA': 'us', 'Australia': 'au', 'Paraguay': 'py', 'Turkey': 'tr',
  'Germany': 'de', 'Ecuador': 'ec', 'Ivory Coast': 'ci', 'Curaçao': 'cw',
  'Netherlands': 'nl', 'Japan': 'jp', 'Tunisia': 'tn', 'Sweden': 'se',
  'Belgium': 'be', 'Iran': 'ir', 'Egypt': 'eg', 'New Zealand': 'nz',
  'Spain': 'es', 'Uruguay': 'uy', 'Saudi Arabia': 'sa', 'Cape Verde': 'cv',
  'France': 'fr', 'Senegal': 'sn', 'Norway': 'no', 'Iraq': 'iq',
  'Argentina': 'ar', 'Austria': 'at', 'Algeria': 'dz', 'Jordan': 'jo',
  'Portugal': 'pt', 'Colombia': 'co', 'Uzbekistan': 'uz', 'DR Congo': 'cd', 'Congo DR': 'cd',
  'England': 'gb-eng', 'Croatia': 'hr', 'Panama': 'pa', 'Ghana': 'gh',
  'Poland': 'pl', 'Italy': 'it', 'Denmark': 'dk', 'Peru': 'pe', 'Chile': 'cl'
};

export default function TeamFlag({ teamName, className = "" }: { teamName: string, className?: string }) {
  const code = FLAG_MAP[teamName];
  if (!code) return <div className={`inline-block bg-slate-200 border border-slate-300 rounded-sm w-6 h-4 opacity-50 ${className}`} title={teamName}></div>;
  return (
    <img src={`https://flagcdn.com/w40/${code}.png`} alt={`${teamName} flag`} className={`inline-block border border-slate-200 rounded-sm shadow-sm object-cover ${className}`} style={{ width: '24px', height: '16px' }} />
  );
}
