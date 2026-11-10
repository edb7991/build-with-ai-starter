export type AgencyType = 'HDB' | 'LTA' | 'URA' | 'COMMERCIAL' | 'HOSPITAL';

export type SingaporeRegion = 'Central / CBD' | 'Orchard & Downtown' | 'East' | 'West' | 'North' | 'North-East';

export type VehicleCategory = 'cars' | 'motorcycles' | 'heavyVehicles';

export interface VehicleLotInfo {
  total: number;
  available: number;
  typeCode: 'C' | 'M' | 'H';
}

export interface EVChargingStation {
  hasEV: boolean;
  totalChargers: number;
  availableChargers: number;
  operator: 'SP Group' | 'Charge+' | 'Shell Recharge' | 'Tesla Supercharger' | 'CDG ENGIE';
  plugType: 'Type 2' | 'CCS2' | 'Tesla' | 'Combo';
  powerKw: number;
}

export interface HourlyRateStructure {
  weekdayDay: string; // e.g. "$1.20 per 30 mins (07:00 - 17:00)"
  weekdayNight: string; // e.g. "$0.60 per 30 mins (capped at $5.00)"
  saturday: string;
  sundayPh: string; // e.g. "Free 07:00 - 22:30 (HDB Scheme)"
  gracePeriodMinutes: number; // typically 10 or 15 mins
  estimatedPerHourDay: number;
  estimatedPerHourNight: number;
}

export interface Carpark {
  id: string;
  carparkNumber: string; // Official Singapore Carpark Code e.g. 'ACB', 'MBS01', 'ORC04'
  name: string;
  agency: AgencyType;
  address: string;
  postalCode: string;
  region: SingaporeRegion;
  coordinates: {
    lat: number;
    lng: number;
  };
  totalLots: number;
  availableLots: number;
  lotTypes: {
    cars: VehicleLotInfo;
    motorcycles?: VehicleLotInfo;
    heavyVehicles?: VehicleLotInfo;
  };
  evCharging?: EVChargingStation;
  rates: HourlyRateStructure;
  heightLimitMeters: number;
  gantryType: 'EPS' | 'NETS FlashPay' | 'CashCard/CEPIS' | 'ERP 2.0';
  occupancyHistory: number[]; // 12 hours historical % (0-100)
  forecastNextHours: number[]; // 4 hours forecast %
  isFavorite?: boolean;
  lastUpdated: string;
  deltaLots?: number; // Real-time fluctuation (+2, -3 lots)
}

export interface FilterOptions {
  searchQuery: string;
  region: string;
  agency: string;
  vehicleType: 'all' | 'cars' | 'motorcycles';
  hasEVOnly: boolean;
  minAvailabilityPercent: number;
  minHeightMeters: number;
  sortBy: 'availability-desc' | 'availability-asc' | 'lots-desc' | 'price-asc' | 'distance-asc' | 'name-asc';
}

export interface UserSimulatedLocation {
  id: string;
  name: string;
  coords: { lat: number; lng: number };
}

// Singapore data.gov.sg Carpark Availability API Schema representation
export interface DataGovSgCarparkData {
  carpark_number: string;
  update_datetime: string;
  carpark_info: Array<{
    total_lots: string;
    lot_type: string; // 'C' | 'M' | 'H'
    lots_available: string;
  }>;
}

export interface DataGovSgApiResponse {
  items: Array<{
    timestamp: string;
    carpark_data: DataGovSgCarparkData[];
  }>;
}
