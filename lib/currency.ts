export type CurrencyCode =
  | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'CAD' | 'AUD' | 'ZAR' | 'AED' | 'KES' | 'GHS';

export const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'ZAR', label: 'South African Rand', symbol: 'R' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'AED' },
  { code: 'KES', label: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'GHS', label: 'Ghanaian Cedi', symbol: 'GH₵' },
];

// The platform's base/storage currency is Naira (NGN) — every price the
// admin enters (services, products) is a plain Naira amount. These rates are
// indicative, relative to NGN = 1, used only to DISPLAY that same Naira
// price in another currency when a shopper switches the currency selector.
// Swap for a live FX API in production and cache the results.
export const RATES_FROM_NGN: Record<CurrencyCode, number> = {
  NGN: 1,
  GBP: 1 / 1900,
  USD: 1.27 / 1900,
  EUR: 1.17 / 1900,
  CAD: 1.74 / 1900,
  AUD: 1.93 / 1900,
  ZAR: 23.5 / 1900,
  AED: 4.66 / 1900,
  KES: 164 / 1900,
  GHS: 19 / 1900,
};

export function convert(amountNgn: number, to: CurrencyCode): number {
  return amountNgn * (RATES_FROM_NGN[to] ?? 1);
}

export function formatMoney(amountNgn: number, currency: CurrencyCode): string {
  const converted = convert(amountNgn, currency);
  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? '';
  const noDecimals = currency === 'NGN' || currency === 'KES';
  const value = noDecimals
    ? Math.round(converted).toLocaleString('en-GB')
    : converted.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol}${value}`;
}
