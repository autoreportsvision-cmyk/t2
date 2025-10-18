
import {NextRequest, NextResponse} from 'next/server';
import {generatePremiumTeaser} from '@/ai/flows/generate-premium-teaser';
import type {GeneratePremiumTeaserInput} from '@/ai/flows/generate-premium-teaser';

export async function POST(req: NextRequest) {
  try {
    const body: GeneratePremiumTeaserInput = await req.json();
    if (!body.effectsSummary) {
      return NextResponse.json(
        {error: 'Parâmetros inválidos.'},
        {status: 400}
      );
    }

    const teaser = await generatePremiumTeaser(body);
    return NextResponse.json({success: true, data: teaser});
  } catch (error: any) {
    // Don't log to console, this is an optional feature
    const errorMessage = error.message || 'Falha ao gerar o teaser.';
    return NextResponse.json(
      {success: false, error: errorMessage},
      {status: 500}
    );
  }
}
