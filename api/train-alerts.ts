import type { Request, Response } from 'express';
import { getTrainServiceAlerts } from './ltaClient';

export default async function handler(_req: Request, res: Response) {
  try {
    const data = await getTrainServiceAlerts();
    return res.json(data);
  } catch (error: any) {
    if (error.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    return res.status(500).json({ error: error.message || 'Failed to fetch train service alerts' });
  }
}
