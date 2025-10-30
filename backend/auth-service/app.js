import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import { testDatabaseConnection } from "./repositories/authRepository.js";
const app = express();
const PORT = 3030;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost",
      "https://crud1.alematta.com",
    ], //cors per il frontend per sviluppo locale e per nginx in produzione
    methods: ["GET", "POST", "PATCH", "DELETE"],
    // credentials: true,
  })
);

// middleware logger utile per stampare info sulla richiesta es "GET /about 200 1.896 ms - 34"
app.use(morgan("dev"));

// middleware che aggiunge vari header di sicurezza alla risposta HTTP
app.use(helmet());

// Parsa il corpo(body) delle richieste in entrata quando sono in formato JSON
app.use(express.json());

// rotta test
// app.get('/', async (req, res) => {
//   res.send('Hello auth-service!');
// });

// Collego il router di autenticazione aggiungo /auth in modo da dover chiamare solo /auth/signup e auth/login
app.use("/auth", authRoutes);

app.get("/health", async (req, res) => {
  try {
    await testDatabaseConnection();
    res.status(200).json({
      status: "ok",
      check: {
        app: "running",
        database: "connected",
      },
    });
  } catch (error) {
    console.error("Health check failed: ", error);
    res.status(500).json({
      status: "error",
      check: {
        app: "running",
        database: "disconnected",
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Auth app listening on port ${PORT}`);
  console.log(`
          Route available:
          '/' return Hello auth-service!
          '/auth/signup (POST)
          '/auth/login' (POST)
      `);
});
