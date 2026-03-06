import { NextRequest, NextResponse } from 'next/server';
import { aiQuestionService } from '@/games/services/aiQuestionService';
import { AIQuestionRequest } from '@/games/types/gameTypes';

export async function POST(request: NextRequest) {
  try {
    const body: AIQuestionRequest = await request.json();
    
    if (!body.gameType || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use instant question generation for better performance
    const question = aiQuestionService.getInstantQuestion(body.gameType, body.category);
    
    return NextResponse.json(question);
  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    );
  }
}
