import React from 'react';
import { Language } from '../types';
import { Gen1PokedexIcon } from './Icons';
import { User, FileText, Sun, Moon, Briefcase, LogIn, LogOut, X, AlertTriangle } from 'lucide-react';
import { TRANSLATIONS } from '../utils';
import { LanguageSelector } from './LanguageSelector';
import { useAuth } from '../contexts/AuthContext';

export const HomePage = ({
    onNavigate,
    isDark,
    toggleTheme,
    language,
    setLanguage
}: {
    onNavigate: (mode: 'pokedex' | 'character' | 'pokemon' | 'items') => void;
    isDark: boolean;
    toggleTheme: () => void;
    language: Language;
    setLanguage: (l: Language) => void;
}) => {
    const t = TRANSLATIONS[language];
    const { user, signInWithGoogle, logout, error, clearError } = useAuth();

    return (
        <div className="p-6 max-w-6xl mx-auto min-h-screen flex flex-col animate-fade-in">
             
             {/* Error Banner */}
             {error && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-lg px-4">
                    <div className="bg-red-500 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-bounce-in border-2 border-red-600">
                        <AlertTriangle className="shrink-0 mt-0.5" size={20} />
                        <div className="flex-1 text-sm font-bold whitespace-pre-line leading-relaxed">
                            {error}
                        </div>
                        <button onClick={clearError} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
             )}

             <header className="mb-12 mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
                        <Gen1PokedexIcon className="w-10 h-10 text-red-500" />
                        {t.appTitle}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">{t.appSubtitle}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <LanguageSelector currentLanguage={language} onChange={setLanguage} />
                    <button 
                        onClick={toggleTheme}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-110 transition-transform shadow-md"
                        aria-label="Toggle Dark Mode"
                    >
                        {isDark ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                    
                    {/* Login/User Button */}
                    {user ? (
                        <div className="flex items-center gap-2 pl-2 bg-white dark:bg-slate-800 rounded-full pr-1 py-1 shadow-md border border-slate-200 dark:border-slate-700">
                             {user.photoURL ? (
                                 <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-green-500" />
                             ) : (
                                 <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg">
                                     {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                                 </div>
                             )}
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-200 hidden sm:block px-2">
                                {user.displayName}
                             </span>
                             <button 
                                onClick={() => logout()}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                title="Logout"
                             >
                                 <LogOut size={18} />
                             </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => signInWithGoogle()}
                            className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold shadow-md hover:scale-105 transition-transform"
                        >
                            <LogIn size={20} />
                            <span>Login</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {/* Character Sheet */}
                <button
                    onClick={() => onNavigate('character')}
                    className="group relative h-40 bg-white dark:bg-slate-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden text-left p-6 border border-slate-100 dark:border-slate-700 hover:scale-[1.02]"
                >
                     <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.characterSheet}</h2>
                     </div>
                     <div className="absolute -right-6 -bottom-6 text-blue-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                        <User size={120} strokeWidth={1.5} />
                     </div>
                </button>

                {/* Pokemon Sheet */}
                <button
                    onClick={() => onNavigate('pokemon')}
                    className="group relative h-40 bg-white dark:bg-slate-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden text-left p-6 border border-slate-100 dark:border-slate-700 hover:scale-[1.02]"
                >
                     <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.pokemonSheet}</h2>
                     </div>
                     <div className="absolute -right-6 -bottom-6 text-amber-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                        <FileText size={120} strokeWidth={1.5} />
                     </div>
                </button>

                {/* Items List */}
                <button
                    onClick={() => onNavigate('items')}
                    className="group relative h-40 bg-white dark:bg-slate-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden text-left p-6 border border-slate-100 dark:border-slate-700 hover:scale-[1.02]"
                >
                     <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.sheet.item}s</h2>
                     </div>
                     <div className="absolute -right-6 -bottom-6 text-green-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                        <Briefcase size={120} strokeWidth={1.5} />
                     </div>
                </button>

                 {/* Pokedex */}
                 <button
                    onClick={() => onNavigate('pokedex')}
                    className="group relative h-40 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden text-left p-6 text-white hover:scale-[1.02]"
                >
                     <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2">{t.pokedex}</h2>
                     </div>
                     <div className="absolute -right-6 -bottom-6 text-white opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                        <Gen1PokedexIcon className="w-[120px] h-[120px]" />
                     </div>
                </button>
            </div>
        </div>
    );
};
