import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { getCachedData, cacheData, clearCache } from '../lib/redis.js';

const CACHE_KEY = 'advisory_members';

export const getAdvisoryMembers = async (req: Request, res: Response) => {
    try {
        const cached = await getCachedData(CACHE_KEY);
        if (cached) return res.json(cached);

        const members = await prisma.advisory.findMany({
            orderBy: { createdAt: 'asc' }
        });
        await cacheData(CACHE_KEY, members);
        res.json(members);
    } catch (error) {
        console.error("Error fetching advisory members:", error);
        res.status(500).json({ error: 'Failed to fetch advisory members' });
    }
};

export const createAdvisoryMember = async (req: Request, res: Response) => {
    try {
        const { name, role, image, github, linkedin, discord } = req.body;
        const member = await prisma.advisory.create({
            data: { name, role, image, github, linkedin, discord },
        });
        await clearCache(CACHE_KEY);
        res.status(201).json(member);
    } catch (error) {
        console.error("Error creating advisory member:", error);
        res.status(500).json({ error: 'Failed to create advisory member' });
    }
};

export const deleteAdvisoryMember = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.advisory.delete({ where: { id: id as string } });
        await clearCache(CACHE_KEY);
        res.json({ message: 'Advisory member deleted' });
    } catch (error) {
        console.error("Error deleting advisory member:", error);
        res.status(500).json({ error: 'Failed to delete advisory member' });
    }
};
