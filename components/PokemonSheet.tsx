import React, { useState, useEffect } from 'react';
import { PokemonData, Language, PokemonCharacter } from '../types';
import { ArrowLeft, Plus, Trash2, Search, X, Edit2, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';
import { TRANSLATIONS, getTypeColor, getListImageUrl, getDetailImageUrl } from '../utils';
import { PokeballIcon } from './Icons';
import { TypeBadge } from './Shared';
import { PokemonCharacterSheet } from './PokemonCharacterSheet';

export const PokemonSheet = ({
    onBack,
    allPokemon,
    language,
    natureMap,
    moveFileMap,
    abilityFileMap
}: {
    onBack: () => void;
    allPokemon: PokemonData[];
    language: Language;
    natureMap: Record<string, string>;
    moveFileMap: Record<string, string>;
    abilityFileMap: Record<string, string>;
}) => {
    const t = TRANSLATIONS[language];
    
    // Party State (Belt)
    const [party, setParty] = useState<(PokemonCharacter | null)[]>(Array(6).fill(null));
    
    // PC State (20 Boxes of 30 Slots)
    const [pcBoxes, setPcBoxes] = useState<(PokemonCharacter | null)[][]>(
        Array(20).fill(null).map(() => Array(30).fill(null))
    );
    const [currentBoxIndex, setCurrentBoxIndex] = useState(0);

    // Selection State
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    
    // Defines where the new pokemon will go.
    // boxIndex = -1 means Party (Belt).
    // boxIndex = 0-19 means PC Box.
    const [selectionTarget, setSelectionTarget] = useState<{ boxIndex: number, slotIndex: number } | null>(null);

    const [editingPokemon, setEditingPokemon] = useState<PokemonCharacter | null>(null);
    // Defines where the edited pokemon resides to save it back correctly
    const [editingTarget, setEditingTarget] = useState<{ boxIndex: number, slotIndex: number } | null>(null);

    // Drag and Drop State
    const [draggedItem, setDraggedItem] = useState<{ source: 'party' | 'pc', boxIndex: number, slotIndex: number } | null>(null);

    // Search State
    const [searchInput, setSearchInput] = useState(''); 
    const [activeSearch, setActiveSearch] = useState('');

    // Load Data
    useEffect(() => {
        // Load Party
        const savedParty = localStorage.getItem('pokerole-party');
        if (savedParty) {
            try {
                const parsed = JSON.parse(savedParty);
                if (Array.isArray(parsed) && parsed.length === 6) {
                    setParty(parsed);
                }
            } catch (e) {
                console.error("Failed to load party", e);
            }
        }

        // Load PC
        const savedPC = localStorage.getItem('pokerole-pc');
        if (savedPC) {
             try {
                const parsed = JSON.parse(savedPC);
                // Validate structure roughly
                if (Array.isArray(parsed) && parsed.length === 20 && Array.isArray(parsed[0]) && parsed[0].length === 30) {
                    setPcBoxes(parsed);
                }
            } catch (e) {
                console.error("Failed to load PC", e);
            }
        }
    }, []);

    // Save Data
    useEffect(() => {
        localStorage.setItem('pokerole-party', JSON.stringify(party));
    }, [party]);

    useEffect(() => {
        localStorage.setItem('pokerole-pc', JSON.stringify(pcBoxes));
    }, [pcBoxes]);


    // --- Handlers ---

    // Drag and Drop Logic
    const handleDragStart = (e: React.DragEvent, source: 'party' | 'pc', boxIndex: number, slotIndex: number) => {
        setDraggedItem({ source, boxIndex, slotIndex });
        e.dataTransfer.effectAllowed = 'move';
        // Optional: Custom ghost image could be set here
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetSource: 'party' | 'pc', targetBoxIndex: number, targetSlotIndex: number) => {
        e.preventDefault();
        
        if (!draggedItem) return;

        const { source, boxIndex: sourceBoxIndex, slotIndex: sourceSlotIndex } = draggedItem;

        // Prevent dropping on self
        if (source === targetSource && sourceBoxIndex === targetBoxIndex && sourceSlotIndex === targetSlotIndex) {
            setDraggedItem(null);
            return;
        }

        // 1. Get Source Pokemon
        let sourceChar: PokemonCharacter | null = null;
        if (source === 'party') {
            sourceChar = party[sourceSlotIndex];
        } else {
            sourceChar = pcBoxes[sourceBoxIndex][sourceSlotIndex];
        }

        if (!sourceChar) {
             setDraggedItem(null);
             return;
        }

        // 2. Get Target Pokemon (if any, for swap)
        let targetChar: PokemonCharacter | null = null;
        if (targetSource === 'party') {
            targetChar = party[targetSlotIndex];
        } else {
            targetChar = pcBoxes[targetBoxIndex][targetSlotIndex];
        }

        // 3. Prepare new arrays
        const newParty = [...party];
        const newPcBoxes = [...pcBoxes]; // Shallow copy of boxes array
        
        // Helper to get/set (handles deep copy of specific box on write)
        const setChar = (src: 'party' | 'pc', bIdx: number, sIdx: number, char: PokemonCharacter | null) => {
             if (src === 'party') {
                 newParty[sIdx] = char;
             } else {
                 // Clone the specific box if it hasn't been cloned yet in this operation
                 if (newPcBoxes[bIdx] === pcBoxes[bIdx]) {
                     newPcBoxes[bIdx] = [...pcBoxes[bIdx]];
                 }
                 newPcBoxes[bIdx][sIdx] = char;
             }
        };

        // 4. Perform Swap/Move
        
        // Remove from Source
        setChar(source, sourceBoxIndex, sourceSlotIndex, null);

        // Place Source at Target
        setChar(targetSource, targetBoxIndex, targetSlotIndex, sourceChar);

        // If Target had a char, place it at Source (Swap)
        if (targetChar) {
            setChar(source, sourceBoxIndex, sourceSlotIndex, targetChar);
        }

        // 5. Update State
        setParty(newParty);
        setPcBoxes(newPcBoxes);
        setDraggedItem(null);
    };

    // Generic Click Handler for any slot (Party or PC)
    const handleSlotClick = (boxIndex: number, slotIndex: number) => {
        const char = boxIndex === -1 ? party[slotIndex] : pcBoxes[boxIndex][slotIndex];

        if (char === null) {
            // Empty Slot -> Add New
            setSelectionTarget({ boxIndex, slotIndex });
            setIsSelectorOpen(true);
            setSearchInput('');
            setActiveSearch('');
        } else {
            // Filled Slot -> Edit
            setEditingTarget({ boxIndex, slotIndex });
            setEditingPokemon(char);
        }
    };

    const createCharacterFromData = (data: PokemonData): PokemonCharacter => {
        return {
            id: crypto.randomUUID(),
            dexId: data.Number,
            nickname: data.Name,
            speciesName: data.Name,
            type1: data.Type1,
            type2: data.Type2,
            rank: data.RecommendedRank || 'Starter',
            attributes: {
                strength: { current: data.Strength, max: data.MaxStrength },
                dexterity: { current: data.Dexterity, max: data.MaxDexterity },
                vitality: { current: data.Vitality, max: data.MaxVitality },
                special: { current: data.Special, max: data.MaxSpecial },
                insight: { current: data.Insight, max: data.MaxInsight },
            },
            skills: {
                fight: { brawl: 0, channel: 0, clash: 0, evasion: 0 },
                survival: { alert: 0, athletic: 0, nature: 0, stealth: 0 },
                social: { allure: 0, etiquette: 0, intimidate: 0, perform: 0 },
            },
            hp: { current: data.BaseHP, max: data.BaseHP },
            // Update: Will is Insight + 2
            will: { current: data.Insight + 2, max: data.Insight + 2 }, 
            moves: [], // Initialize empty moves
            nature: '',
            confidence: '',
            happiness: 2,
            loyalty: 2,
            battles: 0,
            victories: 0,
            item: '',
            status: 'Neutral',
            accessory: '',
            contest: { tough: 1, cool: 1, beauty: 1, cute: 1, clever: 1 },
            combat: { accuracy: 0, damage: 0 },
            size: data.Height?.Meters?.toString() || '0',
            weight: data.Weight?.Kilograms?.toString() || '0',
            image: getDetailImageUrl(data)
        };
    };

    const handleSelectPokemon = (pokemon: PokemonData) => {
        if (selectionTarget) {
            const newChar = createCharacterFromData(pokemon);
            const { boxIndex, slotIndex } = selectionTarget;

            if (boxIndex === -1) {
                // Update Party
                const newParty = [...party];
                newParty[slotIndex] = newChar;
                setParty(newParty);
            } else {
                // Update PC
                const newPC = [...pcBoxes];
                const newBox = [...newPC[boxIndex]];
                newBox[slotIndex] = newChar;
                newPC[boxIndex] = newBox;
                setPcBoxes(newPC);
            }

            setIsSelectorOpen(false);
            setSelectionTarget(null);
        }
    };

    const handleRemovePokemon = (e: React.MouseEvent, boxIndex: number, slotIndex: number) => {
        e.stopPropagation();
        if (boxIndex === -1) {
            // Remove from Party
            const newParty = [...party];
            newParty[slotIndex] = null;
            setParty(newParty);
        } else {
            // Remove from PC
            const newPC = [...pcBoxes];
            const newBox = [...newPC[boxIndex]];
            newBox[slotIndex] = null;
            newPC[boxIndex] = newBox;
            setPcBoxes(newPC);
        }
    };

    const handleSaveCharacter = (updated: PokemonCharacter) => {
        if (editingTarget) {
            const { boxIndex, slotIndex } = editingTarget;
            
            if (boxIndex === -1) {
                // Update Party
                const newParty = [...party];
                newParty[slotIndex] = updated;
                setParty(newParty);
            } else {
                // Update PC
                const newPC = [...pcBoxes];
                const newBox = [...newPC[boxIndex]];
                newBox[slotIndex] = updated;
                newPC[boxIndex] = newBox;
                setPcBoxes(newPC);
            }
        }
    };

    // PC Navigation
    const nextBox = () => setCurrentBoxIndex((prev) => (prev + 1) % 20);
    const prevBox = () => setCurrentBoxIndex((prev) => (prev - 1 + 20) % 20);

    const executeSearch = () => {
        setActiveSearch(searchInput);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            executeSearch();
        }
    };

    // Filter pokemon for selector
    const filteredList = allPokemon
        .filter(p => {
            if (!activeSearch.trim()) return true;
            return p.Name.toLowerCase().includes(activeSearch.toLowerCase());
        })
        .sort((a, b) => {
            if (!activeSearch.trim()) return a.Number - b.Number;
            const term = activeSearch.toLowerCase();
            const aName = a.Name.toLowerCase();
            const bName = b.Name.toLowerCase();
            if (aName === term && bName !== term) return -1;
            if (bName === term && aName !== term) return 1;
            const aStarts = aName.startsWith(term);
            const bStarts = bName.startsWith(term);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            if (aName.length !== bName.length) return aName.length - bName.length;
            return aName.localeCompare(bName);
        })
        .slice(0, 50);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen pb-32">
            <header className="mb-8 flex items-center gap-4">
                <button 
                    onClick={onBack} 
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-8 h-8 text-slate-700 dark:text-slate-200" />
                </button>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t.party}</h1>
            </header>

            {/* Party Grid (Belt) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {party.map((char, index) => (
                    <div 
                        key={index} 
                        className="relative"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'party', -1, index)}
                    >
                        {char ? (
                            // Filled Party Slot
                            <div 
                                draggable
                                onDragStart={(e) => handleDragStart(e, 'party', -1, index)}
                                onClick={() => handleSlotClick(-1, index)}
                                className={`relative h-40 rounded-3xl p-5 shadow-lg overflow-hidden ${getTypeColor(char.type1)} group cursor-grab active:cursor-grabbing transform hover:scale-[1.02] transition-all`}
                            >
                                <div className="absolute -right-6 -bottom-6 w-40 h-40 opacity-30 text-white pointer-events-none z-0">
                                    <PokeballIcon />
                                </div>
                                
                                <div className="flex justify-between h-full relative z-10 pointer-events-none">
                                    <div className="flex flex-col">
                                        <span className="font-extrabold text-white text-xl tracking-wide drop-shadow-md truncate w-32">{char.nickname}</span>
                                        {char.nickname !== char.speciesName && (
                                            <span className="text-white/70 text-xs font-bold uppercase">{char.speciesName}</span>
                                        )}
                                        <div className="mt-2 flex flex-col items-start">
                                            <TypeBadge type={char.type1} language={language} />
                                            {char.type2 && <TypeBadge type={char.type2} language={language} />}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end justify-between">
                                        <div className="bg-black/20 px-2 py-1 rounded-lg">
                                            <span className="text-white font-mono text-sm">HP {char.hp.current}/{char.hp.max}</span>
                                        </div>
                                        <img 
                                            loading="lazy"
                                            src={char.image} 
                                            alt={char.nickname} 
                                            className="w-24 h-24 object-contain absolute bottom-0 right-0 transform translate-x-3 translate-y-3 drop-shadow-lg"
                                        />
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20 pointer-events-none">
                                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
                                        <Edit2 className="text-white" size={20} />
                                        <span className="text-white font-bold">Edit Sheet</span>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => handleRemovePokemon(e, -1, index)}
                                    className="absolute top-3 right-3 p-2 bg-black/20 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 pointer-events-auto"
                                    title={t.removeFromParty}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            // Empty Party Slot
                            <div 
                                onClick={() => handleSlotClick(-1, index)}
                                className="h-40 rounded-3xl border-4 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-200 group"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Plus size={24} />
                                </div>
                                <span className="font-bold text-lg">{t.emptySlot}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Bill's PC Section */}
            <div className="mt-8 border-t-2 border-slate-200 dark:border-slate-700 pt-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <Monitor className="text-slate-500 dark:text-slate-400" size={32} />
                        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">{t.pc}</h2>
                    </div>
                    
                    {/* PC Navigation */}
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <button 
                            onClick={prevBox}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ChevronLeft />
                        </button>
                        <div className="flex flex-col items-center w-32">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.box}</span>
                            <div className="relative">
                                <select 
                                    value={currentBoxIndex}
                                    onChange={(e) => setCurrentBoxIndex(parseInt(e.target.value))}
                                    className="appearance-none bg-transparent font-black text-xl text-center outline-none cursor-pointer text-slate-800 dark:text-white w-full z-10 relative"
                                >
                                    {Array.from({length: 20}).map((_, i) => (
                                        <option key={i} value={i} className="text-slate-800">{i + 1}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button 
                            onClick={nextBox}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ChevronRight />
                        </button>
                    </div>
                </div>
                
                {/* PC Grid (6x5 = 30 Slots) */}
                <div className="bg-slate-200 dark:bg-slate-900/50 p-4 rounded-3xl border-4 border-slate-300 dark:border-slate-800">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {pcBoxes[currentBoxIndex].map((char, slotIndex) => (
                            <div 
                                key={slotIndex} 
                                className="aspect-square relative group"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, 'pc', currentBoxIndex, slotIndex)}
                            >
                                {char ? (
                                    <div 
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, 'pc', currentBoxIndex, slotIndex)}
                                        onClick={() => handleSlotClick(currentBoxIndex, slotIndex)}
                                        className={`w-full h-full rounded-xl shadow-md overflow-hidden ${getTypeColor(char.type1)} cursor-grab active:cursor-grabbing transition-transform hover:scale-105 border-2 border-white/20`}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                            <PokeballIcon />
                                        </div>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 pointer-events-none">
                                            <img 
                                                src={char.image} 
                                                alt={char.nickname} 
                                                className="w-16 h-16 object-contain drop-shadow-md mb-1"
                                            />
                                            <span className="text-[10px] font-bold text-white uppercase truncate w-full text-center bg-black/20 rounded px-1">
                                                {char.nickname}
                                            </span>
                                        </div>
                                        
                                        <button
                                            onClick={(e) => handleRemovePokemon(e, currentBoxIndex, slotIndex)}
                                            className="absolute top-1 right-1 p-1 bg-black/40 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all z-10 pointer-events-auto"
                                            title={t.removeFromParty}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => handleSlotClick(currentBoxIndex, slotIndex)}
                                        className="w-full h-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 flex flex-col items-center justify-center text-slate-400 hover:bg-white hover:border-slate-400 transition-colors cursor-pointer"
                                    >
                                        <Plus size={20} className="opacity-50" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Selector Modal */}
            {isSelectorOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[80vh] animate-scale-up">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.selectPokemon}</h2>
                            <button onClick={() => setIsSelectorOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                                    <input 
                                        type="text" 
                                        autoFocus
                                        placeholder={t.searchPlaceholder}
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <button 
                                    onClick={executeSearch}
                                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg"
                                >
                                    <Search size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {filteredList.map(poke => (
                                    <button
                                        key={poke.Number}
                                        onClick={() => handleSelectPokemon(poke)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left"
                                    >
                                        <img 
                                            src={getListImageUrl(poke)} 
                                            alt={poke.Name}
                                            className="w-12 h-12 object-contain"
                                        />
                                        <div>
                                            <span className="block font-bold text-slate-800 dark:text-white">{poke.Name}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">#{poke.Number}</span>
                                        </div>
                                    </button>
                                ))}
                                {filteredList.length === 0 && (
                                    <div className="col-span-full text-center py-8 text-slate-400">
                                        {t.noResults}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Character Sheet Editor */}
            {editingPokemon && (
                <PokemonCharacterSheet 
                    character={editingPokemon}
                    // Pass full context for move learning
                    baseData={allPokemon.find(p => p.Number === editingPokemon.dexId)}
                    moveFileMap={moveFileMap}
                    abilityFileMap={abilityFileMap}
                    language={language}
                    onSave={handleSaveCharacter}
                    onClose={() => {
                        setEditingPokemon(null);
                        setEditingTarget(null);
                    }}
                    natureMap={natureMap}
                />
            )}
        </div>
    );
};