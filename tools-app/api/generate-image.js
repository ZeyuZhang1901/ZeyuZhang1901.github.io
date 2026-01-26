// API endpoint: /api/generate-image
// Takes a prompt and generates an image using OpenRouter's chat/completions API

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
    const { prompt, imageModel, temperature } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const model = imageModel || "google/gemini-3-pro-image-preview";
    const temp = typeof temperature === "number" ? temperature : 0.7;

    // Enhance the prompt for better academic figure generation
    const enhancedPrompt = `Generate an image: Create a professional academic figure with the following specifications:

${prompt}

Important requirements:
- Use a clean white or very light gray background
- Ensure all text is crisp, readable, and properly spelled
- Use professional academic styling suitable for publication
- Maintain clear visual hierarchy and alignment
- Use consistent color scheme throughout
- Make sure arrows and connections are clear and properly directed`;

    console.log("=== IMAGE GENERATION REQUEST ===");
    console.log("Model:", model);
    console.log("Temperature:", temp);
    console.log("Prompt length:", enhancedPrompt.length);

    // Use OpenRouter's /chat/completions endpoint
    // Image generation models return images in message.images array
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://academic-image-generator.vercel.app",
        "X-Title": "Academic Image Generator",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: enhancedPrompt,
          },
        ],
        temperature: temp,
      }),
    });

    const responseText = await response.text();
    console.log("OpenRouter response status:", response.status);
    console.log("OpenRouter response (first 500 chars):", responseText.substring(0, 500));

    if (!response.ok) {
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = errorJson.error?.message || errorJson.message || responseText;
      } catch (e) {
        // Keep original error text
      }
      return res.status(response.status).json({
        success: false,
        error: "API request failed",
        details: errorDetails,
        model: model,
      });
    }

    // Parse the response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({
        success: false,
        error: "Invalid JSON response",
        details: responseText.substring(0, 500),
      });
    }

    // Extract image from the response
    // OpenRouter returns images in: message.images[0].image_url.url
    let imageData = null;
    const message = data.choices?.[0]?.message;

    if (message) {
      // CHECK 1: message.images array (OpenRouter's format for image generation models)
      if (message.images && Array.isArray(message.images) && message.images.length > 0) {
        const img = message.images[0];
        if (img.image_url?.url) {
          imageData = img.image_url.url;
          console.log("Found image in message.images[0].image_url.url");
        } else if (img.url) {
          imageData = img.url;
          console.log("Found image in message.images[0].url");
        }
      }

      // CHECK 2: content as array (multimodal format)
      if (!imageData && Array.isArray(message.content)) {
        for (const part of message.content) {
          if (part.type === "image_url" && part.image_url?.url) {
            imageData = part.image_url.url;
            console.log("Found image in content array (image_url)");
            break;
          }
          if (part.type === "image" && (part.url || part.data)) {
            imageData = part.url || `data:image/png;base64,${part.data}`;
            console.log("Found image in content array (image)");
            break;
          }
        }
      }

      // CHECK 3: content as URL/base64 string
      if (!imageData && typeof message.content === "string") {
        if (message.content.startsWith("data:image/") || message.content.startsWith("http")) {
          imageData = message.content;
          console.log("Found image in content string");
        }
      }
    }

    // CHECK 4: Other possible locations
    if (!imageData && data.image) {
      imageData = data.image;
      console.log("Found image in data.image");
    }
    if (!imageData && data.data?.[0]?.url) {
      imageData = data.data[0].url;
      console.log("Found image in data.data[0].url");
    }

    // Return result
    if (imageData) {
      return res.status(200).json({
        success: true,
        image: imageData,
        model: model,
      });
    } else {
      // No image found - return debug info
      const textContent = typeof message?.content === "string" ? message.content : null;
      return res.status(200).json({
        success: false,
        error: "No image in response",
        details: textContent
          ? "Model returned text instead of image. This model may not support image generation."
          : "Could not find image data in the response.",
        textResponse: textContent?.substring(0, 300),
        model: model,
        responseStructure: {
          hasMessage: !!message,
          hasImages: !!message?.images,
          imagesLength: message?.images?.length,
          contentType: typeof message?.content,
          contentIsArray: Array.isArray(message?.content),
        },
      });
    }
  } catch (error) {
    console.error("Error in generate-image endpoint:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
}
