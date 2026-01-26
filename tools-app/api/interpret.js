// API endpoint: /api/interpret
// Takes user task description and optional code, generates a detailed prompt for image generation

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { taskDescription, codeContent, interpreterModel } = req.body;

    if (!taskDescription) {
      return res.status(400).json({ error: "Task description is required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    // Default to Claude Opus 4.5 if not specified
    const model = interpreterModel || "anthropic/claude-opus-4.5";

    const systemPrompt = `You are an expert at creating detailed, professional prompts for academic image generation. Your task is to take a user's high-level description of an academic figure they want to create, and transform it into a comprehensive, detailed prompt that an image generation model can use to create a publication-quality figure.

Your prompts should be:
1. **Rigorous and Professional**: Use precise terminology, proper formatting, and academic standards
2. **Detailed**: Specify exact layouts, components, colors, typography, and visual hierarchies
3. **Structured**: Organize the prompt with clear sections (Layout, Components, Styling, etc.)
4. **Implementation-aware**: If code is provided, extract specific class names, function names, data flows, and relationships to ensure accuracy

Guidelines for the output prompt:
- Describe the overall layout (horizontal/vertical flow, grid structure)
- List each component with exact labels, positions, and connections
- Specify color schemes (use professional academic colors: blues, grays, with accent colors for emphasis)
- Include typography requirements (clean, readable, professional fonts)
- Describe arrows, connections, and data flow directions
- Highlight key innovations or important elements that should stand out
- Request a clean, minimalist style suitable for academic publications
- Specify any mathematical notation or equations that should appear`;

    let userMessage = `Please create a detailed image generation prompt for the following academic figure:

**Task Description:**
${taskDescription}`;

    if (codeContent) {
      userMessage += `

**Related Code (for context and accuracy):**
\`\`\`
${codeContent}
\`\`\`

Please analyze the code to extract:
- Specific component/class/function names
- Data flow and relationships
- Key algorithms or processes
- Any specific terminology used

Use these details to make the prompt accurate and aligned with the actual implementation.`;
    }

    userMessage += `

Please generate a comprehensive, detailed prompt that an image generation model can use to create this figure. The prompt should be self-contained and include all necessary details for creating a professional, publication-ready academic figure.`;

    const requestBody = {
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    };

    console.log("Sending request to OpenRouter with model:", model);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://academic-image-generator.vercel.app",
        "X-Title": "Academic Image Generator",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("OpenRouter response status:", response.status);
    console.log("OpenRouter response:", responseText.substring(0, 1000));

    if (!response.ok) {
      console.error("OpenRouter API error:", responseText);
      return res.status(response.status).json({
        error: "Failed to generate prompt",
        details: responseText,
        model: model,
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({
        error: "Invalid JSON response from API",
        details: responseText.substring(0, 500),
      });
    }

    const generatedPrompt = data.choices?.[0]?.message?.content;

    if (!generatedPrompt) {
      return res.status(500).json({ error: "No prompt generated" });
    }

    return res.status(200).json({
      success: true,
      prompt: generatedPrompt,
      model: model,
      conversationHistory: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
        { role: "assistant", content: generatedPrompt },
      ],
    });
  } catch (error) {
    console.error("Error in interpret endpoint:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
