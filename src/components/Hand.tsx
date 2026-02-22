import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './Card';
import { CardData } from '../types';

interface HandProps {
  cards: CardData[];
  isPlayer?: boolean;
  onCardClick?: (card: CardData) => void;
  playableCardIds?: Set<string>;
}

export const Hand: React.FC<HandProps> = ({ 
  cards, 
  isPlayer = false, 
  onCardClick,
  playableCardIds = new Set()
}) => {
  return (
    <div className="flex justify-center items-center w-full min-h-[160px] px-4 overflow-x-auto no-scrollbar">
      <div className="flex -space-x-8 sm:-space-x-12 hover:space-x-2 transition-all duration-300 py-8">
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              isBack={!isPlayer}
              onClick={() => isPlayer && onCardClick?.(card)}
              isPlayable={isPlayer && playableCardIds.has(card.id)}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
