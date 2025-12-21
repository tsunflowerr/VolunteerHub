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
        
        // Check for push subscription status
        registration.pushManager.getSubscription().then((subscription) => {
          if (subscription) {
            console.log('Push subscription exists:', subscription.endpoint);
          } else {
            console.log('No push subscription found - user needs to enable notifications');
          }
        });
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });

  // Listen for messages from Service Worker (e.g., push notifications)
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('Received message from Service Worker:', event.data);
    if (event.data && event.data.type === 'PUSH_NOTIFICATION_RECEIVED') {
      // Invalidate notification queries to refresh the notification bell immediately
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      console.log('Invalidated notification queries due to push notification');
      
      const payload = event.data.payload;
      const notificationType = payload?.type;
      const relatedStatus = payload?.relatedStatus;
      const eventId = payload?.eventId;
      
      // Handle different notification types and invalidate relevant caches
      switch (notificationType) {
        // Registration status updates (confirmed, cancelled, completed)
        case 'registration_status_update':
          queryClient.invalidateQueries({ queryKey: ['events'] });
          queryClient.invalidateQueries({ queryKey: ['registrations'] });
          queryClient.invalidateQueries({ queryKey: ['manager'] }); // Manager dashboard
          // Also invalidate specific event detail if eventId is provided
          if (eventId) {
            queryClient.invalidateQueries({ queryKey: ['events', 'detail', eventId] });
            console.log(`Invalidated specific event detail: ${eventId}`);
          }
          console.log('Invalidated event/registration queries due to registration status update');
          break;
          
        // Event status updates (approved, rejected, cancelled)
        case 'event_status_update':
          queryClient.invalidateQueries({ queryKey: ['events'] });
          queryClient.invalidateQueries({ queryKey: ['manager'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          if (eventId) {
            queryClient.invalidateQueries({ queryKey: ['events', 'detail', eventId] });
          }
          console.log('Invalidated event queries due to event status update');
          break;
          
        // Gamification notifications (level up, achievement, points)
        case 'level_up':
        case 'achievement_earned':
        case 'points_earned':
          queryClient.invalidateQueries({ queryKey: ['gamification'] });
          queryClient.invalidateQueries({ queryKey: ['user'] }); // User profile with gamification data
          queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
          console.log('Invalidated gamification queries due to:', notificationType);
          break;
          
        // New post in event
        case 'new_post':
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          queryClient.invalidateQueries({ queryKey: ['events'] }); // postsCount updates
          if (eventId) {
            queryClient.invalidateQueries({ queryKey: ['events', 'detail', eventId] });
          }
          console.log('Invalidated posts/events queries due to new post');
          break;
          
        // Like/comment notifications
        case 'like':
        case 'comment':
        case 'comment_reply':
          // These don't typically need cache invalidation for the recipient
          // The data updates are for the content owner, not the person who liked/commented
          break;
          
        // Warning from admin
        case 'warning':
          queryClient.invalidateQueries({ queryKey: ['user'] });
          console.log('Invalidated user queries due to warning');
          break;
          
        default:
          // For unknown types, check relatedStatus as fallback
          if (relatedStatus === 'confirmed' || relatedStatus === 'cancelled' || relatedStatus === 'completed') {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
          }
          break;
      }
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
