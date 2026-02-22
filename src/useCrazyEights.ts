import { useState, useEffect, useCallback } from 'react';
import { CardData, Suit, Rank, GameStatus, Turn, SUITS, RANKS } from './types';

const createDeck = (): CardData[] => {
  const deck: CardData[] = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push({
        id: `${rank}-${suit}`,
        suit,
        rank,
      });
    });
  });
  return deck;
};

const shuffle = (deck: CardData[]): CardData[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const useCrazyEights = () => {
  const [deck, setDeck] = useState<CardData[]>([]);
  const [playerHand, setPlayerHand] = useState<CardData[]>([]);
  const [aiHand, setAiHand] = useState<CardData[]>([]);
  const [discardPile, setDiscardPile] = useState<CardData[]>([]);
  const [status, setStatus] = useState<GameStatus>('start-screen');
  const [turn, setTurn] = useState<Turn>('player');
  const [activeSuit, setActiveSuit] = useState<Suit | null>(null);
  const [winner, setWinner] = useState<Turn | null>(null);
  const [message, setMessage] = useState<string>('Welcome to Crazy Eights!');

  const initGame = useCallback(() => {
    setStatus('dealing');
    const timer = setTimeout(() => {
      const fullDeck = shuffle(createDeck());
      const pHand = fullDeck.splice(0, 8);
      const aHand = fullDeck.splice(0, 8);
      
      // Find a non-8 card for the start of discard pile
      let firstDiscardIndex = 0;
      while (fullDeck[firstDiscardIndex].rank === '8') {
        firstDiscardIndex++;
      }
      const firstDiscard = fullDeck.splice(firstDiscardIndex, 1)[0];

      setPlayerHand(pHand);
      setAiHand(aHand);
      setDiscardPile([firstDiscard]);
      setDeck(fullDeck);
      setActiveSuit(firstDiscard.suit);
      setStatus('playing');
      setTurn('player');
      setWinner(null);
      setMessage('Your turn! Match the suit or rank.');
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const topCard = discardPile[discardPile.length - 1];

  const isValidMove = (card: CardData): boolean => {
    if (card.rank === '8') return true;
    return card.suit === activeSuit || card.rank === topCard.rank;
  };

  const playCard = (card: CardData, isPlayer: boolean) => {
    if (status !== 'playing') return;
    if (isPlayer && turn !== 'player') return;
    if (!isPlayer && turn !== 'ai') return;

    if (!isValidMove(card)) {
      if (isPlayer) setMessage("Invalid move! Match the suit or rank, or play an 8.");
      return;
    }

    // Remove from hand
    if (isPlayer) {
      setPlayerHand((prev) => prev.filter((c) => c.id !== card.id));
    } else {
      setAiHand((prev) => prev.filter((c) => c.id !== card.id));
    }

    // Add to discard
    setDiscardPile((prev) => [...prev, card]);
    
    if (card.rank === '8') {
      if (isPlayer) {
        setStatus('selecting-suit');
        setMessage('Crazy 8! Choose a new suit.');
      } else {
        // AI logic for choosing suit: pick most frequent suit in hand
        const suitsInHand = aiHand.filter(c => c.id !== card.id).map(c => c.suit);
        const counts: Record<string, number> = {};
        let maxCount = 0;
        let bestSuit: Suit = SUITS[Math.floor(Math.random() * SUITS.length)];
        
        suitsInHand.forEach(s => {
          counts[s] = (counts[s] || 0) + 1;
          if (counts[s] > maxCount) {
            maxCount = counts[s];
            bestSuit = s as Suit;
          }
        });
        
        setActiveSuit(bestSuit);
        setMessage(`AI played an 8 and chose ${bestSuit}!`);
        setTurn('player');
      }
    } else {
      setActiveSuit(card.suit);
      setTurn(isPlayer ? 'ai' : 'player');
      setMessage(isPlayer ? "AI's turn..." : "Your turn!");
    }
  };

  const drawCard = (isPlayer: boolean) => {
    if (status !== 'playing') return;
    if (isPlayer && turn !== 'player') return;
    if (!isPlayer && turn !== 'ai') return;

    if (deck.length === 0) {
      setMessage("Deck is empty! Skipping turn.");
      setTurn(isPlayer ? 'ai' : 'player');
      return;
    }

    const newDeck = [...deck];
    const drawnCard = newDeck.pop()!;
    setDeck(newDeck);

    if (isPlayer) {
      setPlayerHand((prev) => [...prev, drawnCard]);
      setMessage("You drew a card.");
      // Check if drawn card can be played immediately
      // In some variations you can play it, in others you can't. 
      // Let's allow playing it if valid.
    } else {
      setAiHand((prev) => [...prev, drawnCard]);
      setMessage("AI drew a card.");
    }
    
    // After drawing, turn passes in most Crazy Eights rules if you still can't play.
    // But let's check if the drawn card is playable.
    // Simplified: Draw once, then turn passes.
    setTurn(isPlayer ? 'ai' : 'player');
  };

  const selectSuit = (suit: Suit) => {
    setActiveSuit(suit);
    setStatus('playing');
    setTurn('ai');
    setMessage(`You chose ${suit}. AI's turn...`);
  };

  // AI Turn Logic
  useEffect(() => {
    if (status === 'playing' && turn === 'ai' && !winner) {
      const timer = setTimeout(() => {
        const playableCards = aiHand.filter(isValidMove);
        if (playableCards.length > 0) {
          // Play a card (prefer non-8s if possible, or just first one)
          const cardToPlay = playableCards.find(c => c.rank !== '8') || playableCards[0];
          playCard(cardToPlay, false);
        } else {
          drawCard(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, status, aiHand, activeSuit, topCard, winner]);

  // Win condition check
  useEffect(() => {
    if (playerHand.length === 0 && status === 'playing') {
      setWinner('player');
      setStatus('game-over');
      setMessage('Congratulations! You won!');
    } else if (aiHand.length === 0 && status === 'playing') {
      setWinner('ai');
      setStatus('game-over');
      setMessage('AI wins! Better luck next time.');
    }
  }, [playerHand, aiHand, status]);

  return {
    playerHand,
    aiHand,
    discardPile,
    deck,
    status,
    turn,
    activeSuit,
    winner,
    message,
    playCard,
    drawCard,
    selectSuit,
    initGame,
    topCard,
  };
};
