import express, {
  Application,
  json,
  NextFunction,
  raw,
  Request,
  Response,
} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { ensureCsrfToken } from "@middlewares/csrfProtection";
import morgan from "morgan";
import Logs from "./Logs";

const App: Application = express();

App.use(cors());
App.use(cookieParser());

App.use((req: Request, res: Response, next: NextFunction) => {
  morgan((tokens, req, res): any => {
    Logs(
      ["http", "requests"],
      "req",
      [
        tokens.method(req, res)?.padEnd(5, " "),
        tokens.status(req, res),
        tokens.url(req, res),
        "-",
        tokens["response-time"](req, res),
        "ms",
      ].join(" ")
    );
  })(req, res, next);
});

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
