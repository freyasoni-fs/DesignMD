import { NextResponse } from 'next/server';
import { analyzeWebsite } from '@/lib/analyzer/crawler';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    const designSystem = await analyzeWebsite(url);

    return NextResponse.json(designSystem);
  } catch (error: unknown) {
    console.error('Analysis failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to analyze website';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
