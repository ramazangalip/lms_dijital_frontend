"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA ServiceWorker registration successful:', registration.scope);
          })
          .catch((err) => {
            console.log('PWA ServiceWorker registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}
