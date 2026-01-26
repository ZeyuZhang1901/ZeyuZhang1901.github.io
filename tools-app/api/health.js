// Simple health check endpoint
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    apiKey: process.env.OPENROUTER_API_KEY ? "configured" : "NOT SET",
  });
}
