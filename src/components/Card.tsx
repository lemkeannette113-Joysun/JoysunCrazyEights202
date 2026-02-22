import React from 'react';
import { motion } from 'motion/react';
import { CardData, SUIT_SYMBOLS, SUIT_COLORS } from '../types';

interface CardProps {
  card?: CardData;
  isBack?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
  index?: number;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  isBack = false, 
  onClick, 
  isPlayable = false,
  className = '',
  index = 0
}) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={isPlayable ? { y: -10, scale: 1.05 } : {}}
      onClick={onClick}
      className={`
        relative w-20 h-28 sm:w-24 sm:h-36 rounded-lg border border-zinc-300 
        flex flex-col items-center justify-center cursor-pointer select-none
        ${isBack ? 'card-back' : 'bg-white text-zinc-900'}
        ${isPlayable ? 'ring-2 ring-yellow-400 cursor-pointer' : 'cursor-default'}
        card-shadow transition-shadow duration-200
        ${className}
      `}
      style={{
        zIndex: index,
      }}
    >
      {!isBack && card && (
        <>
          <div className={`absolute top-1 left-1.5 text-xs sm:text-sm font-bold flex flex-col items-center leading-none ${SUIT_COLORS[card.suit]}`}>
            <span>{card.rank}</span>
            <span className="text-[10px] sm:text-xs">{SUIT_SYMBOLS[card.suit]}</span>
          </div>
          
          <div className={`text-2xl sm:text-4xl ${SUIT_COLORS[card.suit]}`}>
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
