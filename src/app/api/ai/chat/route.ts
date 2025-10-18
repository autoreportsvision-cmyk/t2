
import {NextRequest, NextResponse} from 'next/server';
import {chat} from '@/ai/flows/chat-flow';

export async function POST(req: NextRequest) {
  try {
    const {message, processData} = await req.json();
    if (!message || !processData) {
      return NextResponse.json(
        {error: 'Parâmetros inválidos.'},
        {status: 400}
      );
    }

    const response = await chat({message, processData});
    return NextResponse.json({success: true, data: response});
  } catch (error: any) {
    console.error('Error in chat API:', error);
    const errorMessage = error.message || 'Falha ao obter resposta do chat.';
    return NextResponse.json(
      {success: false, error: errorMessage},
      {status: 500}
    );
  }
}
