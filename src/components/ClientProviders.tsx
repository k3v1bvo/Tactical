'use client';

import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#141416',
                border: '1px solid #26262A',
                color: '#F5F5F7',
                borderRadius: '8px',
                fontFamily: 'var(--font-sans)',
              },
            }}
            richColors
          />
        </CartProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
