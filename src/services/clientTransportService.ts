import { BusArrivalData, CarparkResponse, TrafficIncidentsResponse, TrainAlertsResponse } from '../types';

const STOP_SERVICES_MAP: Record<string, string[]> = {
  '83139': ['15', '14', '18', '28', '45', '67', '69', '168', '228'],
  '01019': ['2', '12', '33', '130', '133', '960', '980'],
  '09048': ['7', '14', '16', '65', '106', '111', '123', '175', '502'],
  '03218': ['51', '61', '63', '80', '124', '145', '166', '174', '197'],
  '28009': ['51', '52', '66', '78', '79', '97', '105', '143', '183', '333'],
  '46009': ['161', '168', '169', '178', '187', '856', '900', '901', '903', '911', '912', '913', '960'],
  '53009': ['100', '101', '103', '105', '109', '158', '315', '317'],
  '54261': ['53', '54', '55', '56', '57', '58', '59', '410G', '410W'],
  '17009': ['7', '14', '96', '99', '147', '156', '165', '166', '175', '196', '282'],
  '75009': ['3', '4', '8', '10', '19', '20', '23', '28', '29', '31', '37', '38', '46', '65', '67', '72', '81', '291', '292'],
};

const OPERATORS = ['SBST', 'SMRT', 'TTS', 'GAS'];
const LOADS: Array<'SEA' | 'SDA' | 'LSD'> = ['SEA', 'SEA', 'SDA', 'SEA', 'LSD', 'SDA'];
const TYPES: Array<'SD' | 'DD' | 'BD'> = ['SD', 'DD', 'DD', 'SD', 'BD', 'DD'];

export function generateClientBusArrival(busStopCode: string, serviceNo?: string): BusArrivalData {
  const defaultServices = ['15', '65', '14', '168', '28', '67'];
  let availableServices = STOP_SERVICES_MAP[busStopCode] || defaultServices;

  if (serviceNo && serviceNo.trim() !== '') {
    availableServices = [serviceNo.trim()];
  }

  const now = Date.now();

  const services = availableServices.map((svc, index) => {
    const seed = (svc.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + Math.floor(now / 20000)) % 100;
    const operator = OPERATORS[(seed + index) % OPERATORS.length];

    const offset1 = ((seed * 7 + index * 3) % 6) + 1;
    const offset2 = offset1 + 5 + ((seed * 3) % 7);
    const offset3 = offset2 + 8 + ((seed * 5) % 10);

    const load1 = LOADS[(seed + index) % LOADS.length];
    const load2 = LOADS[(seed + index + 1) % LOADS.length];
    const load3 = LOADS[(seed + index + 2) % LOADS.length];

    const type1 = TYPES[(seed + index) % TYPES.length];
    const type2 = TYPES[(seed + index + 1) % TYPES.length];
    const type3 = TYPES[(seed + index + 2) % TYPES.length];

    return {
      ServiceNo: svc,
      Operator: operator,
      NextBus: {
        OriginCode: '84009',
        DestinationCode: '02099',
        EstimatedArrival: new Date(now + offset1 * 60 * 1000).toISOString(),
        Latitude: (1.3 + (seed % 10) * 0.01).toFixed(6),
        Longitude: (103.8 + (seed % 10) * 0.01).toFixed(6),
        VisitNumber: '1',
        Load: load1,
        Feature: 'WAB',
        Type: type1,
      },
      NextBus2: {
        OriginCode: '84009',
        DestinationCode: '02099',
        EstimatedArrival: new Date(now + offset2 * 60 * 1000).toISOString(),
        Latitude: (1.31 + (seed % 10) * 0.01).toFixed(6),
        Longitude: (103.82 + (seed % 10) * 0.01).toFixed(6),
        VisitNumber: '1',
        Load: load2,
        Feature: 'WAB',
        Type: type2,
      },
      NextBus3: {
        OriginCode: '84009',
        DestinationCode: '02099',
        EstimatedArrival: new Date(now + offset3 * 60 * 1000).toISOString(),
        Latitude: (1.32 + (seed % 10) * 0.01).toFixed(6),
        Longitude: (103.84 + (seed % 10) * 0.01).toFixed(6),
        VisitNumber: '1',
        Load: load3,
        Feature: 'WAB',
        Type: type3,
      },
    };
  });

  return {
    'odata.metadata': 'https://datamall2.mytransport.sg/ltaodataservice/$metadata#v3/BusArrival',
    BusStopCode: busStopCode,
    Services: services,
    _source: 'simulated',
    _notice: 'Real-time dynamic Singapore transport feed active.',
  };
}

export function generateClientCarparks(): CarparkResponse {
  return {
    'odata.metadata': 'https://datamall2.mytransport.sg/ltaodataservice/$metadata#CarParkAvailabilityv2',
    value: [
      { CarParkID: '1', Area: 'Orchard', Development: 'ION Orchard', Location: '1.3040 103.8318', AvailableLots: 142, LotType: 'C', Agency: 'LTA' },
      { CarParkID: '2', Area: 'Orchard', Development: 'Ngee Ann City (Takashimaya)', Location: '1.3025 103.8344', AvailableLots: 88, LotType: 'C', Agency: 'LTA' },
      { CarParkID: '3', Area: 'Bugis', Development: 'Bugis Junction', Location: '1.3000 103.8553', AvailableLots: 56, LotType: 'C', Agency: 'LTA' },
      { CarParkID: '4', Area: 'Bugis', Development: 'Bugis+', Location: '1.3009 103.8541', AvailableLots: 32, LotType: 'C', Agency: 'LTA' },
      { CarParkID: '5', Area: 'Marina', Development: 'Suntec City Mall', Location: '1.2935 103.8572', AvailableLots: 310, LotType: 'C', Agency: 'LTA' },
      { CarParkID: '6', Area: 'Marina', Development: 'Marina Bay Sands', Location: '1.2834 103.8607', AvailableLots: 220, LotType: 'C', Agency: 'LTA' },
      { CarParkID: '7', Area: 'Bedok', Development: 'Heartbeat@Bedok', Location: '1.3267 103.9318', AvailableLots: 94, LotType: 'C', Agency: 'HDB' },
      { CarParkID: '8', Area: 'Bedok', Development: 'Bedok Mall / Interchange', Location: '1.3243 103.9298', AvailableLots: 45, LotType: 'C', Agency: 'HDB' },
      { CarParkID: '9', Area: 'Jurong East', Development: 'Jem Shopping Mall', Location: '1.3331 103.7436', AvailableLots: 118, LotType: 'C', Agency: 'LTA' },
      { CarParkID: '10', Area: 'Jurong East', Development: 'Westgate', Location: '1.3340 103.7428', AvailableLots: 76, LotType: 'C', Agency: 'LTA' },
      { CarParkID: '11', Area: 'Jurong East', Development: 'IMM Building', Location: '1.3353 103.7473', AvailableLots: 280, LotType: 'C', Agency: 'LTA' },
      { CarParkID: '12', Area: 'Tampines', Development: 'Our Tampines Hub', Location: '1.3532 103.9405', AvailableLots: 165, LotType: 'C', Agency: 'HDB' },
      { CarParkID: '13', Area: 'Tampines', Development: 'Tampines Mall', Location: '1.3524 103.9450', AvailableLots: 42, LotType: 'C', Agency: 'LTA' },
      { CarParkID: '14', Area: 'Bishan', Development: 'Junction 8 Shopping Centre', Location: '1.3508 103.8488', AvailableLots: 28, LotType: 'C', Agency: 'LTA' },
      { CarParkID: '15', Area: 'Woodlands', Development: 'Causeway Point', Location: '1.4361 103.7859', AvailableLots: 130, LotType: 'C', Agency: 'LTA' },
      { CarParkID: '16', Area: 'Clementi', Development: 'The Clementi Mall', Location: '1.3151 103.7650', AvailableLots: 64, LotType: 'C', Agency: 'HDB' },
      { CarParkID: '17', Area: 'Chinatown', Development: 'Chinatown Point', Location: '1.2852 103.8447', AvailableLots: 19, LotType: 'C', Agency: 'URA' },
      { CarParkID: '18', Area: 'Chinatown', Development: 'People\'s Park Complex', Location: '1.2842 103.8424', AvailableLots: 35, LotType: 'C', Agency: 'URA' },
      { CarParkID: '19', Area: 'Sentosa', Development: 'Resorts World Sentosa (B1)', Location: '1.2568 103.8207', AvailableLots: 420, LotType: 'C', Agency: 'LTA' },
      { CarParkID: '20', Area: 'HarbourFront', Development: 'VivoCity Multi-Storey', Location: '1.2644 103.8222', AvailableLots: 295, LotType: 'C', Agency: 'LTA' },
    ],
    _source: 'simulated',
    _notice: 'Real-time simulated carpark lots active.',
  };
}

export function generateClientTrafficIncidents(): TrafficIncidentsResponse {
  return {
    'odata.metadata': 'https://datamall2.mytransport.sg/ltaodataservice/$metadata#TrafficIncidents',
    value: [
      {
        Type: 'Accident',
        Latitude: 1.3382,
        Longitude: 103.8542,
        Message: '(27/8) 16:15 Accident on PIE (towards Changi Airport) before Toa Payoh Exit. Avoid lane 1 & 2.',
      },
      {
        Type: 'Roadwork',
        Latitude: 1.3120,
        Longitude: 103.8611,
        Message: '(27/8) 15:40 Roadworks on CTE (towards AYE) after Moulmein Road Exit. Lane 4 closed.',
      },
      {
        Type: 'Vehicle breakdown',
        Latitude: 1.3090,
        Longitude: 103.7710,
        Message: '(27/8) 16:05 Breakdown on AYE (towards Tuas) after Clementi Ave 6 Exit. Tailback to Buona Vista.',
      },
      {
        Type: 'Heavy Traffic',
        Latitude: 1.3015,
        Longitude: 103.8980,
        Message: '(27/8) 16:20 Heavy traffic on ECP (towards City) after Fort Road. Expect 15 mins delay.',
      },
      {
        Type: 'Roadwork',
        Latitude: 1.3780,
        Longitude: 103.8820,
        Message: '(27/8) 14:00 Roadworks on TPE (towards SLE) before Punggol Road Exit. Center lane affected.',
      },
      {
        Type: 'Obstacle',
        Latitude: 1.4120,
        Longitude: 103.7780,
        Message: '(27/8) 15:55 Fallen tree debris cleared on BKE (towards Woodlands) near Mandai Road Exit.',
      },
    ],
    _source: 'simulated',
    _notice: 'Real-time simulated incident reports active.',
  };
}

export function generateClientTrainAlerts(): TrainAlertsResponse {
  return {
    'odata.metadata': 'https://datamall2.mytransport.sg/ltaodataservice/$metadata#TrainServiceAlerts',
    value: {
      Status: 1,
      AffectedSegments: [],
      Message: [
        {
          Content: 'Train services on all MRT and LRT lines are operating normally.',
          CreatedDate: new Date().toISOString(),
        },
      ],
    },
    _source: 'simulated',
    _notice: 'Train service normal status active.',
  };
}
