import React, { useState, useEffect } from 'react';
import { AbilityDetailData, Language } from '../types';
import { TRANSLATIONS, getLocalizedAbility } from '../utils';
import { X, Loader2, Zap, AlertCircle, Info, Sparkles } from 'lucide-react';

interface AbilityDetailProps {
  abilityName: string;
  filePath: string;
  onClose: () => void;
  language: Language;
}

export const AbilityDetail = ({ abilityName, filePath, onClose, language }: AbilityDetailProps) => {
  const t = TRANSLATIONS[language];
  const [data, setData] = useState<AbilityDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbility = async () => {
      try {
        setLoading(true);
        // Clean path and encode
        const encodedPath = filePath.split('/').map(p => encodeURIComponent(p)).join('/');
        const url = `https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/${encodedPath}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Could not fetch ability data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("Failed to load ability details.");
      } finally {
        setLoading(false);
      }
    };

    if (filePath) {
        fetchAbility();
    }
  }, [filePath]);

  // Prevent scrolling on body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
        document.body.style.overflow = 'unset';
    };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
  };

  if (!filePath) return null;

  const localizedName = getLocalizedAbility(data?.Name || abilityName, language);

  return (
    <div 
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-scale-up border border-slate-200 dark:border-slate-800">
        
        {/* Header - Purple/Indigo theme for Abilities */}
        <div className="p-6 bg-indigo-600 dark:bg-indigo-800 text-white relative transition-colors duration-300">
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
             >
                 <X size={20} />
             </button>
             
             <div className="flex items-center gap-3">
                <Sparkles className="text-indigo-200" size={28} />
                <h2 className="text-3xl font-extrabold tracking-tight">{localizedName}</h2>
             </div>
             <span className="inline-block mt-2 text-xs font-bold text-indigo-100 uppercase tracking-wider opacity-80">
                 {t.abilities}
             </span>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-3 text-indigo-500" />
                    <p>{t.consulting}</p>
                </div>
            ) : error || !data ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-center">
                    <AlertCircle className="w-12 h-12 mb-3 text-red-400" />
                    <p>{error || "Ability data not found."}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    
                    {/* Description */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                             <Info size={14} /> {t.about}
                        </h3>
                        <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                            "{data.Description}"
                        </p>
                    </div>

                    {/* Effect */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                            <Zap className="w-4 h-4" /> {t.effect}
                        </h3>
                        <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-slate-800 dark:text-slate-200 text-sm leading-relaxed shadow-sm">
                            {data.Effect}
                        </div>
                    </div>

                </div>
            )}
        </div>
      </div>
    </div>
  );
};