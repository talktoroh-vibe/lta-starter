export interface PresetBusStop {
  code: string;
  name: string;
  road: string;
  popularServices: string[];
}

export const PRESET_BUS_STOPS: PresetBusStop[] = [
  {
    code: '83139',
    name: 'Opp Bedok Sports Cplx',
    road: 'Bedok North Ave 3',
    popularServices: ['15', '14', '18', '28', '45', '67', '69', '168', '228'],
  },
  {
    code: '01019',
    name: 'Bugis Stn Exit A',
    road: 'Victoria Street',
    popularServices: ['2', '12', '33', '130', '133', '960', '980'],
  },
  {
    code: '09048',
    name: 'Orchard Stn / Lucky Plaza',
    road: 'Orchard Road',
    popularServices: ['7', '14', '16', '65', '106', '111', '123', '175', '502'],
  },
  {
    code: '03218',
    name: 'Opp The Treasury',
    road: 'North Bridge Road',
    popularServices: ['51', '61', '63', '80', '124', '145', '166', '174', '197'],
  },
  {
    code: '28009',
    name: 'Jurong East Bus Interchange',
    road: 'Jurong Gateway Road',
    popularServices: ['51', '52', '66', '78', '79', '97', '105', '143', '183', '333'],
  },
  {
    code: '46009',
    name: 'Woodlands Temp Bus Interchange',
    road: 'Woodlands Square',
    popularServices: ['161', '168', '169', '178', '187', '856', '900', '901', '903', '911', '912', '913', '925', '960', '961', '963', '965', '966', '969'],
  },
  {
    code: '53009',
    name: 'Serangoon Bus Interchange',
    road: 'Serangoon Ave 2',
    popularServices: ['100', '101', '103', '105', '109', '158', '315', '317'],
  },
  {
    code: '54261',
    name: 'Bishan Stn',
    road: 'Bishan Road',
    popularServices: ['53', '54', '55', '56', '57', '58', '59', '410G', '410W'],
  },
  {
    code: '17009',
    name: 'Clementi Interchange',
    road: 'Commonwealth Ave West',
    popularServices: ['7', '14', '96', '99', '147', '156', '165', '166', '175', '196', '282', '284', '285'],
  },
  {
    code: '75009',
    name: 'Tampines Bus Interchange',
    road: 'Tampines Central 1',
    popularServices: ['3', '4', '8', '10', '19', '20', '23', '28', '29', '31', '37', '38', '46', '65', '67', '72', '81', '291', '292', '293'],
  },
];

export interface MrtLineInfo {
  code: string;
  name: string;
  color: string;
  textColor: string;
  bgLight: string;
  operator: string;
  length: string;
  stations: number;
}

export const MRT_LINES: MrtLineInfo[] = [
  {
    code: 'NSL',
    name: 'North-South Line',
    color: '#D42E12',
    textColor: '#ffffff',
    bgLight: 'bg-red-50 text-red-700 border-red-200',
    operator: 'SMRT',
    length: '45 km',
    stations: 27,
  },
  {
    code: 'EWL',
    name: 'East-West Line',
    color: '#009530',
    textColor: '#ffffff',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    operator: 'SMRT',
    length: '57 km',
    stations: 35,
  },
  {
    code: 'NEL',
    name: 'North East Line',
    color: '#8f4199',
    textColor: '#ffffff',
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
    operator: 'SBS Transit',
    length: '22 km',
    stations: 17,
  },
  {
    code: 'CCL',
    name: 'Circle Line',
    color: '#FF9E1B',
    textColor: '#000000',
    bgLight: 'bg-amber-50 text-amber-800 border-amber-200',
    operator: 'SMRT',
    length: '35.5 km',
    stations: 30,
  },
  {
    code: 'DTL',
    name: 'Downtown Line',
    color: '#0055B8',
    textColor: '#ffffff',
    bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
    operator: 'SBS Transit',
    length: '42 km',
    stations: 34,
  },
  {
    code: 'TEL',
    name: 'Thomson-East Coast Line',
    color: '#9D5B25',
    textColor: '#ffffff',
    bgLight: 'bg-orange-50 text-orange-800 border-orange-200',
    operator: 'SMRT',
    length: '43 km',
    stations: 32,
  },
  {
    code: 'BPLRT',
    name: 'Bukit Panjang LRT',
    color: '#748477',
    textColor: '#ffffff',
    bgLight: 'bg-slate-100 text-slate-700 border-slate-300',
    operator: 'SMRT',
    length: '7.8 km',
    stations: 13,
  },
  {
    code: 'SKLRT',
    name: 'Sengkang LRT',
    color: '#748477',
    textColor: '#ffffff',
    bgLight: 'bg-slate-100 text-slate-700 border-slate-300',
    operator: 'SBS Transit',
    length: '10.7 km',
    stations: 14,
  },
  {
    code: 'PGLRT',
    name: 'Punggol LRT',
    color: '#748477',
    textColor: '#ffffff',
    bgLight: 'bg-slate-100 text-slate-700 border-slate-300',
    operator: 'SBS Transit',
    length: '10.3 km',
    stations: 15,
  },
];

export const EXPRESSWAYS = [
  'All',
  'PIE',
  'CTE',
  'AYE',
  'ECP',
  'KPE',
  'SLE',
  'TPE',
  'BKE',
  'MCE',
  'KJE',
];
