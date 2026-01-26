// Simple test endpoint to see raw OpenRouter response
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const model = req.query.model || 'black-forest-labs/flux.2-pro';
  const testPrompt = 'Generate a simple red circle on white background';
  
  const results = {};

  // Test 1: /images/generations endpoint
  try {
    const resp1 = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://academic-image-generator.vercel.app',
        'X-Title': 'Test'
      },
      body: JSON.stringify({
        model: model,
        prompt: testPrompt,
        n: 1,
        size: '512x512'
      })
    });
    const text1 = await resp1.text();
    results.imagesEndpoint = {
      status: resp1.status,
      statusText: resp1.statusText,
      body: text1.substring(0, 2000)
    };
  } catch (e) {
    results.imagesEndpoint = { error: e.message };
  }

  // Test 2: /chat/completions endpoint
  try {
    const resp2 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://academic-image-generator.vercel.app',
        'X-Title': 'Test'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: testPrompt }]
      })
    });
    const text2 = await resp2.text();
    results.chatEndpoint = {
      status: resp2.status,
      statusText: resp2.statusText,
      body: text2.substring(0, 2000)
    };
  } catch (e) {
    results.chatEndpoint = { error: e.message };
  }

  // Test 3: List available models (to verify model IDs)
  try {
    const resp3 = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const models = await resp3.json();
    // Find image-related models
    const imageModels = models.data?.filter(m => 
      m.id.includes('flux') || 
      m.id.includes('dall') || 
      m.id.includes('image') ||
      m.id.includes('sdxl') ||
      m.id.includes('stable')
    ).map(m => ({ id: m.id, name: m.name })).slice(0, 20);
    results.availableImageModels = imageModels;
  } catch (e) {
    results.availableImageModels = { error: e.message };
  }

  return res.status(200).json({
    testedModel: model,
    prompt: testPrompt,
    results: results
  });
}
