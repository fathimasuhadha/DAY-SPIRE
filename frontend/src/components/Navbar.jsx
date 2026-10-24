import React from 'react';
import { Compass, MapPin, CalendarDays, ShieldCheck, Map as MapIcon, Route } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { Logo } from './Logo';

export const Navbar = () => {
  const { activeTab, setActiveTab, selectedPlaceIds, isAdminLoggedIn, generatedPlan } = usePlanner();

  const navItems = [
    { tab: 'home', label: 'Home', icon: <Logo size="sm" showText={false} /> },
    { tab: 'explore', label: 'Explore Places', icon: <MapPin className="w-4 h-4" /> },
    { tab: 'map', label: 'Map View', icon: <MapIcon className="w-4 h-4" /> },
    {
      tab: 'planner',
      label: 'One-Day Planner',
      icon: <CalendarDays className="w-4 h-4" />,
      badge: selectedPlaceIds.length,
    },
  ];

  if (generatedPlan) {
    navItems.push({
      tab: 'summary',
      label: 'Itinerary Summary',
      icon: <Route className="w-4 h-4" />,
    });
  }

  return (
    <>
      {/* Top Header */}
      <header id="main-header" className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Brand Logo */}
            <div
              id="brand-logo"
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab('home')}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('home')}
              className="flex items-center cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E27D60] rounded-xl p-1"
            >
              <Logo size="md" badge="25km Zone" />
            </div>

            {/* Desktop Navigation Links */}
            <nav id="desktop-nav" className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    id={`nav-link-${item.tab}`}
                    onClick={() => setActiveTab(item.tab)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#084C61] text-white shadow-sm shadow-[#084C61]/20'
                        : 'text-[#084C61] hover:text-[#084C61] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`ml-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors ${
                          isActive
                            ? 'bg-[#E27D60] text-white'
                            : 'bg-[#E8E2D9] text-[#084C61]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Admin Link / Status */}
              <div className="pl-2 border-l border-[#E8E2D9] ml-1">
                <button
                  id="nav-link-admin"
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                    activeTab === 'admin'
                      ? 'bg-[#084C61] text-white border-[#084C61]'
                      : isAdminLoggedIn
                      ? 'bg-[#F2EDE4] text-[#084C61] border-[#084C61]/30 hover:bg-[#E8E2D9]'
                      : 'bg-white text-[#7D7D7D] border-[#E8E2D9] hover:bg-[#F2EDE4]'
                  }`}
                  title="Maintain place catalogue (Admin only)"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${isAdminLoggedIn ? 'text-[#E27D60]' : 'text-[#7D7D7D]'}`} />
                  <span>{isAdminLoggedIn ? 'Admin Panel' : 'Admin'}</span>
                </button>
              </div>
            </nav>

            {/* Mobile Plan Button Shortcut */}
            <div className="flex md:hidden items-center gap-2">
              <button
                id="mobile-quick-planner-btn"
                onClick={() => setActiveTab('planner')}
                className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E27D60] text-white text-xs font-bold shadow-md shadow-[#E27D6033]"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Plan</span>
                {selectedPlaceIds.length > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-[#E27D60] text-[11px] font-extrabold">
                    {selectedPlaceIds.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav id="mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-lg border-t border-[#E8E2D9] px-2 py-1.5 shadow-lg">
        <div className="grid grid-cols-5 gap-1 text-center">
          <button
            id="mobile-nav-home"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[11px] font-medium transition ${
              activeTab === 'home' ? 'text-[#084C61] font-bold' : 'text-[#7D7D7D]'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </button>
          
          <button
            id="mobile-nav-explore"
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[11px] font-medium transition ${
              activeTab === 'explore' ? 'text-[#084C61] font-bold' : 'text-[#7D7D7D]'
            }`}
          >
            <MapPin className="w-5 h-5 mb-0.5" />
            <span>Explore</span>
          </button>

          <button
            id="mobile-nav-map"
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[11px] font-medium transition ${
              activeTab === 'map' ? 'text-[#084C61] font-bold' : 'text-[#7D7D7D]'
            }`}
          >
            <MapIcon className="w-5 h-5 mb-0.5" />
            <span>Map</span>
          </button>

          <button
            id="mobile-nav-planner"
            onClick={() => setActiveTab('planner')}
            className={`relative flex flex-col items-center justify-center py-1.5 rounded-lg text-[11px] font-medium transition ${
              activeTab === 'planner' || activeTab === 'summary' ? 'text-[#E27D60] font-bold' : 'text-[#7D7D7D]'
            }`}
          >
            <CalendarDays className="w-5 h-5 mb-0.5" />
            <span>Planner</span>
            {selectedPlaceIds.length > 0 && (
              <span className="absolute top-0.5 right-4 w-4 h-4 bg-[#E27D60] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {selectedPlaceIds.length}
              </span>
            )}
          </button>

          <button
            id="mobile-nav-admin"
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[11px] font-medium transition ${
              activeTab === 'admin' ? 'text-[#084C61] font-bold' : 'text-[#7D7D7D]'
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span>Admin</span>
          </button>
        </div>
      </nav>
    </>
  );
};
