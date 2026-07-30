'use client';

import { useCurrency } from '../providers/CurrencyProvider';
import { formatMoney } from '@/lib/currency';

export default function Price({ amountGbp, className = '' }: { amountGbp: number; className?: string }) {
  const { currency } = useCurrency();
  return <span className={className}>{formatMoney(amountGbp, currency)}</span>;
}
