import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ silent: true });
// console.log(process.env);
let pool;

// prima la pool veniva creata subito appena partiva l app, ora viene creata in modo ritardato(lazy) solo quando una funzione repository viene chiamata.
// questo migliora il testing perche pool non e piu globale ma isolato in ogni funzione repository
function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.POSTGRES_HOST_AUTH,
      user: process.env.POSTGRES_USER_AUTH,
      database: process.env.POSTGRES_DB_AUTH,
      password: process.env.POSTGRES_PASSWORD_AUTH,
      port: process.env.POSTGRES_PORT_AUTH,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      maxLifetimeSeconds: 60,
    });
  }
  return pool;
}

export async function testDatabaseConnection() {
  const pool = getPool();
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

// prev_query e' una query preventiva che serve a controllare se un utente o emai e' gia esistente
// const prev_query = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [ validateUser.username , validateUser.email ])
export async function executePrevQuery(username, email) {
  try {
    const pool = getPool();
    return pool.query("SELECT * FROM users WHERE username = $1 OR email = $2", [
      username,
      email,
    ]);
  } catch {
    throw new Error("Error on executePrevQuery");
  }
}

// Inserimento dello user nel db con una query protetta dai placeholder della libreria pg
// const text = `INSERT INTO users (username, email, password_hash) VALUES ($1 ,$2 ,$3 ) returning *`;
// const values = [ validateUser.username, validateUser.email, hash]
// const result = await pool.query( text, values);
export async function createUser(username, email, hash) {
  try {
    const pool = getPool();
    const text = `INSERT INTO users (username, email, password_hash) VALUES ($1 ,$2 ,$3 ) returning *`;
    const values = [username, email, hash];
    const result = await pool.query(text, values);
    return result;
  } catch {
    throw new Error("Error on createUser");
  }
}

// query per cercare l'utente dall email
// const query = await pool.query('SELECT * FROM users WHERE email = $1', [ validateUserLogin.email ])

export async function findUser(email) {
  try {
    const pool = getPool();
    return await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  } catch {
    throw new Error("Error on findUser");
  }
}
