import type { Request, Response } from 'express';
import { isCredentialConfigured } from './ltaClient';

export default function handler(_req: Request, res: Response) {
  const configured = isCredentialConfigured();
  return res.json({
    configured,
    service: 'Singapore LTA DataMall',
    endpoints: [
      '/api/bus-arrival?busStopCode=83139&serviceNo=15',
      '/api/carparks',
      '/api/traffic-incidents',
      '/api/train-alerts',
    ],
  });
}
