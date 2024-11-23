import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const App: Application = express();

App.use(cors());
App.use(cookieParser());

export default App;
