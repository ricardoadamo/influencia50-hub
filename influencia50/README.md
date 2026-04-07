# Influência 5.0 — Hub de Agentes

## Deploy em 5 minutos

### 1. Suba no GitHub
- Crie um repositório novo (ex: `influencia50-hub`)
- Faça upload de todos os arquivos desta pasta

### 2. Deploy no Vercel
- Acesse vercel.com e conecte seu GitHub
- Importe o repositório
- Em **Environment Variables**, adicione:
  - Nome: `ANTHROPIC_API_KEY`
  - Valor: sua chave da API da Anthropic
- Clique em Deploy

### 3. Pronto
Seu hub estará em: `influencia50-hub.vercel.app`

---

## Como adicionar novos agentes

Abra o arquivo `public/index.html` e localize o array `agents`.
Copie um bloco existente e adicione no final:

```javascript
{
  num: "04",
  name: "NOME DO AGENTE",
  desc: "Descrição curta do que ele faz.",
  welcome: "Mensagem de boas-vindas do agente.",
  prompt: `Seu prompt completo aqui.`
}
```

Salve e o Vercel faz o deploy automático.
