import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { env } from '../config/env.js';
import { Topic } from '../models/Topic.js';

/**
 * AI Prompts from source monorepo - exact copy
 */
export const PROMPTS = {
  EXPLAIN: (title, rawText) => ({
    systemPrompt: `You are a friendly Pakistani board exam tutor. Explain topics in simple English
that a Grade 9 student can understand. Use everyday Pakistani examples where helpful.
Keep explanations under 150 words. Write in clear paragraphs, no bullet points.`,
    userPrompt: `Explain this topic simply:\n\nTopic: ${title}\n\nContent:\n${rawText.slice(0, 3000)}`,
  }),

  GENERATE_MCQS: (title, rawText, count = 5) => ({
    systemPrompt: `You are a Pakistani board exam question writer. Generate MCQs in the style of
Lahore Board and FBISE. Output ONLY a JSON array, no other text, no markdown.`,
    userPrompt: `Generate ${count} MCQs for this topic. Each must have 4 options (a,b,c,d), one correct answer, and a brief explanation.

Topic: ${title}
Content: ${rawText.slice(0, 3000)}

Output (JSON array only):
[{"question":"...","options":["(a)...","(b)...","(c)...","(d)..."],"correct_answer":"b","explanation":"..."}]`,
  }),

  GENERATE_FLASHCARDS: (title, rawText, count = 5) => ({
    systemPrompt: `Create concise study flashcards for exam revision. Output ONLY a JSON array.`,
    userPrompt: `Create ${count} flashcards for: ${title}\n\nContent: ${rawText.slice(0, 2000)}\n\nOutput: [{"front":"...","back":"..."}]`,
  }),
};

/**
 * Get AI provider instance based on configuration
 */
export function getAIProvider() {
  const provider = env.AI_PROVIDER || 'gemini';

  if (provider === 'openai') {
    return new OpenAI({
      apiKey: env.OPENAI_API_KEY
    });
  }

  // Default to Gemini
  return new GoogleGenerativeAI(env.DEEPSEEK_API_KEY || env.OPENAI_API_KEY);
}

/**
 * Generate explanation for a topic using source prompts
 */
export async function generateExplanation(topic, options = {}) {
  const { stream = false, onChunk } = options;
  const provider = getAIProvider();
  
  // Use source prompt structure
  const promptData = PROMPTS.EXPLAIN(topic.title, topic.content || topic.rawText || '');
  
  if (stream && onChunk) {
    return streamExplanation(promptData.userPrompt, onChunk, provider);
  }

  if (provider instanceof GoogleGenerativeAI) {
    const model = provider.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(promptData.userPrompt);
    const response = await result.response;
    return response.text();
  } else {
    const completion = await provider.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: promptData.systemPrompt },
        { role: 'user', content: promptData.userPrompt }
      ]
    });
    return completion.choices[0].message.content;
  }
}

/**
 * Generate MCQs using source prompts
 */
export async function generateMCQs(topic, count = 5) {
  const provider = getAIProvider();
  const promptData = PROMPTS.GENERATE_MCQS(topic.title, topic.content || topic.rawText || '', count);
  
  if (provider instanceof GoogleGenerativeAI) {
    const model = provider.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(promptData.userPrompt);
    const response = await result.response;
    const text = response.text();
    // Parse JSON from response
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse MCQ JSON:', e);
    }
    return [];
  } else {
    const completion = await provider.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: promptData.systemPrompt },
        { role: 'user', content: promptData.userPrompt }
      ],
      response_format: { type: 'json_object' }
    });
    try {
      return JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      return [];
    }
  }
}

/**
 * Generate flashcards using source prompts
 */
export async function generateFlashcards(topic, count = 5) {
  const provider = getAIProvider();
  const promptData = PROMPTS.GENERATE_FLASHCARDS(topic.title, topic.content || topic.rawText || '', count);
  
  if (provider instanceof GoogleGenerativeAI) {
    const model = provider.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(promptData.userPrompt);
    const response = await result.response;
    const text = response.text();
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse flashcard JSON:', e);
    }
    return [];
  } else {
    const completion = await provider.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: promptData.systemPrompt },
        { role: 'user', content: promptData.userPrompt }
      ],
      response_format: { type: 'json_object' }
    });
    try {
      return JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      return [];
    }
  }
}

/**
 * Check AI credits for a user (stub implementation)
 */
export async function checkAICredits(userId) {
  // TODO: Integrate with actual user credits system
  return {
    user_id: userId,
    credit_type: 'free',
    balance: 50,
    monthly_limit: 50,
    used_this_month: 0,
  };
}

/**
 * Generate quiz questions - wrapper around generateMCQs
 */
export async function generateQuizQuestions(topicId, count = 5) {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    const error = new Error('Topic not found');
    error.code = 'TOPIC_NOT_FOUND';
    throw error;
  }
  return generateMCQs(topic, count);
}

/**
 * Stream explanation via SSE
 */
async function streamExplanation(prompt, onChunk, provider) {
  if (provider instanceof GoogleGenerativeAI) {
    const model = provider.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text && onChunk) {
        onChunk(text);
      }
    }
  } else {
    const stream = await provider.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a friendly Pakistani board exam tutor.' },
        { role: 'user', content: prompt }
      ],
      stream: true
    });
    
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text && onChunk) {
        onChunk(text);
      }
    }
  }
}
