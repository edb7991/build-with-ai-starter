import type { Request, Response } from 'express';

/**
 * Health check serverless endpoint.
 * GET /api/health
 */
export default async function handler(req: Request, res: Response) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasAccountKey = Boolean(
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_DATAMALL_KEY ||
    process.env.ACCOUNT_KEY ||
    req.headers['accountkey'] ||
    req.headers['account-key']
  );

  return res.status(200).json({
    status: 'healthy',
    service: 'ParkSG Singapore Carpark Availability API Connector',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    ltaDataMall: {
      endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      accountKeyConfigured: hasAccountKey,
    },
  });
}
