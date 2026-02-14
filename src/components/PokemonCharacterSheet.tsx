import React, { useState, useEffect, useMemo } from 'react';
import { PokemonCharacter, Language, CharacterSkills, NatureData, PokemonData, MoveDetailData } from '../types';
import { ArrowLeft, Save, Heart, Shield, Swords, Sparkles, Brain, Leaf, User, MessageCircle, Eye, Info, ChevronDown, ChevronUp, Lock, Unlock, Dices, Play, Zap, CheckCircle2, Circle, Star, Trophy, Plus, Minus, X } from 'lucide-react';
import { TRANSLATIONS, getTypeColor, ALL_RANKS, STATUS_CONDITIONS, getLocalizedMoveName, getLocalizedLearnMethod, getLocalizedAbility } from '../utils';
import { TypeBadge } from './Shared';
import { RankIcon } from './Icons';
import { MoveDetail } from './MoveDetail';
import { AbilityDetail } from './AbilityDetail';

interface PokemonCharacterSheetProps {
    character: PokemonCharacter;
    baseData?: PokemonData; // Context for available moves
    moveFileMap?: Record<string, string>; // To open move details
    abilityFileMap?: Record<string, string>; // To open ability details
    onSave: (updated: PokemonCharacter) => void;
    onClose: () => void;
    language: Language;
    natureMap?: Record<string, string>;
}

interface RollState {
    step: 'setup' | 'rolling' | 'result';
    mode: 'attribute' | 'move' | 'initiative';
    isOpen: boolean;
    
    // Setup Data
    statName: string;
    statValue: number;
    selectedSkillName: string | null;
    selectedSkillValue: number;
    
    // Result Data
    results: number[];
    successes: number;
    total?: number;

    // Follow-up context (e.g. Damage Roll after Accuracy)
    activeMove?: {
        name: string;
        type: string;
        damagePool?: string;
    };
}

export const PokemonCharacterSheet = ({ character, baseData, moveFileMap, abilityFileMap, onSave, onClose, language, natureMap }: PokemonCharacterSheetProps) => {
    const t = TRANSLATIONS[language];
    const [data, setData] = useState<PokemonCharacter>(character);
    const [isLocked, setIsLocked] = useState(true); // Default to "Game Mode"
    const mainColor = getTypeColor(data.type1);
    
    // UI State for Dice Roller
    const [rollData, setRollData] = useState<RollState>({
        step: 'setup',
        mode: 'attribute',
        isOpen: false,
        statName: '',
        statValue: 0,
        selectedSkillName: null,
        selectedSkillValue: 0,
        results: [],
        successes: 0,
        total: 0
    });
    
    // UI State for Move Detail Popup (Game Mode)
    const [viewMove, setViewMove] = useState<{name: string, path: string} | null>(null);

    // UI State for Ability Detail Popup
    const [viewAbility, setViewAbility] = useState<{name: string, path: string} | null>(null);

    // UI State for Stat Choice (when a move has "Strength/Dexterity")
    const [statChoice, setStatChoice] = useState<{ isOpen: boolean, options: string[], modifier: string, moveData?: MoveDetailData } | null>(null);

    // Nature Details State
    const [natureDetails, setNatureDetails] = useState<NatureData | null>(null);
    const [isNatureInfoOpen, setIsNatureInfoOpen] = useState(false);

    // Fetch Nature Data when nature changes
    useEffect(() => {
        if (!data.nature || !natureMap) return;

        const path = natureMap[data.nature];
        if (path) {
            const encodedPath = path.split('/').map(p => encodeURIComponent(p)).join('/');
            const url = `https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/${encodedPath}`;
            
            fetch(url)
                .then(res => res.json())
                .then((json: NatureData) => {
                    setNatureDetails(json);
                    // Automatically set Confidence based on Nature data if editing
                    if (!isLocked && json.Confidence) {
                        setData(prev => ({ ...prev, confidence: json.Confidence }));
                    }
                })
                .catch(e => console.error("Failed to fetch nature", e));
        } else {
            setNatureDetails(null);
        }
    }, [data.nature, natureMap, isLocked]);

    // Save automatically on unmount or manual save
    const handleSave = () => {
        onSave(data);
    };

    const toggleLock = () => {
        if (!isLocked) {
            handleSave(); // Save when locking
        }
        setIsLocked(!isLocked);
    };

    // --- Ability Logic ---
    const handleAbilityClick = (abilityName: string) => {
        if (!abilityFileMap) return;
        
        let path = abilityFileMap[abilityName];
        if (!path) {
             const cleanName = abilityName.replace(/[\s-]/g, '');
             const foundKey = Object.keys(abilityFileMap).find(k => k.toLowerCase() === cleanName.toLowerCase() || k.toLowerCase() === abilityName.toLowerCase());
             if (foundKey) path = abilityFileMap[foundKey];
        }

        if (path) {
            setViewAbility({ name: abilityName, path });
        }
    };

    // --- Move Logic (Edit Mode) ---
    
    const toggleMove = (moveName: string, moveRank: string) => {
        if (isLocked) return;
        
        const currentMoves = data.moves || [];
        const isSelected = currentMoves.includes(moveName);
        const maxMoves = data.attributes.insight.current + 2;
        
        if (isSelected) {
            // Deselect
            setData(prev => ({ ...prev, moves: prev.moves.filter(m => m !== moveName) }));
        } else {
            // Select - Check Constraints
            
            // 1. Check Max Moves (Insight + 2)
            if (currentMoves.length >= maxMoves) {
                alert(`You can only learn ${maxMoves} moves (Insight + 2)!`);
                return;
            }

            const currentRankIndex = ALL_RANKS.indexOf(data.rank);
            const moveRankIndex = ALL_RANKS.indexOf(moveRank);
            
            // 2. If selecting a move from Next Rank, check if we already have one
            if (moveRankIndex > currentRankIndex) {
                // Find existing next rank moves
                const existingNextRankMoves = currentMoves.filter(m => {
                     const mData = baseData?.Moves.find(x => x.Name === m);
                     if(!mData) return false;
                     const mRankIdx = ALL_RANKS.indexOf(mData.Learned);
                     return mRankIdx > currentRankIndex;
                });
                
                if (existingNextRankMoves.length >= 1) {
                    alert("You can only learn one move from a higher rank!");
                    return;
                }
            }
            
            setData(prev => ({ ...prev, moves: [...prev.moves, moveName] }));
        }
    };
    
    // --- Dice Logic ---
    const triggerRollSetup = (statName: string, value: number) => {
        if (!isLocked || value <= 0) return;

        setRollData({
            step: 'setup',
            mode: 'attribute',
            isOpen: true,
            statName,
            statValue: value,
            selectedSkillName: null,
            selectedSkillValue: 0,
            results: [],
            successes: 0
        });
    };

    const toggleSkillSelection = (skillName: string, value: number) => {
        if (rollData.selectedSkillName === skillName) {
            // Deselect
            setRollData(prev => ({ ...prev, selectedSkillName: null, selectedSkillValue: 0 }));
        } else {
            // Select
            setRollData(prev => ({ ...prev, selectedSkillName: skillName, selectedSkillValue: value }));
        }
    };

    const startRoll = () => {
        const isInitiative = rollData.mode === 'initiative';
        // Initiative uses 1 die. Others use stat + skill dice.
        const totalDice = isInitiative ? 1 : rollData.statValue + rollData.selectedSkillValue;
        
        setRollData(prev => ({
            ...prev,
            step: 'rolling',
            results: Array(totalDice).fill(1) // Initial placeholder
        }));
    };

    // --- Move Dice Rolling Parsing ---
    
    const resolveStatValue = (name: string): number => {
        // Try parsing as number first (e.g. "Strength + 2")
        const parsed = parseInt(name);
        if (!isNaN(parsed) && String(parsed) === name) return parsed;

        const lowerName = name.toLowerCase().trim();
        // Check Attributes
        if (data.attributes[lowerName as keyof typeof data.attributes]) {
            return data.attributes[lowerName as keyof typeof data.attributes].current;
        }
        // Check Skills (Deep Search)
        for (const cat of ['fight', 'survival', 'social'] as const) {
            // @ts-ignore
            if (data.skills[cat][lowerName]) {
                // @ts-ignore
                return data.skills[cat][lowerName];
            }
        }
        // Check Contest Stats
        if (data.contest[lowerName as keyof typeof data.contest] !== undefined) {
            return data.contest[lowerName as keyof typeof data.contest];
        }

        return 0;
    };

    const handleMoveRoll = (diceString: string, moveData?: MoveDetailData) => {
        // Expected formats: "Dexterity + Brawl", "Strength/Dexterity + Channel", "Strength + 2"
        // 1. Split by '+'
        const parts = diceString.split('+').map(p => p.trim());
        
        let statPart = parts[0];
        let skillPart = parts[1] || "";
        
        // Check if Stat part has options (/)
        if (statPart.includes('/')) {
            const options = statPart.split('/').map(o => o.trim());
            // Open Choice Modal
            setStatChoice({
                isOpen: true,
                options: options,
                modifier: skillPart ? `+ ${skillPart}` : '',
                moveData: moveData
            });
            // Close Move View to show Choice
            setViewMove(null); 
            return;
        }

        // Direct Execution
        executeMoveRoll(statPart, skillPart, moveData);
    };

    const executeMoveRoll = (statName: string, skillName: string, moveData?: MoveDetailData) => {
        const statVal = resolveStatValue(statName);
        const skillVal = skillName ? resolveStatValue(skillName) : 0;

        let activeMove = undefined;
        if (moveData && moveData.Damage1) {
            const dmgString = moveData.Damage2 ? `${moveData.Damage1} + ${moveData.Damage2}` : moveData.Damage1;
            activeMove = {
                name: moveData.Name,
                type: moveData.Type,
                damagePool: dmgString
            };
        }
        
        // Setup Roll Data directly for Move (Move Mode)
        setRollData({
            step: 'setup',
            mode: 'move',
            isOpen: true,
            statName: statName,
            statValue: statVal,
            selectedSkillName: skillName || null,
            selectedSkillValue: skillVal,
            results: [],
            successes: 0,
            activeMove: activeMove
        });
        
        // Close other modals
        setViewMove(null);
        setStatChoice(null);
    };

    const prepareDamageRoll = () => {
        if (!rollData.activeMove || !rollData.activeMove.damagePool) return;
        
        const damagePool = rollData.activeMove.damagePool;
        const parts = damagePool.split('+').map(p => p.trim());
        
        const statName = parts[0];
        const val1 = resolveStatValue(statName);
        
        let val2 = 0;
        if (parts[1]) {
            val2 = resolveStatValue(parts[1]);
        }
        
        // Calculate Bonuses
        let stabBonus = 0;
        if (data.type1 === rollData.activeMove.type || (data.type2 && data.type2 === rollData.activeMove.type)) {
            stabBonus = 1;
        }

        let critBonus = 0;
        if (rollData.successes > 3) {
            critBonus = 2;
        }

        const totalBonus = val2 + stabBonus + critBonus;
        const labelParts = [];
        if (val2 > 0) labelParts.push(`Base(${val2})`);
        if (stabBonus > 0) labelParts.push("STAB(+1)");
        if (critBonus > 0) labelParts.push("Crit(+2)");
        const bonusLabel = labelParts.length > 0 ? labelParts.join(' ') : "Bonus";

        setRollData({
            step: 'setup',
            mode: 'move',
            isOpen: true,
            statName: "Damage", // Override label
            statValue: val1, // First attribute value
            selectedSkillName: bonusLabel, // Description of modifiers
            selectedSkillValue: totalBonus, // Sum of modifiers
            results: [],
            successes: 0,
            activeMove: undefined // Clear active move so we don't chain infinitely
        });
    };

    const executeInitiativeRoll = () => {
        const dex = data.attributes.dexterity.current;
        const alert = data.skills.survival.alert;
        const modifier = dex + alert;

        setRollData({
            step: 'setup',
            mode: 'initiative',
            isOpen: true,
            statName: 'Initiative',
            statValue: 1, // Always 1 die
            selectedSkillName: 'Dexterity + Alert', // Used as Label for modifier
            selectedSkillValue: modifier, // Used as Modifier value
            results: [],
            successes: 0,
            total: 0
        });
    };

    // Handle Dice Animation
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        let timeout: ReturnType<typeof setTimeout>;

        if (rollData.isOpen && rollData.step === 'rolling') {
            const isInitiative = rollData.mode === 'initiative';
            const diceCount = isInitiative ? 1 : rollData.statValue + rollData.selectedSkillValue;

            // Rapidly change numbers
            interval = setInterval(() => {
                setRollData(prev => ({
                    ...prev,
                    results: Array(diceCount).fill(0).map(() => Math.floor(Math.random() * 6) + 1)
                }));
            }, 80);

            // Stop after 2 seconds
            timeout = setTimeout(() => {
                clearInterval(interval);
                const finalResults = Array(diceCount).fill(0).map(() => Math.floor(Math.random() * 6) + 1);

                if (isInitiative) {
                    const dieVal = finalResults[0];
                    setRollData(prev => ({
                        ...prev,
                        step: 'result',
                        results: finalResults,
                        total: dieVal + prev.selectedSkillValue,
                        successes: 0
                    }));
                } else {
                    const successCount = finalResults.filter(r => r > 3).length; // > 3 means 4, 5, 6
                    setRollData(prev => ({
                        ...prev,
                        step: 'result',
                        results: finalResults,
                        successes: successCount
                    }));
                }
            }, 2000);
        }

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [rollData.isOpen, rollData.step, rollData.statValue, rollData.selectedSkillValue, rollData.mode]);


    // --- State Updaters ---

    const updateAttribute = (attr: keyof typeof data.attributes, field: 'current' | 'max', value: number) => {
        if (isLocked) return;
        setData(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [attr]: { ...prev.attributes[attr], [field]: value }
            }
        }));
    };

    const updateSkill = (category: keyof CharacterSkills, skill: string, value: number) => {
        if (isLocked) return;
        setData(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                [category]: {
                    // @ts-ignore - dynamic key access
                    ...prev.skills[category],
                    [skill]: value
                }
            }
        }));
    };

    const updateInfo = (field: keyof PokemonCharacter, value: any) => {
        if (isLocked) return;
        setData(prev => ({ ...prev, [field]: value }));
    };

    const updateBattleStats = (field: 'battles' | 'victories', delta: number) => {
        // Allow updates even in locked mode for tracking
        setData(prev => ({ 
            ...prev, 
            [field]: Math.max(0, (prev[field] || 0) + delta) 
        }));
    };

    const updateVitals = (field: 'hp' | 'will', sub: 'current' | 'max', value: number) => {
        setData(prev => ({
            ...prev,
            [field]: { ...prev[field], [sub]: value }
        }));
    };

    const updateContest = (stat: keyof typeof data.contest, value: number) => {
        if (isLocked) return;
        setData(prev => ({
            ...prev,
            contest: { ...prev.contest, [stat]: value }
        }));
    };

    const updateCombat = (stat: 'accuracy' | 'damage', value: number) => {
        if (isLocked) return; 
        setData(prev => ({
            ...prev,
            combat: { ...prev.combat, [stat]: value }
        }));
    }

    // --- Render Helpers ---

    const AttributeDots = ({ 
        label, 
        current, 
        max, 
        onChangeCurrent 
    }: { 
        label: string, 
        current: number, 
        max: number, 
        onChangeCurrent: (v: number) => void
    }) => {
        const Wrapper = isLocked ? 'button' : 'div';
        const wrapperProps = isLocked ? {
            onClick: () => triggerRollSetup(label, current),
            className: "w-full bg-white rounded-2xl border-4 border-slate-700 p-3 mb-4 shadow-sm flex flex-col items-center justify-center hover:bg-slate-50 hover:border-blue-500 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group relative"
        } : {
            className: "bg-white rounded-2xl border-4 border-slate-700 p-3 mb-4 shadow-sm flex flex-col items-center justify-center"
        };

        return (
            // @ts-ignore
            <Wrapper {...wrapperProps}>
                <div className="flex items-center gap-2 mb-2">
                    <span className={`font-black uppercase tracking-widest text-sm ${isLocked ? 'text-slate-800 group-hover:text-blue-600' : 'text-slate-800'}`}>{label}</span>
                    {isLocked && <Dices size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity absolute right-3" />}
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 px-1">
                    {Array.from({ length: max }).map((_, i) => (
                        <div
                            key={i}
                            onClick={(e) => {
                                if (!isLocked) {
                                    e.stopPropagation();
                                    onChangeCurrent(i + 1);
                                }
                            }}
                            className={`w-4 h-4 rounded-full border border-slate-300 transition-all duration-150 ${
                                i < current 
                                    ? 'bg-slate-900' // Black for current value
                                    : 'bg-slate-200' // Light gray for max capacity
                            } ${!isLocked ? 'cursor-pointer hover:bg-slate-400' : ''}`}
                            title={!isLocked ? `${label}: ${i + 1}` : ''}
                        />
                    ))}
                </div>
            </Wrapper>
        );
    };

    const ContestRow = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
        <div className={`bg-white/50 rounded-xl px-3 py-2 flex items-center justify-between mb-2 ${isLocked ? 'opacity-90' : 'hover:bg-white/80 transition-colors'}`}>
             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{label}</span>
             <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <button
                        key={i}
                        disabled={isLocked}
                        onClick={() => onChange(i + 1 === value ? 0 : i + 1)}
                        className={`w-3 h-3 rounded-full border border-pink-400 transition-all duration-150 ${
                            i < value 
                                ? 'bg-pink-500 scale-125 border-pink-500' 
                                : 'bg-white'
                        } ${!isLocked ? 'hover:bg-pink-200 cursor-pointer' : 'cursor-default'}`}
                        title={`${label}: ${i + 1}`}
                    />
                ))}
             </div>
        </div>
    );

    const SkillRow = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
        <div className="flex items-center justify-between mb-1.5 group">
            <span className="text-xs font-bold text-white uppercase group-hover:text-amber-200 transition-colors truncate mr-2">{label}</span>
            <div className="flex gap-1 shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                    <button
                        key={i}
                        disabled={isLocked}
                        onClick={() => onChange(i + 1 === value ? 0 : i + 1)}
                        className={`w-3.5 h-3.5 rounded-full border border-white/20 transition-all duration-150 ${
                            i < value 
                                ? 'bg-white scale-110 shadow-sm' 
                                : 'bg-black/20'
                        } ${!isLocked ? 'hover:bg-white/20' : 'cursor-default'}`}
                    />
                ))}
            </div>
        </div>
    );

    const BoxInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
         <div className={`bg-white rounded-xl border-4 border-slate-700 overflow-hidden flex flex-col mb-3 shadow-sm ${isLocked ? 'bg-slate-100' : ''}`}>
            <div className="bg-slate-700 px-2 py-0.5">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">{label}</span>
            </div>
            <input 
                type="text" 
                value={value}
                readOnly={isLocked}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-2 py-1 text-slate-800 font-bold outline-none ${isLocked ? 'bg-slate-100 cursor-default' : 'bg-blue-50 focus:bg-white'}`}
            />
        </div>
    );

    const VitalBox = ({ label, current, max, onChangeCurrent, icon }: { label: string, current: number, max: number, onChangeCurrent: (v: number) => void, icon?: React.ReactNode }) => (
         <div className="bg-slate-800 rounded-2xl p-1.5 flex items-center justify-between gap-3 mb-3 border-4 border-slate-700 shadow-md">
            <div className="flex-1 pl-3 overflow-hidden flex items-center gap-2">
                 <span className="text-lg font-black text-white uppercase tracking-wider truncate">{label}</span>
                 {icon}
            </div>
            <div className="w-28 bg-white rounded-xl h-10 flex items-center px-2 relative overflow-hidden shrink-0">
                 <input 
                    type="number"
                    value={current}
                    onChange={(e) => onChangeCurrent(parseInt(e.target.value) || 0)}
                    className="w-full text-2xl font-bold text-slate-800 bg-transparent relative z-10 outline-none"
                 />
                 <span className="text-slate-400 text-sm font-mono absolute right-2 top-1/2 transform -translate-y-1/2">/{max}</span>
            </div>
        </div>
    );

    const QuickRefPill = ({ 
        label, 
        value, 
        onChange, 
        isReadOnly = false,
        onRoll 
    }: { 
        label: string, 
        value: number | string, 
        onChange?: (v: number) => void, 
        isReadOnly?: boolean,
        onRoll?: () => void
    }) => (
        <div className="flex rounded-full border-4 border-slate-700 bg-white overflow-hidden h-9 shadow-sm">
           <div className="flex-1 flex items-center pl-3 font-black text-slate-700 uppercase text-[10px] tracking-wider whitespace-nowrap overflow-hidden">
               {label}:
           </div>
           {isReadOnly || isLocked ? (
               <div 
                   onClick={() => isLocked && onRoll && onRoll()}
                   className={`w-20 flex items-center justify-center font-bold text-slate-800 text-lg border-l-2 border-slate-200 
                   ${isLocked ? 'bg-slate-100' : 'bg-blue-100'}
                   ${isLocked && onRoll ? 'cursor-pointer hover:bg-green-100 hover:text-green-800 transition-colors' : ''}
                   `}
               >
                   {value}
                   {isLocked && onRoll && <Dices size={12} className="ml-1 opacity-50" />}
               </div>
           ) : (
               <input 
                    type="number"
                    value={value}
                    onChange={(e) => onChange && onChange(parseInt(e.target.value) || 0)}
                    className="w-20 bg-blue-100 flex items-center justify-center font-bold text-slate-800 text-lg border-l-2 border-slate-200 text-center outline-none"
               />
           )}
        </div>
    );

    // Calculated stats
    const initiative = data.attributes.dexterity.current + data.skills.survival.alert;
    const defense = data.attributes.vitality.current;
    const spDefense = data.attributes.insight.current;
    const evasion = data.attributes.dexterity.current + data.skills.fight.evasion;
    const clash = data.attributes.strength.current + data.skills.fight.clash;
    const combat = data.combat || { accuracy: 0, damage: 0 };
    const maxMoves = data.attributes.insight.current + 2;

    // Derived Moves for Edit Mode
    const availableMoves = useMemo(() => {
        if (!baseData) return { currentRank: [], nextRank: [] };
        
        const currentRankIndex = ALL_RANKS.indexOf(data.rank);
        
        const currentRank = baseData.Moves.filter(m => {
             const mRankIndex = ALL_RANKS.indexOf(m.Learned);
             return mRankIndex !== -1 && mRankIndex <= currentRankIndex;
        });

        const nextRank = baseData.Moves.filter(m => {
             const mRankIndex = ALL_RANKS.indexOf(m.Learned);
             return mRankIndex === currentRankIndex + 1;
        });

        return { currentRank, nextRank };
    }, [baseData, data.rank]);

    // Available Natures
    const natureOptions = useMemo(() => {
        return natureMap ? Object.keys(natureMap).sort() : [];
    }, [natureMap]);


    return (
        <div className="fixed inset-0 z-50 bg-[#e74c3c] overflow-y-auto animate-fade-in custom-scrollbar">
            {/* Toolbar */}
            <div className="sticky top-0 z-50 bg-[#c0392b] p-4 shadow-md flex justify-between items-center text-white">
                <button onClick={() => { handleSave(); onClose(); }} className="flex items-center gap-2 hover:bg-white/20 px-3 py-1 rounded-full transition-colors">
                    <ArrowLeft /> {t.close}
                </button>
                <h1 className="text-xl font-bold uppercase tracking-widest hidden md:block">{t.pokemonSheet}</h1>
                <button 
                    onClick={toggleLock} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg border transition-all ${
                        isLocked 
                        ? 'bg-slate-800 border-slate-600 hover:bg-slate-700 text-white' 
                        : 'bg-yellow-400 border-yellow-500 hover:bg-yellow-300 text-slate-900'
                    }`}
                >
                    {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                    <span className="font-bold">{isLocked ? 'Game Mode' : 'Edit Mode'}</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                
                {/* Header Info */}
                <div className="flex flex-col md:flex-row gap-6 mb-8 items-center bg-slate-800/20 p-6 rounded-3xl border-4 border-slate-800/30">
                     <div className="relative">
                        <div className={`w-32 h-32 rounded-full ${mainColor} border-4 border-white shadow-xl flex items-center justify-center overflow-hidden bg-white`}>
                            <img src={data.image} alt={data.nickname} className="w-24 h-24 object-contain" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-lg border-2 border-white">
                            #{data.dexId}
                        </div>
                     </div>
                     <div className="flex-1 w-full text-center md:text-left">
                        <input 
                            type="text" 
                            value={data.nickname}
                            readOnly={isLocked}
                            onChange={(e) => updateInfo('nickname', e.target.value)}
                            className={`text-4xl md:text-5xl font-black text-white bg-transparent border-b-4 focus:border-white outline-none w-full mb-2 placeholder-white/50 ${isLocked ? 'border-transparent cursor-default' : 'border-white/20'}`}
                            placeholder={t.nickname}
                        />
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                             <span className="text-xl text-white font-bold opacity-80">{data.speciesName}</span>
                             <div className="h-6 w-px bg-white/40 hidden md:block"></div>
                             <div className="flex gap-1">
                                <TypeBadge type={data.type1} language={language} />
                                {data.type2 && <TypeBadge type={data.type2} language={language} />}
                             </div>

                             {/* Counters Grid */}
                             <div className="ml-0 md:ml-4 bg-black/20 rounded-lg p-2 border border-white/10">
                                <div className="flex items-center gap-4 px-2 py-1">
                                    {/* Win Column */}
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Win</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateBattleStats('victories', -1)} className="p-1 hover:text-yellow-400 text-white/40 transition-colors"><Minus size={14}/></button>
                                            <span className="font-mono font-bold text-xl text-white min-w-[24px] text-center">{data.victories || 0}</span>
                                            <button onClick={() => updateBattleStats('victories', 1)} className="p-1 hover:text-yellow-400 text-white/40 transition-colors"><Plus size={14}/></button>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-8 bg-white/20"></div>

                                    {/* Fight Column */}
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Fight</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateBattleStats('battles', -1)} className="p-1 hover:text-white text-white/40 transition-colors"><Minus size={14}/></button>
                                            <span className="font-mono font-bold text-xl text-white min-w-[24px] text-center">{data.battles || 0}</span>
                                            <button onClick={() => updateBattleStats('battles', 1)} className="p-1 hover:text-white text-white/40 transition-colors"><Plus size={14}/></button>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                     </div>
                </div>

                {/* Main Grid - Restored */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Attributes & Skills */}
                    <div className="lg:col-span-5 space-y-4">
                        
                        {/* Fight Section */}
                        <div className="bg-red-900/80 p-4 rounded-3xl border-4 border-red-800 shadow-lg">
                            <AttributeDots 
                                label={t.strength} 
                                current={data.attributes.strength.current} 
                                max={data.attributes.strength.max}
                                onChangeCurrent={(v) => updateAttribute('strength', 'current', v)}
                            />
                            <div className="bg-black/20 rounded-xl p-3 mt-2">
                                <h4 className="text-red-200 font-bold uppercase text-xs mb-2 flex items-center gap-1"><Swords size={12}/> {t.sheet.fight}</h4>
                                <SkillRow label={t.sheet.brawl} value={data.skills.fight.brawl} onChange={(v) => updateSkill('fight', 'brawl', v)} />
                                <SkillRow label={t.sheet.channel} value={data.skills.fight.channel} onChange={(v) => updateSkill('fight', 'channel', v)} />
                                <SkillRow label={t.sheet.clash} value={data.skills.fight.clash} onChange={(v) => updateSkill('fight', 'clash', v)} />
                                <SkillRow label={t.sheet.evasion} value={data.skills.fight.evasion} onChange={(v) => updateSkill('fight', 'evasion', v)} />
                            </div>
                        </div>

                        {/* Survival Section */}
                        <div className="bg-green-900/80 p-4 rounded-3xl border-4 border-green-800 shadow-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <AttributeDots 
                                    label={t.dexterity} 
                                    current={data.attributes.dexterity.current} 
                                    max={data.attributes.dexterity.max}
                                    onChangeCurrent={(v) => updateAttribute('dexterity', 'current', v)}
                                />
                                <AttributeDots 
                                    label={t.vitality} 
                                    current={data.attributes.vitality.current} 
                                    max={data.attributes.vitality.max}
                                    onChangeCurrent={(v) => updateAttribute('vitality', 'current', v)}
                                />
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 mt-2">
                                <h4 className="text-green-200 font-bold uppercase text-xs mb-2 flex items-center gap-1"><Leaf size={12}/> {t.sheet.survival}</h4>
                                <SkillRow label={t.sheet.alert} value={data.skills.survival.alert} onChange={(v) => updateSkill('survival', 'alert', v)} />
                                <SkillRow label={t.sheet.athletic} value={data.skills.survival.athletic} onChange={(v) => updateSkill('survival', 'athletic', v)} />
                                <SkillRow label={t.sheet.nature} value={data.skills.survival.nature} onChange={(v) => updateSkill('survival', 'nature', v)} />
                                <SkillRow label={t.sheet.stealth} value={data.skills.survival.stealth} onChange={(v) => updateSkill('survival', 'stealth', v)} />
                            </div>
                        </div>

                        {/* Social Section */}
                        <div className="bg-purple-900/80 p-4 rounded-3xl border-4 border-purple-800 shadow-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <AttributeDots 
                                    label={t.special} 
                                    current={data.attributes.special.current} 
                                    max={data.attributes.special.max}
                                    onChangeCurrent={(v) => updateAttribute('special', 'current', v)}
                                />
                                <AttributeDots 
                                    label={t.insight} 
                                    current={data.attributes.insight.current} 
                                    max={data.attributes.insight.max}
                                    onChangeCurrent={(v) => updateAttribute('insight', 'current', v)}
                                />
                            </div>
                             <div className="bg-black/20 rounded-xl p-3 mt-2">
                                <h4 className="text-purple-200 font-bold uppercase text-xs mb-2 flex items-center gap-1"><MessageCircle size={12}/> {t.sheet.social}</h4>
                                <SkillRow label={t.sheet.allure} value={data.skills.social.allure} onChange={(v) => updateSkill('social', 'allure', v)} />
                                <SkillRow label={t.sheet.etiquette} value={data.skills.social.etiquette} onChange={(v) => updateSkill('social', 'etiquette', v)} />
                                <SkillRow label={t.sheet.intimidate} value={data.skills.social.intimidate} onChange={(v) => updateSkill('social', 'intimidate', v)} />
                                <SkillRow label={t.sheet.perform} value={data.skills.social.perform} onChange={(v) => updateSkill('social', 'perform', v)} />
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Vitals, Stats, Moves */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        
                        {/* Vitals */}
                        <div>
                             <VitalBox 
                                label={t.sheet.hp} 
                                current={data.hp.current} 
                                max={data.hp.max}
                                onChangeCurrent={(v) => updateVitals('hp', 'current', v)}
                                icon={<Heart className="text-red-500 fill-red-500" />}
                             />
                             <VitalBox 
                                label={t.sheet.will} 
                                current={data.will.current} 
                                max={data.will.max}
                                onChangeCurrent={(v) => updateVitals('will', 'current', v)}
                                icon={<Brain className="text-blue-500 fill-blue-500" />}
                             />
                        </div>

                         {/* Derived Stats Grid - Refactored Layout */}
                         <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Column 1 */}
                            <div className="flex flex-col gap-3">
                                <QuickRefPill 
                                    label={t.sheet.initiative} 
                                    value={initiative} 
                                    isReadOnly={true}
                                    onRoll={() => executeInitiativeRoll()}
                                />
                                <QuickRefPill 
                                    label={t.sheet.def} 
                                    value={`${defense}/${spDefense}`}
                                    isReadOnly={true}
                                />
                            </div>

                            {/* Column 2 */}
                            <div className="flex flex-col gap-3">
                                <QuickRefPill 
                                    label={t.sheet.evasion} 
                                    value={evasion} 
                                    isReadOnly={true}
                                />
                                <QuickRefPill 
                                    label={t.sheet.clash} 
                                    value={clash} 
                                    isReadOnly={true}
                                />
                            </div>
                         </div>

                        {/* Moves Section */}
                        <div className="bg-slate-800 rounded-3xl border-4 border-slate-700 p-4 flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-bold uppercase flex items-center gap-2">
                                    <Zap className="text-yellow-400" /> {t.moveset}
                                </h3>
                                <span className="text-xs font-mono text-slate-400">
                                    {data.moves.length}/{maxMoves}
                                </span>
                            </div>
                            
                            <div className="space-y-2">
                                {Array.from({ length: maxMoves }).map((_, i) => {
                                    const moveName = data.moves[i];
                                    
                                    if (moveName) {
                                        return (
                                            <button 
                                                key={i}
                                                onClick={() => {
                                                    if (isLocked) {
                                                        // If in Game Mode, open detail popup to roll
                                                        if(moveFileMap) {
                                                            const path = moveFileMap[moveName] || Object.entries(moveFileMap).find(([k]) => k.toLowerCase() === moveName.toLowerCase())?.[1];
                                                            if(path) setViewMove({ name: moveName, path });
                                                        }
                                                    } else {
                                                         toggleMove(moveName, ''); // Remove in Edit Mode (Logic simplified)
                                                    }
                                                }}
                                                className="w-full bg-white rounded-xl p-3 flex justify-between items-center shadow-md hover:scale-[1.01] active:scale-95 transition-all text-left group"
                                            >
                                                <span className="font-bold text-slate-800">{getLocalizedMoveName(moveName, language)}</span>
                                                {isLocked ? (
                                                    <Dices className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
                                                ) : (
                                                    <Minus className="text-red-500" size={20} />
                                                )}
                                            </button>
                                        );
                                    } else {
                                        return (
                                             <div key={i} className="w-full bg-slate-700/50 rounded-xl p-3 flex justify-center items-center border-2 border-dashed border-slate-600">
                                                <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Empty Slot</span>
                                            </div>
                                        );
                                    }
                                })}
                            </div>

                            {/* Edit Mode: Add Move */}
                            {!isLocked && baseData && (
                                <div className="mt-6 border-t border-white/10 pt-4">
                                     <h4 className="text-white/60 font-bold uppercase text-xs mb-3">Learnable Moves (Current Rank: {data.rank})</h4>
                                     <div className="grid grid-cols-2 gap-2">
                                         {availableMoves.currentRank.map(m => {
                                             const isLearned = data.moves.includes(m.Name);
                                             return (
                                                <button
                                                    key={m.Name}
                                                    onClick={() => toggleMove(m.Name, m.Learned)}
                                                    disabled={isLearned}
                                                    className={`p-2 rounded-lg text-xs font-bold uppercase border transition-all ${
                                                        isLearned 
                                                        ? 'bg-green-500 border-green-500 text-white opacity-50 cursor-not-allowed' 
                                                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                                                    }`}
                                                >
                                                    {getLocalizedMoveName(m.Name, language)}
                                                </button>
                                             );
                                         })}
                                     </div>
                                </div>
                            )}
                        </div>

                        {/* Extra Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Items / Status */}
                            <div className="bg-slate-100 rounded-3xl p-4 border-4 border-slate-300">
                                 {/* Nature Select */}
                                 <div className={`bg-white rounded-xl border-4 border-slate-700 overflow-hidden flex flex-col mb-3 shadow-sm ${isLocked ? 'bg-slate-100' : ''}`}>
                                    <div className="bg-slate-700 px-2 py-0.5">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{t.sheet.nature}</span>
                                    </div>
                                    {isLocked ? (
                                         <div className="w-full px-2 py-1 text-slate-800 font-bold bg-slate-100 cursor-default min-h-[32px] flex items-center">
                                            {data.nature || "-"}
                                         </div>
                                    ) : (
                                        <select
                                            value={data.nature}
                                            onChange={(e) => updateInfo('nature', e.target.value)}
                                            className="w-full px-2 py-1 text-slate-800 font-bold outline-none appearance-none bg-blue-50 focus:bg-white"
                                        >
                                            <option value="">- Select -</option>
                                            {natureOptions.map(n => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                 {/* Confidence (Derived) */}
                                 <BoxInput 
                                    label={t.sheet.confidence} 
                                    value={data.confidence} 
                                    onChange={(v) => updateInfo('confidence', v)} 
                                 />

                                 <BoxInput label={t.sheet.item} value={data.item} onChange={(v) => updateInfo('item', v)} />
                                 
                                 {/* Status Select */}
                                 <div className="bg-white rounded-xl border-4 border-slate-700 overflow-hidden flex flex-col mb-3 shadow-sm">
                                    <div className="bg-slate-700 px-2 py-0.5">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{t.sheet.status}</span>
                                    </div>
                                    <select
                                        value={data.status}
                                        disabled={isLocked}
                                        onChange={(e) => updateInfo('status', e.target.value)}
                                        className={`w-full px-2 py-1 text-slate-800 font-bold outline-none appearance-none ${isLocked ? 'bg-slate-100' : 'bg-blue-50'}`}
                                    >
                                        {STATUS_CONDITIONS.map(s => (
                                            <option key={s} value={s}>{
                                                // @ts-ignore
                                                t.sheet.statuses[s] || s
                                            }</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Contest Stats - Refactored */}
                            <div className="bg-pink-100 rounded-3xl p-4 border-4 border-pink-300 flex flex-col">
                                <h4 className="text-pink-400 font-bold uppercase text-center text-xs mb-3 tracking-widest">Contest</h4>
                                <div className="flex flex-col">
                                     <ContestRow label={t.sheet.cool} value={data.contest.cool} onChange={(v) => updateContest('cool', v)} />
                                     <ContestRow label={t.sheet.beauty} value={data.contest.beauty} onChange={(v) => updateContest('beauty', v)} />
                                     <ContestRow label={t.sheet.cute} value={data.contest.cute} onChange={(v) => updateContest('cute', v)} />
                                     <ContestRow label={t.sheet.clever} value={data.contest.clever} onChange={(v) => updateContest('clever', v)} />
                                     <ContestRow label={t.sheet.tough} value={data.contest.tough} onChange={(v) => updateContest('tough', v)} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Abilities Detail Modal */}
                {viewAbility && (
                    <AbilityDetail 
                        abilityName={viewAbility.name}
                        filePath={viewAbility.path}
                        onClose={() => setViewAbility(null)}
                        language={language}
                    />
                )}

                {/* Move Detail Modal */}
                {viewMove && (
                    <MoveDetail 
                        moveName={viewMove.name}
                        filePath={viewMove.path}
                        onClose={() => setViewMove(null)}
                        language={language}
                        onRoll={handleMoveRoll}
                    />
                )}

                {/* Stat Choice Modal */}
                {statChoice && (
                    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-6 max-w-sm w-full animate-scale-up text-center">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Choose Attribute</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {statChoice.options.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => executeMoveRoll(opt, statChoice.modifier.replace('+', '').trim(), statChoice.moveData)}
                                        className="w-full py-4 bg-slate-100 hover:bg-blue-500 hover:text-white rounded-xl font-bold text-lg transition-colors border-2 border-slate-200"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setStatChoice(null)} className="mt-4 text-slate-400 font-bold">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Dice Roller Overlay */}
                {rollData.isOpen && (
                    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in p-4" onClick={() => {
                        if (rollData.step === 'result') setRollData(prev => ({ ...prev, isOpen: false }));
                    }}>
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 w-full max-w-2xl text-center shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                            
                            {/* Close Button */}
                            <button 
                                onClick={() => setRollData(prev => ({ ...prev, isOpen: false }))}
                                className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200"
                            >
                                <X size={24} />
                            </button>

                            {/* Header */}
                            <div className="mb-8">
                                <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-2">
                                    {rollData.statName} Check
                                </h2>
                                <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full font-bold text-slate-500">
                                    <span className="text-blue-600">{rollData.statValue}</span>
                                    {rollData.selectedSkillName && (
                                        <>
                                            <span>+</span>
                                            <span className="text-purple-600">{rollData.selectedSkillName} ({rollData.selectedSkillValue})</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Setup Step */}
                            {rollData.step === 'setup' && (
                                <div className="animate-fade-in">
                                    {/* Skill Selection (Only for Attribute Mode) */}
                                    {rollData.mode === 'attribute' && (
                                        <div className="mb-8">
                                            <p className="text-slate-400 font-bold uppercase text-sm mb-4">Add a Skill?</p>
                                            <div className="flex flex-wrap justify-center gap-2 max-h-48 overflow-y-auto custom-scrollbar p-2">
                                                {/* Flatten skills for selection */}
                                                {Object.entries(data.skills).flatMap(([cat, skills]) => 
                                                    Object.entries(skills).map(([name, val]) => (
                                                        <button
                                                            key={name}
                                                            onClick={() => toggleSkillSelection(name, val as number)}
                                                            className={`px-4 py-2 rounded-lg font-bold border-2 transition-all capitalize ${
                                                                rollData.selectedSkillName === name 
                                                                ? 'bg-purple-600 border-purple-600 text-white shadow-lg scale-105' 
                                                                : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300'
                                                            }`}
                                                        >
                                                            {name} ({val as number})
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        onClick={startRoll}
                                        className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-2xl shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                                    >
                                        <Dices size={32} /> ROLL {rollData.statValue + rollData.selectedSkillValue} DICE
                                    </button>
                                </div>
                            )}

                            {/* Rolling Step */}
                            {rollData.step === 'rolling' && (
                                <div className="flex flex-wrap justify-center gap-4 py-8">
                                    {rollData.results.map((val, i) => (
                                        <div key={i} className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-white text-3xl font-black animate-pulse">
                                            {val}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Result Step */}
                            {rollData.step === 'result' && (
                                <div className="animate-scale-up">
                                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                                        {rollData.results.map((val, i) => (
                                            <div 
                                                key={i} 
                                                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black border-4 ${
                                                    val >= 4 
                                                    ? 'bg-green-500 border-green-600 text-white shadow-lg' 
                                                    : 'bg-slate-200 border-slate-300 text-slate-400'
                                                }`}
                                            >
                                                {val}
                                            </div>
                                        ))}
                                    </div>

                                    {rollData.mode === 'initiative' ? (
                                         <div className="bg-yellow-50 border-4 border-yellow-200 rounded-2xl p-6">
                                            <span className="block text-slate-400 font-bold uppercase text-xs mb-1">Total Initiative</span>
                                            <span className="text-6xl font-black text-yellow-500">{rollData.total}</span>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 border-4 border-green-200 rounded-2xl p-6">
                                            <span className="block text-slate-400 font-bold uppercase text-xs mb-1">Successes</span>
                                            <span className="text-6xl font-black text-green-600">{rollData.successes}</span>
                                        </div>
                                    )}

                                    {/* Follow Up Actions */}
                                    <div className="flex gap-4 mt-6">
                                         <button 
                                            onClick={() => setRollData(prev => ({ ...prev, isOpen: false }))}
                                            className="flex-1 py-3 rounded-xl font-bold text-