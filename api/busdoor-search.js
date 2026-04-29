import linhas from '../data/busdoor_linhas.json' with { type: 'json' };
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'query is required' });
  const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').trim();
  const queryNorm = normalize(query);
  const queryTerms = queryNorm.split(/\s+/).filter(t => t.length > 2);
  const matches = linhas.map(linha => {
    const searchText = normalize(`${linha.destino} ${linha.itinerario} ${linha.zona} ${linha.cidade}`);
    const score = queryTerms.reduce((acc, term) => acc + (searchText.match(new RegExp(term, 'g')) || []).length, 0);
    return { ...linha, score };
  }).filter(l => l.score > 0).sort((a, b) => b.score - a.score).slice(0, 15);
  return res.status(200).json({ total: matches.length, linhas: matches.map(({ score, ...l }) => l) });
}
