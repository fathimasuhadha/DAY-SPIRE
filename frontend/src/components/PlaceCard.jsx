import React from 'react';
import { Clock, Plus, Check, Compass, Users, Sparkles } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { getVerifiedPlaceImage } from '../utils/placeImages';

export const PlaceCard = ({ place, layout = 'grid' }) => {
  const { selectedPlaceIds, addToPlan, removeFromPlan, setSelectedPlaceForModal } = usePlanner();
  const isSelected = selectedPlaceIds.includes(place.id);
  const placeImg = getVerifiedPlaceImage(place);

  const handlePlanToggle = (e) => {
    e.stopPropagation();
    if (isSelected) {
      removeFromPlan(place.id);
    } else {
      addToPlan(place.id);
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Coastal/Nature':
        return 'bg-[#084C61] text-white';
      case 'Shopping':
        return 'bg-[#E27D60] text-white';
      case 'Religious':
        return 'bg-[#F2EDE4] text-[#084C61] border border-[#E8E2D9]';
      case 'Dining':
        return 'bg-[#F2EDE4] text-[#E27D60] border border-[#E8E2D9]';
      case 'Recreation':
        return 'bg-[#084C61]/10 text-[#084C61]';
      case 'Educational':
        return 'bg-[#E8E2D9] text-[#4A4A4A]';
      default:
        return 'bg-[#F2EDE4] text-[#4A4A4A]';
    }
  };

  if (layout === 'horizontal') {
    return (
      <div
        id={`place-card-h-${place.id}`}
        role="button"
        tabIndex={0}
        onClick={() => setSelectedPlaceForModal(place)}
        onKeyDown={(e) => e.key === 'Enter' && setSelectedPlaceForModal(place)}
        className="group relative flex-none w-[280px] sm:w-[320px] bg-white rounded-[32px] border border-[#E8E2D9] shadow-sm hover:shadow-xl hover:border-[#E27D60]/40 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col p-3.5"
      >
        <div className="relative h-44 w-full rounded-[24px] overflow-hidden bg-[#F2EDE4]">
          <img
            src={placeImg}
            alt={place.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Category Badge */}
          <span
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider shadow-xs ${getCategoryColor(
              place.category
            )}`}
          >
            {place.category}
          </span>

          {/* Distance Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-[#E27D60]" />
            <span>{place.distanceKm} km {place.direction}</span>
          </div>

          {/* Featured Ribbon */}
          {place.featured && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[10px] font-bold text-white bg-[#E27D60] px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-200" />
              <span>Recommended</span>
            </div>
          )}
        </div>

        <div className="px-2 pt-3 pb-1 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1 gap-2">
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#084C61] group-hover:text-[#E27D60] transition-colors line-clamp-1">
                {place.name}
              </h3>
              <span className="text-[10px] bg-[#F2EDE4] text-[#084C61] font-bold px-2 py-0.5 rounded-full shrink-0">
                {place.distanceKm} km
              </span>
            </div>
            <p className="mt-1 text-xs text-[#7D7D7D] line-clamp-2 leading-relaxed">
              {place.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E2D9] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#4A4A4A]">
                {place.entryFee?.isFree ? (
                  <span>Free <span className="font-normal text-[10px] text-[#7D7D7D]">/ access</span></span>
                ) : (
                  <span>LKR {place.entryFee?.costLkr || 0} <span className="font-normal text-[10px] text-[#7D7D7D]">/ entry</span></span>
                )}
              </span>
            </div>

            <button
              id={`add-plan-h-${place.id}`}
              type="button"
              onClick={handlePlanToggle}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 shadow-sm ${
                isSelected
                  ? 'bg-[#084C61] text-white hover:bg-[#084C61]/90'
                  : 'bg-[#E27D60] text-white shadow-md shadow-[#E27D6033] hover:bg-[#C95F43]'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>In Plan</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default Grid Layout
  return (
    <div
      id={`place-card-${place.id}`}
      role="button"
      tabIndex={0}
      onClick={() => setSelectedPlaceForModal(place)}
      onKeyDown={(e) => e.key === 'Enter' && setSelectedPlaceForModal(place)}
      className="group relative bg-white rounded-[32px] border border-[#E8E2D9] shadow-sm hover:shadow-xl hover:border-[#E27D60]/40 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col p-3.5"
    >
      <div className="relative h-48 sm:h-52 w-full rounded-[24px] overflow-hidden bg-[#F2EDE4]">
        <img
          src={placeImg}
          alt={place.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {/* Category Pill */}
        <span
          className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs ${getCategoryColor(
            place.category
          )}`}
        >
          {place.category}
        </span>

        {/* Distance Badge */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
          <Compass className="w-3.5 h-3.5 text-[#E27D60]" />
          <span>{place.distanceKm} km ({place.direction})</span>
        </div>

        {/* Family Friendly indicator badge */}
        {place.familySuitability?.isFamilyFriendly && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-100 bg-emerald-950/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
            <Users className="w-3 h-3 text-emerald-400" />
            <span>Family Friendly</span>
          </div>
        )}
      </div>

      <div className="px-2 pt-3.5 pb-1 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1 gap-2">
            <h3 className="font-heading font-bold text-lg text-[#084C61] group-hover:text-[#E27D60] transition-colors leading-snug">
              {place.name}
            </h3>
            <span className="text-[10px] bg-[#F2EDE4] text-[#084C61] font-bold px-2.5 py-0.5 rounded-full shrink-0">
              {place.distanceKm} km
            </span>
          </div>

          <p className="mt-1.5 text-xs text-[#7D7D7D] line-clamp-2 leading-relaxed">
            {place.description}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-[#7D7D7D]">
            <Clock className="w-3.5 h-3.5 text-[#7D7D7D] shrink-0" />
            <span className="truncate">{place.openingHours}</span>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-[#E8E2D9] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#4A4A4A]">
              {place.entryFee?.isFree ? (
                <span>Free <span className="font-normal text-[10px] text-[#7D7D7D]">/ access</span></span>
              ) : (
                <span>LKR {place.entryFee?.costLkr || 0} <span className="font-normal text-[10px] text-[#7D7D7D]">/ entry</span></span>
              )}
            </span>
          </div>

          <button
            id={`add-plan-${place.id}`}
            type="button"
            onClick={handlePlanToggle}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm ${
              isSelected
                ? 'bg-[#084C61] text-white hover:bg-[#084C61]/90'
                : 'bg-[#E27D60] text-white shadow-md shadow-[#E27D6033] hover:bg-[#C95F43]'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4" />
                <span>In Plan</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};