import React, { useRef, useState } from 'react';
import {
  Search,
  Sparkles,
  Palmtree,
  ShoppingBag,
  Landmark,
  Utensils,
  FerrisWheel,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Compass,
  Map as MapIcon,
  Lightbulb,
  Route,
  Smartphone,
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { PlaceCategory } from '../types';
import { PlaceCard } from './PlaceCard';
import heroSunriseBeachImg from '../assets/images/hero_sunrise_beach_banner_1788184077498.jpg';

export const HomeView = () => {
  const {
    activePlaces,
    setActiveTab,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedRadius,
    setSelectedRadius,
  } = usePlanner();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const scrollContainerRef = useRef(null);

  const featuredPlaces = activePlaces.filter((p) => p.featured);
  const displayFeatured = featuredPlaces.length > 0 ? featuredPlaces : activePlaces.slice(0, 5);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setActiveTab('explore');
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setActiveTab('explore');
  };

  const scrollHorizontal = (offset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Original 6 Categories with descriptions matching the reference screenshot
  const categories = [
    {
      label: 'Coastal/Nature',
      icon: <Palmtree className="w-5 h-5 text-[#084C61]" />,
      color: 'bg-white hover:border-[#084C61]',
      desc: 'Beaches, lagoons, reservoirs & safari',
    },
    {
      label: 'Shopping',
      icon: <ShoppingBag className="w-5 h-5 text-[#E27D60]" />,
      color: 'bg-white hover:border-[#E27D60]',
      desc: 'Bazaars, textiles & local crafts',
    },
    {
      label: 'Religious',
      icon: <Landmark className="w-5 h-5 text-[#084C61]" />,
      color: 'bg-white hover:border-[#084C61]',
      desc: 'Historic mosques & sacred landmarks',
    },
    {
      label: 'Dining',
      icon: <Utensils className="w-5 h-5 text-[#E27D60]" />,
      color: 'bg-white hover:border-[#E27D60]',
      desc: 'Eastern seafood, kottu & tea',
    },
    {
      label: 'Recreation',
      icon: <FerrisWheel className="w-5 h-5 text-[#084C61]" />,
      color: 'bg-white hover:border-[#084C61]',
      desc: 'Water parks & family leisure',
    },
    {
      label: 'Educational',
      icon: <GraduationCap className="w-5 h-5 text-[#4A4A4A]" />,
      color: 'bg-white hover:border-[#4A4A4A]',
      desc: 'University campus & libraries',
    },
  ];

  return (
    <div id="home-view" className="space-y-10 sm:space-y-14 pb-12">
      
      {/* Hero Section with Akkaraipattu Tropical Coastline & Catamaran Boat Background */}
      <section className="relative overflow-hidden rounded-[36px] shadow-2xl text-white min-h-[440px] sm:min-h-[500px] flex flex-col justify-between p-6 sm:p-10 lg:p-14 border border-white/20">
        
        {/* Akkaraipattu Scenic Sunrise Ocean and Beach Background */}
        <img
          src={heroSunriseBeachImg}
          alt="Akkaraipattu Ocean Sunrise Beach"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Cinematic Gradient Overlays to accentuate sunrise glow while keeping typography crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#03242e]/90 via-[#063b4b]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#021820]/80 via-transparent to-black/20" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl pt-2 sm:pt-4">
          
          <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
            Discover Akkaraipattu <br />
            in <span className="text-[#FFB703] drop-shadow-md">One Perfect Day</span>
          </h1>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-100 font-medium leading-relaxed drop-shadow-xs max-w-xl">
            Explore amazing places around Akkaraipattu and plan your perfect one-day adventure.
          </p>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              id="hero-start-planning-btn"
              onClick={() => setActiveTab('planner')}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#E27D60] hover:bg-[#cf6347] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#E27D60]/35 transition transform active:scale-95 cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Start Planning</span>
            </button>
            <button
              id="hero-explore-places-btn"
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/95 hover:bg-white text-[#084C61] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md backdrop-blur-md transition transform active:scale-95 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#E27D60]" />
              <span>Explore Places</span>
            </button>
          </div>
        </div>

        {/* Floating Search Bar */}
        <div className="relative z-10 mt-8 sm:mt-10 max-w-3xl w-full">
          <form
            id="hero-search-form"
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl sm:rounded-full shadow-2xl border border-white/60"
          >
            <div className="flex-1 w-full flex items-center gap-3 px-4 py-2 text-slate-800">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                id="hero-search-input"
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Where would you like to go?"
                className="w-full bg-transparent border-none text-slate-800 placeholder:text-slate-400 text-sm font-medium focus:outline-none"
              />
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2 px-2 pb-1 sm:pb-0">
              <select
                id="hero-radius-select"
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(Number(e.target.value))}
                className="w-full sm:w-auto bg-[#F2EDE4] text-[#084C61] text-xs font-bold py-2.5 px-3 rounded-full border border-[#E8E2D9] focus:outline-none cursor-pointer"
              >
                <option value={25}>Within 25 km</option>
                <option value={15}>Within 15 km</option>
                <option value={10}>Within 10 km</option>
                <option value={5}>Within 5 km</option>
              </select>

              <button
                id="hero-search-btn"
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#E27D60] hover:bg-[#cf6347] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#E27D60]/30 transition shrink-0 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Explore by Category - Restored 6-card layout with icons and descriptions */}
      <section>
        <div className="mb-4 sm:mb-6">
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#084C61] tracking-tight">
            Explore by Category
          </h2>
          <p className="text-xs sm:text-sm text-[#7D7D7D] mt-0.5">
            Filter attractions suited to your travel style
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.label}
              id={`cat-card-${cat.label.toLowerCase().replace('/', '-')}`}
              onClick={() => handleCategoryClick(cat.label)}
              className={`flex flex-col items-start p-4 sm:p-5 rounded-[28px] border border-[#E8E2D9] transition-all duration-300 text-left group hover:shadow-lg hover:border-[#084C61]/40 hover:-translate-y-0.5 cursor-pointer ${cat.color}`}
            >
              <div className="w-11 h-11 rounded-2xl bg-[#F2EDE4] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                {cat.icon}
              </div>
              <span className="font-heading font-bold text-sm sm:text-base text-[#084C61] mt-3 group-hover:text-[#127e75] transition-colors">
                {cat.label}
              </span>
              <span className="text-[11px] text-[#7D7D7D] mt-1 leading-snug line-clamp-2">
                {cat.desc}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Popular Places Carousel */}
      <section>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E27D60]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Must-Visit Highlights</span>
            </div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#084C61] tracking-tight mt-0.5">
              Popular Places in Akkaraipattu
            </h2>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              id="carousel-prev-btn"
              onClick={() => scrollHorizontal(-340)}
              className="w-10 h-10 rounded-full bg-white border border-[#E8E2D9] text-[#084C61] hover:bg-[#F2EDE4] flex items-center justify-center transition shadow-xs cursor-pointer"
              aria-label="Previous places"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="carousel-next-btn"
              onClick={() => scrollHorizontal(340)}
              className="w-10 h-10 rounded-full bg-white border border-[#E8E2D9] text-[#084C61] hover:bg-[#F2EDE4] flex items-center justify-center transition shadow-xs cursor-pointer"
              aria-label="Next places"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-4 pt-1 px-1 -mx-1"
        >
          {displayFeatured.map((place) => (
            <PlaceCard key={place.id} place={place} layout="horizontal" />
          ))}
        </div>
      </section>

      {/* Why Choose DaySpire? Feature Benefits Section */}
      <section className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E8E2D9] shadow-xs">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#127e75]">
            Key Advantages
          </span>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#084C61] tracking-tight mt-0.5">
            Why Choose DaySpire?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          
          <div className="p-4 rounded-[24px] bg-[#FDFBF7] border border-[#E8E2D9] flex flex-col items-start hover:border-[#127e75]/40 transition">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-xs sm:text-sm text-[#084C61]">
              Smart One-Day Planner
            </h4>
            <p className="text-[11px] text-[#7D7D7D] mt-1 leading-snug">
              Create your perfect itinerary with automatic timing and route optimization.
            </p>
          </div>

          <div className="p-4 rounded-[24px] bg-[#FDFBF7] border border-[#E8E2D9] flex flex-col items-start hover:border-[#127e75]/40 transition">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <MapIcon className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-xs sm:text-sm text-[#084C61]">
              Interactive Maps
            </h4>
            <p className="text-[11px] text-[#7D7D7D] mt-1 leading-snug">
              View pin locations, radial bounds, and directions easily on Leaflet maps.
            </p>
          </div>

          <div className="p-4 rounded-[24px] bg-[#FDFBF7] border border-[#E8E2D9] flex flex-col items-start hover:border-[#127e75]/40 transition">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-xs sm:text-sm text-[#084C61]">
              Nearby Attractions
            </h4>
            <p className="text-[11px] text-[#7D7D7D] mt-1 leading-snug">
              Discover verified spots curated strictly within a 25km radius.
            </p>
          </div>

          <div className="p-4 rounded-[24px] bg-[#FDFBF7] border border-[#E8E2D9] flex flex-col items-start hover:border-[#127e75]/40 transition">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-xs sm:text-sm text-[#084C61]">
              Travel Tips
            </h4>
            <p className="text-[11px] text-[#7D7D7D] mt-1 leading-snug">
              Get cultural etiquette, family notes, and best visiting hours.
            </p>
          </div>

          <div className="p-4 rounded-[24px] bg-[#FDFBF7] border border-[#E8E2D9] flex flex-col items-start hover:border-[#127e75]/40 transition">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
              <Route className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-xs sm:text-sm text-[#084C61]">
              Distance Calculator
            </h4>
            <p className="text-[11px] text-[#7D7D7D] mt-1 leading-snug">
              Know the exact travel distance, drive times, and total route spans.
            </p>
          </div>

          <div className="p-4 rounded-[24px] bg-[#FDFBF7] border border-[#E8E2D9] flex flex-col items-start hover:border-[#127e75]/40 transition">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-xs sm:text-sm text-[#084C61]">
              Mobile Friendly
            </h4>
            <p className="text-[11px] text-[#7D7D7D] mt-1 leading-snug">
              Seamlessly access and export your day plan on any phone or tablet.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
