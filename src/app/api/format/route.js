import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { text, apiKey, model = "google/gemma-4-31b-it:free", action = "format" } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Text content is required." }, { status: 400 });
    }

    const activeApiKey = apiKey?.trim() || process.env.OPENROUTER_API_KEY;

    if (!activeApiKey) {
      return NextResponse.json(
        {
          error: "OpenRouter API Key is missing.",
          code: "API_KEY_REQUIRED",
          message: "Please add your OpenRouter API Key in Settings or set OPENROUTER_API_KEY in .env.local.",
        },
        { status: 400 }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "spellcheck") {
      systemPrompt = `You are a professional proofreader and spell-checker.

Your job is to correct spelling, grammar, and punctuation errors in the user's text.

RULES:
1. Fix only clear, unambiguous spelling and grammar mistakes.
2. Do NOT change wording, rephrase sentences, change tone, or alter structure.
3. Do NOT remove, add, or rewrite any content.
4. If you encounter a word you are UNSURE about (e.g. proper nouns, technical jargon, brand names, made-up words, abbreviations), DO NOT change it. Instead, collect it in the UNCERTAIN list.
5. Output MUST be valid JSON in exactly this format:

{
  "corrected": "<the full corrected text here>",
  "uncertain": ["word1", "word2"]
}

- "corrected" is the full text with only clear errors fixed.
- "uncertain" is an array of words you were unsure about and left unchanged. Empty array if none.
- Do NOT include any explanation, markdown, or text outside the JSON.`;

      userPrompt = text;
    } else {
      // Format action
      systemPrompt = `You are a professional document layout and formatting expert.
Your task is to take the user's raw text and format it into a clean, beautifully structured Report.

CRITICAL RULES:
1. DO NOT CHANGE, OMIT, OR ADD ANY WORDS OR CONTENT. Every word must be preserved exactly.
2. Only change the structure and layout. You MUST follow this exact hierarchy:
   - Use a single \`# \` (H1) for the main document title.
   - Use \`## \` (H2) for major sections (e.g., Introduction, Vision, Conclusion).
   - Use \`### \` (H3) for numbered sub-sections or specific key points (e.g., "### 1. Behavioural Change").
   - Break large paragraphs into bullets (- ) or numbered lists (1.) where logical.
   - Use Markdown tables (| col | col |) if data can be structured tabularly.
   - Use Callout Blocks (e.g. > [!NOTE] or > [!WARNING]) for important takeaways or warnings.
   - Bold (** **) key terms, use italics (* *) for emphasis where appropriate.
   - Separate sections with blank lines.
3. Do not add introductory text, explanations, or wrap in a markdown code block.
4. Return ONLY the raw formatted markdown text.`;

      userPrompt = `Format this text:\n---\n${text}\n---`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeApiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "TextCraft PDF",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: action === "spellcheck" ? 0.0 : 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try { errorData = JSON.parse(errorText); } catch { errorData = { message: errorText }; }
      throw new Error(errorData?.error?.message || errorData?.message || `OpenRouter returned status ${response.status}`);
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content;

    if (!raw) throw new Error("Empty response received from AI.");

    // For spellcheck: parse the JSON response
    if (action === "spellcheck") {
      // Strip any markdown code fences the model may have added
      const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      try {
        const parsed = JSON.parse(cleaned);
        return NextResponse.json({
          result: parsed.corrected?.trim() ?? text,
          uncertain: Array.isArray(parsed.uncertain) ? parsed.uncertain : [],
        });
      } catch {
        // If JSON parsing fails, return the raw text as-is with a warning
        return NextResponse.json({
          result: raw.trim(),
          uncertain: [],
          parseWarning: true,
        });
      }
    }

    return NextResponse.json({ result: raw.trim() });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during processing." },
      { status: 500 }
    );
  }
}
