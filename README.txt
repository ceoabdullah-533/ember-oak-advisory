EMBER OAK ADVISORY - HOW TO GO LIVE (FREE ON VERCEL)

Files:
  index.html     the website
  api/chat.js    the AI advisor server function
  package.json   tells Vercel this is a project

STEPS
1. Get an Anthropic API key at console.anthropic.com (API usage costs money, add a small credit like 5 dollars to start).
2. Make a free account at vercel.com and at github.com.
3. Upload this whole folder to a new GitHub repository.
4. In Vercel click Add New > Project > pick that repository > Deploy.
5. In Vercel go to Project > Settings > Environment Variables and add:
     ANTHROPIC_API_KEY   = your key
     TEST_PREMIUM_CODE   = any secret word, for testing premium mode only
6. Redeploy. Open your free address and ask the advisor a question.

BEFORE REAL CUSTOMERS
- Replace your@email.com and the WhatsApp number in index.html.
- Remove the "Preview member mode" link in index.html.
- Add real login + payment, then make isPremium() in api/chat.js check the real subscription.
- Replace the in-memory free counter with a database so limits can not be bypassed.
- Add Terms, Privacy and Refund pages.
