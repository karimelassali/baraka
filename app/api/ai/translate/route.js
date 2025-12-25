
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { text, targetLanguage } = await req.json();

        if (!text || !targetLanguage) {
            return NextResponse.json(
                { error: 'Missing defined parameters: text and targetLanguage are required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY is not configured' },
                { status: 500 }
            );
        }

        // Prepare the prompt
        // We want a direct translation, preserving meaning but adapting to the target language natural flow.
        const prompt = `Translate the following SMS message to ${targetLanguage}. Keep the tone professional but engaging. Do not add any explanations, just return the translated text.
    
    Message: "${text}"`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API Error:', data);
            return NextResponse.json(
                { error: 'Failed to translate text', details: data },
                { status: response.status }
            );
        }

        const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!translatedText) {
            return NextResponse.json(
                { error: 'No translation returned from AI' },
                { status: 500 }
            );
        }

        return NextResponse.json({ translatedText: translatedText.trim() });

    } catch (error) {
        console.error('Translation Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
