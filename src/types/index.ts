export interface BusTrip {
  id: string;
  busNumber: string;
  busType: 'VOLVO' | 'AC LUXURY' | 'SLEEPER' | 'EXPRESS' | 'GURJARNAGRI' | 'LOCAL';
  departureTime: string;
  duration: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  fare: number;
  seatsAvailable: number;
  route: string[];
}

export interface TrackingInfo {
  busNumber: string;
  lat: number;
  lng: number;
  speed: number;
  direction: string;
  lastUpdated: string;
  status: 'On time' | 'Delayed' | 'Arrived';
  depot: string;
}

export interface SearchParams {
  source: string;
  destination: string;
  date: string;
}
