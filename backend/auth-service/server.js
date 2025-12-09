import app from "./app.js";
import { getPool } from "./config/database.js";
import { getRedisClient } from "./config/redis.js";

const AUTH_PORT = process.env.PORT || 3030;
let isDown = false;

const server = app.listen(AUTH_PORT, () => {
  console.log(`Auth app listening on port ${AUTH_PORT}`);
  console.log(`
          Route available:
          '/auth/signup (POST)
          '/auth/login' (POST)
          `);
});

// server.close wrapped into a promise to handle async/await
const serverCloseAsPromise = () =>
  new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

async function shutdown(signal) {
  if (isDown) return;
  isDown = true;
  console.log(`Received  ${signal}.Closing database and server...`);
  try {
    //close the server (ensure it does not accept new connections)
    await serverCloseAsPromise();
  } catch (error) {
    console.error("Error on", error);
  }
  try {
    const pool = getPool();
    //close the db connection pool
    await pool.end();
  } catch (error) {
    console.error("Error on", error);
  }
  try {
    const client = await getRedisClient();
    //closing the redis connection with client.close instead of the depracted .quit()
    await client.close();
  } catch (error) {
    console.error("Error on", error);
  }
  console.log("Shutdown complete.");
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
