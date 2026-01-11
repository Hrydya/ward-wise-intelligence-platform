
import { WardData, Complaint, ConstructionSite } from './types';

export const DELHI_WARDS: WardData[] = [
  {
    id: 'w44',
    name: 'ANAND VIHAR',
    aqi: 412,
    priorityScore: 98,
    populationDensity: 'High',
    status: 'CRITICAL',
    whyToday: "Peak congestion at ISBT and unauthorized biomass combustion in adjacent industrial zones.",
    sourceDistribution: { industrial: 20, vehicular: 48, construction: 12, biomass: 20 },
    complaints: 42,
    responseTime: '1.5h',
    outcomeTrend: 'Stable',
    sensorCoverage: 92,
    dataConfidence: 'High',
    lastUpdated: '2 min ago',
    dataSource: 'sensor',
    aqiDuration: '6 hours',
    recommendedActions: [
      'Restrict construction activities (48 hrs emergency ban)',
      'Deploy dust suppression trucks on Ring Road',
      'Traffic diversion during peak hours (7-10 AM)',
      'Coordinate with ISBT for vehicle staging area relocation'
    ],
    trendHistory: [
      { timestamp: '6 AM', aqi: 380 },
      { timestamp: '9 AM', aqi: 402 },
      { timestamp: '12 PM', aqi: 412 },
      { timestamp: '3 PM', aqi: 408 }
    ]
  },
  {
    id: 'w08',
    name: 'DWARKA SEC-8',
    aqi: 308,
    priorityScore: 74,
    populationDensity: 'Medium',
    status: 'POOR',
    whyToday: "Localized dust from arterial road expansions and high vehicular idling at intersections.",
    sourceDistribution: { industrial: 10, vehicular: 55, construction: 25, biomass: 10 },
    complaints: 18,
    responseTime: '3.2h',
    outcomeTrend: 'Success',
    sensorCoverage: 78,
    dataConfidence: 'High',
    lastUpdated: '5 min ago',
    dataSource: 'sensor',
    aqiDuration: '4 hours',
    recommendedActions: [
      'Intensify metro construction dust management',
      'Deploy air quality monitors at metro pillar sites',
      'Schedule dust control on alternate Sundays'
    ],
    trendHistory: [
      { timestamp: '6 AM', aqi: 280 },
      { timestamp: '9 AM', aqi: 295 },
      { timestamp: '12 PM', aqi: 308 },
      { timestamp: '3 PM', aqi: 302 }
    ]
  },
  {
    id: 'w15',
    name: 'OKHLA PHASE III',
    aqi: 356,
    priorityScore: 89,
    populationDensity: 'High',
    status: 'SEVERE',
    whyToday: "Industrial emission bypass and heavy transport traffic during logistics windows.",
    sourceDistribution: { industrial: 65, vehicular: 20, construction: 5, biomass: 10 },
    complaints: 55,
    responseTime: '2.4h',
    outcomeTrend: 'Worsening',
    sensorCoverage: 88,
    dataConfidence: 'High',
    lastUpdated: '3 min ago',
    dataSource: 'sensor',
    aqiDuration: '8 hours',
    recommendedActions: [
      'Issue industrial emission violation notices (Plot 418 Zone B)',
      'Mandate chimney stack inspections this week',
      'Restrict heavy transport during 6-9 AM (peak hours)',
      'Initiate compliance audit with DPCC'
    ],
    trendHistory: [
      { timestamp: '6 AM', aqi: 330 },
      { timestamp: '9 AM', aqi: 348 },
      { timestamp: '12 PM', aqi: 356 },
      { timestamp: '3 PM', aqi: 352 }
    ]
  },
  {
    id: 'w12',
    name: 'Delhi Civic Center',
    aqi: 142,
    priorityScore: 12,
    populationDensity: 'Medium',
    status: 'MODERATE',
    whyToday: "Minimal industrial activity; background concentrations influenced by city-wide drift.",
    sourceDistribution: { industrial: 5, vehicular: 60, construction: 30, biomass: 5 },
    complaints: 4,
    responseTime: '4.8h',
    outcomeTrend: 'Success',
    sensorCoverage: 65,
    dataConfidence: 'Medium',
    lastUpdated: '12 min ago',
    dataSource: 'estimated',
    aqiDuration: '2 hours',
    recommendedActions: [
      'Continue routine monitoring',
      'Maintain traffic flow management'
    ],
    trendHistory: [
      { timestamp: '6 AM', aqi: 125 },
      { timestamp: '9 AM', aqi: 135 },
      { timestamp: '12 PM', aqi: 142 },
      { timestamp: '3 PM', aqi: 138 }
    ]
  }
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
    type: 'Waste Burning',
    ward: 'ANAND VIHAR',
    location: 'Backyard of ISBT',
    timestamp: '11:20 AM',
    status: 'Assigned',
    intensity: 'High',
    responsibleDept: 'Fire & Sanitation (MCD)',
    slaRemaining: '0.8h'
  },
  {
    id: 'c2',
    type: 'Construction Dust',
    ward: 'DWARKA SEC-8',
    location: 'Metro Pillar 142',
    timestamp: '09:45 AM',
    status: 'Reported',
    intensity: 'Medium',
    responsibleDept: 'MCD Dust Squad',
    slaRemaining: '24h'
  },
  {
    id: 'c3',
    type: 'Industrial Violation',
    ward: 'OKHLA PHASE III',
    location: 'Plot 418 Zone B',
    timestamp: 'Yesterday',
    status: 'Resolved',
    intensity: 'High',
    responsibleDept: 'DPCC Taskforce',
    slaRemaining: 'Resolved'
  },
];

export const CONSTRUCTION_SITES: ConstructionSite[] = [
  { id: 's1', name: 'Apex Residency', location: 'Dwarka Sec 12', compliance: 42, status: 'Penalized', lastInspection: '2h ago', responsibleAgency: 'DPCC', slaDeadline: '48h for remediation' },
  { id: 's2', name: 'NHAI Flyover', location: 'Mayur Vihar Ph 1', compliance: 88, status: 'Compliant', lastInspection: '1d ago', responsibleAgency: 'MCD', slaDeadline: 'Bi-weekly' },
];

export const TREND_DATA = [
  { name: '06:00', aqi: 310 }, { name: '09:00', aqi: 420 }, { name: '12:00', aqi: 380 },
  { name: '15:00', aqi: 340 }, { name: '18:00', aqi: 405 }, { name: '21:00', aqi: 450 },
];

export const NO_IDLING_HOTSPOTS = [
  { id: 'ni1', site: 'ISBT Anand Vihar', ward: 'ANAND VIHAR', violations: 42, sla: '15m Response', status: 'Active Enforcement', lastUpdate: '10 min ago' },
  { id: 'ni2', site: 'Sarai Kale Khan', ward: 'OKHLA PHASE III', violations: 28, sla: 'Immediate', status: 'High Priority', lastUpdate: '5 min ago' },
  { id: 'ni3', site: 'Dhaula Kuan Hub', ward: 'Delhi Civic Center', violations: 12, sla: 'Monitoring', status: 'Routine Check', lastUpdate: '15 min ago' }
];

export const WASTE_BURNING_INCIDENTS = MOCK_COMPLAINTS.filter(c => c.type === 'Waste Burning');
