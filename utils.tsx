import React from 'react';
import { PokemonData, Language, ItemData, PokemonCharacter } from './types';

// --- Constants ---
export const ALL_TYPES = [
  'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 
  'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 
  'Psychic', 'Rock', 'Steel', 'Water'
];

export const ALL_RANKS = [
  'Starter', 'Beginner', 'Amateur', 'Ace', 'Pro', 'Master', 'Champion'
];

export const ALL_NATURES = [
    "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
    "Bold", "Docile", "Relaxed", "Impish", "Lax",
    "Timid", "Hasty", "Serious", "Jolly", "Naive",
    "Modest", "Mild", "Quiet", "Bashful", "Rash",
    "Calm", "Gentle", "Sassy", "Careful", "Quirky"
];

export const STATUS_CONDITIONS = [
    'Neutral', 'Burn', 'Freeze', 'Paralysis', 'Poison', 'Bad Poison', 'Sleep', 'Confused', 'Infatuated', 'Fainted'
];

// --- Terminologies Dictionaries ---

export const TYPE_TRANSLATIONS: Record<string, Record<Language, string>> = {
    Bug: { en: 'Bug', it: 'Coleottero', es: 'Bicho', de: 'Käfer', fr: 'Insecte' },
    Dark: { en: 'Dark', it: 'Buio', es: 'Siniestro', de: 'Unlicht', fr: 'Ténèbres' },
    Dragon: { en: 'Dragon', it: 'Drago', es: 'Dragón', de: 'Drache', fr: 'Dragon' },
    Electric: { en: 'Electric', it: 'Elettro', es: 'Eléctrico', de: 'Elektro', fr: 'Électrik' },
    Fairy: { en: 'Fairy', it: 'Folletto', es: 'Hada', de: 'Fee', fr: 'Fée' },
    Fighting: { en: 'Fighting', it: 'Lotta', es: 'Lucha', de: 'Kampf', fr: 'Combat' },
    Fire: { en: 'Fire', it: 'Fuoco', es: 'Fuego', de: 'Feuer', fr: 'Feu' },
    Flying: { en: 'Flying', it: 'Volante', es: 'Volador', de: 'Flug', fr: 'Vol' },
    Ghost: { en: 'Ghost', it: 'Spettro', es: 'Fantasma', de: 'Geist', fr: 'Spectre' },
    Grass: { en: 'Grass', it: 'Erba', es: 'Planta', de: 'Pflanze', fr: 'Plante' },
    Ground: { en: 'Ground', it: 'Terra', es: 'Tierra', de: 'Boden', fr: 'Sol' },
    Ice: { en: 'Ice', it: 'Ghiaccio', es: 'Hielo', de: 'Eis', fr: 'Glace' },
    Normal: { en: 'Normal', it: 'Normale', es: 'Normal', de: 'Normal', fr: 'Normal' },
    Poison: { en: 'Poison', it: 'Veleno', es: 'Veneno', de: 'Gift', fr: 'Poison' },
    Psychic: { en: 'Psychic', it: 'Psico', es: 'Psíquico', de: 'Psycho', fr: 'Psy' },
    Rock: { en: 'Rock', it: 'Roccia', es: 'Roca', de: 'Gestein', fr: 'Roche' },
    Steel: { en: 'Steel', it: 'Acciaio', es: 'Acero', de: 'Stahl', fr: 'Acier' },
    Water: { en: 'Water', it: 'Acqua', es: 'Agua', de: 'Wasser', fr: 'Eau' }
};

export const MOVE_LEARN_TRANSLATIONS: Record<string, Record<Language, string>> = {
    Starter: { en: 'Starter', it: 'Base', es: 'Inicial', de: 'Starter', fr: 'Départ' },
    Beginner: { en: 'Beginner', it: 'Principiante', es: 'Principiante', de: 'Anfänger', fr: 'Débutant' },
    Amateur: { en: 'Amateur', it: 'Dilettante', es: 'Aficionado', de: 'Amateur', fr: 'Amateur' },
    Ace: { en: 'Ace', it: 'Asso', es: 'As', de: 'Ass', fr: 'As' },
    Pro: { en: 'Pro', it: 'Pro', es: 'Pro', de: 'Profi', fr: 'Pro' },
    Master: { en: 'Master', it: 'Maestro', es: 'Maestro', de: 'Meister', fr: 'Maître' },
    Champion: { en: 'Champion', it: 'Campione', es: 'Campeón', de: 'Champ', fr: 'Champion' },
};

export const ABILITY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  "Overgrow": { en: "Overgrow", it: "Erbaiuto", es: "Espesura", de: "Notdünger", fr: "Engrais" },
  "Blaze": { en: "Blaze", it: "Aiutofuoco", es: "Mar Llamas", de: "Großbrand", fr: "Brasier" },
  "Torrent": { en: "Torrent", it: "Acquaiuto", es: "Torrente", de: "Sturzbach", fr: "Torrent" },
  "Shield Dust": { en: "Shield Dust", it: "Polvoscudo", es: "Polvo Escudo", de: "Puderabwehr", fr: "Écran Poudre" },
  "Shed Skin": { en: "Shed Skin", it: "Muta", es: "Mudar", de: "Häutung", fr: "Mue" },
  "Compound Eyes": { en: "Compound Eyes", it: "Insettocchi", es: "Ojo Compuesto", de: "Facettenauge", fr: "Oeil Composé" },
  "Swarm": { en: "Swarm", it: "Aiutinsetto", es: "Enjambre", de: "Hexaplaga", fr: "Essaim" },
  "Keen Eye": { en: "Keen Eye", it: "Sguardofermo", es: "Vista Lince", de: "Adlerauge", fr: "Regard Vif" },
  "Run Away": { en: "Run Away", it: "Fugafacile", es: "Fuga", de: "Angsthase", fr: "Fuite" },
  "Intimidate": { en: "Intimidate", it: "Prepotenza", es: "Intimidación", de: "Bedroher", fr: "Intimidation" },
  "Static": { en: "Static", it: "Statico", es: "Elec. Estática", de: "Statik", fr: "Statik" },
  "Sand Veil": { en: "Sand Veil", it: "Sabbiavelo", es: "Velo Arena", de: "Sandschleier", fr: "Voile Sable" },
  "Poison Point": { en: "Poison Point", it: "Velenopunto", es: "Punto Tóxico", de: "Giftdorn", fr: "Point Poison" },
  "Cute Charm": { en: "Cute Charm", it: "Incantevole", es: "Gran Encanto", de: "Charmebolzen", fr: "Joli Sourire" },
  "Flash Fire": { en: "Flash Fire", it: "Fuocardore", es: "Absorbe Fuego", de: "Feuerfänger", fr: "Torche" },
  "Pressure": { en: "Pressure", it: "Pressione", es: "Presión", de: "Erzwinger", fr: "Pression" },
  "Levitate": { en: "Levitate", it: "Levitazione", es: "Levitación", de: "Schwebe", fr: "Lévitation" },
  "Synchronize": { en: "Synchronize", it: "Sincronismo", es: "Sincronía", de: "Synchro", fr: "Synchro" },
  "Guts": { en: "Guts", it: "Dentistretti", es: "Agallas", de: "Adrenalin", fr: "Cran" },
  "Huge Power": { en: "Huge Power", it: "Macroforza", es: "Potencia", de: "Kraftkoloss", fr: "Coloforce" },
  "Chlorophyll": { en: "Chlorophyll", it: "Clorofilla", es: "Clorofila", de: "Chlorophyll", fr: "Chlorophylle" },
  "Swift Swim": { en: "Swift Swim", it: "Nuotovelox", es: "Nado Rápido", de: "Wassertempo", fr: "Glissade" },
  "Solar Power": { en: "Solar Power", it: "Solarpotere", es: "Poder Solar", de: "Solarkraft", fr: "Force Soleil" },
  "Inner Focus": { en: "Inner Focus", it: "Fuocodentro", es: "Foco Interno", de: "Konzentrator", fr: "Attention" },
  "Stench": { en: "Stench", it: "Tanfo", es: "Hedor", de: "Duftnote", fr: "Puanteur" },
  "Effect Spore": { en: "Effect Spore", it: "Spargispora", es: "Efec. Espora", de: "Sporenwirt", fr: "Pose Spore" },
  "Damp": { en: "Damp", it: "Umidità", es: "Humedad", de: "Feuchtigkeit", fr: "Moiteur" },
  "Limber": { en: "Limber", it: "Scioltezza", es: "Flexibilidad", de: "Flexibilität", fr: "Échauffement" },
  "Rock Head": { en: "Rock Head", it: "Testadura", es: "Cabeza Roca", de: "Steinhaupt", fr: "Tête de Roc" },
  "Insomnia": { en: "Insomnia", it: "Insonnia", es: "Insomnio", de: "Insomnia", fr: "Insomnia" },
  "Oblivious": { en: "Oblivious", it: "Indifferenza", es: "Despiste", de: "Dösigkeit", fr: "Benêt" },
  "Magnet Pull": { en: "Magnet Pull", it: "Magnetismo", es: "Imán", de: "Magnetfalle", fr: "Magnépiège" },
  "Early Bird": { en: "Early Bird", it: "Sveglialampo", es: "Madrugar", de: "Frühwecker", fr: "Matinal" },
  "Hydration": { en: "Hydration", it: "Idratazione", es: "Hidratación", de: "Hydration", fr: "Hydratation" },
  "Gluttony": { en: "Gluttony", it: "Voracità", es: "Gula", de: "Völlerei", fr: "Gloutonnerie" },
  "Ice Body": { en: "Ice Body", it: "Corpogelo", es: "Gélido", de: "Eishaut", fr: "Corps Gel" },
};

export const MOVE_NAME_TRANSLATIONS: Record<string, Record<Language, string>> = {
  "Tackle": { en: "Tackle", it: "Azione", es: "Placaje", de: "Tackle", fr: "Charge" },
  "Scratch": { en: "Scratch", it: "Graffio", es: "Arañazo", de: "Kratzer", fr: "Griffe" },
  "Growl": { en: "Growl", it: "Ruggito", es: "Gruñido", de: "Heuler", fr: "Rugissement" },
  "Tail Whip": { en: "Tail Whip", it: "Colpocoda", es: "Látigo", de: "Rutenschlag", fr: "Mimi-Queue" },
  "Ember": { en: "Ember", it: "Braciere", es: "Ascuas", de: "Glut", fr: "Flammèche" },
  "Water Gun": { en: "Water Gun", it: "Pistolacqua", es: "Pistola Agua", de: "Aquaknarre", fr: "Pistolet à O" },
  "Vine Whip": { en: "Vine Whip", it: "Frustata", es: "Látigo Cepa", de: "Rankenhieb", fr: "Fouet Lianes" },
  "Leech Seed": { en: "Leech Seed", it: "Parassiseme", es: "Drenadoras", de: "Egelsamen", fr: "Vampigraine" },
  "Thunder Shock": { en: "Thunder Shock", it: "Tuonoshock", es: "Impactrueno", de: "Donnerschock", fr: "Éclair" },
  "Quick Attack": { en: "Quick Attack", it: "Attacco Rapido", es: "Ataque Rápido", de: "Ruckzuckhieb", fr: "Vive-Attaque" },
  "Bite": { en: "Bite", it: "Morso", es: "Mordisco", de: "Biss", fr: "Morsure" },
  "Wing Attack": { en: "Wing Attack", it: "Attacco d'Ala", es: "Ataque Ala", de: "Flügelschlag", fr: "Cru-Ailes" },
  "Gust": { en: "Gust", it: "Raffica", es: "Tornado", de: "Windstoß", fr: "Tornade" },
  "Peck": { en: "Peck", it: "Beccata", es: "Picotazo", de: "Schnabel", fr: "Picpic" },
  "Sand Attack": { en: "Sand Attack", it: "Turbosabbia", es: "Ataque Arena", de: "Sandwirbel", fr: "Jet de Sable" },
  "Double Kick": { en: "Double Kick", it: "Doppiocalcio", es: "Doble Patada", de: "Doppelkick", fr: "Double Pied" },
  "Razor Leaf": { en: "Razor Leaf", it: "Foglielama", es: "Hoja Afilada", de: "Rasierblatt", fr: "Tranch'Herbe" },
  "Flamethrower": { en: "Flamethrower", it: "Lanciafiamme", es: "Lanzallamas", de: "Flammenwurf", fr: "Lance-Flammes" },
  "Hydro Pump": { en: "Hydro Pump", it: "Idropompa", es: "Hidrobomba", de: "Hydropumpe", fr: "Hydrocanon" },
  "Solar Beam": { en: "Solar Beam", it: "Solarraggio", es: "Rayo Solar", de: "Solarstrahl", fr: "Lance-Soleil" },
  "Psychic": { en: "Psychic", it: "Psichico", es: "Psíquico", de: "Psychokinese", fr: "Psyko" },
  "Earthquake": { en: "Earthquake", it: "Terremoto", es: "Terremoto", de: "Erdbeben", fr: "Séisme" },
  "Thunderbolt": { en: "Thunderbolt", it: "Fulmine", es: "Rayo", de: "Donnerblitz", fr: "Tonnerre" },
  "Ice Beam": { en: "Ice Beam", it: "Geloraggio", es: "Rayo Hielo", de: "Eisstrahl", fr: "Laser Glace" },
  "Hyper Beam": { en: "Hyper Beam", it: "Iperraggio", es: "Hiperrayo", de: "Hyperstrahl", fr: "Ultralaser" },
  "Leer": { en: "Leer", it: "Fulmisguardo", es: "Malicioso", de: "Silberblick", fr: "Gros Yeux" },
  "Pound": { en: "Pound", it: "Botta", es: "Destructor", de: "Pfund", fr: "Écras'Face" },
  "Supersonic": { en: "Supersonic", it: "Supersuono", es: "Supersónico", de: "Superschall", fr: "Ultrason" },
  "Disable": { en: "Disable", it: "Inibitore", es: "Anulación", de: "Aussetzer", fr: "Entrave" },
  "Confusion": { en: "Confusion", it: "Confusione", es: "Confusión", de: "Konfusion", fr: "Choc Mental" },
  "Hypnosis": { en: "Hypnosis", it: "Ipnosi", es: "Hipnosis", de: "Hypnose", fr: "Hypnose" },
  "String Shot": { en: "String Shot", it: "Millebave", es: "Disparo Demora", de: "Fadenschuss", fr: "Sécrétion" },
  "Poison Sting": { en: "Poison Sting", it: "Velenospina", es: "Picotazo Ven", de: "Giftstachel", fr: "Dard-Venin" },
  "Harden": { en: "Harden", it: "Rafforzatore", es: "Fortaleza", de: "Härtner", fr: "Armure" },
  "Focus Energy": { en: "Focus Energy", it: "Focalenergia", es: "Foco Energía", de: "Energiefokus", fr: "Puissance" },
  "Spark": { en: "Spark", it: "Scintilla", es: "Chispa", de: "Funkenflug", fr: "Étincelle" },
  "Crunch": { en: "Crunch", it: "Sgranocchio", es: "Triturar", de: "Knirscher", fr: "Mâchouille" },
  "Bubble": { en: "Bubble", it: "Bolla", es: "Burbuja", de: "Blubber", fr: "Écume" },
  "Withdraw": { en: "Withdraw", it: "Ritirata", es: "Refugio", de: "Panzerschutz", fr: "Repli" },
  "Sleep Powder": { en: "Sleep Powder", it: "Sonnifero", es: "Somnífero", de: "Schlafpuder", fr: "Poudre Dodo" },
  "Stun Spore": { en: "Stun Spore", it: "Paralizzante", es: "Paralizador", de: "Stachelspore", fr: "Para-Spore" },
  "Poison Powder": { en: "Poison Powder", it: "Velenpolvere", es: "Polvo Veneno", de: "Giftpuder", fr: "Poudre Toxik" },
  "Will-O-Wisp": { en: "Will-O-Wisp", it: "Fuocofatuo", es: "Fuego Fatuo", de: "Irrlicht", fr: "Feu Follet" },
  "Protect": { en: "Protect", it: "Protezione", es: "Protección", de: "Schutzschild", fr: "Abri" },
  "Surf": { en: "Surf", it: "Surf", es: "Surf", de: "Surfer", fr: "Surf" },
  "Fly": { en: "Fly", it: "Volo", es: "Vuelo", de: "Fliegen", fr: "Vol" },
  "Cut": { en: "Cut", it: "Taglio", es: "Corte", de: "Zerschneider", fr: "Coupe" },
};

// --- Helper Functions ---

export const getLocalizedType = (type: string, lang: Language): string => {
    if (!type) return '';
    // Normalize casing
    const normalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    return TYPE_TRANSLATIONS[normalized]?.[lang] || type;
};

export const getLocalizedLearnMethod = (method: string, lang: Language): string => {
    if (!method) return 'Standard';
    return MOVE_LEARN_TRANSLATIONS[method]?.[lang] || method;
};

export const getLocalizedAbility = (ability: string, lang: Language): string => {
    if (!ability) return '';
    return ABILITY_TRANSLATIONS[ability]?.[lang] || ability;
};

export const getLocalizedMoveName = (move: string, lang: Language): string => {
    if (!move) return '';
    return MOVE_NAME_TRANSLATIONS[move]?.[lang] || move;
};

export const getTypeColor = (type: string): string => {
    if (!type) return 'bg-slate-500';
    
    switch (type.toLowerCase()) {
        case 'bug': return 'bg-lime-600';
        case 'dark': return 'bg-slate-800';
        case 'dragon': return 'bg-violet-600';
        case 'electric': return 'bg-yellow-500';
        case 'fairy': return 'bg-pink-400';
        case 'fighting': return 'bg-orange-700';
        case 'fire': return 'bg-red-500';
        case 'flying': return 'bg-sky-400';
        case 'ghost': return 'bg-purple-700';
        case 'grass': return 'bg-green-500';
        case 'ground': return 'bg-amber-600';
        case 'ice': return 'bg-cyan-400';
        case 'normal': return 'bg-slate-400';
        case 'poison': return 'bg-fuchsia-600';
        case 'psychic': return 'bg-pink-600';
        case 'rock': return 'bg-stone-500';
        case 'steel': return 'bg-slate-500';
        case 'water': return 'bg-blue-500';
        default: return 'bg-slate-500';
    }
};

// --- Translations ---
export const TRANSLATIONS = {
  en: {
    title: "Pokérole Dex",
    appTitle: "Pokérole Tools",
    subtitle: "Select a region to view the database.",
    appSubtitle: "Choose a tool to begin your adventure.",
    searchPlaceholder: "Search...",
    filters: "Filters",
    close: "Close",
    clear: "Clear",
    cancel: "Cancel",
    apply: "Apply",
    nameSearch: "Name Search",
    type: "Type",
    allTypes: "All Types",
    minStats: "Min Stats",
    noResults: "No results found.",
    entriesFound: "Entries found",
    about: "About",
    height: "Height",
    weight: "Weight",
    rank: "Rank",
    role: "Role",
    baseStats: "Base Stats",
    hp: "Base HP",
    abilities: "Abilities",
    primary: "Primary",
    secondary: "Secondary",
    hidden: "Hidden",
    moveset: "Moveset",
    consulting: "Consulting Archives...",
    power: "Power",
    target: "Target",
    dicePools: "Dice Pools",
    accuracy: "Accuracy",
    damage: "Damage",
    effect: "Effect",
    starter: "Starter",
    wild: "Wild",
    strength: "Strength",
    dexterity: "Dexterity",
    vitality: "Vitality",
    special: "Special",
    insight: "Insight",
    rankFilter: "Rank",
    onlyStarter: "Only Starter",
    home: "Home",
    characterSheet: "Character Sheet",
    pokemonSheet: "Pokémon Sheet",
    pokedex: "Pokédex",
    comingSoon: "Coming Soon",
    comingSoonDesc: "This feature is currently under development. Please check back later!",
    backToHome: "Back to Home",
    party: "Belt",
    pc: "Bill's PC",
    box: "Box",
    emptySlot: "Empty",
    addToParty: "Add to Belt",
    removeFromParty: "Remove",
    selectPokemon: "Select Pokémon",
    nickname: "Nickname",
    money: "Money",
    caught: "Caught",
    seen: "Seen",
    trainerSheet: "Trainer Sheet",
    playerName: "Player Name",
    sheet: {
        nature: "Nature",
        age: "Age",
        confidence: "Confidence",
        happiness: "Happiness",
        loyalty: "Loyalty",
        battles: "No of Battles",
        victories: "Victories",
        item: "Item",
        status: "Status",
        accessory: "Accessory",
        weakness: "Weakness",
        hp: "HP",
        will: "Will",
        fight: "Fight",
        survival: "Survival",
        social: "Social",
        brawl: "Brawl",
        channel: "Channel",
        clash: "Clash",
        evasion: "Evasion",
        alert: "Alert",
        athletic: "Athletic",
        stealth: "Stealth",
        allure: "Allure",
        etiquette: "Etiquette",
        intimidate: "Intimidate",
        perform: "Perform",
        tough: "Tough",
        cool: "Cool",
        beauty: "Beauty",
        cute: "Cute",
        clever: "Clever",
        quickRefs: "Quick References",
        initiative: "Initiative",
        def: "Def/S.Def",
        damageReception: "Damage Reception",
        damageInflicted: "Damage Inflicted",
        physical: "Physical",
        special: "Special",
        damageTaken: "Damage Taken",
        newHp: "New HP",
        statuses: {
            Neutral: "Neutral",
            Burn: "Burn",
            Freeze: "Freeze",
            Paralysis: "Paralysis",
            Poison: "Poison",
            "Bad Poison": "Bad Poison",
            Sleep: "Sleep",
            Confused: "Confused",
            Infatuated: "Infatuated",
            Fainted: "Fainted"
        }
    },
    regions: {
      National: "All Data",
      Kanto: "Gen 1",
      Johto: "Gen 2",
      Hoenn: "Gen 3",
      Sinnoh: "Gen 4",
      Unova: "Gen 5",
      Kalos: "Gen 6",
      Alola: "Gen 7",
      Galar: "Gen 8",
      Paldea: "Gen 9"
    }
  },
  it: {
    title: "Pokérole Dex",
    appTitle: "Pokérole Tools",
    subtitle: "Seleziona una regione per vedere il database.",
    appSubtitle: "Scegli uno strumento per iniziare l'avventura.",
    searchPlaceholder: "Cerca...",
    filters: "Filtri",
    close: "Chiudi",
    clear: "Pulisci",
    cancel: "Annulla",
    apply: "Applica",
    nameSearch: "Cerca Nome",
    type: "Tipo",
    allTypes: "Tutti i Tipi",
    minStats: "Stat. Minime",
    noResults: "Nessun risultato trovato.",
    entriesFound: "Voci trovate",
    about: "Info",
    height: "Altezza",
    weight: "Peso",
    rank: "Rango",
    role: "Ruolo",
    baseStats: "Statistiche Base",
    hp: "PV Base",
    abilities: "Abilità",
    primary: "Primaria",
    secondary: "Secondaria",
    hidden: "Nascosta",
    moveset: "Mosse",
    consulting: "Consultando gli Archivi...",
    power: "Potenza",
    target: "Bersaglio",
    dicePools: "Dadi",
    accuracy: "Precisione",
    damage: "Danno",
    effect: "Effetto",
    starter: "Starter",
    wild: "Selvatico",
    strength: "Forza",
    dexterity: "Destrezza",
    vitality: "Vitalità",
    special: "Speciale",
    insight: "Intuito",
    rankFilter: "Rango",
    onlyStarter: "Solo Starter",
    home: "Home",
    characterSheet: "Scheda Personaggio",
    pokemonSheet: "Scheda Pokémon",
    pokedex: "Pokédex",
    comingSoon: "Prossimamente",
    comingSoonDesc: "Questa funzionalità è in fase di sviluppo. Torna più tardi!",
    backToHome: "Torna alla Home",
    party: "Cintura",
    pc: "PC di Bill",
    box: "Box",
    emptySlot: "Vuoto",
    addToParty: "Aggiungi",
    removeFromParty: "Rimuovi",
    selectPokemon: "Seleziona Pokémon",
    nickname: "Soprannome",
    money: "Soldi",
    caught: "Catturati",
    seen: "Visti",
    trainerSheet: "Scheda Allenatore",
    playerName: "Nome Giocatore",
    sheet: {
        nature: "Natura",
        age: "Età",
        confidence: "Sicurezza",
        happiness: "Felicità",
        loyalty: "Lealtà",
        battles: "N° Battaglie",
        victories: "Vittorie",
        item: "Oggetto",
        status: "Stato",
        accessory: "Accessorio",
        weakness: "Debolezza",
        hp: "PV",
        will: "Volontà",
        fight: "Lotta",
        survival: "Sopravvivenza",
        social: "Sociale",
        brawl: "Rissa",
        channel: "Incanalare",
        clash: "Scontro",
        evasion: "Evasione",
        alert: "Allerta",
        athletic: "Atletica",
        stealth: "Furtività",
        allure: "Fascino",
        etiquette: "Etichetta",
        intimidate: "Intimidire",
        perform: "Esibirsi",
        tough: "Grinta",
        cool: "Classe",
        beauty: "Bellezza",
        cute: "Grazia",
        clever: "Acume",
        quickRefs: "Riferimenti Rapidi",
        initiative: "Iniziativa",
        def: "Dif/Dif.Sp",
        damageReception: "Ricezione Danni",
        damageInflicted: "Danni Inflitti",
        physical: "Fisico",
        special: "Speciale",
        damageTaken: "Danni Subiti",
        newHp: "Nuovi PV",
        statuses: {
            Neutral: "Neutro",
            Burn: "Scottatura",
            Freeze: "Congelamento",
            Paralysis: "Paralisi",
            Poison: "Veleno",
            "Bad Poison": "Iperveleno",
            Sleep: "Sonno",
            Confused: "Confusione",
            Infatuated: "Infatuazione",
            Fainted: "Esausto"
        }
    },
    regions: {
      National: "Tutti i Dati",
      Kanto: "Gen 1",
      Johto: "Gen 2",
      Hoenn: "Gen 3",
      Sinnoh: "Gen 4",
      Unova: "Gen 5",
      Kalos: "Gen 6",
      Alola: "Gen 7",
      Galar: "Gen 8",
      Paldea: "Gen 9"
    }
  },
  es: {
    title: "Pokérole Dex",
    appTitle: "Herramientas Pokérole",
    subtitle: "Selecciona una región para ver la base de datos.",
    appSubtitle: "Elige una herramienta para comenzar tu aventura.",
    searchPlaceholder: "Buscar...",
    filters: "Filtros",
    close: "Cerrar",
    clear: "Limpiar",
    cancel: "Cancelar",
    apply: "Aplicar",
    nameSearch: "Buscar Nombre",
    type: "Tipo",
    allTypes: "Todos los Tipos",
    minStats: "Estad. Mínimas",
    noResults: "No se encontraron resultados.",
    entriesFound: "Entradas encontradas",
    about: "Info",
    height: "Altura",
    weight: "Peso",
    rank: "Rango",
    role: "Rol",
    baseStats: "Estadísticas Base",
    hp: "PS Base",
    abilities: "Habilidades",
    primary: "Primaria",
    secondary: "Secundaria",
    hidden: "Oculta",
    moveset: "Movimientos",
    consulting: "Consultando Archivos...",
    power: "Potencia",
    target: "Objetivo",
    dicePools: "Dados",
    accuracy: "Precisión",
    damage: "Daño",
    effect: "Efecto",
    starter: "Inicial",
    wild: "Salvaje",
    strength: "Fuerza",
    dexterity: "Destreza",
    vitality: "Vitalidad",
    special: "Especial",
    insight: "Intuición",
    rankFilter: "Rango",
    onlyStarter: "Solo Inicial",
    home: "Inicio",
    characterSheet: "Hoja de Personaje",
    pokemonSheet: "Hoja de Pokémon",
    pokedex: "Pokédex",
    comingSoon: "Próximamente",
    comingSoonDesc: "Esta función está en desarrollo. ¡Vuelve más tarde!",
    backToHome: "Volver al Inicio",
    party: "Cinturón",
    pc: "PC de Bill",
    box: "Caja",
    emptySlot: "Vacío",
    addToParty: "Añadir",
    removeFromParty: "Quitar",
    selectPokemon: "Seleccionar Pokémon",
    nickname: "Apodo",
    money: "Dinero",
    caught: "Capturados",
    seen: "Vistos",
    trainerSheet: "Ficha de Entrenador",
    playerName: "Nombre Jugador",
    sheet: {
        nature: "Naturaleza",
        age: "Edad",
        confidence: "Confianza",
        happiness: "Felicidad",
        loyalty: "Lealtad",
        battles: "N° Batallas",
        victories: "Victorias",
        item: "Objeto",
        status: "Estado",
        accessory: "Accesorio",
        weakness: "Debilidad",
        hp: "PS",
        will: "Voluntad",
        fight: "Pelea",
        survival: "Supervivencia",
        social: "Social",
        brawl: "Reyerta",
        channel: "Canalizar",
        clash: "Choque",
        evasion: "Evasión",
        alert: "Alerta",
        athletic: "Atletismo",
        stealth: "Sigilo",
        allure: "Seducción",
        etiquette: "Etiqueta",
        intimidate: "Intimidar",
        perform: "Actuar",
        tough: "Dureza",
        cool: "Carisma",
        beauty: "Belleza",
        cute: "Dulzura",
        clever: "Ingenio",
        quickRefs: "Referencias Rápidas",
        initiative: "Iniciativa",
        def: "Def/Def.Esp",
        damageReception: "Recepción de Daño",
        damageInflicted: "Daño Infligido",
        physical: "Físico",
        special: "Especial",
        damageTaken: "Daño Recibido",
        newHp: "Nuevos PS",
        statuses: {
            Neutral: "Neutral",
            Burn: "Quemado",
            Freeze: "Congelado",
            Paralysis: "Parálisis",
            Poison: "Veneno",
            "Bad Poison": "Gravemente Env.",
            Sleep: "Dormido",
            Confused: "Confuso",
            Infatuated: "Enamoramiento",
            Fainted: "Debilitado"
        }
    },
    regions: {
      National: "Todos los Datos",
      Kanto: "Gen 1",
      Johto: "Gen 2",
      Hoenn: "Gen 3",
      Sinnoh: "Gen 4",
      Unova: "Gen 5",
      Kalos: "Gen 6",
      Alola: "Gen 7",
      Galar: "Gen 8",
      Paldea: "Gen 9"
    }
  },
  de: {
    title: "Pokérole Dex",
    appTitle: "Pokérole Tools",
    subtitle: "Wähle eine Region, um die Datenbank anzuzeigen.",
    appSubtitle: "Wähle ein Werkzeug, um dein Abenteuer zu beginnen.",
    searchPlaceholder: "Suchen...",
    filters: "Filter",
    close: "Schließen",
    clear: "Leeren",
    cancel: "Abbrechen",
    apply: "Anwenden",
    nameSearch: "Namenssuche",
    type: "Typ",
    allTypes: "Alle Typen",
    minStats: "Min. Werte",
    noResults: "Keine Ergebnisse gefunden.",
    entriesFound: "Einträge gefunden",
    about: "Über",
    height: "Größe",
    weight: "Gewicht",
    rank: "Rang",
    role: "Rolle",
    baseStats: "Basiswerte",
    hp: "Basis KP",
    abilities: "Fähigkeiten",
    primary: "Primär",
    secondary: "Sekundär",
    hidden: "Versteckt",
    moveset: "Attacken",
    consulting: "Archive werden durchsucht...",
    power: "Stärke",
    target: "Ziel",
    dicePools: "Würfelpools",
    accuracy: "Genauigkeit",
    damage: "Schaden",
    effect: "Effekt",
    starter: "Starter",
    wild: "Wild",
    strength: "Stärke",
    dexterity: "Geschick",
    vitality: "Vitalität",
    special: "Spezial",
    insight: "Einsicht",
    rankFilter: "Rang",
    onlyStarter: "Nur Starter",
    home: "Startseite",
    characterSheet: "Charakterbogen",
    pokemonSheet: "Pokémon-Bogen",
    pokedex: "Pokédex",
    comingSoon: "Demnächst",
    comingSoonDesc: "Diese Funktion wird derzeit entwickelt. Schau später wieder vorbei!",
    backToHome: "Zurück zur Startseite",
    party: "Gürtel",
    pc: "Bills PC",
    box: "Box",
    emptySlot: "Leer",
    addToParty: "Hinzufügen",
    removeFromParty: "Entfernen",
    selectPokemon: "Pokémon auswählen",
    nickname: "Spitzname",
    money: "Geld",
    caught: "Gefangen",
    seen: "Gesehen",
    trainerSheet: "Trainerblatt",
    playerName: "Spielername",
    sheet: {
        nature: "Wesen",
        age: "Alter",
        confidence: "Selbstvertr.",
        happiness: "Freundschaft",
        loyalty: "Loyalität",
        battles: "Kämpfe",
        victories: "Siege",
        item: "Item",
        status: "Status",
        accessory: "Accessoire",
        weakness: "Schwäche",
        hp: "KP",
        will: "Wille",
        fight: "Kampf",
        survival: "Überleben",
        social: "Sozial",
        brawl: "Handgemenge",
        channel: "Kanalisieren",
        clash: "Zusammenstoß",
        evasion: "Ausweichen",
        alert: "Wachsamkeit",
        athletic: "Athletik",
        stealth: "Heimlichkeit",
        allure: "Anziehung",
        etiquette: "Etikette",
        intimidate: "Einschüchtern",
        perform: "Auftritt",
        tough: "Stärke",
        cool: "Coolness",
        beauty: "Schönheit",
        cute: "Anmut",
        clever: "Klugheit",
        quickRefs: "Schnellreferenz",
        initiative: "Initiative",
        def: "Vert/Sp.Vert",
        damageReception: "Schadensempfang",
        damageInflicted: "Zugefügter Schaden",
        physical: "Physisch",
        special: "Spezial",
        damageTaken: "Erlittener Schaden",
        newHp: "Neue KP",
        statuses: {
            Neutral: "Neutral",
            Burn: "Verbrennung",
            Freeze: "Frost",
            Paralysis: "Paralyse",
            Poison: "Vergiftung",
            "Bad Poison": "Schwer vergiftet",
            Sleep: "Schlaf",
            Confused: "Verwirrt",
            Infatuated: "Anziehung",
            Fainted: "Besiegt"
        }
    },
    regions: {
      National: "Alle Daten",
      Kanto: "Gen 1",
      Johto: "Gen 2",
      Hoenn: "Gen 3",
      Sinnoh: "Gen 4",
      Unova: "Gen 5",
      Kalos: "Gen 6",
      Alola: "Gen 7",
      Galar: "Gen 8",
      Paldea: "Gen 9"
    }
  },
  fr: {
    title: "Pokérole Dex",
    appTitle: "Outils Pokérole",
    subtitle: "Sélectionnez une région pour voir la base de données.",
    appSubtitle: "Choisissez un outil pour commencer votre aventure.",
    searchPlaceholder: "Rechercher...",
    filters: "Filtres",
    close: "Fermer",
    clear: "Effacer",
    cancel: "Annuler",
    apply: "Appliquer",
    nameSearch: "Recherche par nom",
    type: "Type",
    allTypes: "Tous les Types",
    minStats: "Stats Min.",
    noResults: "Aucun résultat trouvé.",
    entriesFound: "Entrées trouvées",
    about: "À propos",
    height: "Taille",
    weight: "Poids",
    rank: "Rang",
    role: "Rôle",
    baseStats: "Stats de Base",
    hp: "PV de Base",
    abilities: "Talents",
    primary: "Primaire",
    secondary: "Secondaire",
    hidden: "Caché",
    moveset: "Capacités",
    consulting: "Consultation des archives...",
    power: "Puissance",
    target: "Cible",
    dicePools: "Dés",
    accuracy: "Précision",
    damage: "Dégâts",
    effect: "Effet",
    starter: "Starter",
    wild: "Sauvage",
    strength: "Force",
    dexterity: "Dextérité",
    vitality: "Vitalité",
    special: "Spécial",
    insight: "Intuition",
    rankFilter: "Rang",
    onlyStarter: "Seulement Starter",
    home: "Accueil",
    characterSheet: "Fiche Personnage",
    pokemonSheet: "Fiche Pokémon",
    pokedex: "Pokédex",
    comingSoon: "Bientôt",
    comingSoonDesc: "Cette fonctionnalité est en cours de développement. Revenez plus tard !",
    backToHome: "Retour à l'accueil",
    party: "Ceinture",
    pc: "PC de Léo",
    box: "Boîte",
    emptySlot: "Vide",
    addToParty: "Ajouter",
    removeFromParty: "Retirer",
    selectPokemon: "Sélectionner Pokémon",
    nickname: "Surnom",
    money: "Argent",
    caught: "Attrapés",
    seen: "Vus",
    trainerSheet: "Fiche Dresseur",
    playerName: "Nom Joueur",
    sheet: {
        nature: "Nature",
        age: "Âge",
        confidence: "Confiance",
        happiness: "Bonheur",
        loyalty: "Loyauté",
        battles: "Nb Combats",
        victories: "Victoires",
        item: "Objet",
        status: "Statut",
        accessory: "Accessoire",
        weakness: "Faiblesse",
        hp: "PV",
        will: "Volonté",
        fight: "Combat",
        survival: "Survie",
        social: "Social",
        brawl: "Bagarre",
        channel: "Canaliser",
        clash: "Affrontement",
        evasion: "Évasion",
        alert: "Vigilance",
        athletic: "Athlétisme",
        stealth: "Discrétion",
        allure: "Charme",
        etiquette: "Étiquette",
        intimidate: "Intimidation",
        perform: "Performance",
        tough: "Robuste",
        cool: "Sang-froid",
        beauty: "Beauté",
        cute: "Mignon",
        clever: "Intelligence",
        quickRefs: "Réf. Rapides",
        initiative: "Initiative",
        def: "Déf/Déf.Sp",
        damageReception: "Réception de Dégâts",
        damageInflicted: "Dégâts Infligés",
        physical: "Physique",
        special: "Spécial",
        damageTaken: "Dégâts Subis",
        newHp: "Nouveaux PV",
        statuses: {
            Neutral: "Neutre",
            Burn: "Brûlure",
            Freeze: "Gel",
            Paralysis: "Paralysie",
            Poison: "Poison",
            "Bad Poison": "Gravement Empois.",
            Sleep: "Sommeil",
            Confused: "Confusion",
            Infatuated: "Attraction",
            Fainted: "K.O."
        }
    },
    regions: {
      National: "Toutes les données",
      Kanto: "Gen 1",
      Johto: "Gen 2",
      Hoenn: "Gen 3",
      Sinnoh: "Gen 4",
      Unova: "Gen 5",
      Kalos: "Gen 6",
      Alola: "Gen 7",
      Galar: "Gen 8",
      Paldea: "Gen 9"
    }
  }
};

// --- Image Source Configuration ---
const IMG_SHUFFLE_URL = 'https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ShuffleTokens';
const IMG_BOOK_URL = 'https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/BookSprites';
const IMG_ITEM_URL = 'https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites';

// Used for the List View (Tokens)
export const getListImageUrl = (p: PokemonData) => {
    const filename = p.Image || `${p.Name}.png`;
    return `${IMG_SHUFFLE_URL}/${filename}`;
};

// Used for the Detail View (Full Sprites)
export const getDetailImageUrl = (p: PokemonData) => {
    const filename = p.Image || `${p.Name}.png`;
    return `${IMG_BOOK_URL}/${filename}`;
};

export const getItemImageUrl = (item: ItemData) => {
    return `${IMG_ITEM_URL}/${item._id}.png`;
};

export const getStatDots = (current: number, max: number) => {
  const dots = [];
  for (let i = 0; i < max; i++) {
    dots.push(
      <div 
        key={i} 
        className={`w-3 h-3 rounded-full mr-1 ${i < current ? 'bg-slate-800 dark:bg-slate-200' : 'bg-slate-300 dark:bg-slate-700'}`}
      />
    );
  }
  return <div className="flex items-center">{dots}</div>;
};

export const createInitialPokemon = (data: PokemonData): PokemonCharacter => {
    return {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        dexId: data.Number,
        nickname: data.Name,
        speciesName: data.Name,
        type1: data.Type1,
        type2: data.Type2,
        rank: data.RecommendedRank,
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
        will: { current: data.Insight, max: data.Insight },
        moves: [], 
        nature: "Hardy",
        confidence: "Average",
        happiness: 2,
        loyalty: 1,
        battles: 0,
        victories: 0,
        item: "",
        status: "Neutral",
        accessory: "",
        contest: { tough: 0, cool: 0, beauty: 0, cute: 0, clever: 0 },
        combat: { accuracy: 0, damage: 0 },
        size: `${data.Height.Meters}m`,
        weight: `${data.Weight.Kilograms}kg`,
        image: data.Image
    };
};

export interface TrainerData {
    name: string;
    age: number;
    image: string | null;
    money: number;
    pokedex: {
        seen: number;
        caught: number;
    };
    nature: string;
    confidence: number;
    attributes: {
        strength: { current: number; max: number };
        dexterity: { current: number; max: number };
        vitality: { current: number; max: number };
        special: { current: number; max: number };
        insight: { current: number; max: number };
    };
    skills: {
        fight: { brawl: number; channel: number; clash: number; evasion: number };
        survival: { alert: number; athletic: number; nature: number; stealth: number };
        social: { allure: number; etiquette: number; intimidate: number; perform: number };
    };
    hp: { current: number; max: number };
    will: { current: number; max: number };
}

export const createInitialTrainer = (): TrainerData => {
    return {
        name: "New Trainer",
        age: 10,
        image: null,
        money: 1500,
        pokedex: { seen: 0, caught: 0 },
        nature: "Hardy",
        confidence: 2,
        attributes: {
            strength: { current: 2, max: 5 },
            dexterity: { current: 2, max: 5 },
            vitality: { current: 2, max: 5 },
            special: { current: 2, max: 5 },
            insight: { current: 2, max: 5 },
        },
        skills: {
            fight: { brawl: 0, channel: 0, clash: 0, evasion: 0 },
            survival: { alert: 0, athletic: 0, nature: 0, stealth: 0 },
            social: { allure: 0, etiquette: 0, intimidate: 0, perform: 0 },
        },
        hp: { current: 4, max: 4 },
        will: { current: 4, max: 4 },
    };
};