import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import API from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { IncognitoProvider, useIncognito } from './context/IncognitoContext';
import { CanvasBackground } from './components/layout/CanvasBackground';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SubmitModal } from './components/resources/SubmitModal';
import { AuthModal } from './components/resources/AuthModal';
import { ReportModal } from './components/resources/ReportModal';
import { AddToCollectionModal } from './components/collections/AddToCollectionModal';

import { HomePage } from './pages/HomePage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { SearchPage } from './pages/SearchPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PrivacyTermsPage } from './pages/PrivacyTermsPage';

import { HomeLoader } from './components/layout/HomeLoader';

export const DEFAULT_CATEGORIES = [
  { _id: 'technology', name: 'Technology', slug: 'technology', description: 'AI, software & hardware news', icon: 'Cpu' },
  { _id: 'programming', name: 'Programming', slug: 'programming', description: 'Web dev & engineering', icon: 'Code' },
  { _id: 'gaming', name: 'Gaming', slug: 'gaming', description: 'Games & eSports', icon: 'Gamepad2' },
  { _id: 'education', name: 'Education', slug: 'education', description: 'Science & interactive learning', icon: 'GraduationCap' },
  { _id: 'entertainment', name: 'Entertainment', slug: 'entertainment', description: 'Movies, anime & culture', icon: 'Tv' },
  { _id: 'music', name: 'Music', slug: 'music', description: 'Tracks & podcasts', icon: 'Music' },
  { _id: 'fashion', name: 'Fashion', slug: 'fashion', description: 'Style & streetwear', icon: 'Sparkles' },
  { _id: 'sports', name: 'Sports', slug: 'sports', description: 'Athletics & fitness', icon: 'Trophy' },
  { _id: 'news', name: 'News', slug: 'news', description: 'World news & finance', icon: 'Newspaper' },
  { _id: 'art', name: 'Art', slug: 'art', description: 'Digital art & design', icon: 'Palette' },
  { _id: 'lifestyle', name: 'Lifestyle', slug: 'lifestyle', description: 'Travel & living', icon: 'Compass' },
  { _id: 'other', name: 'Other', slug: 'other', description: 'Uncategorized resources', icon: 'Box' },
  { _id: 'sex', name: 'Sex', slug: 'sex', description: 'Sex category', icon: 'Heart' }
];

export function AppContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isIncognito, filterCategories, disableIncognito } = useIncognito();

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [refreshKey, setRefreshKey] = useState(0);

  // Show loader only when the app starts
  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    mode: 'login'
  });
  const [reportModalState, setReportModalState] = useState({
    isOpen: false,
    resource: null
  });
  const [addToCollectionState, setAddToCollectionState] = useState({
    isOpen: false,
    resource: null
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const visibleCategories = filterCategories(categories);

  // -----------------------------------------
  // Initial App Loading
  // -----------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // -----------------------------------------
  // Fetch Categories
  // -----------------------------------------

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');

        if (
          res.data.success &&
          Array.isArray(res.data.data) &&
          res.data.data.length > 0
        ) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('[App] Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalState({
      isOpen: true,
      mode
    });
  };

  const handleOpenReportModal = (resource) => {
    setReportModalState({
      isOpen: true,
      resource
    });
  };

  const handleOpenAddToCollectionModal = (resource) => {
    if (!user) {
      handleOpenAuthModal('login');
      return;
    }

    setAddToCollectionState({
      isOpen: true,
      resource
    });
  };

  const handleResourceSubmitted = (newResource) => {
    setRefreshKey(prev => prev + 1);

    if (newResource && newResource._id) {
      navigate(`/resources/${newResource._id}`);
    }
  };

  // -----------------------------------------
  // Show Loader Once
  // -----------------------------------------

  if (isLoading) {
    return <HomeLoader />;
  }

  // -----------------------------------------
  // Main Application
  // -----------------------------------------

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white bg-zinc-950 text-zinc-100">

      {/* Dynamic Ambient Background */}
      <CanvasBackground />

      {/* Offline Status Warning Bar */}
      {isOffline && (
        <div className="bg-amber-950/90 border-b border-amber-800/80 px-4 py-2 z-50 text-xs text-amber-200 flex items-center justify-between gap-3 shadow-md backdrop-blur-md sticky top-0">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span><strong>Offline Mode:</strong> Internet disconnected. Displaying cached layout and saved bookmarks.</span>
            </div>
            <button
              onClick={() => {
                if (navigator.onLine) {
                  setIsOffline(false);
                  setRefreshKey(prev => prev + 1);
                } else {
                  window.location.reload();
                }
              }}
              className="px-2.5 py-1 rounded-md bg-amber-900/60 hover:bg-amber-900 text-amber-100 font-medium text-xs border border-amber-700 transition-colors cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Incognito Active Banner */}
      {isIncognito && (
        <div className="bg-purple-950/80 border-b border-purple-800/80 px-4 py-1.5 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="font-semibold text-xs text-purple-200 truncate">
                Incognito Mode Active: 18+ channels unlocked
              </span>
              <span className="hidden sm:inline text-xs text-purple-300/70">
                (Press Alt+I to toggle)
              </span>
            </div>
            <button
              onClick={disableIncognito}
              className="px-2.5 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-purple-200 border border-purple-700/60 text-xs font-medium transition-colors shrink-0 cursor-pointer shadow-sm"
              title="Exit Incognito mode"
            >
              <span>Safe Mode (Exit)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Page Router */}
      <main className="flex-1 relative z-10">
        <Routes>

          <Route
            path="/"
            element={
              <HomePage
                categories={visibleCategories}
                refreshKey={refreshKey}
                onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
                onReportResource={handleOpenReportModal}
                onAddToCollection={handleOpenAddToCollectionModal}
              />
            }
          />

          <Route
            path="/resources/:id"
            element={
              <ResourceDetailPage
                onReportResource={handleOpenReportModal}
                onAddToCollection={handleOpenAddToCollectionModal}
              />
            }
          />

          <Route
            path="/search"
            element={
              <SearchPage
                categories={visibleCategories}
                refreshKey={refreshKey}
                onReportResource={handleOpenReportModal}
                onAddToCollection={handleOpenAddToCollectionModal}
              />
            }
          />

          <Route
            path="/collections"
            element={
              <CollectionsPage
                onReportResource={handleOpenReportModal}
                onAddToCollection={handleOpenAddToCollectionModal}
              />
            }
          />

          <Route
            path="/collections/:id"
            element={
              <CollectionsPage
                onReportResource={handleOpenReportModal}
                onAddToCollection={handleOpenAddToCollectionModal}
              />
            }
          />

          <Route
            path="/profile"
            element={
              <ProfilePage
                refreshKey={refreshKey}
                onReportResource={handleOpenReportModal}
                onAddToCollection={handleOpenAddToCollectionModal}
              />
            }
          />

          <Route
            path="/admin"
            element={<AdminDashboardPage />}
          />

          <Route
            path="/privacy"
            element={<PrivacyTermsPage />}
          />

          {/* Invalid route → Home */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals Container */}

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        categories={visibleCategories}
        onResourceSubmitted={handleResourceSubmitted}
      />

      <AuthModal
        isOpen={authModalState.isOpen}
        onClose={() =>
          setAuthModalState({
            isOpen: false,
            mode: 'login'
          })
        }
        initialMode={authModalState.mode}
      />

      <ReportModal
        isOpen={reportModalState.isOpen}
        onClose={() =>
          setReportModalState({
            isOpen: false,
            resource: null
          })
        }
        resource={reportModalState.resource}
      />

      <AddToCollectionModal
        isOpen={addToCollectionState.isOpen}
        onClose={() =>
          setAddToCollectionState({
            isOpen: false,
            resource: null
          })
        }
        resource={addToCollectionState.resource}
      />

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <IncognitoProvider>
            <AppContent />
          </IncognitoProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}