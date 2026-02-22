import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './Card';
import { CardData } from '../types';

interface HandProps {
  cards: CardData[];
  isPlayer?: boolean;
  onCardClick?: (card: CardData) => void;
  playableCardIds?: Set<string>;
  selectedCardId?: string | null;
}

export const Hand: React.FC<HandProps> = ({ 
  cards, 
  isPlayer = false, 
  onCardClick,
  playableCardIds = new Set(),
  selectedCardId = null
}) => {
  return (
    <div className="flex justify-center items-center w-full min-h-[120px] sm:min-h-[160px] px-2 sm:px-4 overflow-hidden">
      <div className="flex -space-x-10 sm:-space-x-12 md:-space-x-14 max-w-full transition-all duration-300 py-4 sm:py-8">
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => {
            const isSelected = card.id === selectedCardId;
            return (
              <Card
                key={card.id}
                card={card}
                layoutId={card.id}
                isBack={!isPlayer}
                onClick={() => isPlayer && onCardClick?.(card)}
                isPlayable={isPlayer && playableCardIds.has(card.id)}
                highlightColor={card.rank === '8' ? 'red' : 'yellow'}
                index={index}
                className={`shrink-0 ${isSelected ? '-translate-y-6 scale-110 z-50' : ''}`}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
