import React from 'react';
import { Region, Language } from '../types';
import { Sun, Moon, Home } from 'lucide-react';
import { RegionIcon, Gen1PokedexIcon } from './Icons';
import { LanguageSelector } from './LanguageSelector';
import { TRANSLATIONS } from '../utils';

export const RegionSelect = ({ 
    onSelect, 
    onHome,
    isDark, 
    toggleTheme, 
    language, 
    setLanguage 
}: { 
    onSelect: (r: Region) => void, 
    onHome: () => void,
    isDark: boolean, 
    toggleTheme: () => void,
    language: Language,
    setLanguage: (l: Language) => void
}) => {
    
  const t = TRANSLATIONS[language];

  const regions: { id: Region, color: string, desc: string, range: string }[] = [
    { id: 'National', color: 'bg-indigo-500 dark:bg-indigo-700', desc: t.regions.National, range: 'All' },
    { id: 'Kanto', color: 'bg-green-600 dark:bg-green-800', desc: t.regions.Kanto, range: '001-151' },
    { id: 'Johto', color: 'bg-yellow-600 dark:bg-yellow-800', desc: t.regions.Johto, range: '152-251' },
    { id: 'Hoenn', color: 'bg-red-600 dark:bg-red-800', desc: t.regions.Hoenn, range: '252-386' },
    { id: 'Sinnoh', color: 'bg-cyan-600 dark:bg-cyan-800', desc: t.regions.Sinnoh, range: '387-493' },
    { id: 'Unova', color: 'bg-stone-600 dark:bg-stone-800', desc: t.regions.Unova, range: '494-649' },
    { id: 'Kalos', color: 'bg-blue-600 dark:bg-blue-800', desc: t.regions.Kalos, range: '650-721' },
    { id: 'Alola', color: 'bg-orange-500 dark:bg-orange-700', desc: t.regions.Alola, range: '722-809' },
    { id: 'Galar', color: 'bg-pink-600 dark:bg-pink-800', desc: t.regions.Galar, range: '810-905' },
    { id: 'Paldea', color: 'bg-purple-600 dark:bg-purple-800', desc: t.regions.Paldea, range: '906+' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
        <header className="mb-10 mt-4 flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
            <div className="flex flex-col items-center md:items-start">
                 <button 
                    onClick={onHome}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors mb-2 font-medium"
                >
                    <Home size={18} /> {t.backToHome}
                </button>
                <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                    <Gen1PokedexIcon className="w-10 h-10 text-red-500" />
                    {t.title}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
                <LanguageSelector currentLanguage={language} onChange={setLanguage} />
                <button 
                    onClick={toggleTheme}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-110 transition-transform shadow-md"
                    aria-label="Toggle Dark Mode"
                >
                    {isDark ? <Sun size={24} /> : <Moon size={24} />}
                </button>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => (
                <button
                    key={region.id}
                    onClick={() => onSelect(region.id)}
                    className={`${region.color} text-white p-6 rounded-3xl shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 text-left relative overflow-hidden group h-40`}
                >
                    <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:opacity-30 transition-opacity">
                        <RegionIcon region={region.id} />
                    </div>
                    <h2 className="text-2xl font-bold relative z-10">{region.id} Dex</h2>
                    <div className="flex flex-col mt-1 relative z-10">
                         <span className="text-white/90 font-medium">{region.desc}</span>
                         <span className="text-white/60 text-sm">{region.range}</span>
                    </div>
                </button>
            ))}
        </div>
    </div>
  );
};