import React, { useEffect, useRef } from 'react';
import {
  X,
  MapPin,
  Clock,
  CircleDollarSign,
  Compass,
  Users,
  Utensils,
  BookOpen,
  ExternalLink,
  Plus,
  Check,
  Navigation,
  ShieldAlert,
  Sparkles,
  Star,
} from 'lucide-react';
import L from 'leaflet';
import { usePlanner } from '../context/PlannerContext';
import { AKKARAIPATTU_CENTER } from '../data/initialPlaces';
import { getGoogleMapsDirectionsUrl, getSafeGoogleMapsUrl } from '../utils/navigation';
import { getVerifiedPlaceImage } from '../utils/placeImages';

export const PlaceDetailModal = () => {
  const {
    selectedPlaceForModal,
    setSelectedPlaceForModal,
    selectedPlaceIds,
    addToPlan,
    removeFromPlan,
  } = usePlanner();

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);

  const place = selectedPlaceForModal;
  const isSelected = place ? selectedPlaceIds.includes(place.id) : false;

  useEffect(() => {
    if (!place || !mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [place.coordinates.lat, place.coordinates.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `<div style="background-color: #E27D60; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; font-weight: bold; font-size: 14px;">📍</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      L.marker([place.coordinates.lat, place.coordinates.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>${place.name}</b><br/>${place.distanceKm} km from Akkaraipattu town`)
        .openPopup();

      leafletMapRef.current = map;
    } catch (e) {
      console.warn('Leaflet mini map initialization notice:', e);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [place]);

  if (!place) return null;

  const handlePlanToggle = () => {
    if (isSelected) {
      removeFromPlan(place.id);
    } else {
      addToPlan(place.id);
    }
  };

  const googleMapsDirectionsUrl = getGoogleMapsDirectionsUrl(place);
  const safeGoogleMapsUrl = getSafeGoogleMapsUrl(place);

  return (
    <div
      id="place-detail-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-3xl bg-[#FDFBF7] rounded-[32px] shadow-2xl border border-[#E8E2D9] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          id="close-place-modal-btn"
          type="button"
          onClick={() => setSelectedPlaceForModal(null)}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
            <img
              src={getVerifiedPlaceImage(place)}
              alt={place.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-black/30 to-black/60" />

            <div className="absolute bottom-4 left-4 sm:left-6 right-4 sm:right-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E27D60] text-white shadow-xs">
                  {place.category}
                </span>
                <span className="flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-bold bg-white/90 text-[#084C61] backdrop-blur-md">
                  <Compass className="w-3.5 h-3.5 text-[#E27D60]" />
                  {place.distanceKm} km ({place.direction})
                </span>
                {place.rating && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>{place.rating}</span>
                    {place.reviewsCount && (
                      <span className="text-[10px] opacity-90">({place.reviewsCount})</span>
                    )}
                  </span>
                )}
                {place.familySuitability?.isFamilyFriendly && (
                  <span className="flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-bold bg-[#084C61] text-white">
                    <Users className="w-3.5 h-3.5" />
                    Family Friendly
                  </span>
                )}
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#084C61]">
                {place.name}
              </h2>
              {place.address && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#4A4A4A] font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#E27D60] shrink-0" />
                  <span className="line-clamp-1">{place.address}</span>
                </p>
              )}
            </div>
          </div>

          {/* Details Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Description */}
            <div className="bg-[#F2EDE4] p-5 rounded-[24px] border border-[#E8E2D9] shadow-xs">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#7D7D7D] mb-2">
                About this place
              </h3>
              <p className="text-[#4A4A4A] text-base leading-relaxed">
                {place.description}
              </p>
              {place.bestTimeToVisit && (
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#084C61] bg-white px-3.5 py-2 rounded-full border border-[#E8E2D9]">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#E27D60]" />
                  <span>Best Time: {place.bestTimeToVisit}</span>
                </div>
              )}
            </div>

            {/* Practical Visitor Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#F2EDE4] p-4 rounded-[24px] border border-[#E8E2D9] flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white text-[#E27D60] border border-[#E8E2D9] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#7D7D7D] uppercase tracking-wider">
                    Opening Hours
                  </h4>
                  <p className="text-sm font-semibold text-[#084C61] mt-0.5">
                    {place.openingHours}
                  </p>
                </div>
              </div>

              <div className="bg-[#F2EDE4] p-4 rounded-[24px] border border-[#E8E2D9] flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white text-[#084C61] border border-[#E8E2D9] flex items-center justify-center shrink-0">
                  <CircleDollarSign className="w-5 h-5 text-[#E27D60]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#7D7D7D] uppercase tracking-wider">
                    Entry Fee & Cost
                  </h4>
                  <p className="text-sm font-semibold text-[#084C61] mt-0.5">
                    {place.entryFee.displayText}
                  </p>
                  {place.entryFee.foreignTouristNote && (
                    <p className="text-xs text-[#7D7D7D] mt-0.5">
                      {place.entryFee.foreignTouristNote}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Cultural Etiquette */}
            {place.culturalEtiquette && (
              <div className="bg-[#F2EDE4] border border-[#E8E2D9] p-4 sm:p-5 rounded-[24px] flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-white text-[#084C61] border border-[#E8E2D9] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#084C61] flex items-center gap-1.5">
                    Cultural Etiquette & Local Advice
                  </h4>
                  <p className="text-xs sm:text-sm text-[#4A4A4A] mt-1 leading-relaxed">
                    {place.culturalEtiquette}
                  </p>
                </div>
              </div>
            )}

            {/* Family & Safety */}
            {(place.familySuitability?.notes || place.safetyNotes) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {place.familySuitability?.notes && (
                  <div className="bg-[#F2EDE4] border border-[#E8E2D9] p-4 rounded-[24px] flex items-start gap-3">
                    <Users className="w-5 h-5 text-[#084C61] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#084C61] uppercase tracking-wide">
                        Family & Children Info
                      </h4>
                      <p className="text-xs text-[#4A4A4A] mt-1 leading-relaxed">
                        {place.familySuitability.notes}
                      </p>
                    </div>
                  </div>
                )}

                {place.safetyNotes && (
                  <div className="bg-[#F2EDE4] border border-[#E8E2D9] p-4 rounded-[24px] flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-[#E27D60] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#084C61] uppercase tracking-wide">
                        Visitor Safety Guideline
                      </h4>
                      <p className="text-xs text-[#4A4A4A] mt-1 leading-relaxed">
                        {place.safetyNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nearby Food */}
            {place.nearbyFoodRest && (
              <div className="bg-[#F2EDE4] border border-[#E8E2D9] p-4 rounded-[24px] flex items-start gap-3.5">
                <Utensils className="w-5 h-5 text-[#E27D60] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#084C61] uppercase tracking-wide">
                    Nearby Food & Rest Stops
                  </h4>
                  <p className="text-xs sm:text-sm text-[#4A4A4A] mt-1 leading-relaxed">
                    {place.nearbyFoodRest}
                  </p>
                </div>
              </div>
            )}

            {/* Location & Directions */}
            <div className="bg-[#F2EDE4] p-4 sm:p-5 rounded-[24px] border border-[#E8E2D9]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E27D60]" />
                  <span className="font-heading font-bold text-sm text-[#084C61]">
                    Location & Directions
                  </span>
                </div>
                <span className="text-xs text-[#7D7D7D]">
                  Coords: {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
                </span>
              </div>

              {place.address && (
                <div className="mb-3 p-3 bg-white rounded-xl border border-[#E8E2D9] text-xs text-[#4A4A4A] flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#E27D60] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#084C61] block">Exact Address / Plus Code:</span>
                    <span>{place.address}</span>
                  </div>
                </div>
              )}

              <div
                ref={mapContainerRef}
                className="w-full h-44 rounded-2xl overflow-hidden border border-[#E8E2D9] bg-white z-10"
              />

              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#7D7D7D]">
                  <span>Starting reference: </span>
                  <span className="font-semibold text-[#084C61]">Akkaraipattu Home Origin (7.231289, 81.845351)</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Fixed Safe Google Maps Link */}
                  <a
                    id="view-on-google-maps-btn"
                    href={safeGoogleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-[#084C61] border border-[#E8E2D9] text-xs font-bold uppercase tracking-wider hover:bg-[#F2EDE4] transition shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#E27D60]" />
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  <a
                    id="open-google-maps-btn"
                    href={googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#084C61] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#063b4b] transition shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#E27D60]" />
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#E8E2D9] p-4 sm:px-6 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#7D7D7D] font-bold uppercase tracking-wider">Trip Status</span>
            <span className="text-xs sm:text-sm font-bold text-[#084C61]">
              {isSelected ? 'Included in your One-Day Plan' : 'Not added to plan yet'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="modal-toggle-plan-btn"
              type="button"
              onClick={handlePlanToggle}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md transition-all ${
                isSelected
                  ? 'bg-[#084C61] text-white hover:bg-[#063b4b]'
                  : 'bg-[#E27D60] text-white hover:bg-[#C95F43] shadow-[#E27D6033]'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>In Your Plan</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to My Plan</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};