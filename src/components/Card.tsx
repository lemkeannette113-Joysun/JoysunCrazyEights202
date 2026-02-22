import React from 'react';
import { motion } from 'motion/react';
import { CardData, SUIT_SYMBOLS, SUIT_COLORS } from '../types';

interface CardProps {
  card?: CardData;
  isBack?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  highlightColor?: 'yellow' | 'red';
  className?: string;
  index?: number;
  layoutId?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  isBack = false, 
  onClick, 
  isPlayable = false,
  highlightColor = 'yellow',
  className = '',
  index = 0,
  layoutId,
  style = {}
}) => {
  const ringColor = highlightColor === 'red' ? 'ring-4 ring-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'ring-2 ring-yellow-400';
  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={isPlayable ? { y: -10, scale: 1.05 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`
        relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 rounded-lg border border-zinc-300 
        flex flex-col items-center justify-center cursor-pointer select-none
        ${isBack ? 'card-back' : 'bg-white text-zinc-900'}
        ${isPlayable ? `${ringColor} cursor-pointer` : 'cursor-default'}
        card-shadow transition-all duration-200
        ${className}
      `}
      style={{
        zIndex: index,
        ...style
      }}
    >
      {!isBack && card && (
        <>
          <div className={`absolute top-1 left-1.5 text-xs sm:text-sm font-bold flex flex-col items-center leading-none ${SUIT_COLORS[card.suit]}`}>
            <span>{card.rank}</span>
            <span className="text-[10px] sm:text-xs">{SUIT_SYMBOLS[card.suit]}</span>
          </div>
          
          <div className={`text-xl sm:text-2xl md:text-4xl ${SUIT_COLORS[card.suit]}`}>
            {SUIT_SYMBOLS[card.suit]}
          </div>

          <div className={`absolute bottom-1 right-1.5 text-xs sm:text-sm font-bold flex flex-col items-center leading-none rotate-180 ${SUIT_COLORS[card.suit]}`}>
            <span>{card.rank}</span>
            <span className="text-[10px] sm:text-xs">{SUIT_SYMBOLS[card.suit]}</span>
          </div>
        </>
      )}
    </motion.div>
  );
};
