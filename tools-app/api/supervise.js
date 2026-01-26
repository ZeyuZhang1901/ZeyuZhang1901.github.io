// API endpoint: /api/supervise
// Analyzes generated image with user feedback and creates refinement prompt

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
      userFeedback, 
      conversationHistory, 
      originalTask,
      iterationNumber,
      interpreterModel 
    } = req.body;

    if (!userFeedback && !imageBase64) {
      return res.status(400).json({ error: 'Either image or feedback is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Default to Claude Opus 4.5 if not specified
    const model = interpreterModel || 'anthropic/claude-opus-4.5';

    const systemPrompt = `You are an expert academic figure supervisor with extremely high standards for publication-quality visuals. Your task is to analyze generated academic figures and provide detailed refinement prompts.

**CRITICAL: You must be PROACTIVE in finding errors.** The user's feedback is often incomplete - they may miss many issues. You MUST independently and thoroughly examine every single detail of the image, even if the user doesn't mention it. Do NOT rely solely on user feedback.

Your analysis should be:
1. **Exhaustive**: Check EVERY detail independently - don't wait for the user to point out problems
2. **Rigorous**: Scrutinize text accuracy, equation correctness, label consistency, spelling
3. **Professional**: Apply the highest standards expected at top-tier academic venues (NeurIPS, ICML, Nature, Science)
4. **Comprehensive**: Examine layout, typography, colors, connections, and overall clarity
5. **Critical**: Assume there ARE errors until proven otherwise - actively search for problems

**You MUST check for these common issues (even if user doesn't mention them):**

TEXT & LABELS:
- Spelling errors in any text
- Inconsistent terminology (e.g., using different names for the same concept)
- Missing labels or incomplete labels
- Duplicate labels or numbering (e.g., "c1, c2, c1" appearing twice)
- Text that is too small, blurry, or hard to read
- Labels that don't match the original task description

MATHEMATICAL NOTATION:
- Incomplete equations (missing parts like denominators, absolute value signs)
- Wrong mathematical symbols
- Inconsistent notation (e.g., using both φ and ϕ for the same variable)
- Equations that don't match the formulas described in the task

VISUAL ELEMENTS:
- Arrows pointing in wrong directions
- Missing connections between components
- Inconsistent color coding
- Poor visual hierarchy (important elements not emphasized)
- Cluttered or unbalanced layout
- Elements that overlap or are misaligned

ACCURACY:
- Components that don't match the described pipeline/architecture
- Missing phases or steps from the original description
- Incorrect flow or sequence
- Elements that contradict the task description

After the user provides feedback, you should:
1. Address ALL points the user mentioned
2. ALSO find additional issues the user missed
3. Be thorough - the user's feedback is just a starting point, not a complete list

You should follow the user's requirements rigorously and find ALL places that need improvement, whether mentioned by the user or not.`;

    // Build the conversation messages
    let messages = [];
    
    // Add system prompt
    messages.push({ role: 'system', content: systemPrompt });

    // Add conversation history if provided (to maintain context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Filter out system messages as we've already added our own
      const filteredHistory = conversationHistory.filter(msg => msg.role !== 'system');
      messages = messages.concat(filteredHistory);
    }

    // Build the supervision request
    let userMessage = `**Iteration ${iterationNumber || 1} - Image Analysis Request**

Please carefully analyze the generated image with a critical, professional eye. Think deeply about the original task requirements and evaluate every detail.

**Original Task:**
${originalTask || 'Not provided'}

**User Feedback:**
${userFeedback || 'No specific feedback provided - please analyze the image thoroughly.'}`;

    // If image is provided, include it in the message
    if (imageBase64) {
      messages.push({
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
      });
    } else {
      messages.push({ role: 'user', content: userMessage });
    }

    // Add instruction for output format
    const outputInstruction = `
Based on your THOROUGH and INDEPENDENT analysis (not just the user's feedback), please provide:

1. **What Works Well** (bullet points)

2. **Issues Found by User** (address each point from user feedback)

3. **Additional Issues Found by Supervisor** (issues YOU found that user didn't mention - BE THOROUGH)
   - This section is CRITICAL - you must actively search for problems
   - Check every piece of text, every label, every equation, every arrow
   - Don't assume the image is correct just because the user didn't complain

4. **Complete Issues Table** (ALL issues combined - both user-reported and self-discovered)
   | Issue | Problem | Fix |
   |-------|---------|-----|
   
5. **Refinement Prompt** - A complete, detailed prompt for the image generation model to create an improved version. This prompt should:
   - Start with "Refine this academic figure with the following corrections:"
   - Mark critical fixes with **CRITICAL:** prefix
   - List ALL corrections (from both user feedback AND your own analysis)
   - Specify exactly what text/labels/equations should say
   - Describe what to KEEP from the current version
   - Include professional academic styling requirements
   - Be self-contained so the image generator can use it directly

Format the refinement prompt clearly so it can be directly used for the next iteration.`;

    messages.push({ role: 'user', content: outputInstruction });

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
        temperature: 0.5,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return res.status(response.status).json({ error: 'Failed to analyze image', details: error });
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content;

    if (!analysis) {
      return res.status(500).json({ error: 'No analysis generated' });
    }

    // Extract the refinement prompt from the analysis
    // Look for common patterns that indicate the refinement prompt section
    let refinementPrompt = analysis;
    const promptMarkers = [
      '**Refinement Prompt**',
      '## Refinement Prompt',
      '### Refinement Prompt',
      'Refinement Prompt:',
      '**REFINEMENT PROMPT**'
    ];

    for (const marker of promptMarkers) {
      const markerIndex = analysis.indexOf(marker);
      if (markerIndex !== -1) {
        refinementPrompt = analysis.substring(markerIndex + marker.length).trim();
        break;
      }
    }

    // Update conversation history
    const updatedHistory = [...(conversationHistory || [])];
    updatedHistory.push({ role: 'user', content: userMessage });
    updatedHistory.push({ role: 'assistant', content: analysis });

    return res.status(200).json({
      success: true,
      analysis: analysis,
      refinementPrompt: refinementPrompt,
      model: model,
      conversationHistory: updatedHistory
    });

  } catch (error) {
    console.error('Error in supervise endpoint:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
