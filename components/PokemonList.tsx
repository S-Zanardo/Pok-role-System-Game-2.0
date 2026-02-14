import React, { useState, useMemo } from 'react';
import { PokemonData, Region, Language } from '../types';
import { ArrowLeft, Filter, Search, X, RotateCcw, Check, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { ALL_TYPES, ALL_RANKS, getTypeColor, getListImageUrl, TRANSLATIONS, getLocalizedType, getLocalizedLearnMethod } from '../utils';
import { TypeBadge } from './Shared';
import { PokeballIcon } from './Icons';

export const PokemonList = ({ 
    region, 
    onBack, 
    onSelectPokemon, 
    data,
    language
}: { 
    region: Region, 
    onBack: () => void, 
    onSelectPokemon: (p: PokemonData) => void,
    data: PokemonData[],
    language: Language
}) => {
    const t = TRANSLATIONS[language];
    
    // --- Filter States (Inputs) ---
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Accordion States
    const [openSections, setOpenSections] = useState({
        types: true,
        ranks: false,
        stats: false
    });

    const [tempFilterName, setTempFilterName] = useState('');
    const [tempFilterType, setTempFilterType] = useState<string[]>([]); 
    const [tempSelectedRanks, setTempSelectedRanks] = useState<string[]>([]);
    const [tempIsStarter, setTempIsStarter] = useState(false);
    
    const [tempMinStats, setTempMinStats] = useState({
        strength: '',
        dexterity: '',
        vitality: '',
        special: '',
        insight: ''
    });

    // --- Applied Filters State ---
    const [appliedFilters, setAppliedFilters] = useState({
        name: '',
        type: [] as string[],
        ranks: [] as string[],
        isStarter: false,
        stats: {
            strength: '',
            dexterity: '',
            vitality: '',
            special: '',
            insight: ''
        }
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const resetFilters = () => {
        // Reset Inputs
        setTempFilterName('');
        setTempFilterType([]);
        setTempSelectedRanks([]);
        setTempIsStarter(false);
        setTempMinStats({
            strength: '',
            dexterity: '',
            vitality: '',
            special: '',
            insight: ''
        });
        
        // Reset Applied
        setAppliedFilters({
            name: '',
            type: [],
            ranks: [],
            isStarter: false,
            stats: {
                strength: '',
                dexterity: '',
                vitality: '',
                special: '',
                insight: ''
            }
        });
    };

    const applyFilters = () => {
        setAppliedFilters({
            name: tempFilterName,
            type: tempFilterType,
            ranks: tempSelectedRanks,
            isStarter: tempIsStarter,
            stats: { ...tempMinStats }
        });
    };

    const handleStatChange = (stat: keyof typeof tempMinStats, value: string) => {
        setTempMinStats(prev => ({ ...prev, [stat]: value }));
    };

    const toggleRank = (rank: string) => {
        setTempSelectedRanks(prev => 
            prev.includes(rank) ? prev.filter(r => r !== rank) : [...prev, rank]
        );
    };

    const toggleType = (type: string) => {
        setTempFilterType(prev => 
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };
    
    const filteredPokemon = useMemo(() => {
        // 1. Filter by Region (and Variants)
        let result = data;
        if (region !== 'National') {
             const ranges: Record<string, [number, number]> = {
                'Kanto': [1, 151],
                'Johto': [152, 251],
                'Hoenn': [252, 386],
                'Sinnoh': [387, 493],
                'Unova': [494, 649],
                'Kalos': [650, 721],
                'Alola': [722, 809],
                'Galar': [810, 905],
                'Paldea': [906, 2000]
            };
            const range = ranges[region];
            if (range) {
                result = result.filter(p => {
                    const nameLower = p.Name.toLowerCase();
                    
                    const isAlolan = nameLower.includes('alolan');
                    const isGalarian = nameLower.includes('galarian');
                    const isPaldean = nameLower.includes('paldean');
                    const isHisuian = nameLower.includes('hisuian');

                    if (isAlolan) return region === 'Alola';
                    if (isGalarian) return region === 'Galar';
                    if (isPaldean) return region === 'Paldea';
                    if (isHisuian) return region === 'Sinnoh'; 

                    return p.Number >= range[0] && p.Number <= range[1];
                });
            }
        }

        // 2. Filter by Name
        if (appliedFilters.name.trim()) {
            const term = appliedFilters.name.toLowerCase();
            result = result.filter(p => p.Name.toLowerCase().includes(term));
        }

        // 3. Filter by Type (Multi-select)
        if (appliedFilters.type.length > 0) {
            result = result.filter(p => 
                appliedFilters.type.includes(p.Type1) || 
                (p.Type2 && appliedFilters.type.includes(p.Type2))
            );
        }

        // 4. Filter by Rank (Multi-select)
        if (appliedFilters.ranks.length > 0) {
            result = result.filter(p => appliedFilters.ranks.includes(p.RecommendedRank));
        }

        // 5. Filter by Starter
        if (appliedFilters.isStarter) {
            result = result.filter(p => p.GoodStarter);
        }

        // 6. Filter by Stats
        const stats = appliedFilters.stats;
        if (stats.strength) result = result.filter(p => p.Strength >= Number(stats.strength));
        if (stats.dexterity) result = result.filter(p => p.Dexterity >= Number(stats.dexterity));
        if (stats.vitality) result = result.filter(p => p.Vitality >= Number(stats.vitality));
        if (stats.special) result = result.filter(p => p.Special >= Number(stats.special));
        if (stats.insight) result = result.filter(p => p.Insight >= Number(stats.insight));

        return result;
    }, [region, data, appliedFilters]);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
             <header className="sticky top-0 z-20 bg-[#f3f4f6]/95 dark:bg-slate-950/95 backdrop-blur-md rounded-b-xl shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack} 
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-8 h-8 text-slate-700 dark:text-slate-200" />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">{region} Dex</h1>
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{filteredPokemon.length} {t.entriesFound}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isFilterOpen ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'}`}
                    >
                       {isFilterOpen ? <X size={20} /> : <Filter size={20} />}
                       <span className="hidden md:inline">{isFilterOpen ? t.close : t.filters}</span>
                    </button>
                </div>

                {/* Filter Panel */}
                {isFilterOpen && (
                    <div className="p-4 md:p-6 border-t border-slate-200 dark:border-slate-800 animate-fade-in bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-4">
                        
                        {/* Always Visible: Name Search & Reset */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder={t.searchPlaceholder}
                                    value={tempFilterName}
                                    onChange={(e) => setTempFilterName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <button 
                                onClick={resetFilters}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium whitespace-nowrap"
                            >
                                <RotateCcw size={18} /> {t.clear}
                            </button>
                        </div>

                        {/* Collapsible: Type Filter */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50">
                            <button 
                                onClick={() => toggleSection('types')}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="font-bold text-slate-600 dark:text-slate-300 uppercase text-xs">{t.type}</span>
                                {openSections.types ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
                            </button>
                            
                            {openSections.types && (
                                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {ALL_TYPES.map(type => {
                                            const isSelected = tempFilterType.includes(type);
                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => toggleType(type)}
                                                    className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                                                        isSelected 
                                                        ? `${getTypeColor(type)} text-white font-semibold shadow-md border-transparent` 
                                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                    }`}
                                                >
                                                    {getLocalizedType(type, language)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Collapsible: Rank & Role */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50">
                             <button 
                                onClick={() => toggleSection('ranks')}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="font-bold text-slate-600 dark:text-slate-300 uppercase text-xs">{t.rank} & {t.role}</span>
                                {openSections.ranks ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
                            </button>

                            {openSections.ranks && (
                                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        {/* Rank Selection */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">{t.rankFilter}</label>
                                            <div className="flex flex-wrap gap-2">
                                                {ALL_RANKS.map(rank => {
                                                    const isSelected = tempSelectedRanks.includes(rank);
                                                    return (
                                                        <button
                                                            key={rank}
                                                            onClick={() => toggleRank(rank)}
                                                            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                                                                isSelected 
                                                                ? 'bg-red-500 border-red-500 text-white font-semibold shadow-md' 
                                                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                            }`}
                                                        >
                                                            {getLocalizedLearnMethod(rank, language)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Role / Starter Checkbox */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">{t.role}</label>
                                            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors w-max border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${tempIsStarter ? 'bg-red-500 border-red-500' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 group-hover:border-red-400'}`}>
                                                    {tempIsStarter && <Check size={16} className="text-white" />}
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    checked={tempIsStarter}
                                                    onChange={() => setTempIsStarter(!tempIsStarter)}
                                                    className="hidden"
                                                />
                                                <span className="text-slate-700 dark:text-slate-200 font-medium select-none">{t.onlyStarter}</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Collapsible: Stats Filters */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50">
                             <button 
                                onClick={() => toggleSection('stats')}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="font-bold text-slate-600 dark:text-slate-300 uppercase text-xs">{t.minStats}</span>
                                {openSections.stats ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
                            </button>

                             {openSections.stats && (
                                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                                        {(['strength', 'dexterity', 'vitality', 'special', 'insight'] as const).map(stat => (
                                            <div key={stat}>
                                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                                                    {/* @ts-ignore - dynamic key access */}
                                                    {t[stat]}
                                                </label>
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    max="10"
                                                    placeholder="0"
                                                    value={tempMinStats[stat]}
                                                    onChange={(e) => handleStatChange(stat, e.target.value)}
                                                    className="w-full px-3 py-2 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             )}
                        </div>

                         {/* Apply Button */}
                         <div className="mt-2 flex justify-end">
                            <button 
                                onClick={applyFilters}
                                className="w-full md:w-auto px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20 font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                            >
                                <Check size={24} /> {t.apply}
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {filteredPokemon.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Info size={48} className="mb-4" />
                    <p className="text-xl">{t.noResults}</p>
                    <button onClick={resetFilters} className="mt-4 text-red-500 hover:underline">{t.clear}</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 mt-8">
                    {filteredPokemon.map((poke) => (
                        <div 
                            key={`${poke.Number}-${poke.Name}`}
                            onClick={() => onSelectPokemon(poke)}
                            className={`relative h-40 rounded-3xl p-5 shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-300 overflow-hidden ${getTypeColor(poke.Type1)}`}
                        >
                            <div className="absolute -right-6 -bottom-6 w-40 h-40 opacity-30 text-white pointer-events-none z-0">
                                <PokeballIcon />
                            </div>
                            <div className="flex justify-between h-full relative z-10">
                                <div className="flex flex-col">
                                    <span className="font-extrabold text-white text-xl tracking-wide drop-shadow-md truncate w-32">{poke.Name}</span>
                                    <div className="mt-2 flex flex-col items-start">
                                        <TypeBadge type={poke.Type1} language={language} />
                                        {poke.Type2 && <TypeBadge type={poke.Type2} language={language} />}
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end justify-between">
                                    <span className="text-white/80 font-bold text-lg drop-shadow-sm">#{poke.Number.toString().padStart(3, '0')}</span>
                                    <img 
                                        loading="lazy"
                                        src={getListImageUrl(poke)}
                                        alt={poke.Name} 
                                        className="w-24 h-24 object-contain absolute bottom-0 right-0 transform translate-x-3 translate-y-3 drop-shadow-lg"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
