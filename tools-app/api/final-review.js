// API endpoint: /api/final-review
// Provides final evaluation of the generated image

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      imageBase64, 
      originalTask,
      conversationHistory,
      totalIterations,
      interpreterModel 
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Final image is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Default to Claude Opus 4.5 if not specified
    const model = interpreterModel || 'anthropic/claude-opus-4.5';

    const systemPrompt = `You are a senior academic reviewer evaluating figures for publication in top-tier venues. You have extremely high standards and provide thorough, constructive evaluations.

Your evaluation should assess the figure against publication standards expected at venues like NeurIPS, ICML, Nature, Science, or similar top-tier publications.`;

    const userMessage = `**FINAL IMAGE REVIEW**

This is the final version of an academic figure after ${totalIterations || 1} iteration(s) of refinement. Please provide a comprehensive evaluation.

**Original Task:**
${originalTask || 'Not provided'}

Please evaluate this final image based on the following criteria:

## Evaluation Criteria

### 1. Requirements Fulfillment (Does it meet all the user's requirements?)
- Check if all requested components are present
- Verify the figure accurately represents the described concept
- Ensure all specific requests from the original task are addressed

### 2. Academic Rigor and Professionalism
- Is the figure suitable for publication in a top-tier academic venue?
- Does it follow academic conventions for the field?
- Is the visual style professional and consistent?

### 3. Accuracy and Correctness
- Are all labels, text, and terminology correct?
- Are any equations or mathematical notation accurate and complete?
- Are there any spelling errors or inconsistencies?

### 4. Visual Clarity and Reader-Friendliness
- Can a reader understand the figure at a glance?
- Is the visual hierarchy clear?
- Is the color scheme effective and accessible?
- Is the layout well-organized and balanced?

## Output Format

Please provide your evaluation in the following format:

### Overall Assessment
[Brief 2-3 sentence summary]

### Scores (1-10)
- Requirements Fulfillment: X/10
- Academic Rigor: X/10
- Accuracy: X/10
- Visual Clarity: X/10
- **Overall Score: X/10**

### Strengths
[Bullet points of what works well]

### Areas for Improvement
[Bullet points of what could be better]

### Specific Recommendations
[Concrete, actionable suggestions for further improvement if needed]

### Publication Readiness
[State whether the figure is ready for publication as-is, needs minor revisions, or needs major revisions]`;

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userMessage
          },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`
            }
          }
        ]
      }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://academic-image-generator.vercel.app',
        'X-Title': 'Academic Image Generator'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return res.status(response.status).json({ error: 'Failed to generate review', details: error });
    }

    const data = await response.json();
    const review = data.choices[0]?.message?.content;

    if (!review) {
      return res.status(500).json({ error: 'No review generated' });
    }

    // Parse scores from the review
    // Handle various formats: "9/10", "**9/10**", "9 / 10", "**9**/10"
    const scores = {};
    const scorePatterns = [
      { key: 'requirements', pattern: /Requirements\s*Fulfillment[:\s]*\**(\d+(?:\.\d+)?)\**\s*\/\s*10/i },
      { key: 'rigor', pattern: /Academic\s*Rigor[:\s]*\**(\d+(?:\.\d+)?)\**\s*\/\s*10/i },
      { key: 'accuracy', pattern: /Accuracy[:\s]*\**(\d+(?:\.\d+)?)\**\s*\/\s*10/i },
      { key: 'clarity', pattern: /Visual\s*Clarity[:\s]*\**(\d+(?:\.\d+)?)\**\s*\/\s*10/i },
      { key: 'overall', pattern: /Overall\s*Score[:\s]*\**(\d+(?:\.\d+)?)\**\s*\/\s*10/i }
    ];

    for (const { key, pattern } of scorePatterns) {
      const match = review.match(pattern);
      if (match) {
        scores[key] = parseFloat(match[1]);
      }
    }

    console.log('Parsed scores:', scores);

    // Determine publication readiness
    let publicationReadiness = 'unknown';
    if (review.toLowerCase().includes('ready for publication as-is')) {
      publicationReadiness = 'ready';
    } else if (review.toLowerCase().includes('minor revisions')) {
      publicationReadiness = 'minor_revisions';
    } else if (review.toLowerCase().includes('major revisions')) {
      publicationReadiness = 'major_revisions';
    }

    return res.status(200).json({
      success: true,
      review: review,
      scores: scores,
      publicationReadiness: publicationReadiness,
      model: model
    });

  } catch (error) {
    console.error('Error in final-review endpoint:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
