import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
const app = express();

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

app.get("/health", healthRoutes);

export default app;
