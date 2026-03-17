import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { getCachedData, cacheData, clearCache } from '../lib/redis.js';

const CACHE_KEY = 'events';

/**
 * Parse free-text date like "March 17, 2026" or "Mar 17, 2026" into a Date object.
 * Also handles formats like "17 March 2026", "2026-03-17", etc.
 */
function parseEventDate(dateStr: string): Date | null {
    try {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) return parsed;
        return null;
    } catch {
        return null;
    }
}

/**
 * Parse end time from free-text time string like "2:00 PM - 4:00 PM" or "9:00 AM onwards".
 * Returns the end time (or the only time if just one is given) as { hours, minutes } in 24h format.
 */
function parseEndTime(timeStr: string): { hours: number; minutes: number } | null {
    // Match patterns like "2:00 PM", "14:00", "2:00PM", "2 PM"
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/g;
    const matches = [...timeStr.matchAll(timeRegex)];

    if (matches.length === 0) return null;

    // Use the last time found (end time in "2:00 PM - 4:00 PM")
    const match = matches[matches.length - 1];
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2] || '0');
    const period = match[3]?.toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return { hours, minutes };
}

/**
 * Check if an event's date+time has passed and it should be auto-archived.
 */
function isEventExpired(event: { date: string; time: string }): boolean {
    const eventDate = parseEventDate(event.date);
    if (!eventDate) return false;

    const endTime = parseEndTime(event.time);
    const now = new Date();

    if (endTime) {
        eventDate.setHours(endTime.hours, endTime.minutes, 0, 0);
    } else {
        // If no time can be parsed, consider end of day
        eventDate.setHours(23, 59, 59, 999);
    }

    return now > eventDate;
}

/**
 * Auto-archive expired events: transitions LIVE/UPCOMING events to COMPLETED
 * when their date+time has passed.
 */
async function autoArchiveExpiredEvents(): Promise<boolean> {
    let changed = false;
    try {
        const activeEvents = await prisma.event.findMany({
            where: {
                status: { in: ['LIVE', 'UPCOMING'] }
            }
        });

        for (const event of activeEvents) {
            if (isEventExpired(event)) {
                await prisma.event.update({
                    where: { id: event.id },
                    data: { status: 'COMPLETED' }
                });
                changed = true;
                console.log(`Auto-archived event: "${event.title}" (${event.id})`);
            }
        }
    } catch (error) {
        console.error('Error during auto-archive:', error);
    }
    return changed;
}

export const getEvents = async (req: Request, res: Response) => {
    try {
        // Run auto-archive before serving events
        const archiveChanged = await autoArchiveExpiredEvents();

        // If any events were archived, clear the cache
        if (archiveChanged) {
            await clearCache(CACHE_KEY);
        }

        const cached = await getCachedData(CACHE_KEY);
        if (cached) return res.json(cached);

        const events = await prisma.event.findMany({
            orderBy: { createdAt: 'desc' }
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
        const { title, description, date, location, time, image, tags, status, feedbackFormUrl } = req.body;
        const event = await prisma.event.create({
            data: {
                title,
                description,
                date,
                location,
                time,
                image,
                tags,
                status: status || 'UPCOMING',
                feedbackFormUrl: feedbackFormUrl || null
            },
        });
        await clearCache(CACHE_KEY);
        res.status(201).json(event);
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, feedbackFormUrl } = req.body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (feedbackFormUrl !== undefined) updateData.feedbackFormUrl = feedbackFormUrl || null;

        const event = await prisma.event.update({
            where: { id: id as string },
            data: updateData
        });
        await clearCache(CACHE_KEY);
        res.json(event);
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: 'Failed to update event' });
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
