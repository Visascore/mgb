'use client';

import { createContext, useContext, useState } from 'react';
import { CurrencyCode } from '@/lib/currency';

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
};

const DEFAULT_CURRENCY: CurrencyCode = 'NGN';

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
});

function readStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  const stored = window.localStorage.getItem('magicbody_currency') as CurrencyCode | null;
  return stored ?? DEFAULT_CURRENCY;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Lazy init reads localStorage synchronously on first client render — avoids
  // the flash/race that came from setting it inside a useEffect after mount.
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => readStoredCurrency());

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('magicbody_currency', c);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
