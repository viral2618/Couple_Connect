'use client'

import QuestionGame from './QuestionGame'
import DareGame from './DareGame'

interface TruthOrDareGameProps {
  gameRoom: any
  gameData: any
  socket: any
  userId: string
}

export default function TruthOrDareGame({ gameRoom, gameData, socket, userId }: TruthOrDareGameProps) {
  if (gameData.type === 'truth') {
    return <QuestionGame gameRoom={gameRoom} gameData={gameData} socket={socket} userId={userId} />
  } else {
    return <DareGame gameRoom={gameRoom} gameData={gameData} socket={socket} userId={userId} />
  }
}