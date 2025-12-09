import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// React.StrictMode removed to prevent WebGL Context Lost issues in development
// with 3D Canvases being mounted/unmounted rapidly.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Good for 3D/Canvas apps to avoid heavy re-renders
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
    },
  },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);