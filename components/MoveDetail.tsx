import React, { useState, useEffect } from 'react';
import { MoveDetailData, Language } from '../types';
import { getTypeColor, TRANSLATIONS, getLocalizedType, getLocalizedMoveName } from '../utils';
import { X, Loader2, Target, Zap, Sword, Dices, AlertCircle, Hand } from 'lucide-react';

interface MoveDetailProps {
  moveName: string;
  filePath: string;
  onClose: () => void;
  language: Language;
  onRoll?: (diceString: string, moveData?: MoveDetailData) => void;
}

export const MoveDetail = ({ moveName, filePath, onClose, language, onRoll }: MoveDetailProps) => {
  const t = TRANSLATIONS[language];
  const [data, setData] = useState<MoveDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMove = async () => {
      try {
        setLoading(true);
        // Clean path and encode
        const encodedPath = filePath.split('/').map(p => encodeURIComponent(p)).join('/');
        const url = `https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/${encodedPath}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Could not fetch move data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("Failed to load move details.");
      } finally {
        setLoading(false);
      }
    };

    if (filePath) {
        fetchMove();
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

  return (
    <div 
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-scale-up">
        
        {/* Header */}
        <div className={`p-6 ${data ? getTypeColor(data.Type) : 'bg-slate-500'} text-white relative transition-colors duration-300`}>
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
             >
                 <X size={20} />
             </button>
             {data ? (
                 <>
                    <h2 className="text-3xl font-extrabold tracking-tight pr-8">{getLocalizedMoveName(data.Name, language)}</h2>
                    <span className="inline-block px-3 py-1 mt-2 text-xs font-bold bg-white/25 rounded-full backdrop-blur-md uppercase tracking-wider">
                        {getLocalizedType(data.Type, language)}
                    </span>
                 </>
             ) : (
                 <h2 className="text-2xl font-bold">{getLocalizedMoveName(moveName, language)}</h2>
             )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-3 text-red-500" />
                    <p>{t.consulting}</p>
                </div>
            ) : error || !data ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-center">
                    <AlertCircle className="w-12 h-12 mb-3 text-red-400" />
                    <p>{error || "Move data not found."}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    
                    {/* Description */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                            "{data.Description}"
                        </p>
                    </div>

                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center text-center">
                            <span className="text-xs font-bold text-red-400 uppercase mb-1 flex items-center gap-1">
                                <Sword size={14} /> {t.power}
                            </span>
                            <span className="text-3xl font-black text-slate-800 dark:text-slate-200">{data.Power}</span>
                        </div>
                        
                        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 flex flex-col items-center justify-center text-center">
                            <span className="text-xs font-bold text-blue-400 uppercase mb-1 flex items-center gap-1">
                                <Target size={14} /> {t.target}
                            </span>
                            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{data.Target}</span>
                        </div>
                    </div>

                    {/* Dice Pools */}
                    <div className="space-y-3">
                         <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                             <Dices className="w-4 h-4" /> {t.dicePools}
                             {onRoll && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full ml-auto">Click to Roll</span>}
                         </h3>
                         
                         <div className="flex flex-col gap-2">
                            {/* Accuracy Pool */}
                            <button
                                disabled={!onRoll || !data.Accuracy1}
                                onClick={() => {
                                    if(onRoll && data.Accuracy1) {
                                        const pool = data.Accuracy2 ? `${data.Accuracy1} + ${data.Accuracy2}` : data.Accuracy1;
                                        onRoll(pool, data);
                                    }
                                }}
                                className={`flex items-center justify-between p-3 border rounded-lg shadow-sm w-full transition-all ${onRoll ? 'hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer active:scale-95 border-slate-300 dark:border-slate-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-default'}`}
                            >
                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    {t.accuracy}
                                    {onRoll && <Hand size={14} className="text-green-500" />}
                                </span>
                                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                                    <span className="capitalize">{data.Accuracy1}</span>
                                    {data.Accuracy2 && (
                                        <>
                                            <span className="text-slate-300">+</span>
                                            <span className="capitalize">{data.Accuracy2}</span>
                                        </>
                                    )}
                                </div>
                            </button>

                            {/* Damage Pool */}
                            <button
                                disabled={!onRoll || !data.Damage1}
                                onClick={() => {
                                    if(onRoll && data.Damage1) {
                                        const pool = data.Damage2 ? `${data.Damage1} + ${data.Damage2}` : data.Damage1;
                                        // Pass null for data to prevent chaining another damage roll
                                        onRoll(pool); 
                                    }
                                }}
                                className={`flex items-center justify-between p-3 border rounded-lg shadow-sm w-full transition-all ${onRoll ? 'hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer active:scale-95 border-slate-300 dark:border-slate-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-default'}`}
                            >
                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    {t.damage}
                                    {onRoll && <Hand size={14} className="text-green-500" />}
                                </span>
                                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                                    <span className="capitalize">{data.Damage1 || "None"}</span>
                                    {data.Damage2 && (
                                        <>
                                            <span className="text-slate-300">+</span>
                                            <span className="capitalize">{data.Damage2}</span>
                                        </>
                                    )}
                                </div>
                            </button>
                         </div>
                    </div>

                    {/* Effect */}
                    {data.Effect && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Zap className="w-4 h-4" /> {t.effect}
                            </h3>
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                {data.Effect}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
      </div>
    </div>
  );
};