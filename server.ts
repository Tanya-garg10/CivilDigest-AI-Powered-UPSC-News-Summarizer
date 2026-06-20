import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "5mb" }));

const PORT = process.env.PORT || 3005;

// Lazy initialize Gemini client to avoid crashes if API key is not present initially
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please set it in your AI Studio secrets panel.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

// Scrape article helper
async function scrapeArticle(newsUrl: string) {
  try {
    const decodedUrl = decodeURIComponent(newsUrl);
    console.log(`[Scraper] Scrape requested for URL: ${decodedUrl}`);

    const isHttpUrl = decodedUrl.startsWith("http://") || decodedUrl.startsWith("https://");
    if (!isHttpUrl) {
      let source = "Anakin Wire API";
      let title = "Anakin Research Topic";
      if (decodedUrl.startsWith("ask_")) {
        title = `Anakin Query Topic (${decodedUrl.slice(0, 12)}...)`;
      } else {
        title = decodedUrl;
        source = "Custom UPSC Study Request";
      }

      return {
        title,
        content: `The user requested analysis on the topic/query: "${decodedUrl}". Please construct a highly comprehensive, academic UPSC research document on this. Map it to one of the GS Syllabus papers and structure all sections.`,
        source,
        scrapedSuccessfully: true
      };
    }
    
    let title = "";
    let extractedText = "";
    let isAnakinScrape = false;
    const anakinKey = process.env.ANAKIN_API_KEY;

    if (anakinKey) {
      const startEndpoint = "https://api.anakin.io/v1/url-scraper";
      try {
        console.log(`[AnakinScraper] Starting scrape job for url: ${decodedUrl}`);
        const startResp = await fetch(startEndpoint, {
          method: "POST",
          headers: {
            "X-API-Key": anakinKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: decodedUrl })
        });

        if (startResp.ok) {
          const startData = await startResp.json();
          const jobId = startData.jobId;
          
          if (jobId) {
            console.log(`[AnakinScraper] Job started with ID: ${jobId}. Polling for results...`);
            
            // Poll up to 10 times, 3 seconds apart
            for (let i = 0; i < 10; i++) {
              await new Promise(res => setTimeout(res, 3000));
              
              const pollResp = await fetch(`${startEndpoint}/${jobId}`, {
                method: "GET",
                headers: { "X-API-Key": anakinKey }
              });
              
              if (pollResp.ok) {
                const pollData = await pollResp.json();
                if (pollData.status === "pending" || pollData.status === "processing") {
                  console.log(`[AnakinScraper] Job ${jobId} is still pending...`);
                  continue;
                }
                
                // Job finished
                title = pollData.title || pollData.headline || (pollData.meta && pollData.meta.title) || "";
                extractedText = pollData.markdown || pollData.content || pollData.text || pollData.html || "";
                
                if (extractedText) {
                  isAnakinScrape = true;
                  console.log(`[AnakinScraper] Successfully extracted ${extractedText.length} characters using AnakinScraper API.`);
                  
                  // Clean up HTML tags if returned as raw HTML
                  if (extractedText.includes("<p>") || extractedText.includes("</div>") || extractedText.includes("</html>")) {
                    extractedText = extractedText
                      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
                      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
                      .replace(/<[^>]*>/g, ' ')
                      .replace(/\s+/g, ' ')
                      .trim();
                  }
                }
                break; // Break polling loop
              } else {
                console.warn(`[AnakinScraper] Polling failed with status: ${pollResp.status}`);
                break; // Break polling loop on error
              }
            }
          } else {
            console.warn(`[AnakinScraper] Failed to get jobId from response:`, startData);
          }
        } else {
          const errorText = await startResp.text();
          console.warn(`[AnakinScraper] Endpoint ${startEndpoint} failed with status: ${startResp.status}. Error: ${errorText.slice(0, 150)}`);
        }
      } catch (apiErr) {
        console.error(`[AnakinScraper] Failure during calling ${startEndpoint}:`, apiErr);
      }
    }

    if (!isAnakinScrape) {
      console.log(`[Scraper] Falling back to standard direct fetch scrape for URL: ${decodedUrl}`);
      const response = await fetch(decodedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en,en-US;q=0.9,hi;q=0.8",
          "Referer": "https://www.google.com/"
        },
        redirect: "follow"
      });

      if (!response.ok) {
        throw new Error(`Scraper request failed with status: ${response.status}`);
      }

      const html = await response.text();

      // Find Title
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(/\s+/g, ' ').trim();
      }

      // Clean HTML scripts, styles and complex markup
      let cleanHtml = html
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
        .replace(/<svg[^>]*>([\s\S]*?)<\/svg>/gi, '')
        .replace(/<!--([\s\S]*?)-->/g, '');

      // Extract standard paragraph structures
      const pMatches = cleanHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
      let chunks: string[] = [];
      if (pMatches) {
        pMatches.forEach(p => {
          const text = p.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
          // Skip short texts or interactive widgets
          if (text.length > 50 && !text.includes("cookie") && !text.includes("subscribe")) {
            chunks.push(text);
          }
        });
      }

      extractedText = chunks.join("\n\n");

      // Fallback if paragraphs are empty or scarce
      if (extractedText.length < 200) {
        let bodyText = cleanHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (bodyText.length > 250) {
          extractedText = bodyText.slice(0, 6000);
        }
      } else {
        extractedText = extractedText.slice(0, 10000); // keep clean prompt size
      }
    }

    // Guess source based on domain
    let source = "General News";
    try {
      const parsedUrl = new URL(decodedUrl);
      const host = parsedUrl.hostname.replace("www.", "");
      // Beautify: thehindu.com -> Thehindu, etc.
      source = host.split('.')[0];
      source = source.charAt(0).toUpperCase() + source.slice(1);
    } catch (_) {}

    return {
      title: title || "UPSC Relevant Article",
      content: extractedText,
      source: source || "Current Affairs Source",
      scrapedSuccessfully: extractedText.length > 150
    };
  } catch (error: any) {
    console.error("[Scraper Error]", error);
    
    // Attempt Fallback Info Parsers from URL
    let fallbackTitle = "UPSC Relevant Article";
    let fallbackSource = "News Link";
    try {
      const urlObj = new URL(decodeURIComponent(newsUrl));
      fallbackSource = urlObj.hostname.replace("www.", "").split('.')[0];
      fallbackSource = fallbackSource.charAt(0).toUpperCase() + fallbackSource.slice(1);
      
      const pathWords = urlObj.pathname.split(/[-_/]/).filter(w => w.length > 3 && !w.endsWith(".html") && !w.endsWith(".ece"));
      if (pathWords.length > 0) {
        fallbackTitle = pathWords.slice(0, 7).join(" ");
        fallbackTitle = fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1);
      }
    } catch (_) {}

    return {
      title: fallbackTitle,
      content: "",
      source: fallbackSource,
      scrapedSuccessfully: false,
      error: error.message
    };
  }
}

// Schema for Gemini UPSC Structured Response
const upscResponseSchema = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    source: { type: "STRING" },
    category: {
      type: "STRING",
      enum: [
        "Polity & Governance", 
        "Economy & Development", 
        "Environment & Ecology", 
        "International Relations", 
        "Science & Technology", 
        "General Studies"
      ]
    },
    summary: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Exactly 5 detailed, examination-ready summaries based strictly on facts, constitutional articles, committees, and policy details."
    },
    keywords: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "5 to 8 crucial UPSC keys/phrases (e.g., 'Primary Deficit', 'Doctrine of Severability', 'Green Taxonomy')."
    },
    mcq: {
      type: "OBJECT",
      properties: {
        question: { type: "STRING" },
        options: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Exactly 4 multiple-choice options."
        },
        correctAnswer: { type: "INTEGER", description: "0-indexed correct option (must be 0, 1, 2, or 3)" },
        explanation: { type: "STRING", description: "In-depth UPSC grade explanation mapping both the right option and stating why other choices are wrong." }
      },
      required: ["question", "options", "correctAnswer", "explanation"]
    },
    revisionSheet: {
      type: "STRING",
      description: "Comprehensive notes using clean Markdown formatting. Outline sections: Syllabus Paper Context, Core Arguments & Controversies, Key Facts for Prelims, Analytical mains viewpoints, and futuristic Way Forward/Solution suggestions."
    }
  },
  required: ["title", "source", "category", "summary", "keywords", "mcq", "revisionSheet"]
};

// API Endpoint for news analysis
app.post("/api/analyze", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const scraped = await scrapeArticle(url);
    const ai = getGeminiClient();

    const promptMessage = `You are a distinguished UPSC Civil Services Board editor and Senior UPSC Mentor.
Analyze this current affairs news material and compile executive UPSC preparation notes.

Details:
URL: ${url}
Extracted Headline Idea: ${scraped.title}
Estimated Source: ${scraped.source}

Scraped Content Extract:
${scraped.content || "Note: Direct scraping payload is restricted or empty. Please use search-grounded knowledge of public news on this exact URL / Title to reconstruct the comprehensive context."}

Instructions:
1. Subject Classification: Map the article to its dominant UPSC subject (Choose polity, economy, environment, IR, science & tech, or GS).
2. Title: Create an academic UPSC-styled title (e.g., "The Impact of CBAM on India's Steel Exports").
3. 5-Point Summary: Craft 5 high-density summaries containing relevant laws, constitutional articles, facts, or committee recommendations.
4. Keywords: Extract 5-8 major keywords that add weight to custom answers.
5. Practice MCQ: Create one high-quality UPSC Prelims-standard MCQ with deep testing of analytical parameters.
6. Daily Revision Sheet: Detail structured revision materials using rich Markdown format covering Syllabus, Arguments, Prelims facts, Mains angles, and Way Forward.

You must reply with JSON adhering perfectly to the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptMessage,
      config: {
        responseMimeType: "application/json",
        responseSchema: upscResponseSchema,
        temperature: 0.2
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from LLM engine");
    }

    const upscResult = JSON.parse(responseText);

    res.json({
      success: true,
      data: {
        ...upscResult,
        url,
        title: upscResult.title || scraped.title,
        source: upscResult.source || scraped.source,
        scrapedSuccessfully: scraped.scrapedSuccessfully,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error("[API Error]", error);
    res.status(500).json({
      error: error.message || "An internal error occurred during article analysis. Please check your config or try again."
    });
  }
});

// Vite & Static file handler integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Vite Service] Initializing Dev Server Middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Prod Mode] Serving Compiled Build Files");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CivilDigest] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
