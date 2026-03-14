import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});

export default redis;

export const cacheData = async (key: string, data: any, ttlSeconds: number = 3600) => {
    try {
        await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch (error) {
        console.error('Redis set error:', error);
    }
};

export const getCachedData = async (key: string) => {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
};

export const clearCache = async (key: string) => {
    try {
        await redis.del(key);
    } catch (error) {
        console.error('Redis del error:', error);
    }
};
