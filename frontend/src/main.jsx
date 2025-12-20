import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { RoleProvider } from './contexts/RoleContext.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.jsx';
import './styles/index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log(
          'ServiceWorker registration successful with scope: ',
          registration.scope
        );
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });

  // Listen for messages from Service Worker (e.g., push notifications)
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PUSH_NOTIFICATION_RECEIVED') {
      // Invalidate notification queries to refresh the notification bell
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <RoleProvider>
            <Toaster />
            <Routes>
              <Route path="/*" element={<App />}></Route>
            </Routes>
          </RoleProvider>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
