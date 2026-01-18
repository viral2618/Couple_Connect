'use client'

import QuestionGame from './QuestionGame'
import DareGame from './DareGame'
import TruthOrDareGame from './TruthOrDareGame'
import DesireDecoderGame from './DesireDecoderGame'
import LoveAddictionGame from '../../games/LoveAddiction/LoveAddictionGame'
import SeductiveSecretsGame from '../../games/SeductiveSecrets/SeductiveSecretsGame'

interface GameRendererProps {
  gameRoom: any
  currentGameData: any
  socket: any
  userId: string
  userName: string
}

export default function GameRenderer({ gameRoom, currentGameData, socket, userId, userName }: GameRendererProps) {
  console.log('GameRenderer called with:', { gameRoom, currentGameData })
  
  if (!gameRoom || !currentGameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Waiting for game data...</p>
          <p className="text-xs text-gray-500 mt-2">Room: {gameRoom ? 'Yes' : 'No'}</p>
          <p className="text-xs text-gray-500">Data: {currentGameData ? 'Yes' : 'No'}</p>
        </div>
      </div>
    )
  }

  if (currentGameData.gameType === 'love-addiction') {
    console.log('Rendering Love Addiction with roomId:', gameRoom.id, 'gameRoom:', gameRoom)
    return (
      <LoveAddictionGame 
        socket={socket} 
        roomId={gameRoom.id} 
        players={gameRoom.players} 
        onGameEnd={() => {}} 
        initialGameData={currentGameData}
        gameRoom={gameRoom}
      />
    )
  }

  if (currentGameData.gameType === 'seductive-secrets') {
    console.log('Rendering Seductive Secrets with roomId:', gameRoom.id, 'gameRoom:', gameRoom)
    return (
      <SeductiveSecretsGame 
        socket={socket} 
        roomId={gameRoom.id} 
        players={gameRoom.players} 
        onGameEnd={() => {}} 
        initialGameData={currentGameData}
        gameRoom={gameRoom}
      />
    )
  }

  if (currentGameData.gameType === 'desire-decoder') {
    return <DesireDecoderGame gameRoom={gameRoom} gameData={currentGameData} socket={socket} userId={userId} />
  }

  if (currentGameData.gameType === 'truth-or-dare') {
    return <TruthOrDareGame gameRoom={gameRoom} gameData={currentGameData} socket={socket} userId={userId} />
  }

  if (currentGameData.gameType === 'intimate-dares') {
    return <DareGame gameRoom={gameRoom} gameData={currentGameData} socket={socket} userId={userId} />
  }
  
  return <QuestionGame gameRoom={gameRoom} gameData={currentGameData} socket={socket} userId={userId} />
}