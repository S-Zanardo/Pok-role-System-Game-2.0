import React from 'react';
import { Region } from '../types';
import { Globe, Map } from 'lucide-react';

export const RegionIcon = ({ region }: { region: Region }) => {
    const props = {
        width: 120,
        height: 120,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.5,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };

    switch (region) {
        case 'National':
            return <Globe {...props} />;
        case 'Kanto': // Ship (S.S. Anne)
            return (
                <svg {...props}>
                    <path d="M2 17h20L19 9H5L2 17Z" />
                    <path d="M6 9V5h3v4" />
                    <path d="M15 9V4h3v5" />
                    <path d="M4 17v4" />
                    <path d="M20 17v4" />
                    <path d="M2 21h20" />
                    <path d="M9 13h6" />
                </svg>
            );
        case 'Johto': // Pagoda (Bell Tower)
            return (
                <svg {...props}>
                    <path d="M12 2l-8 4h16l-8-4z" />
                    <path d="M4 6v4h16V6" />
                    <path d="M2 14l2-4h16l2 4H2z" />
                    <path d="M6 14v6h12v-6" />
                    <path d="M12 14v6" />
                </svg>
            );
        case 'Hoenn': // Rocket (Space Center)
            return (
                <svg {...props}>
                    <path d="M12 2c0 0-3 3-3 8v6c0 1.5 1 3 3 3s3-1.5 3-3v-6c0-5-3-8-3-8z" />
                    <path d="M9 16c-3 0-5 3-5 5h16c0-2-2-5-5-5" />
                    <path d="M12 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                </svg>
            );
        case 'Sinnoh': // Mountain (Mt. Coronet)
            return (
                <svg {...props}>
                    <path d="M12 2L2 22h20L12 2z" />
                    <path d="M12 2l4 10-4 4-4-4 4-10z" />
                    <path d="M8 22l4-8 4 8" />
                </svg>
            );
        case 'Unova': // Bridge (Skyarrow)
            return (
                <svg {...props}>
                    <path d="M4 21V9" />
                    <path d="M20 21V9" />
                    <path d="M4 9c8 6 8 6 16 0" />
                    <path d="M2 21h20" />
                    <path d="M7 12l2 2" />
                    <path d="M17 12l-2 2" />
                </svg>
            );
        case 'Kalos': // Tower (Prism Tower)
            return (
                <svg {...props}>
                    <path d="M12 2L4 22h16L12 2z" />
                    <path d="M12 2v20" />
                    <path d="M8 12h8" />
                    <path d="M6 17h12" />
                    <path d="M10 7h4" />
                </svg>
            );
        case 'Alola': // Tropical (Palm/Sun)
            return (
                <svg {...props}>
                    <circle cx="18" cy="6" r="4" />
                    <path d="M12 22s-6-8-6-14c0-2 2-3 4-3" />
                    <path d="M12 22s6-8 6-14c0-2-2-3-4-3" />
                    <path d="M12 22v-8" />
                </svg>
            );
        case 'Galar': // Castle/Tower (Knuckleburgh/Stadium)
            return (
                <svg {...props}>
                    <path d="M4 22V8l4-4 4 4 4-4 4 4v14H4z" />
                    <path d="M12 8v14" />
                    <rect x="8" y="12" width="8" height="6" rx="1" />
                    <path d="M12 4v4" />
                </svg>
            );
        case 'Paldea': // Academy Building
            return (
                <svg {...props}>
                    <path d="M12 4l-8 6v12h16v-12z" />
                    <circle cx="12" cy="13" r="4" />
                    <path d="M12 9v4" />
                    <path d="M12 13l3 2" />
                    <path d="M2 22h20" />
                </svg>
            );
        default:
            return <Map {...props} />;
    }
}

export const Gen1PokedexIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M5 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V3z" />
        <path d="M5 9h14" />
        <circle cx="9" cy="5" r="2" fill="currentColor" />
        <path d="M16 4h1" />
        <path d="M16 6h1" />
        <rect x="8" y="12" width="8" height="6" rx="1" />
        <path d="M8 20h2" />
        <path d="M14 20h2" />
    </svg>
);

export const PokeballIcon = () => (
    <svg 
        viewBox="0 0 24 24" 
        className="w-full h-full text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h7" />
        <path d="M15 12h7" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
);

export const RankIcon = ({ rank, className = "w-6 h-6" }: { rank: string, className?: string }) => {
    // Determine colors and styles based on rank
    const getRankStyle = (r: string) => {
        switch (r) {
            case 'Starter': // White/Grey Ball
                return { top: 'fill-slate-100', bottom: 'fill-white', band: 'fill-slate-300', btn: 'fill-white' };
            case 'Beginner': // Standard PokeBall (Red/White)
                return { top: 'fill-red-500', bottom: 'fill-white', band: 'fill-slate-800', btn: 'fill-white' };
            case 'Amateur': // Great Ball (Blue/Red stripes)
                return { top: 'fill-blue-500', bottom: 'fill-white', band: 'fill-slate-800', btn: 'fill-white', accents: 'fill-red-500' };
            case 'Ace': // Ultra Ball (Black/Yellow)
                return { top: 'fill-slate-900', bottom: 'fill-white', band: 'fill-slate-800', btn: 'fill-white', accents: 'fill-yellow-400' };
            case 'Pro': // Cherish/Red Style
                return { top: 'fill-red-700', bottom: 'fill-red-700', band: 'fill-slate-900', btn: 'fill-red-500' };
            case 'Master': // Master Ball (Purple/Pink)
                return { top: 'fill-purple-600', bottom: 'fill-white', band: 'fill-slate-800', btn: 'fill-white', accents: 'fill-pink-400' };
            case 'Champion': // Park/Gold Ball
                return { top: 'fill-yellow-400', bottom: 'fill-white', band: 'fill-slate-800', btn: 'fill-white', accents: 'fill-green-500' };
            default:
                return { top: 'fill-slate-400', bottom: 'fill-white', band: 'fill-slate-600', btn: 'fill-white' };
        }
    };

    const style = getRankStyle(rank);

    return (
        <svg viewBox="0 0 100 100" className={className}>
            {/* Bottom Half */}
            <path d="M 5 50 A 45 45 0 0 0 95 50 L 5 50" className={style.bottom} />
            
            {/* Top Half */}
            <path d="M 5 50 A 45 45 0 0 1 95 50 L 5 50" className={style.top} />
            
            {/* Accents for Great Ball (Amateur) */}
            {rank === 'Amateur' && (
                <>
                   <path d="M 20 25 L 35 40 L 30 20 Z" className={style.accents} transform="rotate(-30 50 50)" />
                   <path d="M 80 25 L 65 40 L 70 20 Z" className={style.accents} transform="rotate(30 50 50)" />
                </>
            )}

             {/* Accents for Ultra Ball (Ace) */}
             {rank === 'Ace' && (
                <path d="M 25 20 Q 50 50 75 20 L 80 25 Q 50 60 20 25 Z" className={style.accents} />
            )}

            {/* Accents for Master Ball */}
            {rank === 'Master' && (
                 <>
                    <circle cx="25" cy="25" r="8" className={style.accents} />
                    <circle cx="75" cy="25" r="8" className={style.accents} />
                    <text x="50" y="35" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">M</text>
                 </>
            )}

            {/* Band */}
            <rect x="5" y="46" width="90" height="8" className={style.band} />

            {/* Button Outer */}
            <circle cx="50" cy="50" r="14" className={style.band} />
            
            {/* Button Inner */}
            <circle cx="50" cy="50" r="8" className={style.btn} />
            
            {/* Stroke for definition if white on white */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
        </svg>
    );
};