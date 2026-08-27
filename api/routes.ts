import { Router } from 'express';
import {
  getBusArrival,
  getCarParkAvailability,
  getTrafficIncidents,
  getTrainServiceAlerts,
  isCredentialConfigured,
} from './ltaClient';

export const apiRouter = Router();

// Endpoint to verify credential configuration status
apiRouter.get('/config-status', (req, res) => {
  const configured = isCredentialConfigured();
  res.json({
    configured,
    service: 'Singapore LTA DataMall',
    endpoints: [
      '/api/bus-arrival?busStopCode=83139&serviceNo=15',
      '/api/carparks',
      '/api/traffic-incidents',
      '/api/train-alerts',
    ],
  });
});

// 1. Next buses at a stop (v3 - 20-second refresh)
apiRouter.get('/bus-arrival', async (req, res) => {
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
    console.error('Error in /api/bus-arrival:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to fetch bus arrivals' });
  }
});

// 2. Live carpark lots (HDB + LTA + URA)
apiRouter.get('/carparks', async (req, res) => {
  try {
    const data = await getCarParkAvailability();
    return res.json(data);
  } catch (error: any) {
    if (error.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    console.error('Error in /api/carparks:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to fetch carpark availability' });
  }
});

// 3. Traffic incidents
apiRouter.get('/traffic-incidents', async (req, res) => {
  try {
    const data = await getTrafficIncidents();
    return res.json(data);
  } catch (error: any) {
    if (error.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    console.error('Error in /api/traffic-incidents:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to fetch traffic incidents' });
  }
});

// 4. Train service alerts
apiRouter.get('/train-alerts', async (req, res) => {
  try {
    const data = await getTrainServiceAlerts();
    return res.json(data);
  } catch (error: any) {
    if (error.message === 'credential not configured') {
      return res.status(500).json({ error: 'credential not configured' });
    }
    console.error('Error in /api/train-alerts:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to fetch train service alerts' });
  }
});
