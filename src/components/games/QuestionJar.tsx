'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const questions = [
  "What's the most spontaneous thing you've ever done?",
  "If you could have dinner with anyone, dead or alive, who would it be?",
  "What's your biggest fear that you've never told anyone?",
  "What's the best compliment you've ever received?",
  "If you could live anywhere in the world, where would it be?",
  "What's your most embarrassing childhood memory?",
  "What's something you've always wanted to learn but never tried?",
  "What's the weirdest food combination you actually enjoy?",
  "If you could have any superpower, what would it be and why?",
  "What's the most beautiful place you've ever been to?",
  "What's your guilty pleasure that you're actually not guilty about?",
  "What's the best piece of advice you've ever received?",
  "If you could change one thing about yourself, what would it be?",
  "What's your favorite memory from this past year?",
  "What's something that always makes you laugh?",
  "If you could master any skill instantly, what would it be?",
  "What's the most adventurous thing on your bucket list?",
  "What's your biggest pet peeve?",
  "What's something you believed as a child that was completely wrong?",
  "If you could relive one day of your life, which would it be?",
  "What's the strangest dream you've ever had?",
  "What's something you're proud of but don't get to talk about often?",
  "If you could ask your future self one question, what would it be?",
  "What's the most valuable lesson you've learned from a mistake?",
  "What's something that seems normal to others but weird to you?",
  "If you could instantly become an expert in something, what would it be?",
  "What's the most interesting conversation you've had with a stranger?",
  "What's something you do when you're alone that you'd be embarrassed if others saw?",
  "If you could have been born in any other time period, when would it be?",
  "What's the most thoughtful gift you've ever given or received?"
]

export default function QuestionJar() {
  const [gameStarted, setGameStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [usedQuestions, setUsedQuestions] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState(0)
  const [showQuestion, setShowQuestion] = useState(false)

  const startGame = () => {
    setGameStarted(true)
    setUsedQuestions([])
    setQuestionCount(0)
    drawQuestion()
  }

  const drawQuestion = () => {
    const availableQuestions = questions.filter(q => !usedQuestions.includes(q))
    
    if (availableQuestions.length === 0) {
      // Reset if all questions used
      setUsedQuestions([])
      setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)])
    } else {
      const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
      setCurrentQuestion(randomQuestion)
      setUsedQuestions([...usedQuestions, randomQuestion])
    }
    
    setQuestionCount(questionCount + 1)
    setShowQuestion(true)
  }

  const nextQuestion = () => {
    setShowQuestion(false)
    setTimeout(() => {
      drawQuestion()
    }, 300)
  }

  const endGame = () => {
    setGameStarted(false)
    setShowQuestion(false)
    setCurrentQuestion('')
    setUsedQuestions([])
    setQuestionCount(0)
  }

  if (!gameStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="text-6xl mb-4">🏺</div>
        <h2 className="text-3xl font-bold text-gray-800">Question Jar</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Draw random questions from the jar and take turns answering them. 
          Perfect for getting to know each other better!
        </p>

        <div className="bg-rose-50 rounded-xl p-6 max-w-md mx-auto">
          <h3 className="font-semibold text-gray-800 mb-3">How to Play:</h3>
          <ul className="text-left text-gray-600 space-y-2">
            <li>• Take turns drawing questions</li>
            <li>• Answer honestly and openly</li>
            <li>• Ask follow-up questions</li>
            <li>• No judgment zone!</li>
          </ul>
        </div>

        <button
          onClick={startGame}
          className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl font-semibold transition-all"
        >
          🎲 Start Drawing Questions
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="text-4xl mb-2">🏺</div>
        <h2 className="text-2xl font-bold text-gray-800">Question Jar</h2>
        <p className="text-gray-600">Question #{questionCount}</p>
      </div>

      <AnimatePresence mode="wait">
        {showQuestion && (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 90 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-lg border-2 border-rose-200"
          >
            <div className="text-center mb-6">
              <div className="text-3xl mb-4">💭</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Question:</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                {currentQuestion}
              </p>
            </div>

            <div className="bg-rose-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 text-center">
                💡 Take your time to think about your answer. Share as much or as little as you're comfortable with!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={nextQuestion}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition-all"
              >
                🎲 Next Question
              </button>
              <button
                onClick={endGame}
                className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all"
              >
                End Game
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showQuestion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4 animate-bounce">🎲</div>
          <p className="text-gray-600">Drawing your next question...</p>
        </motion.div>
      )}

      <div className="text-center">
        <div className="bg-gray-100 rounded-full p-4 inline-block">
          <p className="text-sm text-gray-600">
            Questions drawn: {questionCount} | Remaining: {questions.length - usedQuestions.length}
          </p>
        </div>
      </div>
    </motion.div>
  )
}