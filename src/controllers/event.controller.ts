import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { getCachedData, cacheData, clearCache } from '../lib/redis.js';

const CACHE_KEY = 'events';

export const getEvents = async (req: Request, res: Response) => {
    try {
        const cached = await getCachedData(CACHE_KEY);
        if (cached) return res.json(cached);

        const events = await prisma.event.findMany({
            orderBy: { date: 'desc' }
        });
        await cacheData(CACHE_KEY, events);
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

export const createEvent = async (req: Request, res: Response) => {
    try {
        const { title, description, date, location, time, image, tags, status } = req.body;
        const event = await prisma.event.create({
            data: {
                title,
                description,
                date,
                location,
                time,
                image,
                tags,
                status: status || 'UPCOMING'
            },
        });
        await clearCache(CACHE_KEY);
        res.status(201).json(event);
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.event.delete({ where: { id: id as string } });
        await clearCache(CACHE_KEY);
        res.json({ message: 'Event deleted' });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
};
