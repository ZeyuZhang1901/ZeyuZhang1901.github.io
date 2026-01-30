// API endpoint: /api/supervise
// Two-phase supervisor: Structural Analysis + Operation Generation
// Phase A: Analyze image structure and identify issues
// Phase B: Translate user feedback + generate modification script

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
    const {
      imageBase64,
      userFeedback,
      conversationHistory,
      originalTask,
      iterationNumber,
      interpreterModel,
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Image is required for supervision" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const model = interpreterModel || "anthropic/claude-opus-4";

    // =========================================================================
    // PHASE A: STRUCTURAL ANALYSIS
    // =========================================================================

    const phaseAResult = await runPhaseA(apiKey, model, imageBase64, originalTask);

    if (!phaseAResult.success) {
      return res.status(500).json({
        error: "Phase A failed",
        details: phaseAResult.error,
      });
    }

    // =========================================================================
    // PHASE B: OPERATION GENERATION
    // =========================================================================

    const phaseBResult = await runPhaseB(
      apiKey,
      model,
      phaseAResult.inventory,
      userFeedback,
      originalTask,
      iterationNumber
    );

    if (!phaseBResult.success) {
      return res.status(500).json({
        error: "Phase B failed",
        details: phaseBResult.error,
      });
    }

    // =========================================================================
    // GENERATE FINAL REFINEMENT PROMPT
    // =========================================================================

    const refinementPrompt = generateRefinementPrompt(
      phaseAResult.inventory,
      phaseBResult.modificationScript
    );

    // Update conversation history
    const updatedHistory = [...(conversationHistory || [])];
    updatedHistory.push({
      role: "user",
      content: `Iteration ${iterationNumber || 1} - User feedback: ${userFeedback || "No specific feedback"}`,
    });
    updatedHistory.push({
      role: "assistant",
      content: `Phase A Analysis:\n${phaseAResult.rawResponse}\n\nPhase B Operations:\n${phaseBResult.rawResponse}`,
    });

    return res.status(200).json({
      success: true,
      phaseA: {
        inventory: phaseAResult.inventory,
        rawResponse: phaseAResult.rawResponse,
      },
      phaseB: {
        modificationScript: phaseBResult.modificationScript,
        rawResponse: phaseBResult.rawResponse,
      },
      refinementPrompt: refinementPrompt,
      model: model,
      conversationHistory: updatedHistory,
    });
  } catch (error) {
    console.error("Error in supervise endpoint:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

// =============================================================================
// PHASE A: STRUCTURAL ANALYSIS
// =============================================================================

async function runPhaseA(apiKey, model, imageBase64, originalTask) {
  const systemPrompt = `You are an expert at analyzing academic figures with rigorous attention to detail. Your task is to create a complete structural inventory of the image and evaluate each element against academic publication standards.

COORDINATE SYSTEM:
You will use a percentage-based coordinate system that is independent of the image's actual pixel dimensions or aspect ratio.
- Horizontal (X): 0% represents the left edge, 100% represents the right edge
- Vertical (Y): 0% represents the bottom edge, 100% represents the top edge

YOUR RESPONSIBILITIES:

1. STRUCTURAL INVENTORY
Identify and catalog every visual element in the image:
- Blocks: All boxes, containers, and bounded regions
- Connections: All arrows, lines, and links between elements
- Text Elements: Standalone text not contained within blocks
- Background: The background color or pattern

For each element, estimate its position using percentage ranges.

2. ELEMENT EVALUATION
For every element you identify, assess its quality against:
- The original task requirements (if provided)
- Academic publication standards (clarity, precision, professionalism)
- Visual consistency (uniform styling across similar elements)
- Textual accuracy (spelling, grammar, mathematical notation)

Mark each element with one of these statuses:
- CORRECT: The element meets all standards and requires no changes
- NEEDS_FIX: The element has one or more issues that should be addressed

For elements marked NEEDS_FIX, provide specific descriptions of each issue in the "issues" array.

OUTPUT FORMAT:
You must output a valid JSON object with the following structure. Do not include any text before or after the JSON.

{
  "coordinate_system": "percentage-based (X: 0%=left to 100%=right, Y: 0%=bottom to 100%=top)",
  "image_description": "A brief description of what the figure depicts",
  "original_task_summary": "Summary of the task requirements, or null if not provided",
  
  "blocks": [
    {
      "id": "B1",
      "name": "Human-readable name for this block",
      "position": {
        "x_range": [0, 15],
        "y_range": [35, 65],
        "center": [7, 50]
      },
      "style": {
        "border": "description of border style",
        "fill": "description of fill color",
        "shape": "rectangle, rounded_rectangle, circle, etc."
      },
      "content": ["List of text content within the block"],
      "sub_elements": [
        {
          "id": "B1.1",
          "type": "small_box, label, icon, etc.",
          "description": "Description of sub-element",
          "position": [x_percent, y_percent]
        }
      ],
      "status": "CORRECT or NEEDS_FIX",
      "issues": ["List of issues if status is NEEDS_FIX, empty array otherwise"]
    }
  ],
  
  "connections": [
    {
      "id": "C1",
      "type": "solid_arrow, dashed_arrow, line, etc.",
      "from": {
        "element_id": "B1",
        "position": [x_percent, y_percent]
      },
      "to": {
        "element_id": "B2",
        "position": [x_percent, y_percent]
      },
      "style": {
        "line_type": "solid, dashed, dotted",
        "thickness": "thin, medium, thick",
        "color": "color description"
      },
      "label": "Label text if present, null otherwise",
      "status": "CORRECT or NEEDS_FIX",
      "issues": []
    }
  ],
  
  "text_elements": [
    {
      "id": "T1",
      "content": "The text content",
      "position": [x_percent, y_percent],
      "orientation": "horizontal or vertical",
      "style": {
        "font_size": "small, medium, large",
        "font_weight": "normal, bold",
        "color": "color description"
      },
      "status": "CORRECT or NEEDS_FIX",
      "issues": []
    }
  ],
  
  "background": {
    "color": "color description",
    "pattern": "solid, gradient, etc.",
    "status": "CORRECT or NEEDS_FIX",
    "issues": []
  },
  
  "summary": {
    "total_elements": 0,
    "correct_elements": 0,
    "elements_needing_fix": 0,
    "issue_summary": ["Brief list of all issues found"]
  }
}

EVALUATION CRITERIA:
When assessing elements, check for the following issues:

Text and Labels:
- Spelling errors or typos
- Inconsistent terminology (using different terms for the same concept)
- Missing or incomplete labels
- Text that is too small, blurry, or difficult to read
- Labels that do not match the original task description

Mathematical Notation:
- Incomplete equations (missing terms, operators, or delimiters)
- Incorrect mathematical symbols
- Inconsistent notation (using different symbols for the same variable)
- Poorly rendered subscripts or superscripts
- Equations that do not match the described formulas

Visual Elements:
- Arrows pointing in incorrect directions
- Missing connections between components
- Inconsistent styling (different line thicknesses, colors, or shapes for similar elements)
- Poor visual hierarchy
- Overlapping or misaligned elements

Structural Accuracy:
- Components that do not match the described architecture or pipeline
- Missing phases, steps, or components from the original description
- Incorrect flow or sequence of operations
- Elements that contradict the task requirements

Be thorough and rigorous. Examine every detail of the image.`;

  const userMessage = `Please analyze the following academic figure and create a complete structural inventory with element evaluation.

Original Task Description:
${originalTask || "No specific task description provided. Evaluate the figure based on general academic standards."}

Analyze the image carefully and output only the JSON inventory. Do not include any explanatory text before or after the JSON.`;

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        { type: "text", text: userMessage },
        {
          type: "image_url",
          image_url: {
            url: imageBase64.startsWith("data:")
              ? imageBase64
              : `data:image/png;base64,${imageBase64}`,
          },
        },
      ],
    },
  ];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://academic-image-generator.vercel.app",
        "X-Title": "Academic Image Generator - Phase A",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.3,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Phase A API error:", error);
      return { success: false, error: error };
    }

    const data = await response.json();
    const rawResponse = data.choices[0]?.message?.content;

    if (!rawResponse) {
      return { success: false, error: "No response from Phase A" };
    }

    // Parse JSON from response
    const inventory = parseJsonFromResponse(rawResponse);

    if (!inventory) {
      console.error("Failed to parse Phase A JSON. Raw response:", rawResponse);
      return {
        success: false,
        error: "Failed to parse inventory JSON",
        rawResponse: rawResponse,
      };
    }

    return {
      success: true,
      inventory: inventory,
      rawResponse: rawResponse,
    };
  } catch (error) {
    console.error("Phase A error:", error);
    return { success: false, error: error.message };
  }
}

// =============================================================================
// PHASE B: REFINEMENT PROMPT GENERATION
// =============================================================================

async function runPhaseB(apiKey, model, inventory, userFeedback, originalTask, iterationNumber) {
  const systemPrompt = `You are an expert supervisor generating precise refinement instructions for an academic figure.

You have access to a detailed structural inventory of the image with coordinates. Use this to understand EXACTLY what elements exist and where they are located. Your analysis must be thorough and rigorous.

IMPORTANT CONSTRAINT:
The image generator that will execute your instructions does NOT understand:
- Coordinate systems or percentages (like "x: 40%, y: 60%")
- JSON or technical formatting
- Element IDs (like "B1", "C2")

Instead, it understands natural language descriptions based on visual characteristics.

YOUR RESPONSIBILITIES:

1. THOROUGHLY ANALYZE THE INVENTORY
- Understand every element's position, content, and status
- Use the coordinates internally to precisely identify elements
- Note which elements have status "NEEDS_FIX" and their issues

2. INTERPRET USER FEEDBACK
- Map the user's natural language feedback to specific elements in the inventory
- Understand exactly which elements the user is referring to
- Determine the precise changes requested

3. IDENTIFY ALL ISSUES
- From user feedback
- From elements marked NEEDS_FIX in the inventory
- From your own professional analysis against academic standards

4. GENERATE PRECISE REFINEMENT INSTRUCTIONS
For each issue, provide:
- A clear description of the element using visual/spatial language (e.g., "the blue box labeled 'Interpreter' in the second column", "the arrow connecting User Input to Interpreter")
- What is currently wrong
- Exactly what it should be changed to
- Be extremely specific about text content, colors, styles

5. EXPLICITLY FORBID CHANGES TO OTHER ELEMENTS
List all major elements that must NOT be changed.

OUTPUT FORMAT:

REFINEMENT INSTRUCTIONS
=======================

USER FEEDBACK ANALYSIS:
[Quote the user's feedback and explain what specific elements/changes they are referring to]

SUPERVISOR ANALYSIS:
[List additional issues you identified from the inventory and your own analysis]

SPECIFIC MODIFICATIONS REQUIRED:
--------------------------------

Modification 1:
  Element: [Describe the element using visual characteristics - position, color, label, shape]
  Current state: [What it currently shows/looks like]
  Required change: [Exactly what to change - be very specific]
  
Modification 2:
  Element: [Description]
  Current state: [Current]
  Required change: [Change]

[Continue for all modifications]

STRICT PROHIBITION - DO NOT CHANGE THE FOLLOWING:
-------------------------------------------------
The following elements must remain EXACTLY as they currently appear. Any modification to these elements is forbidden.

- [List each element that should NOT be changed, described by visual characteristics]
- [Be comprehensive - list all major elements not being modified]

All positions, sizes, colors, and styles of the elements listed above must be preserved exactly.
Any element not explicitly listed in "SPECIFIC MODIFICATIONS REQUIRED" must remain unchanged.

=======================

GUIDELINES:
- Describe elements by their visual appearance, not coordinates
- Use spatial terms like "left side", "top-right corner", "the box labeled X", "the arrow from A to B"
- Be extremely specific about what text should say (exact wording)
- Be specific about colors if they need to change
- The prohibition section is critical - be thorough in listing what to preserve`;

  const userMessage = `Analyze the following and generate precise refinement instructions.

STRUCTURAL INVENTORY (use for your analysis - understand every element's position and status):
${JSON.stringify(inventory, null, 2)}

USER FEEDBACK:
${userFeedback || "No specific feedback provided by the user."}

ORIGINAL TASK DESCRIPTION:
${originalTask || "No specific task description provided."}

ITERATION NUMBER: ${iterationNumber || 1}

Generate refinement instructions following the format specified. Use the inventory to understand the image precisely, but describe elements using visual characteristics (not coordinates) in your output.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://academic-image-generator.vercel.app",
        "X-Title": "Academic Image Generator - Phase B",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.4,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Phase B API error:", error);
      return { success: false, error: error };
    }

    const data = await response.json();
    const rawResponse = data.choices[0]?.message?.content;

    if (!rawResponse) {
      return { success: false, error: "No response from Phase B" };
    }

    return {
      success: true,
      modificationScript: rawResponse,
      rawResponse: rawResponse,
    };
  } catch (error) {
    console.error("Phase B error:", error);
    return { success: false, error: error.message };
  }
}

// =============================================================================
// GENERATE FINAL REFINEMENT PROMPT
// =============================================================================

function generateRefinementPrompt(inventory, modificationScript) {
  // The modificationScript from Phase B is now a clean natural language prompt
  // We just need to add some framing for the image generator
  return modificationScript;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function parseJsonFromResponse(response) {
  // Try to extract JSON from the response
  // The model might include markdown code blocks or extra text

  // First, try direct parsing
  try {
    return JSON.parse(response);
  } catch (e) {
    // Continue to other methods
  }

  // Try to find JSON within code blocks
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {
      // Continue to other methods
    }
  }

  // Try to find JSON object pattern
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // Continue to other methods
    }
  }

  // Try to find JSON starting from first {
  const firstBrace = response.indexOf("{");
  const lastBrace = response.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(response.substring(firstBrace, lastBrace + 1));
    } catch (e) {
      // Failed to parse
    }
  }

  return null;
}
