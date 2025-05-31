import { console } from 'inspector';
import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('suggest-messages');
    const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction.";

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'OpenAI API key not configured.' }, { status: 500 });
    }
    console.log('apiKey', apiKey);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (response.status === 429) {
      // fallback
      return NextResponse.json({
        success: true,
        message:
          "What's something you've always wanted to try?||If you could live in any fictional world, where would it be?||What's a random fun fact you recently learned?",
        fallback: true,
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ success: false, message: errorData.message }, { status: response.status });
    }

    const data = await response.json();
    const message = data.choices[0].message.content;

    return NextResponse.json({ success: true, message });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown server error';

    return NextResponse.json(
      {
        success: false,
        message: 'Server error',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
