/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // Gemini Rotational Advisor AI Assistant Route
  app.post("/api/advisor", async (req, res) => {
    const { prompt, chatHistory } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    try {
      // Reconstruct simple instruction
      const systemInstruction = `You are AjoVault Advisor, an elite financial coach, mediation specialist, and authority on rotational savings circles (Ajo, Esusu, Adashe, Stokvel, and Tontines) across Nigeria and diaspora communities.
      
      Your goal is to offer accurate, professional, respectful, and highly actionable advice on:
      1. Managing late contributions & setting up fair penalty policies (e.g., trust scores, reminders, grace periods).
      2. Handling disputes between circular members (e.g., missed deadlines, rotational bidding, payout delays).
      3. Setting up healthy contribution standards, encouraging savings velocity, and upgrading plan tiers on AjoVault.
      4. Traditional definitions: explain terms like Ajo, Adashe, Stokvel, and Esusu with cultural pride.
      
      Keep your tone encouraging, culturally intelligent, professional, and clear. Avoid overly technical jargon. Always format your output cleanly in Markdown. Keep your recommendations practical.`;

      // Formulate query. If we have chatHistory, combine it or format it
      let contents = prompt;
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        // Simple context-prep for content generation
        const formattedHistory = chatHistory
          .map((m: any) => `${m.sender === "user" ? "Member" : "Advisor"}: ${m.text}`)
          .join("\n");
        contents = `${formattedHistory}\n\nMember: ${prompt}\n\nAdvisor:`;
      }

      // Check if API key is actually set, otherwise return helpful sandbox mock advice
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        console.warn("GEMINI_API_KEY is not set. Simulating expert advice locally for the sandbox.");
        // Simulated premium Nigerian advisory response
        let mockResponse = "";
        if (prompt.toLowerCase().includes("late") || prompt.toLowerCase().includes("penalty")) {
          mockResponse = `### AjoVault Advisory: Handling Late Contributions

In traditional Yoruba *Ajo* and Northern *Adashe* circles, late payments threaten the group's trust. Here is a recommended 3-step action plan for your circle:

1. **Reputation Penalty (Trust Score)**: AjoVault automatically reduces their **Trust Score** by **5 points** for late payments and **20 points** if it slips past the grace period into a "Missed" state. Surface this trust score to encourage peer motivation.
2. **Grace Period Enforcement**: Implement a strict **24 to 48-hour grace period**. If they pay within this window, they pay the standard amount plus a subtle **5% penalty** (applied to compensate the payout recipient for the delay).
3. **Structured Payout Ordering (Gating)**: Keep high-risk members (low Trust scores) at the later positions in the rotation (e.g., spots 5 or 6 in a 6-member circle) to minimize default rates.

*Tip: You can set custom penalty sliders (0-20%) inside the **Group Settings** panel on AjoVault.*`;
        } else if (prompt.toLowerCase().includes("bidding")) {
          mockResponse = `### Understanding the Bidding Payout Model

On AjoVault, the **Bidding Payout Order** is a premium feature designed for high-velocity investment circles. 

* **The Core Mechanism**: Instead of taking turns in a fixed or random order, members bid portion of their payout to receive the funds earlier.
* **An Example**: In a month where ₦500,000 is collected, Member A might bid ₦20,000 to get the payout first. Member B might bid ₦25,000.
* **How It Resolves**: The highest bidder (Member B) gets the payout immediately, but the bid amount (₦25,000) is deducted and distributed back to other members as a dividend/yield!
* **Why Use It**: It helps members who have urgent capital needs (school fees, business expansion) get immediate cash, while rewarding patient savors with dynamic dividends.

*Upgrade your circle's group to AjoVault **Pro** or **Cooperative** tier to unlock dynamic payout bidding!*`;
        } else {
          mockResponse = `### Welcom to AjoVault Interactive Guru 🌟

I am here to guide your savings circle to maximum credit efficiency and smooth rotation.

Here are a few questions you can ask me:
* *"How should we handle a member who missed their turn?"*
* *"What is the best rotational length for a 12-member weekly circle?"*
* *"Explain the differences between Esusu, Adashe, and Stokvel."*
* *"How can we utilize the AjoVault Escrow service securely?"*

*Feel free to ask your custom question below!*`;
        }

        res.json({ text: mockResponse });
        return;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (e: any) {
      console.error("Gemini API Error in /api/advisor:", e);
      res.status(500).json({
        error: "Advisor had a minor connection lag. Please try again! Error: " + e.message,
      });
    }
  });

  // Serve static assets / Vite middle-ware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
