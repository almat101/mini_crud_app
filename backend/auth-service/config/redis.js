import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config({ silent: true });

let redisClient = null;

//signleton pattern only one redis instance is ever created and shared across
//lazy initialization pattern the connection to redis is created on the first call of getRedisClient() not at import time
export async function getRedisClient() {
  if (!redisClient) {
    redisClient = await createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    })
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();
  }
  return redisClient;
}

//original version
// export const client = await createClient({
//   url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
// })
//   .on("error", (err) => console.log("Redis Client Error", err))
//   .connect();
