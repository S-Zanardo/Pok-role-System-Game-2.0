import React, { useEffect, useState } from 'react';
import { PokemonData, Move, Language } from '../types';
import { ArrowLeft, Info, Activity, Star, Zap } from 'lucide-react';
import { getTypeColor, getDetailImageUrl, getListImageUrl, getStatDots, TRANSLATIONS, getLocalizedLearnMethod, getLocalizedAbility, getLocalizedMoveName } from '../utils';
import { TypeBadge } from './Shared';
import { MoveDetail } from './MoveDetail';
import { AbilityDetail } from './AbilityDetail';

interface PokemonDetailProps {
    pokemon: PokemonData;
    onBack: () => void;
    moveMap: Record<string, string>;
    abilityMap: Record<string, string>;
    language: Language;
}

export const PokemonDetail = ({ pokemon, onBack, moveMap, abilityMap, language }: PokemonDetailProps) => {
    const t = TRANSLATIONS[language];
    const mainColor = getTypeColor(pokemon.Type1);
    const [selectedMove, setSelectedMove] = useState<{ name: string, path: string } | null>(null);
    const [selectedAbility, setSelectedAbility] = useState<{ name: string, path: string } | null>(null);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleMoveClick = (moveName: string) => {
        let path = moveMap[moveName];
        if (!path) {
            const cleanName = moveName.replace(/[\s-]/g, '');
            const foundKey = Object.keys(moveMap).find(k => k.toLowerCase() === cleanName.toLowerCase() || k.toLowerCase() === moveName.toLowerCase());
            if (foundKey) path = moveMap[foundKey];
        }

        if (path) {
            setSelectedMove({ name: moveName, path });
        } else {
            console.warn(`Move path not found for: ${moveName}`);
            setSelectedMove({ name: moveName, path: '' });
        }
    };

    const handleAbilityClick = (abilityName: string) => {
        if (!abilityName) return;

        let path = abilityMap[abilityName];
        if (!path) {
             const cleanName = abilityName.replace(/[\s-]/g, '');
             const foundKey = Object.keys(abilityMap).find(k => k.toLowerCase() === cleanName.toLowerCase() || k.toLowerCase() === abilityName.toLowerCase());
             if (foundKey) path = abilityMap[foundKey];
        }

        if (path) {
            setSelectedAbility({ name: abilityName, path });
        } else {
            // If not found in file map (e.g. custom or missing file), we can't show details
            console.warn(`Ability path not found for: ${abilityName}`);
        }
    };

    return (
        <>
            <div className={`min-h-screen ${mainColor} transition-colors duration-500 overflow-x-hidden`}>
                {/* Header Section */}
                <div className="p-6 pt-8 pb-48 relative">
                    <div className="flex justify-between items-center text-white max-w-4xl mx-auto z-50 relative">
                        <button 
                            onClick={onBack}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
                        >
                            <ArrowLeft size={32} />
                        </button>
                        <span className="font-bold text-2xl">#{pokemon.Number.toString().padStart(3, '0')}</span>
                    </div>

                    <div className="max-w-4xl mx-auto mt-6 flex justify-between items-center px-4 relative z-30">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">{pokemon.Name}</h1>
                            <div className="flex gap-2 mt-4">
                                <TypeBadge type={pokemon.Type1} language={language} />
                                {pokemon.Type2 && <TypeBadge type={pokemon.Type2} language={language} />}
                            </div>
                        </div>
                        <div className="text-white/90 font-semibold text-lg hidden md:block backdrop-blur-sm bg-white/10 px-4 py-2 rounded-lg">
                            {pokemon.DexCategory}
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 z-40 pointer-events-none">
                        <img 
                            src={getDetailImageUrl(pokemon)} 
                            alt={pokemon.Name}
                            className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const fallbackUrl = getListImageUrl(pokemon);
                                if (target.src !== fallbackUrl) {
                                    target.src = fallbackUrl;
                                } else {
                                    target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
                                }
                            }}
                        />
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-y-1/4 translate-x-1/4 z-10">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" className="w-96 h-96 filter invert" alt="bg" />
                    </div>
                </div>

                {/* White Content Sheet */}
                <div className="bg-white dark:bg-slate-900 rounded-t-[3rem] min-h-[calc(100vh-300px)] p-6 pt-16 md:px-12 pb-20 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-colors duration-300">
                    <div className="max-w-4xl mx-auto space-y-10">

                        {/* About Section */}
                        <section>
                            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white`}>
                            <Info className="w-5 h-5" /> {t.about}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg italic">
                                "{pokemon.DexDescription || "No description available."}"
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase">{t.height}</span>
                                    <p className="font-medium text-slate-700 dark:text-slate-200">{pokemon.Height?.Meters || '?'}m</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase">{t.weight}</span>
                                    <p className="font-medium text-slate-700 dark:text-slate-200">{pokemon.Weight?.Kilograms || '?'}kg</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase">{t.rank}</span>
                                    <p className="font-medium text-slate-700 dark:text-slate-200">{pokemon.RecommendedRank || 'Unknown'}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase">{t.role}</span>
                                    <p className="font-medium text-slate-700 dark:text-slate-200">{pokemon.GoodStarter ? t.starter : t.wild}</p>
                                </div>
                            </div>
                        </section>

                        {/* Stats Grid */}
                        <section>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                                <Activity className="w-5 h-5" /> {t.baseStats}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                {/* HP Row */}
                                <div className="col-span-1 md:col-span-2 flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                    <span className="font-bold text-slate-500 dark:text-slate-400 w-24">{t.hp}</span>
                                    <div className="flex-1 flex items-center">
                                        <span className="font-bold text-slate-800 dark:text-slate-200 mr-4 w-8">{pokemon.BaseHP}</span>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (pokemon.BaseHP / 15) * 100)}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {[
                                    { label: t.strength, val: pokemon.Strength, max: pokemon.MaxStrength },
                                    { label: t.dexterity, val: pokemon.Dexterity, max: pokemon.MaxDexterity },
                                    { label: t.vitality, val: pokemon.Vitality, max: pokemon.MaxVitality },
                                    { label: t.special, val: pokemon.Special, max: pokemon.MaxSpecial },
                                    { label: t.insight, val: pokemon.Insight, max: pokemon.MaxInsight },
                                ].map((stat) => (
                                    <div key={stat.label} className="flex items-center justify-between py-2">
                                        <span className="font-bold text-slate-500 dark:text-slate-400 w-24">{stat.label}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-400 font-mono">{stat.val}/{stat.max}</span>
                                            {getStatDots(stat.val, stat.max)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Abilities */}
                        <section>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                                <Star className="w-5 h-5" /> {t.abilities}
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {pokemon.Ability1 && (
                                    <button 
                                        onClick={() => handleAbilityClick(pokemon.Ability1)}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left"
                                    >
                                        <span className="text-xs text-slate-400 block uppercase font-bold">{t.primary}</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{getLocalizedAbility(pokemon.Ability1, language)}</span>
                                    </button>
                                )}
                                {pokemon.Ability2 && (
                                    <button 
                                        onClick={() => handleAbilityClick(pokemon.Ability2!)}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left"
                                    >
                                        <span className="text-xs text-slate-400 block uppercase font-bold">{t.secondary}</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{getLocalizedAbility(pokemon.Ability2, language)}</span>
                                    </button>
                                )}
                                {pokemon.HiddenAbility && (
                                    <button 
                                        onClick={() => handleAbilityClick(pokemon.HiddenAbility!)}
                                        className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors text-left"
                                    >
                                        <span className="text-xs text-purple-400 dark:text-purple-300 block uppercase font-bold">{t.hidden}</span>
                                        <span className="font-semibold text-purple-700 dark:text-purple-200">{getLocalizedAbility(pokemon.HiddenAbility, language)}</span>
                                    </button>
                                )}
                            </div>
                        </section>

                        {/* Moves */}
                        <section>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                                <Zap className="w-5 h-5" /> {t.moveset}
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 overflow-hidden border border-slate-100 dark:border-slate-700">
                                {pokemon.Moves && pokemon.Moves.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {pokemon.Moves.map((move: Move, idx: number) => {
                                            let tierColor = "text-slate-500 dark:text-slate-400";
                                            let bg = "bg-white dark:bg-slate-800";
                                            let hover = "hover:bg-slate-100 dark:hover:bg-slate-700";
                                            const learned = move.Learned || 'Standard';
                                            
                                            // Translated Learn Method
                                            const localizedLearn = getLocalizedLearnMethod(learned, language);
                                            // Translated Move Name
                                            const displayMoveName = getLocalizedMoveName(move.Name, language);

                                            if(learned === 'Starter') { tierColor = "text-green-600 dark:text-green-400"; bg = "bg-green-50 dark:bg-green-900/20"; hover = "hover:bg-green-100 dark:hover:bg-green-900/30"; }
                                            if(learned === 'Expert' || learned === 'Ace' || learned === 'Master') { tierColor = "text-orange-600 dark:text-orange-400"; bg = "bg-orange-50 dark:bg-orange-900/20"; hover = "hover:bg-orange-100 dark:hover:bg-orange-900/30"; }
                                            
                                            return (
                                                <button 
                                                    key={idx} 
                                                    onClick={() => handleMoveClick(move.Name)}
                                                    className={`${bg} ${hover} p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col text-left transition-all duration-200 active:scale-95`}
                                                >
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${tierColor} mb-1`}>{localizedLearn}</span>
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate w-full">{displayMoveName}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-center italic">No moves data available.</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Modal for Moves */}
            {selectedMove && (
                <MoveDetail 
                    moveName={selectedMove.name}
                    filePath={selectedMove.path}
                    onClose={() => setSelectedMove(null)}
                    language={language}
                />
            )}

            {/* Modal for Abilities */}
            {selectedAbility && (
                <AbilityDetail 
                    abilityName={selectedAbility.name}
                    filePath={selectedAbility.path}
                    onClose={() => setSelectedAbility(null)}
                    language={language}
                />
            )}
        </>
    );
};