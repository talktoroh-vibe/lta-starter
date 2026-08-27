import type { Request, Response } from 'express';

export default function handler(_req: Request, res: Response) {
  return res.json({ status: 'ok', time: new Date().toISOString() });
}
