import { useState, useEffect, useCallback } from 'react';
import { CardData, Suit, Rank, GameStatus, Turn, Language, SUITS, RANKS } from './types';
import { soundService } from './soundService';

const TRANSLATIONS = {
  zh: {
    welcome: '欢迎来到疯狂 8 点！',
    yourTurn: '轮到你了！匹配花色或点数。',
    invalidMove: '无效的出牌！请匹配花色、点数，或者打出 8。',
    crazyEight: '疯狂 8 点！请选择一个新的花色。',
    aiPlayedEight: (suit: string) => `AI 打出了 8 并选择了 ${suit}！`,
    aiThinking: 'AI 正在思考...',
    playerTurn: '轮到你了！',
    deckEmpty: '牌堆已空！跳过此回合。',
    playerDrew: '你摸了一张牌。',
    aiDrew: 'AI 摸了一张牌。',
    playerChose: (suit: string) => `你选择了 ${suit}。AI 正在思考...`,
    playerWin: '恭喜！你赢了！',
    aiWin: 'AI 获胜！下次好运。',
    suitNames: {
      hearts: '红心',
      diamonds: '方块',
      clubs: '梅花',
      spades: '黑桃'
    }
  },
  en: {
    welcome: 'Welcome to Crazy Eights!',
    yourTurn: 'Your turn! Match the suit or rank.',
    invalidMove: 'Invalid move! Match the suit or rank, or play an 8.',
    crazyEight: 'Crazy 8! Choose a new suit.',
    aiPlayedEight: (suit: string) => `AI played an 8 and chose ${suit}!`,
    aiThinking: "AI's turn...",
    playerTurn: "Your turn!",
    deckEmpty: 'Deck is empty! Skipping turn.',
    playerDrew: 'You drew a card.',
    aiDrew: 'AI drew a card.',
    playerChose: (suit: string) => `You chose ${suit}. AI's turn...`,
    playerWin: 'Congratulations! You won!',
    aiWin: 'AI wins! Better luck next time.',
    suitNames: {
      hearts: 'Hearts',
      diamonds: 'Diamonds',
      clubs: 'Clubs',
      spades: 'Spades'
    }
  }
};

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
  const [language, setLanguage] = useState<Language>('zh');
  const [message, setMessage] = useState<string>(TRANSLATIONS.zh.welcome);

  const t = TRANSLATIONS[language];

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
      setMessage(t.yourTurn);
    }, 500);
    return () => clearTimeout(timer);
  }, [language, t.yourTurn]);

  // Update message when language changes if in a specific state
  useEffect(() => {
    if (status === 'start-screen') setMessage(t.welcome);
    else if (status === 'playing' && turn === 'player') setMessage(t.yourTurn);
  }, [language, status, turn]);

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
      if (isPlayer) setMessage(t.invalidMove);
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
      soundService.playExplosion();
      if (isPlayer) {
        setStatus('selecting-suit');
        setMessage(t.crazyEight);
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
        setMessage(t.aiPlayedEight(t.suitNames[bestSuit]));
        setTurn('player');
      }
    } else {
      soundService.playCard();
      setActiveSuit(card.suit);
      setTurn(isPlayer ? 'ai' : 'player');
      setMessage(isPlayer ? t.aiThinking : t.playerTurn);
    }
  };

  const drawCard = (isPlayer: boolean) => {
    if (status !== 'playing') return;
    if (isPlayer && turn !== 'player') return;
    if (!isPlayer && turn !== 'ai') return;

    if (deck.length === 0) {
      setMessage(t.deckEmpty);
      setTurn(isPlayer ? 'ai' : 'player');
      return;
    }

    const newDeck = [...deck];
    const drawnCard = newDeck.pop()!;
    setDeck(newDeck);
    soundService.playDraw();

    if (isPlayer) {
      setPlayerHand((prev) => [...prev, drawnCard]);
      setMessage(t.playerDrew);
      // Check if drawn card can be played immediately
      // In some variations you can play it, in others you can't. 
      // Let's allow playing it if valid.
    } else {
      setAiHand((prev) => [...prev, drawnCard]);
      setMessage(t.aiDrew);
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
    setMessage(t.playerChose(t.suitNames[suit]));
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
      setMessage(t.playerWin);
    } else if (aiHand.length === 0 && status === 'playing') {
      setWinner('ai');
      setStatus('game-over');
      setMessage(t.aiWin);
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
    language,
    setLanguage,
    playCard,
    drawCard,
    selectSuit,
    initGame,
    topCard,
  };
};
