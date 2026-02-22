/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCrazyEights } from './useCrazyEights';
import { Hand } from './components/Hand';
import { Card } from './components/Card';
import { SUITS, SUIT_SYMBOLS, SUIT_COLORS, Suit, CardData } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Info, Trophy, AlertCircle, Languages, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';

const UI_TRANSLATIONS = {
  zh: {
    title: '疯狂 8 点 202',
    status: '状态',
    restart: '重新开始',
    aiOpponent: (count: number) => `AI 对手 (${count})`,
    deck: (count: number) => `牌堆 (${count})`,
    discard: '弃牌堆',
    yourHand: (count: number) => `你的手牌 (${count})`,
    startTitle: '疯狂 8 点',
    startDesc: '匹配花色或点数，使用万能 8 点，争做第一个清空手牌的人！',
    startBtn: '开始游戏',
    initialHand: '初始手牌',
    changeSuit: '改变花色',
    dealing: '正在洗牌与发牌...',
    crazyEightTitle: '疯狂 8 点！',
    crazyEightDesc: '请为下一位玩家选择一个新的花色。',
    victory: '胜利！',
    victoryDesc: '你清空了手牌，战胜了 AI。',
    defeat: '失败',
    defeatDesc: 'AI 这次更快。别灰心！',
    draw: '平局',
    drawDesc: '双方都无法出牌，握手言和吧。',
    playAgain: '再玩一次',
    rulesTitle: '游戏规则',
    rules: [
      '发牌：每位玩家初始发 8 张牌。',
      '出牌：出牌必须在“花色”或“点数”上与弃牌堆顶部的牌匹配。',
      '万能 8：数字“8”是万能牌，可以在任何时候打出，并指定新的花色。',
      '摸牌：如果无牌可出，必须从牌堆摸一张牌。',
      '胜利：最先清空手牌的一方获胜。'
    ],
    suitNames: {
      hearts: '红心',
      diamonds: '方块',
      clubs: '梅花',
      spades: '黑桃'
    }
  },
  en: {
    title: 'Crazy Eights 202',
    status: 'Status',
    restart: 'Restart',
    aiOpponent: (count: number) => `AI Opponent (${count})`,
    deck: (count: number) => `DECK (${count})`,
    discard: 'DISCARD',
    yourHand: (count: number) => `Your Hand (${count})`,
    startTitle: 'CRAZY EIGHTS',
    startDesc: 'Match suits or ranks, use wild 8s, and be the first to clear your hand!',
    startBtn: 'START GAME',
    initialHand: 'INITIAL HAND',
    changeSuit: 'CHANGE SUIT',
    dealing: 'Shuffling & Dealing...',
    crazyEightTitle: 'Crazy Eight!',
    crazyEightDesc: 'Choose the new suit for the next player.',
    victory: 'VICTORY!',
    victoryDesc: "You've cleared your hand and outsmarted the AI.",
    defeat: 'DEFEAT',
    defeatDesc: "The AI was faster this time. Don't give up!",
    draw: 'DRAW',
    drawDesc: 'No more moves possible for both players.',
    playAgain: 'PLAY AGAIN',
    rulesTitle: 'Game Rules',
    rules: [
      'Dealing: Each player starts with 8 cards.',
      'Playing: Match the suit or rank of the top card on the discard pile.',
      'Wild 8s: An 8 can be played on any card. The player then chooses a new suit.',
      'Drawing: If you cannot play, you must draw a card from the deck.',
      'Winning: The first player to get rid of all their cards wins.'
    ],
    suitNames: {
      hearts: 'Hearts',
      diamonds: 'Diamonds',
      clubs: 'Clubs',
      spades: 'Spades'
    }
  }
};

export default function App() {
  const {
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
  } = useCrazyEights();

  const [showRules, setShowRules] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const ut = UI_TRANSLATIONS[language];

  useEffect(() => {
    if (winner === 'player') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706']
      });
    }
  }, [winner]);

  // Reset selection when turn changes or hand changes
  useEffect(() => {
    setSelectedCardId(null);
  }, [turn, playerHand.length]);

  const playableCardIds = new Set(
    playerHand.filter(c => {
      if (c.rank === '8') return true;
      return c.suit === activeSuit || c.rank === topCard?.rank;
    }).map(c => c.id)
  );

  const handleCardClick = (card: CardData) => {
    if (turn !== 'player') return;
    if (playableCardIds.has(card.id)) {
      setSelectedCardId(card.id === selectedCardId ? null : card.id);
    }
  };

  const handlePlayClick = () => {
    if (!selectedCardId) return;
    const card = playerHand.find(c => c.id === selectedCardId);
    if (card) {
      playCard(card, true);
      setSelectedCardId(null);
    }
  };

  return (
    <div className="fixed inset-0 felt-gradient flex flex-col font-sans select-none overflow-hidden">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-emerald-900 font-bold">8</div>
          <h1 className="text-xl font-bold tracking-tight">{ut.title}</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest opacity-60">{ut.status}</span>
            <span className="text-sm font-medium">{message}</span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1"
              title="Switch Language"
            >
              <Languages size={20} />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>
            <button 
              onClick={initGame}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title={ut.restart}
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Game Board */}
      <main className="flex-1 relative flex flex-col justify-between py-4">
        
        {/* AI Hand */}
        <div className="relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/30 rounded-full text-[10px] uppercase tracking-widest border border-white/10 z-10">
            {ut.aiOpponent(aiHand.length)}
          </div>
          <Hand cards={aiHand} isPlayer={false} />
        </div>

        {/* Center Area (Deck & Discard) */}
        <div className="flex-1 flex items-center justify-center gap-8 sm:gap-16">
          {/* Draw Pile */}
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className="relative">
              {deck.length > 0 ? (
                <Card 
                  isBack 
                  onClick={() => drawCard(true)} 
                  isPlayable={turn === 'player' && playableCardIds.size === 0}
                />
              ) : (
                <div className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/20 text-xs">
                  Empty
                </div>
              )}
              {deck.length > 1 && (
                <div className="absolute -top-1 -left-1 w-full h-full rounded-lg border border-white/10 card-back -z-10" />
              )}
              {deck.length > 2 && (
                <div className="absolute -top-2 -left-2 w-full h-full rounded-lg border border-white/10 card-back -z-20" />
              )}
            </div>
            <span className="text-xs font-mono opacity-60">{ut.deck(deck.length)}</span>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <AnimatePresence mode="popLayout">
                {topCard && (
                  <Card 
                    key={topCard.id} 
                    card={topCard} 
                    layoutId={topCard.id}
                    className="shadow-2xl"
                    style={{ rotate: (discardPile.length % 10) - 5 }}
                  />
                )}
              </AnimatePresence>
              
              {/* Active Suit Indicator */}
              {activeSuit && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-emerald-800 z-20"
                >
                  <span className={`text-xl ${SUIT_COLORS[activeSuit]}`}>
                    {SUIT_SYMBOLS[activeSuit]}
                  </span>
                </motion.div>
              )}
            </div>
            <span className="text-xs font-mono opacity-60">{ut.discard}</span>
          </div>
        </div>

        {/* Player Hand & Controls */}
        <div className="relative flex flex-col items-center gap-4">
          <AnimatePresence>
            {selectedCardId && turn === 'player' && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={handlePlayClick}
                className="px-8 py-2 bg-yellow-500 text-emerald-900 font-bold rounded-full shadow-lg hover:bg-yellow-400 transition-colors z-30"
              >
                {language === 'zh' ? '出牌' : 'PLAY'}
              </motion.button>
            )}
          </AnimatePresence>

          <div className="w-full relative">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500/20 rounded-full text-[10px] text-yellow-500 uppercase tracking-widest border border-yellow-500/30 z-10">
              {ut.yourHand(playerHand.length)}
            </div>
            <Hand 
              cards={playerHand} 
              isPlayer={true} 
              onCardClick={handleCardClick}
              playableCardIds={playableCardIds}
              selectedCardId={selectedCardId}
            />
          </div>
        </div>
      </main>

      {/* Mobile Message Bar */}
      <div className="md:hidden p-3 bg-black/40 text-center text-sm font-medium border-t border-white/10">
        {message}
      </div>

      {/* Start Screen Overlay */}
      <AnimatePresence>
        {status === 'start-screen' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl relative"
            >
              {/* Rules Button on Start Screen */}
              <button 
                onClick={() => setShowRules(true)}
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white/60 hover:text-white transition-all"
                title={ut.rulesTitle}
              >
                <Info size={24} />
              </button>

              <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center text-emerald-900 font-black text-5xl mx-auto mb-6 shadow-lg shadow-yellow-500/20">8</div>
              <h1 className="text-4xl font-black text-white mb-2 uppercase">{ut.startTitle}</h1>
              <p className="text-zinc-400 mb-8">{ut.startDesc}</p>
              
              <div className="space-y-4">
                <button
                  onClick={initGame}
                  className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-emerald-900 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/10"
                >
                  {ut.startBtn}
                </button>
                <div className="pt-4 grid grid-cols-2 gap-4 text-[10px] uppercase tracking-widest text-zinc-500">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-white font-bold">8 {language === 'zh' ? '张牌' : 'CARDS'}</span>
                    <span>{ut.initialHand}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-white font-bold">{language === 'zh' ? '万能 8' : 'WILD 8'}</span>
                    <span>{ut.changeSuit}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dealing Overlay */}
      <AnimatePresence>
        {status === 'dealing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-900/40 backdrop-blur-sm"
          >
            <div className="relative w-24 h-36">
              <motion.div 
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  y: [0, -10, 0]
                }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-full h-full rounded-lg border border-white/20 card-back shadow-2xl"
              />
              <div className="absolute -top-2 -left-2 w-full h-full rounded-lg border border-white/10 card-back -z-10 opacity-50" />
            </div>
            <motion.p 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-6 text-sm font-bold uppercase tracking-[0.3em] text-white"
            >
              {ut.dealing}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suit Selection Modal */}
      <AnimatePresence>
        {status === 'selecting-suit' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-emerald-900 font-bold text-3xl mx-auto mb-4">8</div>
              <h2 className="text-2xl font-bold mb-2 uppercase">{ut.crazyEightTitle}</h2>
              <p className="text-zinc-400 mb-8">{ut.crazyEightDesc}</p>
              
              <div className="grid grid-cols-2 gap-4">
                {SUITS.map((suit) => {
                  return (
                    <button
                      key={suit}
                      onClick={() => selectSuit(suit)}
                      className="flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                    >
                      <span className={`text-4xl mb-2 group-hover:scale-110 transition-transform ${SUIT_COLORS[suit]}`}>
                        {SUIT_SYMBOLS[suit]}
                      </span>
                      <span className="text-xs uppercase tracking-widest opacity-60">{ut.suitNames[suit]}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {status === 'game-over' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
            >
              {winner === 'player' ? (
                <div className="mb-6">
                  <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center text-emerald-900 mx-auto mb-4">
                    <Trophy size={40} />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-2 uppercase">{ut.victory}</h2>
                  <p className="text-zinc-400">{ut.victoryDesc}</p>
                </div>
              ) : winner === 'ai' ? (
                <div className="mb-6">
                  <div className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 mx-auto mb-4">
                    <AlertCircle size={40} />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-2 uppercase">{ut.defeat}</h2>
                  <p className="text-zinc-400">{ut.defeatDesc}</p>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                    <RefreshCw size={40} />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-2 uppercase">{ut.draw}</h2>
                  <p className="text-zinc-400">{ut.drawDesc}</p>
                </div>
              )}
              
              <button
                onClick={initGame}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-emerald-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                {ut.playAgain}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowRules(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                <Info className="text-yellow-500" />
                {ut.rulesTitle}
              </h2>
              
              <div className="space-y-4 text-zinc-300">
                {ut.rules.map((rule, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-yellow-500 shrink-0 mt-0.5 border border-white/10">
                      {i + 1}
                    </span>
                    <p className="leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowRules(false)}
                className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
              >
                {language === 'zh' ? '我知道了' : 'GOT IT'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Info Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <button 
          onClick={() => setShowRules(true)}
          className="p-3 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 text-white/60 hover:text-white transition-all"
        >
          <Info size={20} />
        </button>
      </div>
    </div>
  );
}
