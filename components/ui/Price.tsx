'use client';

import { useCurrency } from '../providers/CurrencyProvider';
import { formatMoney } from '@/lib/currency';

export default function Price({ amount, className = '' }: { amount: number; className?: string }) {
  const { currency } = useCurrency();
  return <span className={className}>{formatMoney(amount, currency)}</span>;
}
