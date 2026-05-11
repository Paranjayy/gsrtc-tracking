import type { BusTrip } from '../types';

export const MOCK_TRIPS: BusTrip[] = [
  {
    id: '1',
    busNumber: 'GJ-18-ZT-1831',
    busType: 'VOLVO',
    departureTime: '08:00',
    duration: '02:30',
    arrivalTime: '10:30',
    origin: 'Junagadh Busport',
    destination: 'Rajkot Busport',
    fare: 267.0,
    seatsAvailable: 45,
    route: ['Junagadh', 'Jetpur', 'Gondal', 'Rajkot']
  },
  {
    id: '2',
    busNumber: 'GJ-06-BT-5047',
    busType: 'AC LUXURY',
    departureTime: '09:00',
    duration: '02:30',
    arrivalTime: '11:30',
    origin: 'Junagadh Busport',
    destination: 'Rajkot Busport',
    fare: 185.0,
    seatsAvailable: 39,
    route: ['Junagadh', 'Gondal', 'Rajkot']
  },
  {
    id: '3',
    busNumber: 'GJ-12-ZT-9981',
    busType: 'EXPRESS',
    departureTime: '21:00',
    duration: '02:40',
    arrivalTime: '23:40',
    origin: 'Junagadh Busport',
    destination: 'Rajkot Busport',
    fare: 123.0,
    seatsAvailable: 42,
    route: ['Junagadh', 'Rajkot']
  },
  {
    id: '4',
    busNumber: 'GJ-01-SM-1234',
    busType: 'SLEEPER',
    departureTime: '22:35',
    duration: '02:10',
    arrivalTime: '00:45',
    origin: 'Junagadh Busport',
    destination: 'Rajkot Busport',
    fare: 310.0,
    seatsAvailable: 12,
    route: ['Junagadh', 'Rajkot']
  },
  {
    id: '5',
    busNumber: 'GJ-18-ZT-1832',
    busType: 'VOLVO',
    departureTime: '01:19',
    duration: '03:40',
    arrivalTime: '04:59',
    origin: 'Junagadh Busport',
    destination: 'Rajkot Busport',
    fare: 267.0,
    seatsAvailable: 41,
    route: ['Junagadh', 'Jetpur', 'Rajkot']
  }
];
