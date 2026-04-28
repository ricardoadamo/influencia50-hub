export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, systemPrompt } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages is required and must be an array' });
  }

  if (!systemPrompt || typeof systemPrompt !== 'string') {
    return res.status(400).json({ error: 'systemPrompt is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API error:', error);
      return res.status(response.status).json({ error: error.message || 'Claude API error' });
    }

    const data = await response.json();
    const content = data.content[0].text;

    return res.status(200).json({
      success: true,
      message: content,
      usage: data.usage,
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
