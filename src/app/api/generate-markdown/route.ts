import { NextResponse } from 'next/server';
import { generateMarkdown } from '@/lib/generator/markdown';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data || !data.metadata) {
      return new NextResponse('Invalid data', { status: 400 });
    }

    const markdown = generateMarkdown(data);

    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'attachment; filename="design.md"',
      },
    });
  } catch (error: any) {
    console.error('Markdown generation failed:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
