// api/chat.js  -  Vercel serverless function
// The API key lives ONLY here on the server, as an environment variable. Never put it in index.html.

const FREE_PROMPT = `You are the Ember Oak Advisory AI advisor, in FREE mode.
Help with marketing, sales and new business ideas. Keep answers short (under 120 words), practical and clear.
At the end, in one short line, mention that Premium members get deeper analysis and step-by-step plans.
Never give personal investment, financial, legal or tax advice. Never say what to buy or sell, and never promise returns.
If asked about investing, explain it is coming soon and only share general educational information.`;

const PREMIUM_PROMPT = `You are the Ember Oak Advisory AI advisor, in PREMIUM mode, serving a paying member.
Give deep, structured, step-by-step help on marketing, sales, growth strategy, market research summaries and screening new business ideas.
Be specific: give concrete actions, examples, numbers where reasonable, and trade-offs. Be honest, including when an idea is weak.
Never give personal investment, financial, legal or tax advice. Never say what to buy or sell, and never promise returns.
For investing topics, share general education only and say the investing service is coming soon pending licensing.`;

// TEMPORARY in-memory counters. They reset when the server restarts. For real limits use a database (Supabase / Vercel KV).
const freeUsage = globalThis.__freeUsage || (globalThis.__freeUsage = new Map());
const FREE_DAILY_LIMIT = 3;

function isPremium(req) {
  // PLACEHOLDER. Replace with real check: verify the user's login token and that their subscription is active.
  // For now, premium only unlocks if you send the secret TEST_PREMIUM_CODE, so you can test.
  const code = req.headers['x-premium-code'];
  return !!process.env.TEST_PREMIUM_CODE && code === process.env.TEST_PREMIUM_CODE;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ reply: 'Method not allowed' });

  const message = (req.body && req.body.message || '').toString().slice(0, 2000);
  if (!message.trim()) return res.status(400).json({ reply: 'Please type a question.' });

  const premium = isPremium(req);

  if (!premium) {
    const ip = (req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
    const key = ip + ':' + new Date().toISOString().slice(0, 10);
    const used = freeUsage.get(key) || 0;
    if (used >= FREE_DAILY_LIMIT) {
      return res.status(200).json({ reply: 'You have used your 3 free questions for today. Join Premium for the full-power AI and monthly credits.' });
    }
    freeUsage.set(key, used + 1);
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5',
        max_tokens: premium ? 1500 : 350,
        system: premium ? PREMIUM_PROMPT : FREE_PROMPT,
        messages: [{ role: 'user', content: message }]
      })
    });
    if (!r.ok) return res.status(200).json({ reply: 'The advisor is busy right now. Please try again in a moment.' });
    const data = await r.json();
    const text = (data.content && data.content[0] && data.content[0].text) || 'No reply.';
    return res.status(200).json({ reply: text });
  } catch (e) {
    return res.status(200).json({ reply: 'Something went wrong. Please try again.' });
  }
};
