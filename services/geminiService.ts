import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { PullRequest, Changelog } from '../types';

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set. The app will not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const changelogSchema = {
  type: Type.OBJECT,
  properties: {
    features: {
      type: Type.ARRAY,
      description: 'List of summaries for new features, enhancements, or significant additions.',
      items: { type: Type.STRING },
    },
    fixes: {
      type: Type.ARRAY,
      description: 'List of summaries for bug fixes or corrections.',
      items: { type: Type.STRING },
    },
    improvements: {
      type: Type.ARRAY,
      description: 'List of summaries for performance improvements, refactoring, documentation, or other maintenance tasks.',
      items: { type: Type.STRING },
    },
  },
  required: ['features', 'fixes', 'improvements'],
};

export const generateChangelogFromPRs = async (pullRequests: PullRequest[], version: string): Promise<Changelog> => {
  if (pullRequests.length === 0) {
    return { features: [], fixes: [], improvements: [] };
  }
  const prData = pullRequests.map(pr => `PR #${pr.id}: ${pr.title}\nDescription: ${pr.body || 'No description.'}`).join('\n---\n');

  const prompt = `
    You are an expert technical writer creating release changelogs.
    Analyze the following pull requests and generate a concise, human-readable changelog for version ${version}.
    Rules:
    1. Categorize each PR into "features", "fixes", or "improvements".
    2. Rewrite the PR title and description into a clear, single-sentence summary from a user's perspective. Focus on the value delivered.
    3. Exclude PR numbers, authors, and internal jargon.
    4. Ignore trivial PRs (e.g., minor doc typos).
    5. Return a JSON object matching the schema.

    Pull Request Data:
    ${prData}
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: changelogSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Changelog;
  } catch (error) {
    console.error("Error calling Gemini API for generation:", error);
    throw new Error("Failed to generate changelog from AI service.");
  }
};


export const createAriaChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are Aria, an AI assistant specializing in refining changelogs. The user will provide a changelog in JSON format and a request to edit it.
            Your task is to apply the user's request to the JSON object.
            You MUST ONLY respond with the updated JSON object, adhering strictly to the original schema.
            Do not include any other text, markdown formatting, or explanations in your response. Just the raw, updated JSON.
            If the user asks a general question, answer it politely while reminding them of your purpose.`,
        },
    });
}
