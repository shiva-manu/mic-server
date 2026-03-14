import type { Request, Response } from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const chatWithAI = async (req: Request, res: Response) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI assistant for the Machine Intelligence Club (MIC) at SNIST. You are knowledgeable about Artificial Intelligence, Machine Learning, and the activities of the club. Be professional, helpful, and concise.',
                },
                ...messages,
            ],
            model: 'llama-3.3-70b-versatile',
        });

        res.json({
            message: completion.choices[0]?.message?.content || 'No response from AI',
        });
    } catch (error) {
        console.error('Error with Groq AI:', error);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
};
