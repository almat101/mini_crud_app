import { Redis } from "ioredis"
import dotenv from "dotenv";

dotenv.config({ debug: false});

let redisClient: Redis | null = null;

export async function getRedisClient(): Promise<Redis> {
    if(!redisClient) {
        redisClient = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT)
        });
    }
    return redisClient;
}