export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages, systemPrompt, agentId, agentModel, image } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages is required' });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });
  let finalSystemPrompt = systemPrompt;
  if (agentId === 'busdoor') {
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    try {
      const baseUrl = 'https://influencia50-hub.vercel.app';
      const searchRes = await fetch(`${baseUrl}/api/busdoor-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: lastUserMessage }),
      });
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.total > 0) {
          const linhasTexto = searchData.linhas.map(l => {
            const linha = l.linha ? `Linha ${l.linha} — ` : '';
            return `${linha}${l.destino} (Regiao ${l.zona})\nItinerario: ${l.itinerario.substring(0, 300)}...`;
          }).join('\n\n');
          finalSystemPrompt = `${systemPrompt}\n\nDADOS REAIS DAS LINHAS ENCONTRADAS (${searchData.total} linhas relevantes):\n\n${linhasTexto}\n\nUse esses dados reais. Mencione numeros das linhas, origens, destinos e regioes. Calcule impactos usando 8.500 impactos/dia por onibus.`;
        }
      }
    } catch (e) { console.error('RAG error:', e); }
  }
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      // Adiciona imagem na última mensagem se existir
      let apiMessages = [...messages];
      if (image && apiMessages.length > 0) {
        const last = apiMessages[apiMessages.length - 1];
        if (last.role === 'user') {
          apiMessages[apiMessages.length - 1] = {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: image.type, data: image.data } },
              { type: 'text', text: last.content }
            ]
          };
        }
      }
      body: JSON.stringify({ model: agentModel || 'claude-haiku-4-5-20251001', max_tokens: 4096, system: finalSystemPrompt, messages: apiMessages }),
    });
    if (!response.ok) { const error = await response.json(); return res.status(response.status).json({ error: error.message }); }
    const data = await response.json();
    return res.status(200).json({ success: true, message: data.content[0].text, usage: data.usage });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
