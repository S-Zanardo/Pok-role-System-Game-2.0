import React, { useEffect, useMemo } from 'react';
import { TrainerData, TRANSLATIONS, ALL_NATURES, getTypeColor, InventoryItem, getItemImageUrl } from '../utils';
import { Language, PokemonCharacter, ItemData } from '../types';
import { ArrowLeft, Heart, Shield, Swords, Brain, Leaf, MessageCircle, Coins, Minus, Plus, Dices, Image as ImageIcon, Save, Briefcase, X, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CharacterSheetProps {
  trainer: TrainerData;
  setTrainer: React.Dispatch<React.SetStateAction<TrainerData>>;
  language: Language;
  onBack: () => void;
  onSave?: () => void;
  natureMap?: Record<string, string>;
  party?: (PokemonCharacter | null)[];
  items: ItemData[];
  onManagePokemon?: () => void;
  onEditPokemon?: (pokemon: PokemonCharacter) => void;
  onUpdatePokemon?: (pokemon: PokemonCharacter) => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ trainer, setTrainer, language, onBack, onSave, natureMap, party, items, onManagePokemon, onEditPokemon, onUpdatePokemon }) => {
  const t = TRANSLATIONS[language];
  const { user } = useAuth();
  const mainColor = 'bg-slate-600'; // Colore tema per l'allenatore
  const [isInventoryOpen, setIsInventoryOpen] = React.useState(false);
  const [isItemSelectorOpen, setIsItemSelectorOpen] = React.useState(false);
  const [selectorTargetPocket, setSelectorTargetPocket] = React.useState<'small' | 'main'>('main');
  const [itemSearchTerm, setItemSearchTerm] = React.useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTrainer({ ...trainer, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateAttribute = (attr: keyof typeof trainer.attributes, field: 'current' | 'max', value: number) => {
    setTrainer({
      ...trainer,
      attributes: {
        ...trainer.attributes,
        [attr]: { ...trainer.attributes[attr], [field]: value }
      }
    });
  };

  const updateSkill = (category: keyof typeof trainer.skills, skill: string, value: number) => {
    setTrainer({
      ...trainer,
      skills: {
        ...trainer.skills,
        [category]: {
          ...trainer.skills[category],
          [skill]: value
        }
      }
    });
  };

  const updateVitals = (field: 'hp' | 'will', sub: 'current' | 'max', value: number) => {
    setTrainer({
      ...trainer,
      [field]: { ...trainer[field], [sub]: value }
    });
  };

  const updatePokedex = (field: 'caught' | 'seen', delta: number) => {
      setTrainer({
          ...trainer,
          pokedex: {
              ...trainer.pokedex,
              [field]: Math.max(0, trainer.pokedex[field] + delta)
          }
      });
  };

  // Fetch Nature Data when nature changes
  useEffect(() => {
    if (!trainer.nature || !natureMap) return;

    const path = natureMap[trainer.nature];
    if (path) {
        const encodedPath = path.split('/').map(p => encodeURIComponent(p)).join('/');
        const url = `https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/${encodedPath}`;
        
        fetch(url)
            .then(res => res.json())
            .then((json: any) => {
                // Automatically set Confidence based on Nature data
                if (json.Confidence) {
                    
                    setTrainer(prev => {
                        if (prev.confidence !== json.Confidence) return { ...prev, confidence: json.Confidence };
                        return prev;
                    });
                }
            })
            .catch(e => console.error("Failed to fetch nature", e));
    }
  }, [trainer.nature, natureMap]);

  const natureOptions = useMemo(() => {
      return natureMap ? Object.keys(natureMap).sort() : ALL_NATURES;
  }, [natureMap]);

  const getPartyIconUrl = (image: string) => {
      // Convert BookSprites url to ShuffleTokens url for round icons
      if (image && image.includes('BookSprites')) {
          return image.replace('BookSprites', 'ShuffleTokens');
      }
      return image;
  };

  const updatePotion = (type: string, field: 'count' | 'used', delta: number) => {
      setTrainer((prev: any) => {
          const potions = prev.potions || { potion: { count: 0, used: 0 }, superPotion: { count: 0, used: 0 }, hyperPotion: { count: 0, used: 0 } };
          const current = potions[type] || { count: 0, used: 0 };
          
          let newVal = (current[field] || 0) + delta;
          if (newVal < 0) newVal = 0;

          // Constraints
          const healMap: Record<string, number> = { potion: 2, superPotion: 4, hyperPotion: 14 };
          const heal = healMap[type];
          
          if (field === 'used') {
              const max = current.count * heal;
              if (newVal > max) newVal = max;
          }
          
          // If count changes, clamp used
          let newUsed = field === 'used' ? newVal : current.used;
          if (field === 'count') {
              const newMax = newVal * heal;
              if (newUsed > newMax) newUsed = newMax;
          }

          return {
              ...prev,
              potions: {
                  ...potions,
                  [type]: {
                      ...current,
                      count: field === 'count' ? newVal : current.count,
                      used: newUsed
                  }
              }
          };
      });
  };

  const handlePotionDrop = (e: React.DragEvent, pokemon: PokemonCharacter) => {
      e.preventDefault();
      e.stopPropagation();

      const potionType = e.dataTransfer.getData('potionType');
      const healAmountStr = e.dataTransfer.getData('healAmount');

      if (!potionType || !healAmountStr || !pokemon) return;

      // Check if Pokemon is fainted
      if (pokemon.hp.current === 0) {
          const msg = language === 'it' ? "Non è possibile curare un Pokémon esausto con una pozione!" : "Cannot heal a fainted Pokémon with a potion!";
          alert(msg);
          return;
      }

      if (pokemon.hp.current >= pokemon.hp.max) return; // Already full

      const healPerUnit = parseInt(healAmountStr);
      const pData = (trainer as any).potions?.[potionType] || { count: 0, used: 0 };
      const totalHp = pData.count * healPerUnit;
      const remainingPotionHp = totalHp - pData.used;

      if (remainingPotionHp <= 0) {
          const msg = language === 'it' ? "Pozione esaurita!" : "Potion pool is empty!";
          alert(msg);
          return;
      }

      const missingHp = pokemon.hp.max - pokemon.hp.current;
      const amountToHeal = Math.min(missingHp, remainingPotionHp);

      // Update Potion Usage
      updatePotion(potionType, 'used', amountToHeal);

      // Update Pokemon HP
      if (onUpdatePokemon) {
          const updatedPokemon = { ...pokemon, hp: { ...pokemon.hp, current: pokemon.hp.current + amountToHeal } };
          onUpdatePokemon(updatedPokemon);
      }
  };

  const addItem = (pocket: 'small' | 'main') => {
      setSelectorTargetPocket(pocket);
      setItemSearchTerm('');
      setIsItemSelectorOpen(true);
  };

  const handleSelectItem = (item: ItemData) => {
      if (selectorTargetPocket === 'small') {
          // Constraint: Only HeldItems and Medicine in Small Pocket
          if (item.Pocket !== 'HeldItems' && item.Pocket !== 'Medicine') {
              const msg = language === 'it' 
                  ? "Nella Small Pocket puoi inserire solo oggetti di tipo 'HeldItems' o 'Medicine'." 
                  : "You can only put 'HeldItems' or 'Medicine' in the Small Pocket.";
              alert(msg);
              return;
          }
      }

      const newItem: InventoryItem = {
          id: crypto.randomUUID(),
          name: item.Name,
          count: 1,
          pocket: selectorTargetPocket,
          description: item.Description,
          image: getItemImageUrl(item)
      };

      setTrainer(prev => ({
          ...prev,
          inventory: [...(prev.inventory || []), newItem]
      }));
      
      setIsItemSelectorOpen(false);
  };

  const updateItemCount = (id: string, delta: number) => {
      setTrainer(prev => ({
          ...prev,
          inventory: (prev.inventory || []).map(item => {
              if (item.id === id) {
                  return { ...item, count: Math.max(0, item.count + delta) };
              }
              return item;
          }).filter(item => item.count > 0)
      }));
  };

  // --- Helper Components (replicati da PokemonCharacterSheet per mantenere lo stile) ---

  const AttributeDots = ({ label, current, max, onChangeCurrent }: { label: string, current: number, max: number, onChangeCurrent: (v: number) => void }) => (
    <div className="bg-white rounded-2xl border-4 border-slate-700 p-3 mb-4 shadow-sm flex flex-col items-center justify-center relative group">
        <div className="flex items-center gap-2 mb-2">
            <span className="font-black uppercase tracking-widest text-sm text-slate-800">{label}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2 px-1">
            {Array.from({ length: max }).map((_, i) => (
                <div
                    key={i}
                    onClick={() => onChangeCurrent(i + 1)}
                    className={`w-4 h-4 rounded-full border border-slate-300 cursor-pointer hover:bg-slate-400 transition-all duration-150 ${
                        i < current ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
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
                    onClick={() => onChange(i + 1 === value ? 0 : i + 1)}
                    className={`w-3.5 h-3.5 rounded-full border border-white/20 transition-all duration-150 hover:bg-white/20 ${
                        i < value ? 'bg-white scale-110 shadow-sm' : 'bg-black/20'
                    }`}
                />
            ))}
        </div>
    </div>
  );

  const ResourceBar = ({ label, current, max, onChangeCurrent, Icon, activeColor }: { label: string, current: number, max: number, onChangeCurrent: (v: number) => void, Icon: any, activeColor: string }) => (
    <div className="bg-slate-800 rounded-2xl p-3 mb-3 border-4 border-slate-700 shadow-md flex items-center gap-4">
        <span className="text-lg font-black text-white uppercase tracking-wider shrink-0">{label}</span>
        <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: max }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => {
                         const newValue = i + 1;
                         if (i === 0 && current === 1) onChangeCurrent(0);
                         else onChangeCurrent(newValue);
                    }}
                    className="cursor-pointer hover:scale-110 transition-all duration-200"
                >
                    <Icon size={24} className={`drop-shadow-sm ${i < current ? activeColor : 'text-slate-600 fill-slate-900'}`} />
                </button>
            ))}
        </div>
    </div>
  );

  const QuickRefPill = ({ label, value, Icon }: { label: string, value: string | number, Icon?: any }) => (
    <div className="flex rounded-full border-4 border-slate-700 bg-white overflow-hidden h-9 shadow-sm">
       <div className="flex-1 flex items-center pl-3 font-black text-slate-700 uppercase text-[10px] tracking-wider whitespace-nowrap overflow-hidden">
           {label}:
       </div>
       <div className="w-20 flex items-center justify-center font-bold text-slate-800 text-lg border-l-2 border-slate-200 bg-slate-100">
           {value}
           {Icon && <Icon size={12} className="ml-1 opacity-50" />}
       </div>
    </div>
  );

  const PotionRow = ({ type, label, heal, image }: { type: string, label: string, heal: number, image: string }) => {
      const pData = (trainer as any).potions?.[type] || { count: 0, used: 0 };
      const totalHp = pData.count * heal;
      const remaining = totalHp - pData.used;
      
      // Calculate dots for the "current" unit
      let currentUnitHP = remaining > 0 ? (remaining % heal) : 0;
      if (currentUnitHP === 0 && remaining > 0) currentUnitHP = heal;
      
      return (
        <div className="bg-black/20 rounded-xl p-2 flex items-center justify-between mb-2">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase">{label}</span>
                <span className="text-[10px] text-white/60">{heal} HP / unit</span>
            </div>
            
            <div className="flex items-center gap-3">
                {/* Qty */}
                <div className="flex flex-col items-center">
                    <span className="text-[8px] text-white/50 uppercase">Qty</span>
                    <div className="flex items-center gap-1 bg-slate-700/50 rounded px-1">
                        <button onClick={() => updatePotion(type, 'count', -1)} className="text-white hover:text-red-400"><Minus size={12}/></button>
                        <span className="text-sm font-bold text-white w-4 text-center">{pData.count}</span>
                        <button onClick={() => updatePotion(type, 'count', 1)} className="text-white hover:text-green-400"><Plus size={12}/></button>
                    </div>
                </div>

                {/* Usage */}
                <div className="flex flex-col items-center min-w-[80px]">
                     <span className="text-[8px] text-white/50 uppercase">HP Pool</span>
                     <div className="flex items-center gap-2">
                        <button onClick={() => updatePotion(type, 'used', 1)} className="text-white hover:text-red-400" disabled={remaining <= 0} title="Use HP"><Minus size={12}/></button>
                        
                        <div className="flex flex-col items-center">
                            <div className={`gap-1 ${heal === 14 ? 'grid grid-cols-7' : 'flex flex-wrap justify-center max-w-[80px]'}`}>
                                {Array.from({ length: heal }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2.5 h-2.5 rounded-full border border-slate-500 transition-colors duration-200 ${
                                            i < currentUnitHP ? 'bg-green-500 border-green-400 shadow-[0_0_5px_rgba(34,197,94,0.6)]' : 'bg-slate-800/50'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-[9px] text-white/40 mt-1 font-mono">{remaining}/{totalHp}</span>
                        </div>

                        <button onClick={() => updatePotion(type, 'used', -1)} className="text-white hover:text-green-400" disabled={pData.used <= 0} title="Restore HP"><Plus size={12}/></button>
                     </div>
                </div>

                {/* Image */}
                <img 
                    src={image} 
                    alt={label} 
                    className="w-8 h-8 object-contain ml-1 cursor-grab active:cursor-grabbing" 
                    draggable
                    onDragStart={(e) => { e.dataTransfer.setData('potionType', type); e.dataTransfer.setData('healAmount', heal.toString()); }}
                />
            </div>
        </div>
      );
  };

  // Calcolo statistiche derivate
  const initiative = trainer.attributes.dexterity.current + trainer.skills.survival.alert;
  const defense = trainer.attributes.vitality.current;
  const spDefense = trainer.attributes.insight.current;
  const evasion = trainer.attributes.dexterity.current + trainer.skills.fight.evasion;
  const clash = trainer.attributes.strength.current + trainer.skills.fight.clash;

  return (
    <div className={`fixed inset-0 z-50 ${mainColor} overflow-y-auto animate-fade-in custom-scrollbar`}>
        {/* Toolbar */}
        <div className="sticky top-0 z-50 bg-slate-800/90 backdrop-blur-sm p-4 shadow-md flex justify-between items-center text-white">
            <button onClick={onBack} className="flex items-center gap-2 hover:bg-white/20 px-3 py-1 rounded-full transition-colors">
                <ArrowLeft /> {t.backToHome}
            </button>
            <h1 className="text-xl font-bold uppercase tracking-widest hidden md:block">{t.trainerSheet}</h1>
            
            <div className="flex items-center gap-2">
                {user && onSave && (
                    <button 
                        onClick={onSave}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-colors flex items-center justify-center"
                        title="Save to Cloud"
                    >
                        <Save size={20} />
                    </button>
                )}
                {(!user || !onSave) && <div className="w-8"></div>}
            </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-8">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-center bg-slate-800/20 p-6 rounded-3xl border-4 border-slate-800/30">
                 <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-slate-200 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden relative">
                        {trainer.image ? (
                            <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="text-slate-400 w-12 h-12" />
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-white text-xs font-bold">Upload</span>
                        </div>
                        <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                        />
                    </div>
                 </div>
                 <div className="flex-1 w-full text-center md:text-left">
                    <input 
                        type="text" 
                        value={trainer.name}
                        onChange={(e) => setTrainer({ ...trainer, name: e.target.value })}
                        className="text-4xl md:text-5xl font-black text-white bg-transparent border-b-4 border-white/20 focus:border-white outline-none w-full mb-2 placeholder-white/50"
                        placeholder={t.playerName}
                    />
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                         {/* Age */}
                         <div className="bg-black/20 text-white font-bold px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                            <span className="text-xs uppercase opacity-70">{t.sheet.age}</span>
                            <input 
                                type="number" 
                                value={trainer.age ?? 10}
                                onChange={(e) => setTrainer({ ...trainer, age: parseInt(e.target.value) || 0 })}
                                className="w-12 bg-transparent text-center outline-none"
                            />
                         </div>

                         {/* Nature & Confidence */}
                         <div className="flex gap-2">
                            <select
                                value={trainer.nature}
                                onChange={(e) => setTrainer({ ...trainer, nature: e.target.value })}
                                className="bg-black/20 text-white font-bold px-3 py-1 rounded-lg border border-white/10 outline-none appearance-none cursor-pointer hover:bg-black/30"
                            >
                                {natureOptions.map(n => <option key={n} value={n} className="text-slate-900">{n}</option>)}
                            </select>
                            
                            <div className="bg-black/20 text-white font-bold px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                                <span className="text-xs uppercase opacity-70">{t.sheet.confidence}</span>
                                <input 
                                    type="number" 
                                    value={trainer.confidence}
                                    onChange={(e) => setTrainer({ ...trainer, confidence: parseInt(e.target.value) || 0 })}
                                    className="w-12 bg-transparent text-center outline-none"
                                />
                            </div>
                         </div>

                         <div className="h-6 w-px bg-white/40 hidden md:block"></div>

                         {/* Counters Grid (Caught/Seen) */}
                         <div className="bg-black/20 rounded-lg p-2 border border-white/10">
                            <div className="flex items-center gap-4 px-2 py-1">
                                {/* Caught Column */}
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">{t.caught}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updatePokedex('caught', -1)} className="p-1 hover:text-yellow-400 text-white/40 transition-colors"><Minus size={14}/></button>
                                        <span className="font-mono font-bold text-xl text-white min-w-[24px] text-center">{trainer.pokedex.caught}</span>
                                        <button onClick={() => updatePokedex('caught', 1)} className="p-1 hover:text-yellow-400 text-white/40 transition-colors"><Plus size={14}/></button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-px h-8 bg-white/20"></div>

                                {/* Seen Column */}
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{t.seen}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updatePokedex('seen', -1)} className="p-1 hover:text-white text-white/40 transition-colors"><Minus size={14}/></button>
                                        <span className="font-mono font-bold text-xl text-white min-w-[24px] text-center">{trainer.pokedex.seen}</span>
                                        <button onClick={() => updatePokedex('seen', 1)} className="p-1 hover:text-white text-white/40 transition-colors"><Plus size={14}/></button>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                 </div>
            </div>

            {/* Belt (Party) Section */}
            {party && (
                <div 
                    onClick={onManagePokemon}
                    className={`bg-slate-800/20 p-4 rounded-3xl border-4 border-slate-800/30 mb-8 ${onManagePokemon ? 'cursor-pointer hover:bg-slate-800/30 transition-colors group' : ''}`}
                >
                    <div className="flex justify-between items-center mb-3 ml-2">
                        <h3 className="text-white font-bold uppercase tracking-widest flex items-center gap-2 text-sm opacity-80">
                            {t.party}
                        </h3>
                        {onManagePokemon && <span className="text-white/60 text-xs uppercase font-bold group-hover:text-white transition-colors">Manage &rarr;</span>}
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {party.map((pokemon, index) => (
                            <div 
                                key={index} 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => pokemon && handlePotionDrop(e, pokemon)}
                                onClick={(e) => {
                                    if (pokemon && onEditPokemon) {
                                        e.stopPropagation();
                                        onEditPokemon(pokemon);
                                    }
                                }}
                                className={`aspect-square rounded-2xl border-2 border-slate-700/50 flex items-center justify-center relative overflow-hidden group hover:border-slate-500 transition-colors ${pokemon ? getTypeColor(pokemon.type1) + (onEditPokemon ? ' cursor-pointer hover:scale-105' : '') : 'bg-slate-800/40'}`}
                            >
                                {pokemon ? (
                                    <>
                                        <img 
                                            src={getPartyIconUrl(pokemon.image)} 
                                            alt={pokemon.nickname}
                                            className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-110 drop-shadow-md" 
                                        />
                                        
                                        {/* Stats with Icons */}
                                        <div className="absolute bottom-1 inset-x-1 flex justify-center gap-1 pointer-events-none">
                                             <div className="flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5 backdrop-blur-sm shadow-sm">
                                                 <Heart size={10} className="text-red-500 fill-red-500" />
                                                 <span className="text-[10px] font-bold text-white leading-none">{pokemon.hp.current}/{pokemon.hp.max}</span>
                                             </div>
                                             <div className="flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5 backdrop-blur-sm shadow-sm">
                                                 <Brain size={10} className="text-blue-500 fill-blue-500" />
                                                 <span className="text-[10px] font-bold text-white leading-none">{pokemon.will.current}/{pokemon.will.max}</span>
                                             </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-700/30" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Attributes & Skills */}
                <div className="lg:col-span-5 space-y-4">
                    
                    {/* Fight Section */}
                    <div className="bg-red-900/80 p-4 rounded-3xl border-4 border-red-800 shadow-lg">
                        <AttributeDots 
                            label={t.strength} 
                            current={trainer.attributes.strength.current} 
                            max={trainer.attributes.strength.max}
                            onChangeCurrent={(v) => updateAttribute('strength', 'current', v)}
                        />
                        <div className="bg-black/20 rounded-xl p-3 mt-2">
                            <h4 className="text-red-200 font-bold uppercase text-xs mb-2 flex items-center gap-1"><Swords size={12}/> {t.sheet.fight}</h4>
                            <SkillRow label={t.sheet.brawl} value={trainer.skills.fight.brawl} onChange={(v) => updateSkill('fight', 'brawl', v)} />
                            <SkillRow label={t.sheet.channel} value={trainer.skills.fight.channel} onChange={(v) => updateSkill('fight', 'channel', v)} />
                            <SkillRow label={t.sheet.clash} value={trainer.skills.fight.clash} onChange={(v) => updateSkill('fight', 'clash', v)} />
                            <SkillRow label={t.sheet.evasion} value={trainer.skills.fight.evasion} onChange={(v) => updateSkill('fight', 'evasion', v)} />
                        </div>
                    </div>

                    {/* Survival Section */}
                    <div className="bg-green-900/80 p-4 rounded-3xl border-4 border-green-800 shadow-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <AttributeDots 
                                label={t.dexterity} 
                                current={trainer.attributes.dexterity.current} 
                                max={trainer.attributes.dexterity.max}
                                onChangeCurrent={(v) => updateAttribute('dexterity', 'current', v)}
                            />
                            <AttributeDots 
                                label={t.vitality} 
                                current={trainer.attributes.vitality.current} 
                                max={trainer.attributes.vitality.max}
                                onChangeCurrent={(v) => updateAttribute('vitality', 'current', v)}
                            />
                        </div>
                        <div className="bg-black/20 rounded-xl p-3 mt-2">
                            <h4 className="text-green-200 font-bold uppercase text-xs mb-2 flex items-center gap-1"><Leaf size={12}/> {t.sheet.survival}</h4>
                            <SkillRow label={t.sheet.alert} value={trainer.skills.survival.alert} onChange={(v) => updateSkill('survival', 'alert', v)} />
                            <SkillRow label={t.sheet.athletic} value={trainer.skills.survival.athletic} onChange={(v) => updateSkill('survival', 'athletic', v)} />
                            <SkillRow label={t.sheet.nature} value={trainer.skills.survival.nature} onChange={(v) => updateSkill('survival', 'nature', v)} />
                            <SkillRow label={t.sheet.stealth} value={trainer.skills.survival.stealth} onChange={(v) => updateSkill('survival', 'stealth', v)} />
                        </div>
                    </div>

                    {/* Social Section */}
                    <div className="bg-purple-900/80 p-4 rounded-3xl border-4 border-purple-800 shadow-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <AttributeDots 
                                label={t.special} 
                                current={trainer.attributes.special.current} 
                                max={trainer.attributes.special.max}
                                onChangeCurrent={(v) => updateAttribute('special', 'current', v)}
                            />
                            <AttributeDots 
                                label={t.insight} 
                                current={trainer.attributes.insight.current} 
                                max={trainer.attributes.insight.max}
                                onChangeCurrent={(v) => updateAttribute('insight', 'current', v)}
                            />
                        </div>
                         <div className="bg-black/20 rounded-xl p-3 mt-2">
                            <h4 className="text-purple-200 font-bold uppercase text-xs mb-2 flex items-center gap-1"><MessageCircle size={12}/> {t.sheet.social}</h4>
                            <SkillRow label={t.sheet.allure} value={trainer.skills.social.allure} onChange={(v) => updateSkill('social', 'allure', v)} />
                            <SkillRow label={t.sheet.etiquette} value={trainer.skills.social.etiquette} onChange={(v) => updateSkill('social', 'etiquette', v)} />
                            <SkillRow label={t.sheet.intimidate} value={trainer.skills.social.intimidate} onChange={(v) => updateSkill('social', 'intimidate', v)} />
                            <SkillRow label={t.sheet.perform} value={trainer.skills.social.perform} onChange={(v) => updateSkill('social', 'perform', v)} />
                        </div>
                    </div>

                </div>

                {/* Right Column: Vitals, Stats, Money */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    
                    {/* Vitals */}
                    <div>
                         <ResourceBar 
                            label={t.sheet.hp} 
                            current={trainer.hp.current} 
                            max={trainer.hp.max}
                            onChangeCurrent={(v) => updateVitals('hp', 'current', v)}
                            Icon={Heart}
                            activeColor="text-red-500 fill-red-500"
                         />
                         <ResourceBar 
                            label={t.sheet.will} 
                            current={trainer.will.current} 
                            max={trainer.will.max}
                            onChangeCurrent={(v) => updateVitals('will', 'current', v)}
                            Icon={Brain}
                            activeColor="text-blue-500 fill-blue-500"
                         />
                    </div>

                     {/* Derived Stats Grid */}
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col gap-3">
                            <QuickRefPill 
                                label={t.sheet.initiative} 
                                value={initiative} 
                                Icon={Dices}
                            />
                            <QuickRefPill 
                                label={t.sheet.def} 
                                value={`${defense}/${spDefense}`}
                                Icon={Shield}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <QuickRefPill 
                                label={t.sheet.evasion} 
                                value={evasion} 
                                Icon={Dices}
                            />
                            <QuickRefPill 
                                label={t.sheet.clash} 
                                value={clash} 
                                Icon={Dices}
                            />
                        </div>
                     </div>

                    {/* Items Section (Click to open Inventory) */}
                    <div 
                        onClick={() => setIsInventoryOpen(true)}
                        className="bg-blue-900/80 p-4 rounded-3xl border-4 border-blue-800 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform group"
                    >
                        <h3 className="text-blue-100 font-bold uppercase text-lg mb-3 flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-blue-300 group-hover:text-white transition-colors" /> {t.sheet.item}s
                        </h3>
                        <div className="flex flex-col">
                            <PotionRow 
                                type="potion" 
                                label="Potion" 
                                heal={2} 
                                image="https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/potion.png" 
                            />
                            <PotionRow 
                                type="superPotion" 
                                label="Super Potion" 
                                heal={4} 
                                image="https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/super-potion.png" 
                            />
                            <PotionRow 
                                type="hyperPotion" 
                                label="Hyper Potion" 
                                heal={14} 
                                image="https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/hyper-potion.png" 
                            />
                        </div>
                    </div>

                    {/* Money Section */}
                    <div className="bg-yellow-600/90 p-4 rounded-3xl border-4 border-yellow-700 shadow-lg">
                        <h3 className="text-yellow-100 font-bold uppercase text-lg mb-2 flex items-center gap-2">
                            <Coins className="w-6 h-6 text-yellow-300" /> {t.money}
                        </h3>
                        <div className="bg-black/20 rounded-2xl p-4 flex items-center justify-between">
                            <span className="text-3xl font-black text-white tracking-widest">₽</span>
                            <input 
                                type="number" 
                                value={trainer.money}
                                onChange={(e) => setTrainer({ ...trainer, money: parseInt(e.target.value) || 0 })}
                                className="bg-transparent text-right text-4xl font-black text-white outline-none w-full"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>

        {/* Inventory Modal */}
        {isInventoryOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsInventoryOpen(false)}>
                <div className="bg-slate-900 border-4 border-blue-500 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="bg-blue-600 p-4 flex justify-between items-center shrink-0">
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <Briefcase size={32} /> {t.sheet.item}s
                        </h2>
                        <button onClick={() => setIsInventoryOpen(false)} className="text-white hover:text-blue-200 transition-colors">
                            <X size={32} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        {/* Small Pocket */}
                        <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-blue-700/50 bg-blue-900/20 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-4 sticky top-0 bg-blue-900/90 p-2 rounded-xl backdrop-blur-md z-10">
                                <h3 className="text-xl font-bold text-blue-300 uppercase">Small Pocket <span className="text-xs opacity-60 block md:inline">(Battle)</span></h3>
                                <button onClick={() => addItem('small')} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg"><Plus size={20}/></button>
                            </div>
                            <div className="space-y-2">
                                {trainer.inventory?.filter(i => i.pocket === 'small').map(item => (
                                    <div key={item.id} className="bg-slate-800 p-3 rounded-xl flex justify-between items-center border border-slate-700 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 object-contain" />}
                                            <span className="font-bold text-white">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-black/30 rounded-lg px-2 py-1">
                                            <button onClick={() => updateItemCount(item.id, -1)} className="text-slate-400 hover:text-red-400"><Minus size={16}/></button>
                                            <span className="font-mono text-white w-6 text-center font-bold">{item.count}</span>
                                            <button onClick={() => updateItemCount(item.id, 1)} className="text-slate-400 hover:text-green-400"><Plus size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                                {(!trainer.inventory?.some(i => i.pocket === 'small')) && <p className="text-slate-500 text-center italic py-8 opacity-50">Empty Pocket</p>}
                            </div>
                        </div>

                        {/* Main Pocket */}
                        <div className="flex-1 p-4 bg-slate-900/50 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-800/90 p-2 rounded-xl backdrop-blur-md z-10">
                                <h3 className="text-xl font-bold text-slate-300 uppercase">Main Pocket <span className="text-xs opacity-60 block md:inline">(Other)</span></h3>
                                <button onClick={() => addItem('main')} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-white shadow-lg"><Plus size={20}/></button>
                            </div>
                            <div className="space-y-2">
                                {trainer.inventory?.filter(i => i.pocket === 'main').map(item => (
                                    <div key={item.id} className="bg-slate-800 p-3 rounded-xl flex justify-between items-center border border-slate-700 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 object-contain" />}
                                            <span className="font-bold text-white">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-black/30 rounded-lg px-2 py-1">
                                            <button onClick={() => updateItemCount(item.id, -1)} className="text-slate-400 hover:text-red-400"><Minus size={16}/></button>
                                            <span className="font-mono text-white w-6 text-center font-bold">{item.count}</span>
                                            <button onClick={() => updateItemCount(item.id, 1)} className="text-slate-400 hover:text-green-400"><Plus size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                                {(!trainer.inventory?.some(i => i.pocket === 'main')) && <p className="text-slate-500 text-center italic py-8 opacity-50">Empty Pocket</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Item Selector Modal */}
        {isItemSelectorOpen && (
            <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsItemSelectorOpen(false)}>
                <div className="bg-slate-900 border-4 border-slate-700 rounded-3xl w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="bg-slate-800 p-4 flex justify-between items-center shrink-0 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <Search size={24} /> Select Item ({selectorTargetPocket === 'small' ? 'Small Pocket' : 'Main Pocket'})
                        </h2>
                        <button onClick={() => setIsItemSelectorOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="p-4 bg-slate-800/50">
                        <input 
                            type="text" 
                            autoFocus
                            placeholder={language === 'it' ? "Cerca oggetto..." : "Search item..."}
                            value={itemSearchTerm}
                            onChange={(e) => setItemSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                        {items.filter(i => {
                            const matchesSearch = i.Name.toLowerCase().includes(itemSearchTerm.toLowerCase());
                            const isSmallPocketItem = i.Pocket === 'HeldItems' || i.Pocket === 'Medicine';
                            const matchesPocket = selectorTargetPocket === 'small' ? isSmallPocketItem : !isSmallPocketItem;
                            return matchesSearch && matchesPocket;
                        }).map(item => (
                            <button 
                                key={item._id} 
                                onClick={() => handleSelectItem(item)}
                                className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-xl flex items-center gap-4 transition-colors border border-slate-700 hover:border-slate-500 text-left group"
                            >
                                <img src={getItemImageUrl(item)} alt={item.Name} className="w-10 h-10 object-contain" />
                                <div className="flex-1">
                                    <div className="font-bold text-white group-hover:text-blue-300 transition-colors">{item.Name}</div>
                                    <div className="text-xs text-slate-400">{item.Pocket}</div>
                                </div>
                                <Plus size={20} className="text-slate-500 group-hover:text-green-400" />
                            </button>
                        ))}
                        {items.length === 0 && <div className="text-center text-slate-500 py-8">No items loaded.</div>}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default CharacterSheet;
