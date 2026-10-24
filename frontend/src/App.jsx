import React, { useState } from 'react';
import { PlannerProvider, usePlanner } from './context/PlannerContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { ExploreView } from './components/ExploreView';
import { MapView } from './components/MapView';
import { PlannerView } from './components/PlannerView';
import { PlanSummaryView } from './components/PlanSummaryView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { SupportModal } from './components/SupportModal';
import { ToastContainer } from './components/Toast';
import { Logo } from './components/Logo';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const AppContent = () => {
  const {
    activeTab,
    setActiveTab,
    isAdminLoggedIn,
    setSelectedCategory,
    setSearchQuery,
    showToast,
  } = usePlanner();

  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportInitialTab, setSupportInitialTab] = useState('about');

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'explore':
        return <ExploreView />;
      case 'map':
        return <MapView />;
      case 'planner':
        return <PlannerView />;
      case 'summary':
        return <PlanSummaryView />;
      case 'admin':
        return isAdminLoggedIn ? <AdminDashboard /> : <AdminLoginModal />;
      default:
        return <HomeView />;
    }
  };

  // Redirect to Explore page with specific category filter and scroll to top
  const handleCategoryClick = (category, searchKeyword) => {
    setSelectedCategory(category);
    if (searchKeyword) {
      setSearchQuery(searchKeyword);
    } else {
      setSearchQuery('');
    }
    setActiveTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Filtered by ${category}`, 'info');
  };

  // Open the interactive Support Modal on the requested section
  const handleSupportClick = (tab) => {
    setSupportInitialTab(tab);
    setSupportModalOpen(true);
  };

  // Handle Newsletter Subscription
  const handleSubscribe = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('dayspire_newsletter_subscribers') || '[]');
      if (existing.includes(cleanEmail)) {
        showToast('You are already subscribed to DaySpire travel tips!', 'info');
      } else {
        existing.push(cleanEmail);
        localStorage.setItem('dayspire_newsletter_subscribers', JSON.stringify(existing));
        setIsSubscribed(true);
        showToast('🎉 Subscribed successfully! Travel tips & itinerary guide sent.', 'success');
      }
    } catch {
      setIsSubscribed(true);
      showToast('🎉 Subscribed successfully! Welcome to DaySpire travel tips.', 'success');
    }

    setEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#4A4A4A] font-sans selection:bg-[#127e75] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {renderCurrentView()}
      </main>

      <PlaceDetailModal />
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        initialTab={supportInitialTab}
        onToast={showToast}
      />
      <ToastContainer />

      {/* ULTRA-CLEAN MODERN FOOTER */}
      <footer id="main-footer" className="mt-auto bg-gradient-to-br from-[#084C61] via-[#053747] to-[#021820] text-slate-200 pt-12 pb-16 border-t-4 border-[#127e75]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Footer: 4-Column Balanced Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-8 mb-10">
            
            {/* 1. Brand & Information */}
            <div className="space-y-4">
              <Logo size="md" variant="light" badge="25km" />
              <p className="text-xs text-slate-300 leading-relaxed pr-2">
                Your verified companion for discovering coastal viewpoints, heritage landmarks, and one-day journeys around Akkaraipattu (25km Radius).
              </p>
            </div>

            {/* 2. Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Quick Links</h4>
              <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                <li>
                  <button
                    onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-[#38ef7d] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Home</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setActiveTab('explore'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-[#38ef7d] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Explore Places</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setActiveTab('planner'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-[#38ef7d] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>One-Day Planner</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setActiveTab('map'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-[#38ef7d] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Map View</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setActiveTab('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-[#38ef7d] transition flex items-center gap-1.5 cursor-pointer text-slate-400"
                  >
                    <span>Admin Portal</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* 3. Categories (Directly navigates and filters Explore Places) */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Categories</h4>
              <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                <li>
                  <button
                    onClick={() => handleCategoryClick('Coastal/Nature')}
                    className="hover:text-[#38ef7d] transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Nature & Safari</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCategoryClick('Religious')}
                    className="hover:text-[#38ef7d] transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Religious Sites</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCategoryClick('Educational')}
                    className="hover:text-[#38ef7d] transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Heritage & Education</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCategoryClick('Coastal/Nature', 'beach')}
                    className="hover:text-[#38ef7d] transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Beaches & Coastal</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCategoryClick('Recreation')}
                    className="hover:text-[#38ef7d] transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Family Recreation</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCategoryClick('Dining')}
                    className="hover:text-[#38ef7d] transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Food & Dining</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCategoryClick('Shopping')}
                    className="hover:text-[#38ef7d] transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Shopping & Bazaars</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* 4. Support & Information Modals */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Support</h4>
              <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                <li>
                  <button
                    onClick={() => handleSupportClick('emergency')}
                    className="hover:text-[#38ef7d] transition cursor-pointer text-left"
                  >
                    Emergency Contacts
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSupportClick('about')}
                    className="hover:text-[#38ef7d] transition cursor-pointer text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSupportClick('contact')}
                    className="hover:text-[#38ef7d] transition cursor-pointer text-left"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSupportClick('faq')}
                    className="hover:text-[#38ef7d] transition cursor-pointer text-left"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSupportClick('privacy')}
                    className="hover:text-[#38ef7d] transition cursor-pointer text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSupportClick('terms')}
                    className="hover:text-[#38ef7d] transition cursor-pointer text-left"
                  >
                    Terms of Use
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Newsletter Bar */}
          <div className="border-t border-white/10 pt-8 pb-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-md">
                <h4 className="text-white font-bold text-sm sm:text-base">
                  Get Akkaraipattu Travel Inspiration
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Subscribe to receive curated weekend itineraries, hidden beaches, and local food recommendations.
                </p>
              </div>

              {isSubscribed ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>You're subscribed to DaySpire travel tips!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto min-w-[300px]">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-white text-slate-800 border-none rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#127e75] w-full sm:w-64"
                  />
                  <button
                    id="footer-subscribe-btn"
                    type="submit"
                    className="bg-[#E76F51] hover:bg-[#D45A3D] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-white/10 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-[11px] text-slate-400 font-medium">
              © 2026 DaySpire. All rights reserved. • Akkaraipattu Day Tour (25km Radius)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <PlannerProvider>
      <AppContent />
    </PlannerProvider>
  );
}
