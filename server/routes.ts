import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

const analyzeRequestSchema = z.object({
  text: z.string().min(1, "Contract text is required."),
});

const SYSTEM_PROMPT = `You are a Legal Risk Analyst specializing in freelance contracts and Scope of Work (SOW) documents.

Analyze the provided contract text for:
1. Scope creep triggers (vague deliverables, unlimited revisions, open-ended timelines)
2. Missing or weak payment terms (no milestones, no late fees, unclear amounts)
3. Vague language that could be exploited (subjective terms, undefined responsibilities)
4. Missing protections (no kill fee, no IP transfer clause, no termination terms)

Return a JSON object with this exact structure:
{
  "score": <number 0-100 where 0=safe and 100=extremely risky>,
  "label": "<one of: Low Risk, Moderate Risk, High Risk, Critical Risk>",
  "flags": [
    {
      "title": "<short name of the issue>",
      "severity": "<low, medium, or high>",
      "description": "<2-3 sentence explanation of why this is risky for the freelancer>",
      "fix": "<specific replacement language or clause the freelancer should add>"
    }
  ]
}

Rules:
- Score 0-25 = "Low Risk", 26-50 = "Moderate Risk", 51-75 = "High Risk", 76-100 = "Critical Risk"
- Return between 0 and 8 red flags depending on what you find
- If the text is not a contract or SOW, return score 0 with an empty flags array
- Be specific in your fix suggestions — provide actual contract language, not generic advice
- Return ONLY valid JSON, no markdown fences, no extra text`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/analyze", async (req, res) => {
    const parsed = analyzeRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nAnalyze this contract text:\n\n${parsed.data.text}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });

      const responseText = result.response.text();
      const analysis = JSON.parse(responseText);

      const responseSchema = z.object({
        score: z.number().min(0).max(100),
        label: z.enum(["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"]),
        flags: z.array(
          z.object({
            title: z.string().min(1),
            severity: z.enum(["low", "medium", "high"]),
            description: z.string().min(1),
            fix: z.string().min(1),
          })
        ).max(8),
      });

      const validated = responseSchema.safeParse(analysis);
      if (!validated.success) {
        console.error("Gemini response validation failed:", validated.error);
        return res.status(500).json({ error: "Failed to parse analysis results." });
      }

      return res.json(validated.data);
    } catch (error: any) {
      console.error("Gemini API error:", error?.message || error);
      const status = error?.response?.status ?? error?.status ?? error?.statusCode;
      const isRateLimit = status === 429 || /429|rate limit|quota|RESOURCE_EXHAUSTED/i.test(String(error?.message ?? ""));
      const message = isRateLimit
        ? "Rate limit exceeded. Please try again later or check your API quota."
        : "Failed to analyze contract. Please try again.";
      return res.status(isRateLimit ? 429 : 500).json({ error: message });
    }
  });

  return httpServer;
}
