'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Statement {
  text: string
  isLie: boolean
}

interface Player {
  name: string
  statements: Statement[]
  score: number
}

export default function TwoTruthsOneLie() {
  const [gamePhase, setGamePhase] = useState<'setup' | 'player1-input' | 'player2-input' | 'player1-guess' | 'player2-guess' | 'results'>('setup')
  const [players, setPlayers] = useState<Player[]>([
    { name: '', statements: [], score: 0 },
    { name: '', statements: [], score: 0 }
  ])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [currentStatements, setCurrentStatements] = useState<string[]>(['', '', ''])
  const [selectedLie, setSelectedLie] = useState<number | null>(null)
  const [guess, setGuess] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [round, setRound] = useState(1)

  const handleSetupComplete = (player1Name: string, player2Name: string) => {
    setPlayers([
      { name: player1Name, statements: [], score: 0 },
      { name: player2Name, statements: [], score: 0 }
    ])
    setGamePhase('player1-input')
  }

  const handleStatementsSubmit = () => {
    if (currentStatements.some(s => !s.trim()) || selectedLie === null) return

    const statements: Statement[] = currentStatements.map((text, index) => ({
      text: text.trim(),
      isLie: index === selectedLie
    }))

    const updatedPlayers = [...players]
    updatedPlayers[currentPlayer].statements = statements
    setPlayers(updatedPlayers)

    setCurrentStatements(['', '', ''])
    setSelectedLie(null)

    if (currentPlayer === 0) {
      setCurrentPlayer(1)
      setGamePhase('player2-input')
    } else {
      setCurrentPlayer(0)
      setGamePhase('player1-guess')
    }
  }

  const handleGuess = (guessIndex: number) => {
    setGuess(guessIndex)
    setShowResult(true)

    const isCorrect = players[1 - currentPlayer].statements[guessIndex].isLie
    if (isCorrect) {
      const updatedPlayers = [...players]
      updatedPlayers[currentPlayer].score += 1
      setPlayers(updatedPlayers)
    }

    setTimeout(() => {
      setShowResult(false)
      setGuess(null)

      if (gamePhase === 'player1-guess') {
        setCurrentPlayer(1)
        setGamePhase('player2-guess')
      } else {
        if (round < 3) {
          setRound(round + 1)
          setCurrentPlayer(0)
          setGamePhase('player1-input')
        } else {
          setGamePhase('results')
        }
      }
    }, 3000)
  }

  const resetGame = () => {
    setGamePhase('setup')
    setPlayers([
      { name: '', statements: [], score: 0 },
      { name: '', statements: [], score: 0 }
    ])
    setCurrentPlayer(0)
    setCurrentStatements(['', '', ''])
    setSelectedLie(null)
    setGuess(null)
    setShowResult(false)
    setRound(1)
  }

  if (gamePhase === 'setup') {
    return <SetupPhase onComplete={handleSetupComplete} />
  }

  if (gamePhase === 'player1-input' || gamePhase === 'player2-input') {
    return (
      <InputPhase
        playerName={players[currentPlayer].name}
        statements={currentStatements}
        selectedLie={selectedLie}
        round={round}
        onStatementsChange={setCurrentStatements}
        onLieSelect={setSelectedLie}
        onSubmit={handleStatementsSubmit}
      />
    )
  }

  if (gamePhase === 'player1-guess' || gamePhase === 'player2-guess') {
    return (
      <GuessPhase
        guesserName={players[currentPlayer].name}
        targetName={players[1 - currentPlayer].name}
        statements={players[1 - currentPlayer].statements}
        guess={guess}
        showResult={showResult}
        round={round}
        onGuess={handleGuess}
      />
    )
  }

  if (gamePhase === 'results') {
    return <ResultsPhase players={players} onPlayAgain={resetGame} />
  }

  return null
}

function SetupPhase({ onComplete }: { onComplete: (p1: string, p2: string) => void }) {
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="text-6xl mb-4">🎭</div>
      <h2 className="text-3xl font-bold text-gray-800">Two Truths and a Lie</h2>
      <p className="text-gray-600 max-w-md mx-auto">
        Each player will share three statements - two truths and one lie. 
        Can you guess which one is the lie?
      </p>

      <div className="space-y-4 max-w-sm mx-auto">
        <input
          type="text"
          placeholder="Player 1 Name"
          value={player1}
          onChange={(e) => setPlayer1(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Player 2 Name"
          value={player2}
          onChange={(e) => setPlayer2(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />
        <button
          onClick={() => onComplete(player1, player2)}
          disabled={!player1.trim() || !player2.trim()}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-all"
        >
          Start Game
        </button>
      </div>
    </motion.div>
  )
}

function InputPhase({
  playerName,
  statements,
  selectedLie,
  round,
  onStatementsChange,
  onLieSelect,
  onSubmit
}: {
  playerName: string
  statements: string[]
  selectedLie: number | null
  round: number
  onStatementsChange: (statements: string[]) => void
  onLieSelect: (index: number) => void
  onSubmit: () => void
}) {
  const updateStatement = (index: number, value: string) => {
    const newStatements = [...statements]
    newStatements[index] = value
    onStatementsChange(newStatements)
  }

  const canSubmit = statements.every(s => s.trim()) && selectedLie !== null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="text-4xl mb-2">✍️</div>
        <h2 className="text-2xl font-bold text-gray-800">{playerName}'s Turn</h2>
        <p className="text-gray-600">Round {round} - Write your statements</p>
      </div>

      <div className="bg-rose-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4">
          Write 3 statements about yourself (2 truths, 1 lie):
        </h3>
        
        <div className="space-y-4">
          {statements.map((statement, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Statement {index + 1}:</span>
                <button
                  onClick={() => onLieSelect(index)}
                  className={`px-2 py-1 text-xs rounded-full transition-all ${
                    selectedLie === index
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                  }`}
                >
                  {selectedLie === index ? 'This is the LIE' : 'Mark as lie'}
                </button>
              </div>
              <textarea
                value={statement}
                onChange={(e) => updateStatement(index, e.target.value)}
                placeholder="Write an interesting statement about yourself..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-all"
      >
        Submit Statements
      </button>
    </motion.div>
  )
}

function GuessPhase({
  guesserName,
  targetName,
  statements,
  guess,
  showResult,
  round,
  onGuess
}: {
  guesserName: string
  targetName: string
  statements: Statement[]
  guess: number | null
  showResult: boolean
  round: number
  onGuess: (index: number) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="text-4xl mb-2">🤔</div>
        <h2 className="text-2xl font-bold text-gray-800">{guesserName}'s Turn</h2>
        <p className="text-gray-600">Round {round} - Which statement is {targetName}'s lie?</p>
      </div>

      <div className="space-y-4">
        {statements.map((statement, index) => (
          <motion.button
            key={index}
            onClick={() => !showResult && onGuess(index)}
            disabled={showResult}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
              guess === index
                ? showResult
                  ? statement.isLie
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-red-500 bg-red-50 text-red-800'
                  : 'border-rose-500 bg-rose-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            whileHover={!showResult ? { scale: 1.02 } : {}}
            whileTap={!showResult ? { scale: 0.98 } : {}}
          >
            <div className="flex items-start gap-3">
              <span className="bg-gray-100 text-gray-600 text-sm rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                {index + 1}
              </span>
              <p className="text-gray-800">{statement.text}</p>
            </div>
            
            {showResult && guess === index && (
              <div className="mt-2 text-sm font-medium">
                {statement.isLie ? '✅ Correct! This was the lie!' : '❌ Wrong! This was actually true.'}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center bg-gray-50 rounded-xl p-4"
          >
            <p className="text-gray-600">
              {guess !== null && statements[guess].isLie
                ? '🎉 Great guess! Moving to next round...'
                : '😅 Better luck next time! Moving to next round...'
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ResultsPhase({ players, onPlayAgain }: { players: Player[], onPlayAgain: () => void }) {
  const winner = players[0].score > players[1].score ? players[0] : 
                 players[1].score > players[0].score ? players[1] : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="text-6xl mb-4">🏆</div>
      <h2 className="text-3xl font-bold text-gray-800">Game Complete!</h2>
      
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Final Scores</h3>
        <div className="space-y-3">
          {players.map((player, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-3 rounded-lg ${
                winner && player.name === winner.name ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-50'
              }`}
            >
              <span className="font-medium text-gray-800">
                {winner && player.name === winner.name && '👑 '}{player.name}
              </span>
              <span className="text-2xl font-bold text-rose-500">{player.score}/3</span>
            </div>
          ))}
        </div>
      </div>

      {winner ? (
        <p className="text-lg text-gray-600">
          🎉 Congratulations {winner.name}! You're the lie detection champion!
        </p>
      ) : (
        <p className="text-lg text-gray-600">
          🤝 It's a tie! You both know each other equally well!
        </p>
      )}

      <div className="space-y-3">
        <button
          onClick={onPlayAgain}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition-all"
        >
          🔄 Play Again
        </button>
      </div>
    </motion.div>
  )
}