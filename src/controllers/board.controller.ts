import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { getCachedData, cacheData, clearCache } from '../lib/redis.js';

const CACHE_KEY = 'board_members';

export const getBoardMembers = async (req: Request, res: Response) => {
    try {
        const cached = await getCachedData(CACHE_KEY);
        if (cached) return res.json(cached);

        const members = await prisma.boardMember.findMany({
            orderBy: { createdAt: 'asc' }
        });
        await cacheData(CACHE_KEY, members);
        res.json(members);
    } catch (error) {
        console.error("Error fetching board members:", error);
        res.status(500).json({ error: 'Failed to fetch board members' });
    }
};

export const createBoardMember = async (req: Request, res: Response) => {
    try {
        const { name, role, image, github, linkedin, discord } = req.body;
        const member = await prisma.boardMember.create({
            data: { name, role, image, github, linkedin, discord },
        });
        await clearCache(CACHE_KEY);
        res.status(201).json(member);
    } catch (error) {
        console.error("Error creating board member:", error);
        res.status(500).json({ error: 'Failed to create board member' });
    }
};

export const deleteBoardMember = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.boardMember.delete({ where: { id: id as string } });
        await clearCache(CACHE_KEY);
        res.json({ message: 'Board member deleted' });
    } catch (error) {
        console.error("Error deleting board member", error);
        res.status(500).json({ error: 'Failed to delete board member' });
    }
};
