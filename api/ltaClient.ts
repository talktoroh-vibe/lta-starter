/**
 * Singapore LTA DataMall API Client
 * Reads credential strictly via process.env in the api/ directory.
 */

export interface LtaBusArrivalResponse {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: Array<{
    ServiceNo: string;
    Operator: string;
    NextBus?: {
      OriginCode?: string;
      DestinationCode?: string;
      EstimatedArrival?: string;
      Latitude?: string;
      Longitude?: string;
      VisitNumber?: string;
      Load?: 'SEA' | 'SDA' | 'LSD' | string;
      Feature?: 'WAB' | string;
      Type?: 'SD' | 'DD' | 'BD' | string;
    };
    NextBus2?: {
      OriginCode?: string;
      DestinationCode?: string;
      EstimatedArrival?: string;
      Latitude?: string;
      Longitude?: string;
      VisitNumber?: string;
      Load?: 'SEA' | 'SDA' | 'LSD' | string;
      Feature?: 'WAB' | string;
      Type?: 'SD' | 'DD' | 'BD' | string;
    };
    NextBus3?: {
      OriginCode?: string;
      DestinationCode?: string;
      EstimatedArrival?: string;
      Latitude?: string;
      Longitude?: string;
      VisitNumber?: string;
      Load?: 'SEA' | 'SDA' | 'LSD' | string;
      Feature?: 'WAB' | string;
      Type?: 'SD' | 'DD' | 'BD' | string;
    };
  }>;
}

export interface LtaCarparkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string;
  AvailableLots: number | string;
  LotType: string;
  Agency: string;
}

export interface LtaCarparkResponse {
  'odata.metadata'?: string;
  value: LtaCarparkItem[];
}

export interface LtaTrafficIncidentItem {
  Type: string;
  Latitude: number;
  Longitude: number;
  Message: string;
}

export interface LtaTrafficIncidentsResponse {
  'odata.metadata'?: string;
  value: LtaTrafficIncidentItem[];
}

export interface LtaTrainAlertAffectedSegment {
  Line: string;
  Direction: string;
  Stations: string;
  FreePublicBus: string;
  FreeMRTShuttle: string;
  MRTShuttleDirection: string;
}

export interface LtaTrainAlertsResponse {
  'odata.metadata'?: string;
  value: {
    Status: number;
    AffectedSegments?: LtaTrainAlertAffectedSegment[];
    Message?: Array<{
      Content: string;
      CreatedDate: string;
    }>;
  };
}

/**
 * Validates and retrieves the LTA DataMall AccountKey from environment variables.
 * Fails fast if the credential is not configured.
 */
export function getLtaAccountKey(): string {
  const key = process.env.LTA_ACCOUNT_KEY || process.env.ACCOUNT_KEY;
  if (!key || key.trim() === '') {
    throw new Error('credential not configured');
  }
  return key.trim();
}

/**
 * Checks whether the credential is configured without exposing it.
 */
export function isCredentialConfigured(): boolean {
  try {
    getLtaAccountKey();
    return true;
  } catch {
    return false;
  }
}

const LTA_BASE_URL = 'https://datamall2.mytransport.sg/ltaodataservice';

async function fetchFromLta<T>(endpointUrl: string): Promise<T> {
  const accountKey = getLtaAccountKey(); // Throws 'credential not configured' if absent

  const res = await fetch(endpointUrl, {
    headers: {
      AccountKey: accountKey,
      accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`LTA API responded with status ${res.status}: ${errorBody || res.statusText}`);
  }

  return (await res.json()) as T;
}

/**
 * Fetch Next buses at a stop (v3 - current version)
 * @param busStopCode 5-digit bus stop code (e.g. "83139")
 * @param serviceNo optional specific bus service number (e.g. "15")
 */
export async function getBusArrival(busStopCode: string, serviceNo?: string): Promise<LtaBusArrivalResponse> {
  if (!busStopCode) {
    throw new Error('busStopCode is required');
  }

  let url = `${LTA_BASE_URL}/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;
  if (serviceNo && serviceNo.trim() !== '') {
    url += `&ServiceNo=${encodeURIComponent(serviceNo.trim())}`;
  }

  return await fetchFromLta<LtaBusArrivalResponse>(url);
}

/**
 * Fetch Live Carpark lots availability (HDB + LTA + URA)
 */
export async function getCarParkAvailability(): Promise<LtaCarparkResponse> {
  const url = `${LTA_BASE_URL}/CarParkAvailabilityv2`;
  return await fetchFromLta<LtaCarparkResponse>(url);
}

/**
 * Fetch Live Traffic Incidents
 */
export async function getTrafficIncidents(): Promise<LtaTrafficIncidentsResponse> {
  const url = `${LTA_BASE_URL}/TrafficIncidents`;
  return await fetchFromLta<LtaTrafficIncidentsResponse>(url);
}

/**
 * Fetch MRT/LRT Train Service Alerts
 */
export async function getTrainServiceAlerts(): Promise<LtaTrainAlertsResponse> {
  const url = `${LTA_BASE_URL}/TrainServiceAlerts`;
  return await fetchFromLta<LtaTrainAlertsResponse>(url);
}
