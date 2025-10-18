
import {NextRequest, NextResponse} from 'next/server';
import {generateEffectEvaluations} from '@/ai/flows/generate-effect-evaluations';
import type {GenerateEffectEvaluationsInput} from '@/ai/flows/generate-effect-evaluations';

export async function POST(req: NextRequest) {
  try {
    const body: GenerateEffectEvaluationsInput = await req.json();
    if (!body.effects || !body.overallSummary || !body.prompt) {
      return NextResponse.json(
        {error: 'Parâmetros inválidos.'},
        {status: 400}
      );
    }

    const evaluations = await generateEffectEvaluations(body);
    return NextResponse.json({success: true, data: evaluations});
  } catch (error: any) {
    console.error('Error in evaluations API:', error);
    const errorMessage =
      error.message || 'Falha ao gerar avaliações de IA.';
    return NextResponse.json(
      {success: false, error: errorMessage},
      {status: 500}
    );
  }
}
