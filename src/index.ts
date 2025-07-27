import express from "express";
import type { Request, Response } from "express";
import morgan from "morgan";
import path from "path";

const PORT:string|number = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/stream', async (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'stream.html'));
})

app.get('/ping', async (req: Request, res: Response) => {
  res.json({ "status": "pong" });
});

app.listen(PORT);
