'use client';

import { SWRConfig } from 'swr';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        dedupingInterval: 5000,
        onError: (error) => {
          if (error.status === 401) {
            // Clear local session state on 401
            window.location.href = '/login';
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
