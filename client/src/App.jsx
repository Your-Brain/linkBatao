import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import API from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
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

export function AppContent() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [authModalState, setAuthModalState] = useState({ isOpen: false, mode: 'login' });
  const [reportModalState, setReportModalState] = useState({ isOpen: false, resource: null });
  const [addToCollectionState, setAddToCollectionState] = useState({ isOpen: false, resource: null });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('[App] Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const handleOpenReportModal = (resource) => {
    setReportModalState({ isOpen: true, resource });
  };

  const handleOpenAddToCollectionModal = (resource) => {
    if (!user) {
      handleOpenAuthModal('login');
      return;
    }
    setAddToCollectionState({ isOpen: true, resource });
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-sky-400 selection:text-slate-950">
      {/* Dynamic Floating Particle Background */}
      <CanvasBackground />

      {/* Navigation Header */}
      <Navbar
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main Page Router */}
      <main className="flex-1 relative z-10">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                categories={categories}
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
                categories={categories}
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
                onReportResource={handleOpenReportModal}
                onAddToCollection={handleOpenAddToCollectionModal}
              />
            }
          />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/privacy" element={<PrivacyTermsPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals Container */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        categories={categories}
        onResourceSubmitted={() => {
          // Trigger refresh if needed or auto-navigate
        }}
      />

      <AuthModal
        isOpen={authModalState.isOpen}
        onClose={() => setAuthModalState({ isOpen: false, mode: 'login' })}
        initialMode={authModalState.mode}
      />

      <ReportModal
        isOpen={reportModalState.isOpen}
        onClose={() => setReportModalState({ isOpen: false, resource: null })}
        resource={reportModalState.resource}
      />

      <AddToCollectionModal
        isOpen={addToCollectionState.isOpen}
        onClose={() => setAddToCollectionState({ isOpen: false, resource: null })}
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
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

