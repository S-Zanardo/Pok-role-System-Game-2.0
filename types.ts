
export interface PokemonHeight {
  Meters: number;
  Feet: number;
}

export interface PokemonWeight {
  Kilograms: number;
  Pounds: number;
}

export interface Evolution {
  To: string;
  Kind: string;
  Speed: string;
}

export interface Move {
  Learned: string;
  Name: string;
}

export interface MoveDetailData {
  Name: string;
  Type: string;
  Power: number;
  Accuracy1: string;
  Accuracy2?: string;
  Damage1?: string;
  Damage2?: string;
  Target: string;
  Effect?: string;
  Description: string;
  Category?: string; // Physical, Special, Status (sometimes inferred)
}

export interface AbilityDetailData {
  Name: string;
  Description: string;
  Effect: string;
}

export interface ItemData {
    _id: string; // Used for images
    Name: string;
    Description: string;
    Type?: string;
    Cost?: number;
    Effect?: string;
    // Allow any other optional field found in the JSON (e.g. OneUse, Heal, Damage, etc.)
    [key: string]: any;
}

export interface NatureData {
    Name: string;
    Keywords: string[];
    Description: string;
    Confidence: string;
}

export interface PokemonData {
  Number: number;
  DexID: string;
  Name: string;
  Type1: string;
  Type2?: string;
  BaseHP: number;
  Strength: number;
  MaxStrength: number;
  Dexterity: number;
  MaxDexterity: number;
  Vitality: number;
  MaxVitality: number;
  Special: number;
  MaxSpecial: number;
  Insight: number;
  MaxInsight: number;
  Ability1: string;
  Ability2?: string;
  HiddenAbility?: string;
  EventAbilities?: string;
  RecommendedRank: string;
  GenderType?: string;
  Legendary: boolean;
  GoodStarter: boolean;
  _id?: string; // Optional as we generate it or it might not be in JSON
  DexCategory: string;
  Height: PokemonHeight;
  Weight: PokemonWeight;
  DexDescription: string;
  Evolutions: Evolution[];
  Image: string;
  Moves: Move[];
}

// --- RPG Character Sheet Types ---

export interface CharacterSkills {
    fight: {
        brawl: number;
        channel: number;
        clash: number;
        evasion: number;
    };
    survival: {
        alert: number;
        athletic: number;
        nature: number;
        stealth: number;
    };
    social: {
        allure: number;
        etiquette: number;
        intimidate: number;
        perform: number;
    };
}

export interface PokemonCharacter {
    id: string; // Unique instance ID
    dexId: number; // Reference to original Dex Number
    nickname: string;
    speciesName: string;
    type1: string;
    type2?: string;
    rank: string;
    
    // Attributes (Mutable)
    attributes: {
        strength: { current: number; max: number };
        dexterity: { current: number; max: number };
        vitality: { current: number; max: number };
        special: { current: number; max: number };
        insight: { current: number; max: number };
    };

    // Skills
    skills: CharacterSkills;

    // Vitals
    hp: { current: number; max: number };
    will: { current: number; max: number };

    // Moves (Learned)
    moves: string[];

    // Info
    nature: string;
    confidence: string;
    happiness: number; // 0-5
    loyalty: number; // 0-5
    battles: number;
    victories: number;
    item: string;
    status: string;
    accessory: string;
    
    // Contest Stats
    contest: {
        tough: number;
        cool: number;
        beauty: number;
        cute: number;
        clever: number;
    };

    // Combat Stats (Quick Refs Modifiers)
    combat: {
        accuracy: number;
        damage: number;
    };

    // Physical
    size: string;
    weight: string;
    image: string; // URL
}

export type Region = 'National' | 'Kanto' | 'Johto' | 'Hoenn' | 'Sinnoh' | 'Unova' | 'Kalos' | 'Alola' | 'Galar' | 'Paldea';

export type Language = 'en' | 'it' | 'es' | 'de' | 'fr';
