import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';

interface LanguageSelectorProps {
    currentLanguage: Language;
    onChange: (lang: Language) => void;
}

const flags: Record<Language, string> = {
    en: '🇬🇧',
    it: '🇮🇹',
    es: '🇪🇸',
    de: '🇩🇪',
    fr: '🇫🇷'
};

const labels: Record<Language, string> = {
    en: 'English',
    it: 'Italiano',
    es: 'Español',
    de: 'Deutsch',
    fr: 'Français'
};

export const LanguageSelector = ({ currentLanguage, onChange }: LanguageSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (lang: Language) => {
        onChange(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-2xl hover:scale-110 transition-transform shadow-md"
                aria-label="Select Language"
            >
                {flags[currentLanguage]}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-fade-in">
                    <div className="py-1">
                        {(Object.keys(flags) as Language[]).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => handleSelect(lang)}
                                className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                                    currentLanguage === lang ? 'bg-slate-50 dark:bg-slate-700/50 font-bold' : ''
                                }`}
                            >
                                <span className="text-xl">{flags[lang]}</span>
                                <span className="text-sm text-slate-700 dark:text-slate-200">{labels[lang]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};