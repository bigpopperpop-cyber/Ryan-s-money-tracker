
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "./types";

export const getFinancialInsights = async (transactions: Transaction[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const transactionSummary = transactions.slice(-10).map(t => 
    `${t.date}: ${t.type} of $${t.amount} for ${t.category} (${t.comment})`
  ).join('\n');

  const prompt = `
    Ryan is a young student tracking his money. Here are his recent transactions:
    ${transactionSummary}

    Based on this, give Ryan 3 short, encouraging, and easy-to-understand financial tips or insights. 
    Keep the tone friendly and motivating. Use bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Keep up the great work, Ryan! Remember to save a little bit from every allowance.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Great job tracking your money, Ryan! Saving consistently is the secret to reaching your goals.";
  }
};
