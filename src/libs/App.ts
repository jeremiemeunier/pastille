import express, { Application, json } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { ensureCsrfToken } from "@middlewares/csrfProtection";

const App: Application = express();

App.use(cors());
App.use(cookieParser());
App.use(json());

// Ensure CSRF tokens are available
App.use(ensureCsrfToken);

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

App.use(limiter);

export default App;
