import type { Request, Response } from 'express';
import { getCarParkAvailability } from './ltaClient';

export default async function handler(_req: Request, res: Response) {
  try {
    const data = await getCarParkAvailability();
    return res.json(data);
  } catch (error: any) {
    if (error.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    return res.status(500).json({ error: error.message || 'Failed to fetch carpark availability' });
  }
}
