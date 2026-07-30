export type CurrencyCode =
  | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'CAD' | 'AUD' | 'ZAR' | 'AED' | 'KES' | 'GHS';

export const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'ZAR', label: 'South African Rand', symbol: 'R' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'AED' },
  { code: 'KES', label: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'GHS', label: 'Ghanaian Cedi', symbol: 'GH₵' },
];

// Indicative conversion rates against GBP (the studio's base currency for
// services/products). Swap this for a live FX API in production and cache
// the results — these are placeholders so the shop can display multi-currency
// pricing consistently today.
export const RATES_FROM_GBP: Record<CurrencyCode, number> = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
  NGN: 1900,
  CAD: 1.74,
  AUD: 1.93,
  ZAR: 23.5,
  AED: 4.66,
  KES: 164,
  GHS: 19,
};

export function convert(amountInGbp: number, to: CurrencyCode): number {
  return amountInGbp * (RATES_FROM_GBP[to] ?? 1);
}

export function formatMoney(amountInGbp: number, currency: CurrencyCode): string {
  const converted = convert(amountInGbp, currency);
  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? '';
  const noDecimals = currency === 'NGN' || currency === 'KES';
  const value = noDecimals
    ? Math.round(converted).toLocaleString('en-GB')
    : converted.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol}${value}`;
}
