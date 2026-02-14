import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils';

export const ComingSoon = ({ 
    onBack, 
    language 
}: { 
    onBack: () => void;
    language: Language;
}) => {
    const t = TRANSLATIONS[language];

    return (
        <div className="min-h-screen flex flex-col p-6 animate-fade-in">
            <div className="mb-8">
                 <button 
                    onClick={onBack} 
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors inline-flex"
                >
                    <ArrowLeft className="w-8 h-8 text-slate-700 dark:text-slate-200" />
                </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                <div className="bg-amber-100 dark:bg-amber-900/20 p-8 rounded-full mb-8">
                    <Construction className="w-20 h-20 text-amber-500" />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-4">
                    {t.comingSoon}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xl leading-relaxed">
                    {t.comingSoonDesc}
                </p>
            </div>
        </div>
    );
};