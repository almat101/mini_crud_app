import { Redis } from 'ioredis'
import dotenv from 'dotenv'

dotenv.config();

let redisClient = null;

export async function getRedisClient() {
    if(!redisClient) {
        redisClient = new Redis({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        });
    }
    return redisClient;
}