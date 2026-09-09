// This runs on Vercel's server, not in the browser — so the API key stays private.
// Setup: in Vercel, go to Project Settings -> Environment Variables, and add
// ANTHROPIC_API_KEY with your key from console.anthropic.com

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Assistant not configured yet. Add ANTHROPIC_API_KEY in Vercel project settings.",
    });
  }

  try {
    const { prompt } = req.body;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    const reply = (data.content || []).map((b) => b.text || "").join("\n").trim();
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "Assistant request failed" });
  }
}
