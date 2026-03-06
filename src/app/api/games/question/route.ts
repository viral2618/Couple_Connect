import { NextRequest, NextResponse } from 'next/server';
import { aiQuestionService } from '@/games/services/aiQuestionService';
import { AIQuestionRequest } from '@/games/types/gameTypes';

export async function POST(request: NextRequest) {
  try {
    const body: AIQuestionRequest = await request.json();
    
    if (!body.gameType || !body.category || !body.playerNames) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const question = await aiQuestionService.generateQuestion(body);
    
    return NextResponse.json(question);
  } catch (error) {
    console.error('AI question generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    );
  }
}
