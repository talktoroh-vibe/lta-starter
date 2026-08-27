import type { Request, Response } from 'express';
import { getBusArrival } from './ltaClient';

export default async function handler(req: Request, res: Response) {
  try {
    const busStopCode = (req.query.busStopCode || req.query.BusStopCode) as string;
    const serviceNo = (req.query.serviceNo || req.query.ServiceNo) as string | undefined;

    if (!busStopCode) {
      return res.status(400).json({ error: 'Missing required query parameter: busStopCode (e.g. 83139)' });
    }

    const data = await getBusArrival(busStopCode, serviceNo);
    return res.json(data);
  } catch (error: any) {
    if (error.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    return res.status(500).json({ error: error.message || 'Failed to fetch bus arrivals' });
  }
}
