/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCrazyEights } from './useCrazyEights';
import { Hand } from './components/Hand';
import { Card } from './components/Card';
import { SUITS, SUIT_SYMBOLS, SUIT_COLORS, Suit } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Info, Trophy, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

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
    playCard,
    drawCard,
    selectSuit,
    initGame,
    topCard,
  } = useCrazyEights();

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

  const playableCardIds = new Set(
    playerHand.filter(c => {
      if (c.rank === '8') return true;
      return c.suit === activeSuit || c.rank === topCard?.rank;
    }).map(c => c.id)
  );

  return (
    <div className="fixed inset-0 felt-gradient flex flex-col font-sans select-none overflow-hidden">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-emerald-900 font-bold">8</div>
          <h1 className="text-xl font-bold tracking-tight">Crazy Eights 202</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest opacity-60">Status</span>
            <span className="text-sm font-medium">{message}</span>
          </div>
          <button 
            onClick={initGame}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Restart Game"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Game Board */}
      <main className="flex-1 relative flex flex-col justify-between py-4">
        
        {/* AI Hand */}
        <div className="relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/30 rounded-full text-[10px] uppercase tracking-widest border border-white/10 z-10">
            AI Opponent ({aiHand.length})
          </div>
          <Hand cards={aiHand} isPlayer={false} />
        </div>

        {/* Center Area (Deck & Discard) */}
        <div className="flex-1 flex items-center justify-center gap-8 sm:gap-16">
          {/* Draw Pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {deck.length > 0 ? (
                <Card 
                  isBack 
                  onClick={() => drawCard(true)} 
                  isPlayable={turn === 'player' && playableCardIds.size === 0}
                  className="hover:rotate-1 transition-transform"
                />
              ) : (
                <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/20">
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
            <span className="text-xs font-mono opacity-60">DECK ({deck.length})</span>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <AnimatePresence mode="popLayout">
                {topCard && (
                  <Card 
                    key={topCard.id} 
                    card={topCard} 
                    className="shadow-2xl"
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
            <span className="text-xs font-mono opacity-60">DISCARD</span>
          </div>
        </div>

        {/* Player Hand */}
        <div className="relative">
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500/20 rounded-full text-[10px] text-yellow-500 uppercase tracking-widest border border-yellow-500/30 z-10">
            Your Hand ({playerHand.length})
          </div>
          <Hand 
            cards={playerHand} 
            isPlayer={true} 
            onCardClick={(card) => playCard(card, true)}
            playableCardIds={playableCardIds}
          />
        </div>
      </main>

      {/* Mobile Message Bar */}
      <div className="sm:hidden p-3 bg-black/40 text-center text-sm font-medium border-t border-white/10">
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
              className="bg-zinc-900 border border-white/10 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center text-emerald-900 font-black text-5xl mx-auto mb-6 shadow-lg shadow-yellow-500/20">8</div>
              <h1 className="text-4xl font-black text-white mb-2">CRAZY EIGHTS</h1>
              <p className="text-zinc-400 mb-8">Match suits or ranks, use wild 8s, and be the first to clear your hand!</p>
              
              <div className="space-y-4">
                <button
                  onClick={initGame}
                  className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-emerald-900 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/10"
                >
                  START GAME
                </button>
                <div className="pt-4 grid grid-cols-2 gap-4 text-[10px] uppercase tracking-widest text-zinc-500">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-white font-bold">8 CARDS</span>
                    <span>INITIAL HAND</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-white font-bold">WILD 8</span>
                    <span>CHANGE SUIT</span>
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
              Shuffling & Dealing...
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
              <h2 className="text-2xl font-bold mb-2">Crazy Eight!</h2>
              <p className="text-zinc-400 mb-8">Choose the new suit for the next player.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {SUITS.map((suit) => (
                  <button
                    key={suit}
                    onClick={() => selectSuit(suit)}
                    className="flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                  >
                    <span className={`text-4xl mb-2 group-hover:scale-110 transition-transform ${SUIT_COLORS[suit]}`}>
                      {SUIT_SYMBOLS[suit]}
                    </span>
                    <span className="text-xs uppercase tracking-widest opacity-60">{suit}</span>
                  </button>
                ))}
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
                  <h2 className="text-4xl font-black text-white mb-2">VICTORY!</h2>
                  <p className="text-zinc-400">You've cleared your hand and outsmarted the AI.</p>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 mx-auto mb-4">
                    <AlertCircle size={40} />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-2">DEFEAT</h2>
                  <p className="text-zinc-400">The AI was faster this time. Don't give up!</p>
                </div>
              )}
              
              <button
                onClick={initGame}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-emerald-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                PLAY AGAIN
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions / Help Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <button className="p-3 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 text-white/60 hover:text-white transition-all">
          <Info size={20} />
        </button>
      </div>
    </div>
  );
}
