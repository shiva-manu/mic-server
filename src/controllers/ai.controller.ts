import type { Request, Response } from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

// Lazily initialize Groq to prevent crash if key is missing during startup
let groq: Groq | null = null;
const getGroq = () => {
    if (!groq) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error('GROQ_API_KEY is missing');
            return null;
        }
        groq = new Groq({ apiKey });
    }
    return groq;
};

export const chatWithAI = async (req: Request, res: Response) => {
    try {
        const { messages } = req.body;
        const groqInstance = getGroq();

        if (!groqInstance) {
            return res.status(500).json({ error: 'AI service not configured. Please add GROQ_API_KEY to .env' });
        }

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = await groqInstance.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI assistant for the Machine Intelligence Club (MIC) at SNIST. You are knowledgeable about Artificial Intelligence, Machine Learning, and the activities of the club. Be professional, helpful, and concise. CRITICAL: Format your responses using strict Markdown ONLY. USE GFM TABLE SYNTAX (e.g. | Column |) for tables. NEVER use HTML tags like <br>. NEVER use tab characters or spaces for alignment—use proper Markdown table syntax. Use double newlines for paragraph breaks.',
                },
                ...messages,
            ],
            model: 'openai/gpt-oss-120b',
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Error with Groq AI:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to get response from AI' });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
            res.end();
        }
    }
};
