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
  } catch (error: any) {
    console.error('Analysis failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze website' }, { status: 500 });
  }
}
