import { Check } from 'lucide-react';
import useIntersectionObserver from '@/hooks/useIntersectionObserver.jsx';

export default function PokemonCard({
    pokemon,
    isSelected,
    isCurrentlySelected,
    onClick
}) {
    const { ref, isIntersecting, direction } = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '50px'
    });

    // Choose animation based on direction
    const getAnimationClass = () => {
        if (!isIntersecting) return 'opacity-0 translate-y-4';


        if (direction === 'up') {
            return 'animate__animated animate__fadeInDown opacity-100 translate-y-0';
        } else if (direction === 'down') {
            return 'animate__animated animate__fadeInUp opacity-100 translate-y-0';
        } else {
            return 'animate__animated animate__fadeIn opacity-100 translate-y-0';
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            normal: 'bg-gray-500',
            fire: 'bg-red-500',
            water: 'bg-blue-500',
            electric: 'bg-yellow-500',
            grass: 'bg-green-500',
            ice: 'bg-cyan-500',
            fighting: 'bg-orange-500',
            poison: 'bg-purple-500',
            ground: 'bg-amber-600',
            flying: 'bg-indigo-400',
            psychic: 'bg-pink-500',
            bug: 'bg-lime-500',
            rock: 'bg-stone-600',
            ghost: 'bg-indigo-700',
            dragon: 'bg-violet-600',
            dark: 'bg-gray-800',
            steel: 'bg-gray-400',
            fairy: 'bg-pink-300'
        };
        return colors[type] || 'bg-gray-500';
    };

    return (
        <div
            ref={ref}
            onClick={onClick}
            className={`relative bg-gray-800/70 rounded-lg p-2 cursor-pointer hover:bg-gray-700 transition-all duration-300 border transform ${
                getAnimationClass()
            } ${isSelected || isCurrentlySelected
                ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-900/30 scale-105'
                : 'border-gray-700'
                }`}
        >
            {/* Check icon overlay */}
            {isSelected && (
                <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1 z-10 animate__animated animate__bounceIn">
                    <Check className="w-3 h-3 text-white" />
                </div>
            )}

            <div className="text-xs text-gray-400 mb-1">{pokemon.number}</div>
            <div className="text-xs font-semibold text-white mb-2 truncate">
                {pokemon.name}
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
                {pokemon.types.map((type, idx) => (
                    <span
                        key={idx}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${getTypeColor(type)} text-white`}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                ))}
            </div>
            {pokemon.sprite && (
                <img
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    className="w-full h-auto"
                />
            )}
        </div>
    );
}