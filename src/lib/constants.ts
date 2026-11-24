export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'INR',
  'CHF',
  'CAD',
  'AUD',
  'NZD',
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'CZK',
  'TRY',
  'ZAR',
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: SupportedCurrency = 'USD';

export const EXAMPLE_PEOPLE = [
  { id: 'person_anna', name: 'Anna' },
  { id: 'person_ben', name: 'Ben' },
  { id: 'person_chris', name: 'Chris' },
];

export const EXAMPLE_EXPENSES = [
  {
    id: 'exp_apt',
    description: 'Apartment',
    amountMinor: 30000, // $300.00
    paidBy: 'person_anna',
    participants: ['person_anna', 'person_ben', 'person_chris'],
  },
  {
    id: 'exp_fuel',
    description: 'Fuel',
    amountMinor: 6000, // $60.00
    paidBy: 'person_ben',
    participants: ['person_anna', 'person_ben', 'person_chris'],
  },
  {
    id: 'exp_museum',
    description: 'Museum',
    amountMinor: 2400, // $24.00
    paidBy: 'person_ben',
    participants: ['person_ben', 'person_chris'],
  },
  {
    id: 'exp_dinner',
    description: 'Dinner',
    amountMinor: 9000, // $90.00
    paidBy: 'person_chris',
    participants: ['person_anna', 'person_ben', 'person_chris'],
  },
];
