import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RECRAFT_API_TOKEN;
    if (!apiKey) {
      return NextResponse.json({ error: 'Recraft API token not configured' }, { status: 500 });
    }

    const contentType = req.headers.get('content-type') || '';
    
    // Handle Multipart FormData (Image to Image or custom)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const prompt = formData.get('prompt') as string;
      const negativePrompt = formData.get('negative_prompt') as string | null;
      const image = formData.get('image') as File | null;

      if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
      }

      if (image) {
        // IMAGE TO IMAGE REQUEST
        const recraftForm = new FormData();
        recraftForm.append('image', image);
        recraftForm.append('prompt', prompt);
        recraftForm.append('strength', '0.6'); // Give it enough strength to adopt the prompt style while keeping composition
        recraftForm.append('model', 'recraftv3');
        recraftForm.append('response_format', 'url');
        if (negativePrompt) {
            recraftForm.append('negative_prompt', negativePrompt);
        }

        const response = await fetch('https://external.api.recraft.ai/v1/images/imageToImage', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: recraftForm,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Recraft Image2Image error:', errorData);
          return NextResponse.json({ error: 'Failed to generate variation from Recraft' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ url: data.data[0].url });
      } else {
        // Fallback if formData is sent without image
        const response = await fetch('https://external.api.recraft.ai/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            prompt,
            model: 'recraftv3',
            response_format: 'url',
            ...(negativePrompt && { negative_prompt: negativePrompt })
          }),
        });

        const data = await response.json();
        return NextResponse.json({ url: data.data[0].url });
      }
    }

    // Handle Standard JSON Generation
    const body = await req.json();
    const { prompt, style = 'digital_illustration', negative_prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await fetch('https://external.api.recraft.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        model: 'recraftv3',
        style,
        response_format: 'url',
        ...(negative_prompt && { negative_prompt })
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Recraft API error:', errorData);
      return NextResponse.json({ error: 'Failed to generate image from Recraft' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ url: data.data[0].url });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
