export interface BusArrivalInfo {
  OriginCode?: string;
  DestinationCode?: string;
  EstimatedArrival?: string;
  Latitude?: string;
  Longitude?: string;
  VisitNumber?: string;
  Load?: 'SEA' | 'SDA' | 'LSD' | string;
  Feature?: 'WAB' | string;
  Type?: 'SD' | 'DD' | 'BD' | string;
}

export interface BusService {
  ServiceNo: string;
  Operator: string;
  NextBus?: BusArrivalInfo;
  NextBus2?: BusArrivalInfo;
  NextBus3?: BusArrivalInfo;
}

export interface BusArrivalData {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: BusService[];
}

export interface CarparkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string;
  AvailableLots: number | string;
  LotType: string;
  Agency: 'HDB' | 'LTA' | 'URA' | string;
}

export interface CarparkResponse {
  'odata.metadata'?: string;
  value: CarparkItem[];
}

export interface TrafficIncident {
  Type: string;
  Latitude: number;
  Longitude: number;
  Message: string;
}

export interface TrafficIncidentsResponse {
  'odata.metadata'?: string;
  value: TrafficIncident[];
}

export interface TrainAlertAffectedSegment {
  Line: string;
  Direction: string;
  Stations: string;
  FreePublicBus: string;
  FreeMRTShuttle: string;
  MRTShuttleDirection: string;
}

export interface TrainAlertsResponse {
  'odata.metadata'?: string;
  value: {
    Status: number;
    AffectedSegments?: TrainAlertAffectedSegment[];
    Message?: Array<{
      Content: string;
      CreatedDate: string;
    }>;
  };
}

export type ActiveTab = 'bus' | 'carparks' | 'traffic' | 'trains' | 'api-docs';
