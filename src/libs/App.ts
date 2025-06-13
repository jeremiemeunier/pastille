import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";

const App: Application = express();

App.use(cors());
App.use(cookieParser());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

App.use(limiter);

export default App;
