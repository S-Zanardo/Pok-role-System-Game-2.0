import React, { useState, useEffect } from 'react';
import { PokemonData, Region, Language, ItemData, PokemonCharacter } from './types';
import { Loader2, RefreshCw } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { saveUserData, loadUserData } from './services/persistence';
import { TrainerData, createInitialTrainer } from './utils';

// Components
import { HomePage } from './components/HomePage';
import { ComingSoon } from './components/ComingSoon';
import { RegionSelect } from './components/RegionSelect';
import { PokemonList } from './components/PokemonList';
import { PokemonDetail } from './components/PokemonDetail';
import CharacterSheet from './components/CharacterSheet';
import { PokemonSheet } from './components/PokemonSheet';
import { ItemList } from './components/ItemList';
import { ProgressBar } from './components/Shared';

// --- Fetching Logic ---
// Using Recursive Tree API to get all files from v2.0
const GITHUB_TREE_API = 'https://api.github.com/repos/Pokerole-Software-Development/Pokerole-Data/git/trees/master?recursive=1';
const RAW_BASE_URL = 'https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/';

// --- Main App Container ---

export default function App() {
  return (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();
  // Navigation State
  const [appMode, setAppMode] = useState<'home' | 'pokedex' | 'character' | 'pokemon' | 'items'>('home');
  const [pokedexView, setPokedexView] = useState<'regions' | 'list' | 'detail'>('regions');
  const [previousMode, setPreviousMode] = useState<'home' | 'character'>('home');
  
  const [selectedRegion, setSelectedRegion] = useState<Region>('National');
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Data State
  const [pokemonDB, setPokemonDB] = useState<PokemonData[]>([]);
  const [itemsDB, setItemsDB] = useState<ItemData[]>([]);

  // User Data State (Persistence)
  const [party, setParty] = useState<(PokemonCharacter | null)[]>(Array(6).fill(null));
  const [pc, setPc] = useState<(PokemonCharacter | null)[][]>(
      Array(20).fill(null).map(() => Array(30).fill(null))
  );
  const [trainer, setTrainer] = useState<TrainerData>(createInitialTrainer());
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Store maps for on-demand fetching
  const [moveFileMap, setMoveFileMap] = useState<Record<string, string>>({});
  const [abilityFileMap, setAbilityFileMap] = useState<Record<string, string>>({});
  const [natureFileMap, setNatureFileMap] = useState<Record<string, string>>({});
  
  const [loading, setLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Language State
  const [language, setLanguage] = useState<Language>('en');

  // Toggle Theme Logic
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Apply Theme Effect
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Initial Data Fetching
  useEffect(() => {
    const fetchData = async () => {
        try {
            // 1. Get List of Files using Tree API
            const treeResponse = await fetch(GITHUB_TREE_API);
            if (!treeResponse.ok) {
                throw new Error('GitHub API request failed. Limit might be reached.');
            }
            const treeData = await treeResponse.json();
            
            // 2. Process Tree Nodes (Targeting v2.0)
            const pokedexNodes: any[] = [];
            const itemNodes: any[] = [];
            
            const tempMoveMap: Record<string, string> = {};
            const tempAbilityMap: Record<string, string> = {};
            const tempNatureMap: Record<string, string> = {};

            treeData.tree.forEach((node: any) => {
                if (node.type !== 'blob') return;

                // Check for Pokedex Files (v2.0)
                if (node.path.includes('v2.0/Pokedex') && node.path.endsWith('.json')) {
                    pokedexNodes.push(node);
                }

                // Check for Item Files (v2.0)
                if (node.path.includes('v2.0/Items') && node.path.endsWith('.json')) {
                    itemNodes.push(node);
                }

                // Check for Move Files (v2.0)
                if (node.path.includes('v2.0/Moves') && node.path.endsWith('.json')) {
                    const parts = node.path.split('/');
                    const filename = parts[parts.length - 1].replace('.json', '');
                    tempMoveMap[filename] = node.path;
                }

                // Check for Ability Files (v2.0)
                if (node.path.includes('v2.0/Abilities') && node.path.endsWith('.json')) {
                    const parts = node.path.split('/');
                    const filename = parts[parts.length - 1].replace('.json', '');
                    tempAbilityMap[filename] = node.path;
                }

                // Check for Nature Files (v2.0)
                if (node.path.includes('v2.0/Natures') && node.path.endsWith('.json')) {
                    const parts = node.path.split('/');
                    const filename = parts[parts.length - 1].replace('.json', '');
                    tempNatureMap[filename] = node.path;
                }
            });

            const totalToFetch = pokedexNodes.length + itemNodes.length;
            setTotalFiles(totalToFetch);
            
            setMoveFileMap(tempMoveMap);
            setAbilityFileMap(tempAbilityMap);
            setNatureFileMap(tempNatureMap);
            
            // 3. Batch Fetch Content for Pokedex
            const BATCH_SIZE = 20;
            const fetchedPokemon: PokemonData[] = [];
            
            for (let i = 0; i < pokedexNodes.length; i += BATCH_SIZE) {
                const batch = pokedexNodes.slice(i, i + BATCH_SIZE);
                
                const batchPromises = batch.map(async (node: any) => {
                    try {
                        const encodedPath = node.path.split('/').map((segment: string) => encodeURIComponent(segment)).join('/');
                        const url = `${RAW_BASE_URL}${encodedPath}`;

                        const res = await fetch(url);
                        if (!res.ok) return null;
                        const rawData = await res.json();
                        
                        // --- V2.0 to App Data Mapper ---
                        // Ensure required fields exist and map old keys if necessary
                        if (rawData && rawData.Name) {
                            // Map HP -> BaseHP if BaseHP is missing (v2 structure)
                            const baseHp = rawData.BaseHP !== undefined ? rawData.BaseHP : rawData.HP;
                            
                            // Ensure Number is present (sometimes named DexID in different versions or string)
                            const num = typeof rawData.Number === 'number' ? rawData.Number : parseInt(rawData.Number || rawData.DexID || "0");

                            return {
                                ...rawData,
                                Number: num,
                                BaseHP: baseHp,
                                // Fallbacks for images if path structure is different
                                Image: rawData.Image || `${rawData.Name}.png` 
                            } as PokemonData;
                        }
                        return null;
                    } catch (e) {
                        return null;
                    }
                });

                const results = await Promise.all(batchPromises);
                const validResults = results.filter((p): p is PokemonData => p !== null);
                fetchedPokemon.push(...validResults);
                
                setProgress(prev => Math.min(prev + BATCH_SIZE, totalToFetch));
            }

            // 4. Batch Fetch Content for Items
            const fetchedItems: ItemData[] = [];
            for (let i = 0; i < itemNodes.length; i += BATCH_SIZE) {
                const batch = itemNodes.slice(i, i + BATCH_SIZE);
                const batchPromises = batch.map(async (node: any) => {
                    try {
                        const encodedPath = node.path.split('/').map((segment: string) => encodeURIComponent(segment)).join('/');
                        const url = `${RAW_BASE_URL}${encodedPath}`;
                        const res = await fetch(url);
                        if (!res.ok) return null;
                        return await res.json() as ItemData;
                    } catch (e) { return null; }
                });
                const results = await Promise.all(batchPromises);
                fetchedItems.push(...results.filter((i): i is ItemData => i !== null));
                setProgress(prev => Math.min(prev + BATCH_SIZE, totalToFetch));
            }

            // 5. Final Sort and Set
            fetchedPokemon.sort((a, b) => a.Number - b.Number);
            fetchedItems.sort((a, b) => a.Name.localeCompare(b.Name));

            setPokemonDB(fetchedPokemon);
            setItemsDB(fetchedItems);
            setLoading(false);

        } catch (err) {
            console.error(err);
            setError("Failed to load data. Please check your connection or try again later.");
            setLoading(false);
        }
    };

    fetchData();
  }, []);

  // --- Persistence Logic ---

  // 1. Load data on login
  useEffect(() => {
    if (user) {
        loadUserData(user.uid).then((data) => {
            // Definisci la struttura di default
            const defaultParty = Array(6).fill(null);
            const defaultPc = Array(20).fill(null).map(() => Array(30).fill(null));

            // Usa i dati caricati SOLO se validi (lunghezza corretta), altrimenti usa default
            const loadedParty = (data?.party && data.party.length === 6) ? data.party : defaultParty;
            const loadedPc = (data?.pcBoxes && data.pcBoxes.length === 20) ? data.pcBoxes : defaultPc;
            const loadedTrainer = data?.trainer || createInitialTrainer();
            
            setParty(loadedParty);
            setPc(loadedPc);
            setTrainer(loadedTrainer);
            setIsDataLoaded(true);
        });
    } else {
        // Reset alla struttura di default (NON array vuoti) quando non loggato
        setParty(Array(6).fill(null));
        setPc(Array(20).fill(null).map(() => Array(30).fill(null)));
        setTrainer(createInitialTrainer());
        setIsDataLoaded(false);
    }
  }, [user]);

  // 2. Manual Save/Load Handlers
  const handleManualSave = async () => {
      if (!user) return;
      try {
          await saveUserData(user.uid, { party, pcBoxes: pc, trainer });
          alert("Salvataggio completato con successo!");
      } catch (e) {
          console.error("Errore salvataggio:", e);
          alert("Errore durante il salvataggio. Controlla la console.");
      }
  };

  const handleManualLoad = async () => {
      if (!user) return;
      const data = await loadUserData(user.uid);
      if (data) {
          // Logica robusta: se i dati sono corrotti o vuoti, usa i default
          const defaultParty = Array(6).fill(null);
          const defaultPc = Array(20).fill(null).map(() => Array(30).fill(null));

          const loadedParty = (data.party && Array.isArray(data.party) && data.party.length === 6) ? data.party : defaultParty;
          const loadedPc = (data.pcBoxes && Array.isArray(data.pcBoxes)) ? data.pcBoxes : defaultPc;
          const loadedTrainer = data.trainer || createInitialTrainer();

          setParty(loadedParty);
          setPc(loadedPc);
          setTrainer(loadedTrainer);
          alert("Dati ricaricati dal cloud!");
      }
  };

  // --- Navigation Handlers ---

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
    setPokedexView('list');
    window.scrollTo(0, 0); 
  };

  const handlePokemonSelect = (pokemon: PokemonData) => {
    setScrollPosition(window.scrollY); // Save scroll position
    setSelectedPokemon(pokemon);
    setPokedexView('detail');
  };

  const goBackToRegions = () => {
    setPokedexView('regions');
    setSelectedRegion('National');
    setScrollPosition(0);
  };

  const goBackToList = () => {
    setPokedexView('list');
    setSelectedPokemon(null);
  };

  // Restore scroll position when returning to list view
  useEffect(() => {
    if (appMode === 'pokedex' && pokedexView === 'list') {
        setTimeout(() => {
            window.scrollTo(0, scrollPosition);
        }, 0);
    }
  }, [appMode, pokedexView, scrollPosition]);

  // --- Render ---

  const isPokedexLoading = loading && (appMode === 'pokedex' || appMode === 'pokemon' || appMode === 'items');

  if (isPokedexLoading) {
      return <ProgressBar progress={progress} total={totalFiles} status="Syncing Database (v2.0)..." />;
  }

  if (error && (appMode === 'pokedex' || appMode === 'pokemon' || appMode === 'items')) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center text-slate-600 dark:text-slate-300">
              <Loader2 className="w-12 h-12 mb-4 text-red-500 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Oops!</h2>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
              >
                  <RefreshCw size={18} /> Retry
              </button>
          </div>
      );
  }

  return (
        <div className="min-h-screen bg-[#f3f4f6] dark:bg-slate-950 transition-colors duration-300">
            
            {/* Home Page */}
            {appMode === 'home' && (
                <HomePage 
                    onNavigate={(mode) => {
                        if (mode === 'pokemon') setPreviousMode('home');
                        setAppMode(mode);
                    }}
                    isDark={isDarkMode}
                    toggleTheme={toggleTheme}
                    language={language}
                    setLanguage={setLanguage}
                />
            )}

            {/* Character Sheet */}
            {appMode === 'character' && (
                <CharacterSheet 
                    trainer={trainer}
                    setTrainer={setTrainer}
                    onBack={() => setAppMode('home')}
                    language={language}
                    onSave={handleManualSave}
                    natureMap={natureFileMap}
                    party={party}
                    onManagePokemon={() => {
                        setPreviousMode('character');
                        setAppMode('pokemon');
                    }}
                />
            )}

            {/* Item List */}
            {appMode === 'items' && (
                <ItemList 
                    items={itemsDB}
                    onBack={() => setAppMode('home')}
                    language={language}
                />
            )}

            {/* Pokemon Party Sheet */}
            {appMode === 'pokemon' && (
                <PokemonSheet 
                    onBack={() => setAppMode(previousMode)}
                    allPokemon={pokemonDB}
                    language={language}
                    natureMap={natureFileMap}
                    moveFileMap={moveFileMap}
                    abilityFileMap={abilityFileMap}
                    party={party}
                    setParty={setParty}
                    pcBoxes={pc}
                    setPcBoxes={setPc}
                    onSave={handleManualSave}
                    onLoad={handleManualLoad}
                />
            )}

            {/* Pokedex Application */}
            {appMode === 'pokedex' && (
                <>
                    {pokedexView === 'regions' && (
                        <RegionSelect 
                            onSelect={handleRegionSelect} 
                            onHome={() => setAppMode('home')}
                            isDark={isDarkMode} 
                            toggleTheme={toggleTheme}
                            language={language}
                            setLanguage={setLanguage}
                        />
                    )}

                    {(pokedexView === 'list' || pokedexView === 'detail') && (
                        <div className={pokedexView === 'detail' ? 'hidden' : 'block'}>
                            <PokemonList 
                                region={selectedRegion} 
                                onBack={goBackToRegions} 
                                onSelectPokemon={handlePokemonSelect} 
                                data={pokemonDB}
                                language={language}
                            />
                        </div>
                    )}

                    {pokedexView === 'detail' && selectedPokemon && (
                        <PokemonDetail 
                            pokemon={selectedPokemon} 
                            onBack={goBackToList}
                            moveMap={moveFileMap}
                            abilityMap={abilityFileMap}
                            language={language}
                        />
                    )}
                </>
            )}
        </div>
  );
}
