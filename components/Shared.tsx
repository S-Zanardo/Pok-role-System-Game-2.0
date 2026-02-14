import React from 'react';
import { Language } from '../types';
import { getLocalizedType } from '../utils';

export const TypeBadge = ({ type, language }: { type: string, language: Language }) => {
  if (!type) return null;
  return (
    <span className="inline-block px-3 py-1 text-xs font-bold text-white bg-white/25 rounded-full backdrop-blur-sm mb-2 capitalize w-max shadow-sm">
      {getLocalizedType(type, language)}
    </span>
  );
};

export const ProgressBar = ({ progress, total, status }: { progress: number; total: number; status: string }) => {
    const percentage = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;
    
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm text-white p-8">
            <div className="w-full max-w-md">
                <div className="flex justify-between mb-2 items-end">
                    <span className="font-bold text-lg">{status}</span>
                    <div className="text-right">
                        <span className="block font-mono text-2xl font-bold text-red-400">{percentage}%</span>
                        <span className="block text-xs text-slate-400 font-mono mt-1">{progress} / {total} files</span>
                    </div>
                </div>
                <div className="h-4 w-full bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                    <div 
                        className="h-full bg-red-500 transition-all duration-200 ease-out shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <p className="text-slate-400 mt-4 text-center text-sm animate-pulse">
                    Retrieving data from GitHub...
                </p>
            </div>
        </div>
    );
};
