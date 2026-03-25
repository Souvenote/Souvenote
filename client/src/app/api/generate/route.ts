import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const MAX_OUTPUTS_PER_USER = 20_000;

const usageCounts = new Map<string, number>();

function getUserId(request: NextRequest): string {
    return request.headers.get('x-user-id') ?? 'anonymous';
}

export async function POST(request: NextRequest) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'OpenAI API key not configured' },
            { status: 500 },
        );
    }

    const userId = getUserId(request);
    const currentCount = usageCounts.get(userId) ?? 0;

    if (currentCount >= MAX_OUTPUTS_PER_USER) {
        return NextResponse.json(
            { error: 'You have reached your generation limit (20,000). Please contact support.' },
            { status: 429 },
        );
    }

    const body = await request.json();
    const { prompt, type } = body as { prompt: string; type: 'caption' | 'message' };

    if (!prompt || !type) {
        return NextResponse.json(
            { error: 'Missing prompt or type' },
            { status: 400 },
        );
    }

    const systemPrompt =
        type === 'caption'
            ? 'You are a creative greeting card caption generator. Generate short, punchy captions for greeting cards based on the user\'s idea. Keep each suggestion to one sentence. Provide 3 options separated by newlines.'
            : 'You are a heartfelt greeting card message writer. Generate warm, personal messages for inside greeting cards based on the user\'s idea. Keep each suggestion to 2-3 sentences. Provide 3 options separated by newlines.';

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.8,
    });

    const result = completion.choices[0]?.message?.content ?? '';

    usageCounts.set(userId, currentCount + 1);

    return NextResponse.json({
        result,
        remainingOutputs: MAX_OUTPUTS_PER_USER - (currentCount + 1),
    });
}
