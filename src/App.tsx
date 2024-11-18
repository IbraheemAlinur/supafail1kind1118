import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

// Eagerly load critical components
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import DashboardLayout from './components/dashboard/DashboardLayout';

// Lazy load other components with proper error boundaries
const FeedPage = React.lazy(() => import('./components/feed/FeedPage'));
const AboutPage = React.lazy(() => import('./components/pages/AboutPage'));
const BlogPage = React.lazy(() => import('./components/pages/BlogPage'));
const BlogArticlePage = React.lazy(() => import('./components/pages/BlogArticlePage'));
const ProfilePage = React.lazy(() => import('./components/profile/ProfilePage'));
const PublicProfile = React.lazy(() => import('./components/profile/PublicProfile'));
const CommunitiesPage = React.lazy(() => import('./components/communities/CommunitiesPage'));
const CommunityDetail = React.lazy(() => import('./components/communities/CommunityDetail'));
const EventsPage = React.lazy(() => import('./components/events/EventsPage'));
const EventDetailPage = React.lazy(() => import('./components/events/EventDetailPage'));
const KiPointsPage = React.lazy(() => import('./components/ki-points/KiPointsPage'));
const MessagesPage = React.lazy(() => import('./components/messages/MessagesPage'));
const MessageThread = React.lazy(() => import('./components/messages/MessageThread'));

const LazyComponent = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              <>
                <Navbar />
                <Hero />
              </>
            } />
            <Route path="/about" element={
              <>
                <Navbar />
                <LazyComponent>
                  <AboutPage />
                </LazyComponent>
              </>
            } />
            <Route path="/blog" element={
              <>
                <Navbar />
                <LazyComponent>
                  <BlogPage />
                </LazyComponent>
              </>
            } />
            <Route path="/blog/:id" element={
              <>
                <Navbar />
                <LazyComponent>
                  <BlogArticlePage />
                </LazyComponent>
              </>
            } />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />

            {/* Public profile route */}
            <Route path="/:username" element={
              <LazyComponent>
                <PublicProfile />
              </LazyComponent>
            } />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={
                <LazyComponent>
                  <FeedPage />
                </LazyComponent>
              } />
              <Route path="profile" element={
                <LazyComponent>
                  <ProfilePage />
                </LazyComponent>
              } />
              <Route path="communities" element={
                <LazyComponent>
                  <CommunitiesPage />
                </LazyComponent>
              } />
              <Route path="communities/:id" element={
                <LazyComponent>
                  <CommunityDetail />
                </LazyComponent>
              } />
              <Route path="events" element={
                <LazyComponent>
                  <EventsPage />
                </LazyComponent>
              } />
              <Route path="events/:id" element={
                <LazyComponent>
                  <EventDetailPage />
                </LazyComponent>
              } />
              <Route path="messages" element={
                <LazyComponent>
                  <MessagesPage />
                </LazyComponent>
              } />
              <Route path="messages/:id" element={
                <LazyComponent>
                  <MessageThread />
                </LazyComponent>
              } />
              <Route path="ki-points" element={
                <LazyComponent>
                  <KiPointsPage />
                </LazyComponent>
              } />
            </Route>

            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;