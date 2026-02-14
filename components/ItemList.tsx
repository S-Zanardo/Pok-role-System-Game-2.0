import React, { useState, useMemo } from 'react';
import { ItemData, Language } from '../types';
import { ArrowLeft, Search, Briefcase, Tag, Coins, Info, CheckCircle2, XCircle, Filter, X, RotateCcw } from 'lucide-react';
import { TRANSLATIONS, getItemImageUrl } from '../utils';

interface ItemListProps {
    items: ItemData[];
    onBack: () => void;
    language: Language;
}

export const ItemList = ({ items, onBack, language }: ItemListProps) => {
    const t = TRANSLATIONS[language];
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Dynamic Filters State
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

    // List of keys we display in the main card or handle specifically, 
    // but we might still want to filter by some of them (like Type).
    // Keys strictly excluded from the "Dynamic Filters" generation because they are handled by main search or UI logic.
    const EXCLUDED_FILTER_KEYS = ['Name', 'Description', 'Image', '_id'];
    
    // Keys excluded from the "Details" view because they are already prominent
    const EXCLUDED_DETAILS_KEYS = ['Name', 'Description', 'Effect', 'Cost', '_id', 'Image', 'Type'];

    // Fields that should be rendered as Dropdown Selects instead of Text Input
    const DROPDOWN_FILTER_KEYS = ['Boost', 'Category', 'Cures', 'ForTypes', 'ForTipes', 'Pocket'];

    // 1. Analyze all items to find all available unique keys, their types, and options for dropdowns
    const availableFilterFields = useMemo(() => {
        // Map structure: Key -> { type, options (Set of unique values) }
        const fieldMap = new Map<string, { type: 'boolean' | 'string' | 'select', options: Set<string> }>();

        items.forEach(item => {
            Object.keys(item).forEach(key => {
                if (EXCLUDED_FILTER_KEYS.includes(key)) return;
                
                const value = item[key];
                // Skip null/undefined/empty values for option collection
                if (value === undefined || value === null || value === '') return;

                // Initialize if not exists
                if (!fieldMap.has(key)) {
                    let type: 'boolean' | 'string' | 'select' = 'string';
                    
                    if (DROPDOWN_FILTER_KEYS.includes(key)) {
                        type = 'select';
                    } else if (typeof value === 'boolean') {
                        type = 'boolean';
                    }
                    
                    fieldMap.set(key, { type, options: new Set() });
                }

                const entry = fieldMap.get(key)!;

                // Collect Options if it is a Select type
                if (entry.type === 'select') {
                    entry.options.add(String(value));
                }
            });
        });

        // Convert Map to array and sort keys alphabetically
        return Array.from(fieldMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, data]) => ({
                key,
                type: data.type,
                // Convert Set to Array and sort options alphabetically
                options: Array.from(data.options).sort()
            }));
    }, [items]);

    // 2. Filter Logic
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // A. Main Search (Name)
            if (searchTerm && !item.Name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // B. Dynamic Filters
            for (const [key, filterValue] of Object.entries(activeFilters)) {
                // If filter is empty/false, skip
                if (filterValue === '' || filterValue === false || filterValue === null) continue;

                const itemValue = item[key];

                // If item doesn't have the key, strictly exclude it? 
                // Usually for filters, if I ask for "Cost: 500", items without cost shouldn't show.
                if (itemValue === undefined || itemValue === null) return false;

                if (typeof filterValue === 'boolean') {
                    // For boolean filters (e.g. OneUse), if filter is true, item must be true
                    if (itemValue !== true) return false;
                } else if (DROPDOWN_FILTER_KEYS.includes(key)) {
                     // Exact match for dropdowns
                     if (String(itemValue) !== String(filterValue)) return false;
                } else {
                    // For standard string/number filters, do a loose string match
                    const strItemVal = String(itemValue).toLowerCase();
                    const strFilterVal = String(filterValue).toLowerCase();
                    if (!strItemVal.includes(strFilterVal)) return false;
                }
            }

            return true;
        });
    }, [items, searchTerm, activeFilters]);

    const handleFilterChange = (key: string, value: any) => {
        setActiveFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const resetFilters = () => {
        setSearchTerm('');
        setActiveFilters({});
    };

    const activeFilterCount = Object.values(activeFilters).filter(v => v !== '' && v !== false && v !== null).length;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen pb-20">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-[#f3f4f6]/95 dark:bg-slate-950/95 backdrop-blur-md rounded-b-xl shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 -mx-4 px-4 pt-4 pb-4 mb-6">
                <div className="flex flex-col gap-4 max-w-6xl mx-auto">
                    
                    {/* Top Row: Title & Search */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button 
                                onClick={onBack} 
                                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ArrowLeft className="w-8 h-8 text-slate-700 dark:text-slate-200" />
                            </button>
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                <Briefcase className="text-green-500" />
                                {t.sheet.item}s
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder={t.searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                                />
                            </div>
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`p-3 rounded-xl border transition-all flex items-center gap-2 font-bold ${
                                    isFilterOpen || activeFilterCount > 0
                                    ? 'bg-green-500 border-green-500 text-white shadow-md' 
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {isFilterOpen ? <X size={20} /> : <Filter size={20} />}
                                <span className="hidden md:inline">{t.filters}</span>
                                {activeFilterCount > 0 && (
                                    <span className="bg-white text-green-600 text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {isFilterOpen && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-lg animate-fade-in">
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-sm tracking-wider">
                                    Advanced Filters
                                </h3>
                                <button 
                                    onClick={resetFilters}
                                    className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 uppercase"
                                >
                                    <RotateCcw size={12} /> {t.clear}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                                {availableFilterFields.map(({ key, type, options }) => (
                                    <div key={key} className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate" title={key}>
                                            {key}
                                        </label>
                                        
                                        {type === 'select' ? (
                                            <div className="relative">
                                                <select
                                                    value={activeFilters[key] || ''}
                                                    onChange={(e) => handleFilterChange(key, e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer"
                                                >
                                                    <option value="">Any</option>
                                                    {options.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <Filter size={12} />
                                                </div>
                                            </div>
                                        ) : type === 'boolean' ? (
                                            <button
                                                onClick={() => handleFilterChange(key, !activeFilters[key])}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold transition-all ${
                                                    activeFilters[key] 
                                                    ? 'bg-green-500 border-green-500 text-white' 
                                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                                }`}
                                            >
                                                {activeFilters[key] ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                                                {activeFilters[key] ? 'Yes' : 'No / Any'}
                                            </button>
                                        ) : (
                                            <input 
                                                type="text"
                                                placeholder={`Filter ${key}...`}
                                                value={activeFilters[key] || ''}
                                                onChange={(e) => handleFilterChange(key, e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item, idx) => (
                    <div 
                        key={idx}
                        onClick={() => setSelectedItem(selectedItem === item ? null : item)}
                        className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                            selectedItem === item 
                            ? 'border-green-500 ring-2 ring-green-500/20' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700'
                        }`}
                    >
                        <div className="flex items-start gap-4 mb-2">
                            {/* Image Container */}
                            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                <img 
                                    src={getItemImageUrl(item)} 
                                    alt={item.Name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
                                        (e.target as HTMLImageElement).style.opacity = '0.3';
                                    }}
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight mb-1">{item.Name}</h3>
                                {item.Type && (
                                    <span className="inline-flex text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full items-center gap-1">
                                        <Tag size={10} /> {item.Type}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-2">
                            {item.Description}
                        </p>

                        {/* Expanded Details */}
                        {selectedItem === item && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 animate-fade-in space-y-3">
                                <p className="text-sm text-slate-700 dark:text-slate-200">
                                    {item.Description}
                                </p>
                                
                                {item.Effect && (
                                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                                        <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase block mb-1">Effect</span>
                                        <p className="text-sm text-slate-800 dark:text-slate-200">{item.Effect}</p>
                                    </div>
                                )}

                                {item.Cost !== undefined && (
                                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-bold text-sm bg-yellow-50 dark:bg-yellow-900/10 px-3 py-2 rounded-lg w-max">
                                        <Coins size={16} />
                                        <span>{item.Cost} ₽</span>
                                    </div>
                                )}

                                {/* Dynamic Extra Fields Display */}
                                <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                                    {Object.entries(item).map(([key, value]) => {
                                        if (EXCLUDED_DETAILS_KEYS.includes(key)) return null;
                                        if (value === null || value === undefined || value === '') return null;
                                        
                                        let displayValue = value;
                                        // Handle Booleans nicely
                                        if (typeof value === 'boolean') {
                                            displayValue = value ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />;
                                        }
                                        // Handle Objects simply (stringify if needed, or skip complex objects)
                                        if (typeof value === 'object') return null;

                                        return (
                                            <div key={key} className="flex flex-col border-b border-slate-200 dark:border-slate-700/50 last:border-0 pb-1 last:pb-0">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{key}</span>
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                    {displayValue}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Info size={48} className="mb-4" />
                    <p className="text-xl">{t.noResults}</p>
                    {(searchTerm || activeFilterCount > 0) && (
                        <button onClick={resetFilters} className="mt-4 text-green-500 font-bold hover:underline">
                            {t.clear} Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};