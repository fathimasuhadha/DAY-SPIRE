import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  LayoutGrid,
  List,
  Compass,
  Users,
  CircleDollarSign,
  Palmtree,
  ShoppingBag,
  Landmark,
  Utensils,
  FerrisWheel,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { PlaceCategory } from '../types';
import { PlaceCard } from './PlaceCard';
import { getVerifiedPlaceImage } from '../utils/placeImages';

export const ExploreView = () => {
  const {
    activePlaces,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    maxDistanceKm,
    setMaxDistanceKm,
    filterFamilyOnly,
    setFilterFamilyOnly,
    filterFreeOnly,
    setFilterFreeOnly,
    resetFilters,
    isLoadingSkeleton,
    setIsLoadingSkeleton,
    setSelectedPlaceForModal,
    selectedPlaceIds,
    addToPlan,
    removeFromPlan,
  } = usePlanner();

  const [viewMode, setViewMode] = useState('grid');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const categories = [
    { label: 'All' },
    { label: 'Coastal/Nature', icon: <Palmtree className="w-3.5 h-3.5" /> },
    { label: 'Shopping', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { label: 'Religious', icon: <Landmark className="w-3.5 h-3.5" /> },
    { label: 'Dining', icon: <Utensils className="w-3.5 h-3.5" /> },
    { label: 'Recreation', icon: <FerrisWheel className="w-3.5 h-3.5" /> },
    { label: 'Educational', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  ];

  // Filtering Logic
  const filteredPlaces = useMemo(() => {
    return activePlaces.filter((place) => {
      // Category check
      if (selectedCategory !== 'All' && place.category !== selectedCategory) {
        return false;
      }

      // Distance check
      if (place.distanceKm > maxDistanceKm) {
        return false;
      }

      // Family only check
      if (filterFamilyOnly && !place.familySuitability?.isFamilyFriendly) {
        return false;
      }

      // Free entry only check
      if (filterFreeOnly && !place.entryFee.isFree) {
        return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = place.name.toLowerCase().includes(q);
        const matchesDesc = place.description.toLowerCase().includes(q);
        const matchesCategory = place.category.toLowerCase().includes(q);
        const matchesDirection = place.direction.toLowerCase().includes(q);
        const matchesFood = place.nearbyFoodRest?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesDirection && !matchesFood) {
          return false;
        }
      }

      return true;
    });
  }, [activePlaces, selectedCategory, maxDistanceKm, filterFamilyOnly, filterFreeOnly, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    maxDistanceKm < 25 ||
    filterFamilyOnly ||
    filterFreeOnly;

  return (
    <div id="explore-view" className="space-y-6 pb-12">
      
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#084C61] tracking-tight">
            Explore Places in Akkaraipattu
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7D7D] mt-1">
            Browse verified attractions, natural viewpoints, shopping bazaars, and dining stops within 25km.
          </p>
        </div>

        {/* View Mode & Skeleton Toggle Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            id="toggle-loading-skeleton-btn"
            onClick={() => {
              setIsLoadingSkeleton(true);
              setTimeout(() => setIsLoadingSkeleton(false), 1200);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E8E2D9] text-[#084C61] bg-white hover:bg-[#F2EDE4] text-xs font-semibold shadow-xs"
            title="Test loading state"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E27D60]" />
            <span className="hidden sm:inline">Simulate</span> Skeleton
          </button>

          <div className="flex items-center bg-white border border-[#E8E2D9] rounded-full p-1 shadow-xs">
            <button
              id="view-mode-grid"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition ${
                viewMode === 'grid'
                  ? 'bg-[#084C61] text-white shadow-xs'
                  : 'text-[#7D7D7D] hover:text-[#084C61]'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-list"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition ${
                viewMode === 'list'
                  ? 'bg-[#084C61] text-white shadow-xs'
                  : 'text-[#7D7D7D] hover:text-[#084C61]'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative bg-[#F2EDE4] rounded-full border border-[#E8E2D9] shadow-xs p-2 sm:p-2.5 flex items-center gap-3">
        <Search className="w-5 h-5 text-[#7D7D7D] ml-3 shrink-0" />
        <input
          id="explore-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by attraction name, beach, mosque, restaurant, shopping..."
          className="w-full bg-transparent border-none text-[#4A4A4A] placeholder:text-[#7D7D7D] text-sm sm:text-base focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-semibold text-[#7D7D7D] hover:text-[#084C61] px-3 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Filter Chips Bar (Combinable per FR-009) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.label;
          return (
            <button
              key={cat.label}
              id={`filter-chip-${cat.label.toLowerCase().replace('/', '-')}`}
              onClick={() => setSelectedCategory(cat.label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shadow-xs shrink-0 ${
                isSelected
                  ? 'bg-[#084C61] text-white shadow-sm shadow-[#084C61]/20'
                  : 'bg-white text-[#084C61] border border-[#E8E2D9] hover:bg-[#F2EDE4]'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              {cat.label === 'All' && (
                <span className="ml-1 text-[11px] opacity-80">({activePlaces.length})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Controls Bar */}
      <div className="bg-white rounded-[28px] p-4 sm:p-5 border border-[#E8E2D9] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Distance Filter */}
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#E27D60]" />
              <label htmlFor="distance-range-slider" className="text-xs font-bold text-[#4A4A4A]">
                Max Distance:
              </label>
              <input
                id="distance-range-slider"
                type="range"
                min={2}
                max={25}
                step={1}
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="w-24 sm:w-32 accent-[#E27D60] cursor-pointer"
              />
              <span className="text-xs font-bold text-[#084C61] bg-[#F2EDE4] px-2.5 py-1 rounded-full border border-[#E8E2D9]">
                ≤ {maxDistanceKm} km
              </span>
            </div>

            {/* Family Friendly Toggle */}
            <button
              id="filter-family-toggle"
              type="button"
              onClick={() => setFilterFamilyOnly(!filterFamilyOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                filterFamilyOnly
                  ? 'bg-[#084C61] text-white border-[#084C61] font-bold'
                  : 'bg-[#F2EDE4] text-[#4A4A4A] border-[#E8E2D9] hover:bg-[#E8E2D9]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Family Friendly Only</span>
            </button>

            {/* Free Entry Toggle */}
            <button
              id="filter-free-toggle"
              type="button"
              onClick={() => setFilterFreeOnly(!filterFreeOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                filterFreeOnly
                  ? 'bg-[#E27D60] text-white border-[#E27D60] font-bold'
                  : 'bg-[#F2EDE4] text-[#4A4A4A] border-[#E8E2D9] hover:bg-[#E8E2D9]'
              }`}
            >
              <CircleDollarSign className="w-3.5 h-3.5" />
              <span>Free Admission Only</span>
            </button>
          </div>

          {/* Reset Filters (FR-010) */}
          {hasActiveFilters && (
            <button
              id="reset-filters-btn"
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#E27D60] hover:bg-[#F2EDE4] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count & Feedback */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 px-1">
        <span>
          Showing <strong>{filteredPlaces.length}</strong> of {activePlaces.length} verified places
        </span>
        {selectedCategory !== 'All' && (
          <span className="text-xs text-slate-500 font-medium">
            Category: <strong className="text-slate-800">{selectedCategory}</strong>
          </span>
        )}
      </div>

      {/* Skeleton Loading State */}
      {isLoadingSkeleton ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8DFD3] overflow-hidden p-4 space-y-3">
              <div className="h-48 bg-slate-200 rounded-xl" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="pt-3 flex justify-between">
                <div className="h-6 bg-slate-200 rounded w-20" />
                <div className="h-8 bg-slate-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPlaces.length > 0 ? (
        /* Results Grid or List View */
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} layout="grid" />
            ))}
          </div>
        ) : (
          /* List View with Verified Authentic Images */
          <div className="space-y-3">
            {filteredPlaces.map((place) => {
              const isSelected = selectedPlaceIds.includes(place.id);
              return (
                <div
                  key={place.id}
                  id={`place-list-item-${place.id}`}
                  onClick={() => setSelectedPlaceForModal(place)}
                  className="bg-white rounded-[28px] p-4 sm:p-5 border border-[#E8E2D9] hover:border-[#E27D60]/40 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={getVerifiedPlaceImage(place)}
                      alt={place.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-[20px] object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F2EDE4] text-[#084C61] border border-[#E8E2D9]">
                          {place.category}
                        </span>
                        <span className="text-xs text-[#7D7D7D] font-medium">
                          {place.distanceKm} km ({place.direction})
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-base text-[#084C61] mt-1">
                        {place.name}
                      </h3>
                      <p className="text-xs text-[#7D7D7D] line-clamp-1 max-w-xl mt-0.5">
                        {place.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E2D9]">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-[#7D7D7D] block uppercase font-bold">Fee</span>
                      <span className="text-xs font-bold text-[#4A4A4A]">
                        {place.entryFee.displayText}
                      </span>
                    </div>

                    <button
                      id={`list-add-${place.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSelected) removeFromPlan(place.id);
                        else addToPlan(place.id);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition shadow-sm ${
                        isSelected
                          ? 'bg-[#084C61] text-white'
                          : 'bg-[#E27D60] text-white shadow-md shadow-[#E27D6033] hover:bg-[#C95F43]'
                      }`}
                    >
                      {isSelected ? 'In Plan' : '+ Add to Plan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Empty-State */
        <div
          id="explore-empty-state"
          className="bg-[#F2EDE4] rounded-[32px] p-8 sm:p-12 text-center border border-[#E8E2D9] shadow-xs max-w-xl mx-auto"
        >
          <div className="w-16 h-16 rounded-full bg-white text-[#E27D60] flex items-center justify-center mx-auto mb-4 border border-[#E8E2D9] shadow-xs">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-xl text-[#084C61]">
            No attractions found
          </h3>
          <p className="text-sm text-[#4A4A4A] mt-2 max-w-md mx-auto leading-relaxed">
            We couldn’t find any places matching your active search terms or category filters within the 25km radius.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              id="empty-reset-filters-btn"
              onClick={resetFilters}
              className="px-6 py-3 rounded-full bg-[#E27D60] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#E27D6033] hover:bg-[#C95F43] transition"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};