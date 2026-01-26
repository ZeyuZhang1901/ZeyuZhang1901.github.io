# Academic Research Image Generator

An AI-powered pipeline for generating publication-quality academic figures using LLM collaboration.

## Overview

This tool implements an iterative refinement pipeline:

1. **Interpret**: An LLM (Claude Opus 4.5) analyzes your task description and code to generate a detailed image prompt
2. **Generate**: An image model (Gemini) creates the initial figure
3. **Supervise**: The LLM analyzes the generated image and your feedback to create refinement prompts
4. **Refine**: The image model generates improved versions based on the refinements
5. **Review**: A final professional evaluation of the image quality

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel CLI (optional, for local development)

### Setup

1. Install dependencies:

   ```bash
   cd tools-app
   npm install
   ```

2. Create a `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

3. Add your OpenRouter API key to `.env`:

   ```
   OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
   ```

4. Run locally with Vercel CLI:

   ```bash
   npx vercel dev
   ```

   Or use a simple HTTP server for the frontend (API calls will need to be mocked or proxied):

   ```bash
   npx serve public
   ```

## Deployment to Vercel

### Option 1: Deploy from Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Set the root directory to `tools-app`
5. Add environment variable:
   - Name: `OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key
6. Click "Deploy"

### Option 2: Deploy from CLI

1. Install Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:

   ```bash
   vercel login
   ```

3. Deploy:

   ```bash
   cd tools-app
   vercel
   ```

4. Set the environment variable:

   ```bash
   vercel env add OPENROUTER_API_KEY
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

## API Endpoints

### POST /api/interpret

Generates a detailed image prompt from user input.

**Request Body:**

```json
{
  "taskDescription": "Description of the figure to create",
  "codeContent": "Optional related code",
  "interpreterModel": "anthropic/claude-opus-4"
}
```

### POST /api/generate-image

Generates an image from a prompt.

**Request Body:**

```json
{
  "prompt": "Detailed image generation prompt",
  "imageModel": "google/gemini-2.0-flash-exp:free"
}
```

### POST /api/supervise

Analyzes a generated image and creates refinement suggestions.

**Request Body:**

```json
{
  "imageBase64": "Base64 encoded image",
  "userFeedback": "User's feedback on the image",
  "conversationHistory": [],
  "originalTask": "Original task description",
  "iterationNumber": 1,
  "interpreterModel": "anthropic/claude-opus-4"
}
```

### POST /api/final-review

Generates a professional evaluation of the final image.

**Request Body:**

```json
{
  "imageBase64": "Base64 encoded image",
  "originalTask": "Original task description",
  "conversationHistory": [],
  "totalIterations": 3,
  "interpreterModel": "anthropic/claude-opus-4"
}
```

## Models Used

### Interpreter/Supervisor Models (via OpenRouter)

- Claude Opus 4 (recommended)
- Claude Sonnet 4
- GPT-4o
- Gemini 2.5 Pro

### Image Generation Models (via OpenRouter)

- Gemini 2.0 Flash (free)
- DALL-E 3

## License

MIT License - Part of Zeyu Zhang's personal tools collection.
