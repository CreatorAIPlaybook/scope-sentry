import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";

const analyzeRequestSchema = z.object({
  text: z.string().min(1, "Contract text is required."),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/analyze", async (req, res) => {
    const parsed = analyzeRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result = {
      score: 45,
      label: "Critical Risk",
      flags: [
        {
          title: "Vague Revision Count",
          description:
            'The contract uses language like "reasonable number of revisions" without defining a specific limit, leaving you exposed to unlimited rework.',
          severity: "high",
          fix: 'Replace with: "The project includes up to 3 rounds of revisions. Additional revisions will be billed at $X/hour."',
        },
        {
          title: "Missing Payment Dates",
          description:
            "No specific payment milestones or due dates are defined. The contract only mentions payment \"upon completion\" without defining what completion means.",
          severity: "high",
          fix: 'Add: "Payment schedule: 50% upon project kickoff, 25% at midpoint delivery, 25% upon final approval. Net-15 payment terms apply."',
        },
        {
          title: "Undefined Deliverables Scope",
          description:
            'The SOW references "all necessary assets" and "related materials" without specifying exact file types, formats, or quantities.',
          severity: "medium",
          fix: 'Replace with: "Deliverables include: 5 page designs (Figma), 1 brand guide (PDF), source files (AI/PSD). No additional assets are included."',
        },
      ],
    };

    return res.json(result);
  });

  return httpServer;
}
