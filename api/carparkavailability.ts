import type { Request, Response } from 'express';

const LTA_CARPARK_ENDPOINT = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export interface LTACarparkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // e.g. "1.29375 103.85718" (lat lng)
  AvailableLots: number;
  LotType: 'C' | 'M' | 'H'; // C: Cars, M: Motorcycles, H: Heavy
  Agency: 'HDB' | 'LTA' | 'URA';
}

export interface LTAResponse {
  'odata.metadata'?: string;
  value: LTACarparkItem[];
}

/**
 * Serverless connection pulling live carpark lot availability from LTA DataMall.
 * GET /api/carparkavailability
 * Supports:
 * - Query param `skip` (number): Pagination skip (default: 0)
 * - Query param `all` (boolean): If true, iteratively fetches all batches from LTA DataMall
 */
export default async function handler(req: Request, res: Response) {
  // CORS Configuration for frontend & API clients
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, accountkey, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only GET requests are supported.',
    });
  }

  // Retrieve AccountKey from environment or incoming request header
  const accountKey =
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_DATAMALL_KEY ||
    process.env.ACCOUNT_KEY ||
    (req.headers['accountkey'] as string) ||
    (req.headers['account-key'] as string) ||
    '';

  // Check if AccountKey is provided
  if (!accountKey || accountKey.trim() === '') {
    return res.status(200).json({
      success: false,
      status: 'KEY_NOT_CONFIGURED',
      message:
        'LTA DataMall AccountKey is not yet configured. Please set LTA_DATAMALL_ACCOUNT_KEY or ACCOUNT_KEY in your environment, or provide an "AccountKey" header.',
      endpoint: LTA_CARPARK_ENDPOINT,
      documentation: 'https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html',
      totalRecords: 0,
      timestamp: new Date().toISOString(),
      value: [],
    });
  }

  try {
    const fetchAll = req.query.all === 'true';
    const skipParam = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;

    if (fetchAll) {
      // Fetch all batches (LTA paginates in blocks of 500)
      let allLots: LTACarparkItem[] = [];
      let currentSkip = 0;
      let hasMore = true;

      while (hasMore) {
        const fetchUrl = `${LTA_CARPARK_ENDPOINT}?$skip=${currentSkip}`;
        const response = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            AccountKey: accountKey.trim(),
            accept: 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          return res.status(response.status).json({
            success: false,
            error: `LTA DataMall API responded with status ${response.status}`,
            details: errorText,
          });
        }

        const data = (await response.json()) as LTAResponse;
        const items = data.value || [];
        allLots = allLots.concat(items);

        if (items.length < 500 || currentSkip >= 3000) {
          hasMore = false;
        } else {
          currentSkip += 500;
        }
      }

      return res.status(200).json({
        success: true,
        source: 'LTA DataMall v2 (CarParkAvailabilityv2)',
        timestamp: new Date().toISOString(),
        totalRecords: allLots.length,
        value: allLots,
      });
    }

    // Default: Single batch with optional $skip
    const fetchUrl =
      skipParam > 0
        ? `${LTA_CARPARK_ENDPOINT}?$skip=${skipParam}`
        : LTA_CARPARK_ENDPOINT;

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        AccountKey: accountKey.trim(),
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `LTA DataMall API responded with status ${response.status}`,
        details: errorText,
      });
    }

    const data = (await response.json()) as LTAResponse;

    return res.status(200).json({
      success: true,
      source: 'LTA DataMall v2 (CarParkAvailabilityv2)',
      timestamp: new Date().toISOString(),
      skip: skipParam,
      count: data.value ? data.value.length : 0,
      value: data.value || [],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch live carpark availability from LTA DataMall',
      message: error?.message || 'Internal server error connecting to LTA gateway',
      timestamp: new Date().toISOString(),
    });
  }
}
