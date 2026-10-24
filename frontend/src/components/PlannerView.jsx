import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  CalendarDays,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
  Compass,
  Plus,
  ArrowRight,
  Info,
  Clock,
  MapPin,
  ExternalLink,
  Navigation,
  Car,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePlanner } from '../context/PlannerContext';
import { AKKARAIPATTU_CENTER } from '../data/initialPlaces';
import {
  HOME_ORIGIN_COORDS,
  getMultiStopDirectionsUrl,
  getGoogleMapsDirectionsUrl,
} from '../utils/navigation';
import { getVerifiedPlaceImage } from '../utils/placeImages';

// Haversine formula for calculating distance in km
const calcHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const PlannerView = () => {
  const {
    activePlaces,
    selectedPlaceIds,
    removeFromPlan,
    reorderPlan,
    clearPlan,
    optimizeRouteSequence,
    generatePlan,
    setActiveTab,
    setSelectedPlaceForModal,
    addToPlan,
    showToast,
  } = usePlanner();

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const polylineLayerRef = useRef(null);

  const [activeLegIndex, setActiveLegIndex] = useState(null);

  // Selected places in current order
  const selectedPlaces = useMemo(() => {
    return selectedPlaceIds
      .map((id) => activePlaces.find((p) => p.id === id))
      .filter((p) => p !== undefined);
  }, [selectedPlaceIds, activePlaces]);

  // Unselected places to quickly add
  const unselectedPlaces = useMemo(() => {
    return activePlaces.filter((p) => !selectedPlaceIds.includes(p.id));
  }, [activePlaces, selectedPlaceIds]);

  // Compute leg-by-leg distance and cumulative trip metrics
  const { legs, totalDistanceKm, estimatedDriveTimeMins } = useMemo(() => {
    const computedLegs = [];
    let cumDist = 0;
    let prevLat = HOME_ORIGIN_COORDS.lat;
    let prevLng = HOME_ORIGIN_COORDS.lng;
    let prevName = 'Home Base (Akkaraipattu)';

    selectedPlaces.forEach((place, idx) => {
      const legDist = calcHaversineDistance(
        prevLat,
        prevLng,
        place.coordinates.lat,
        place.coordinates.lng
      );
      cumDist += legDist;
      // Driving estimate: ~30km/h average in local roads + buffer = ~2.2 mins per km
      const driveMins = Math.max(3, Math.round(legDist * 2.2));

      computedLegs.push({
        stopIndex: idx + 1,
        fromName: prevName,
        toName: place.name,
        place,
        distanceKm: legDist,
        driveMins,
      });

      prevLat = place.coordinates.lat;
      prevLng = place.coordinates.lng;
      prevName = place.name;
    });

    const totalDriveMins = computedLegs.reduce((sum, leg) => sum + leg.driveMins, 0);

    return {
      legs: computedLegs,
      totalDistanceKm: cumDist,
      estimatedDriveTimeMins: totalDriveMins,
    };
  }, [selectedPlaces]);

  // Multi-stop Google Maps directions link for the full sequence
  const multiStopGoogleMapsUrl = useMemo(() => {
    return getMultiStopDirectionsUrl(selectedPlaces);
  }, [selectedPlaces]);

  // Initialize and maintain the embedded Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Leaflet map instance if not already initialized
    if (!leafletMapRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: [HOME_ORIGIN_COORDS.lat, HOME_ORIGIN_COORDS.lng],
          zoom: 12,
          zoomControl: false,
        });

        // Crisp OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // Add custom zoom controls in top-right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // 25km perimeter guide
        L.circle([HOME_ORIGIN_COORDS.lat, HOME_ORIGIN_COORDS.lng], {
          radius: 25000,
          color: '#084C61',
          fillColor: '#084C61',
          fillOpacity: 0.03,
          weight: 1.5,
          dashArray: '5, 5',
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        leafletMapRef.current = map;

        // Force layout recalculation
        setTimeout(() => {
          map.invalidateSize();
        }, 150);
      } catch (err) {
        console.warn('Planner Leaflet init notice:', err);
      }
    }

    const map = leafletMapRef.current;
    if (!map) return;

    // Clear existing markers and route polyline
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }
    if (polylineLayerRef.current) {
      polylineLayerRef.current.remove();
      polylineLayerRef.current = null;
    }

    const allPoints = [];

    // 1. Draw Home Origin Pin (7.231289, 81.845351)
    const homeCoords = [HOME_ORIGIN_COORDS.lat, HOME_ORIGIN_COORDS.lng];
    allPoints.push(homeCoords);

    const homeIcon = L.divIcon({
      className: 'planner-home-pin',
      html: `
        <div style="
          position: relative;
          background-color: #084C61;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(8, 76, 97, 0.45);
          border: 3px solid #FFFFFF;
          font-size: 16px;
          cursor: pointer;
        ">
          🏠
          <span style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            background: #084C61;
            color: #FFF;
            font-size: 8px;
            font-weight: 800;
            padding: 1px 4px;
            border-radius: 4px;
            white-space: nowrap;
            letter-spacing: 0.5px;
            border: 1px solid #FFF;
          ">START</span>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 21],
    });

    const homeMarker = L.marker(homeCoords, { icon: homeIcon }).addTo(markersLayerRef.current);
    homeMarker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 160px;">
        <div style="font-weight: bold; color: #084C61; font-size: 13px;">🏠 Home Origin (Starting Point)</div>
        <div style="font-size: 11px; color: #E27D60; font-weight: 600; margin-top: 2px;">7.231289, 81.845351</div>
        <div style="font-size: 11px; color: #666; margin-top: 2px;">Akkaraipattu base location for all day-tour routes.</div>
      </div>
    `);

    // 2. Draw Numbered Pins for each selected place in visit sequence
    selectedPlaces.forEach((place, index) => {
      const stopNumber = index + 1;
      const coords = [place.coordinates.lat, place.coordinates.lng];
      allPoints.push(coords);

      const placeIcon = L.divIcon({
        className: 'planner-stop-pin',
        html: `
          <div style="
            position: relative;
            background-color: #E27D60;
            color: white;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(226, 125, 96, 0.45);
            border: 3px solid #FFFFFF;
            font-weight: 800;
            font-size: 13px;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <span>${stopNumber}</span>
            <span style="
              position: absolute;
              bottom: -6px;
              left: 50%;
              transform: translateX(-50%);
              background: #084C61;
              color: #FFF;
              font-size: 8px;
              font-weight: 700;
              padding: 0px 4px;
              border-radius: 4px;
              white-space: nowrap;
              border: 1px solid #FFF;
            ">STOP ${stopNumber}</span>
          </div>
        `,
        iconSize: [34, 40],
        iconAnchor: [17, 20],
      });

      const marker = L.marker(coords, { icon: placeIcon }).addTo(markersLayerRef.current);
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 175px;">
          <div style="font-size: 10px; font-weight: 800; color: #E27D60; text-transform: uppercase;">Stop ${stopNumber} of ${selectedPlaces.length}</div>
          <div style="font-weight: bold; color: #084C61; font-size: 13px; margin-top: 2px;">${place.name}</div>
          <div style="font-size: 11px; color: #666; margin-top: 2px;">${place.category} • ${place.distanceKm} km from Home</div>
          <div style="font-size: 11px; color: #4A4A4A; font-weight: 600; margin-top: 2px;">${place.entryFee?.displayText || 'Free Entry'}</div>
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #EEE;">
            <a href="${getGoogleMapsDirectionsUrl(place)}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #084C61; font-weight: bold; text-decoration: underline;">Open Directions ↗</a>
          </div>
        </div>
      `);
    });

    // 3. Draw Route Polyline connecting: Home -> Stop 1 -> Stop 2 -> ... -> Stop N
    if (allPoints.length > 1) {
      const polyline = L.polyline(allPoints, {
        color: '#E27D60',
        weight: 4,
        opacity: 0.9,
        dashArray: '6, 8',
      }).addTo(map);

      polylineLayerRef.current = polyline;

      // Fit map bounds to neatly encompass the whole route
      try {
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, {
          padding: [30, 30],
          maxZoom: 14,
          animate: true,
        });
      } catch {
        // ignore bounds calculation error
      }
    } else {
      // If only home base exists, center directly on Akkaraipattu Home Origin
      map.setView([HOME_ORIGIN_COORDS.lat, HOME_ORIGIN_COORDS.lng], 12);
    }
  }, [selectedPlaces]);

  // Recenter button click
  const handleRecenterMap = () => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (selectedPlaces.length > 0) {
      const allPoints = [
        [HOME_ORIGIN_COORDS.lat, HOME_ORIGIN_COORDS.lng],
        ...selectedPlaces.map((p) => [p.coordinates.lat, p.coordinates.lng]),
      ];
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [30, 30], animate: true });
    } else {
      map.flyTo([HOME_ORIGIN_COORDS.lat, HOME_ORIGIN_COORDS.lng], 12);
    }
    if (showToast) {
      showToast('Map recentered to complete route.', 'info');
    }
  };

  const handleGenerate = () => {
    const success = generatePlan();
    if (success) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#E07A5F', '#0D9488', '#F49D85', '#F59E0B'],
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div id="planner-view" className="space-y-6 sm:space-y-8 pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E27D60] mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>Single-Day Sightseeing Trip</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#084C61] tracking-tight">
            One-Day Visit Planner
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7D7D] mt-1">
            Select, organize, and sequence your visit stops around Akkaraipattu with a live interactive route map.
          </p>
        </div>

        {selectedPlaces.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              id="optimize-route-btn"
              type="button"
              onClick={optimizeRouteSequence}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#F2EDE4] border border-[#E8E2D9] text-[#084C61] hover:bg-[#E8E2D9] text-xs font-bold transition shadow-xs cursor-pointer"
              title="Auto-sequence stops based on geographic proximity and dawn/dusk hours"
            >
              <Sparkles className="w-4 h-4 text-[#E27D60]" />
              <span>Recommend Sequence</span>
            </button>

            <button
              id="clear-plan-btn"
              type="button"
              onClick={clearPlan}
              className="p-2.5 rounded-full border border-[#E8E2D9] text-[#7D7D7D] hover:text-rose-600 hover:bg-rose-50 transition bg-white cursor-pointer"
              title="Clear all stops"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Top Quick Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Planned Stops */}
        <div className="bg-white p-4 sm:p-5 rounded-[24px] border border-[#E8E2D9] shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F2EDE4] text-[#E27D60] border border-[#E8E2D9] flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider block">
              Planned Stops
            </span>
            <span className="font-heading font-black text-xl sm:text-2xl text-[#084C61]">
              {selectedPlaces.length} <span className="text-xs font-normal text-[#7D7D7D]">places</span>
            </span>
          </div>
        </div>

        {/* Total Route Distance */}
        <div className="bg-white p-4 sm:p-5 rounded-[24px] border border-[#E8E2D9] shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F2EDE4] text-[#084C61] border border-[#E8E2D9] flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6 text-[#084C61]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider block">
              Total Route Distance
            </span>
            <span className="font-heading font-black text-xl sm:text-2xl text-[#084C61]">
              {totalDistanceKm.toFixed(1)} km
            </span>
            <span className="text-[11px] text-[#7D7D7D] font-medium block">
              origin: 7.231289, 81.845351
            </span>
          </div>
        </div>

        {/* Estimated Driving Duration */}
        <div className="bg-white p-4 sm:p-5 rounded-[24px] border border-[#E8E2D9] shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F2EDE4] text-[#E27D60] border border-[#E8E2D9] flex items-center justify-center shrink-0">
            <Car className="w-6 h-6 text-[#E27D60]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider block">
              Approx. Driving Time
            </span>
            <span className="font-heading font-black text-xl sm:text-2xl text-[#084C61]">
              ~{estimatedDriveTimeMins} mins
            </span>
            <span className="text-[11px] text-[#7D7D7D] font-medium block">
              excluding sightseeing time
            </span>
          </div>
        </div>

      </div>

      {/* Main 2-Column Responsive Layout: Stops List (Left) + Live Route Map & Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Selected Stops List & Quick Add */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Selected Stops Reordering List */}
          <div className="bg-white rounded-[32px] p-5 sm:p-7 border border-[#E8E2D9] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <div>
                <h2 className="font-heading font-bold text-lg text-[#084C61]">
                  Selected Itinerary Stops ({selectedPlaces.length})
                </h2>
                <p className="text-xs text-[#7D7D7D]">
                  Stops are visited in this exact order on your live route map.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#E27D60] hidden sm:inline">
                Use ↑ ↓ to reorder
              </span>
            </div>

            {selectedPlaces.length > 0 ? (
              <div className="space-y-3">
                {selectedPlaces.map((place, index) => (
                  <div
                    key={place.id}
                    id={`plan-stop-item-${place.id}`}
                    className="group bg-[#F2EDE4] rounded-[24px] p-3.5 sm:p-4 border border-[#E8E2D9] hover:border-[#E27D60]/50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Step Number Badge */}
                      <div className="w-8 h-8 rounded-full bg-[#E27D60] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {index + 1}
                      </div>

                      <img
                        src={getVerifiedPlaceImage(place)}
                        alt={place.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 cursor-pointer border border-[#E8E2D9]"
                        onClick={() => setSelectedPlaceForModal(place)}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#084C61] uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-[#E8E2D9]">
                            {place.category}
                          </span>
                          <span className="text-xs text-[#7D7D7D] font-medium">
                            {place.distanceKm} km ({place.direction})
                          </span>
                        </div>

                        <h3
                          onClick={() => setSelectedPlaceForModal(place)}
                          className="font-heading font-bold text-base text-[#084C61] hover:text-[#E27D60] cursor-pointer truncate mt-0.5"
                        >
                          {place.name}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-[#7D7D7D] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#7D7D7D]" />
                            {place.openingHours?.split('(')[0] || 'Open'}
                          </span>
                          <span className="font-semibold text-[#4A4A4A]">
                            {place.entryFee?.displayText || 'Free Entry'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reorder and Delete Controls */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        id={`move-up-${place.id}`}
                        type="button"
                        disabled={index === 0}
                        onClick={() => reorderPlan(index, index - 1)}
                        className="p-2 rounded-full bg-white border border-[#E8E2D9] text-[#084C61] hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
                        title="Move stop earlier in sequence"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        id={`move-down-${place.id}`}
                        type="button"
                        disabled={index === selectedPlaces.length - 1}
                        onClick={() => reorderPlan(index, index + 1)}
                        className="p-2 rounded-full bg-white border border-[#E8E2D9] text-[#084C61] hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
                        title="Move stop later in sequence"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        id={`remove-stop-${place.id}`}
                        type="button"
                        onClick={() => removeFromPlan(place.id)}
                        className="p-2 rounded-full bg-white border border-[#E8E2D9] text-[#7D7D7D] hover:text-rose-600 hover:bg-rose-50 transition shadow-2xs cursor-pointer"
                        title="Remove from plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-[#F2EDE4] rounded-[24px] border border-dashed border-[#E8E2D9]">
                <CalendarDays className="w-10 h-10 text-[#E27D60] mx-auto mb-2" />
                <h3 className="font-heading font-bold text-[#084C61] text-base">
                  Your Day Plan is Empty
                </h3>
                <p className="text-xs text-[#7D7D7D] mt-1 max-w-sm mx-auto">
                  Add places from the catalogue below or browse the Explore section to start tracing your live route on the map.
                </p>
                <button
                  id="empty-browse-explore-btn"
                  onClick={() => setActiveTab('explore')}
                  className="mt-4 px-5 py-2.5 rounded-full bg-[#E27D60] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#C95F43] transition shadow-md shadow-[#E27D6033] cursor-pointer"
                >
                  Browse Attractions
                </button>
              </div>
            )}

            {/* Generate Plan Action Bar */}
            <div className="pt-4 border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#7D7D7D]">
                <Info className="w-4 h-4 text-[#E27D60] shrink-0" />
                <span>
                  {selectedPlaces.length >= 1
                    ? 'Ready! Generating will create a timeline with travel guidance.'
                    : 'Select at least 1 place to generate your timeline.'}
                </span>
              </div>

              <button
                id="generate-plan-btn"
                type="button"
                disabled={selectedPlaces.length === 0}
                onClick={handleGenerate}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#E27D60] hover:bg-[#C95F43] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#E27D6033] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <span>Generate One-Day Itinerary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Add More Attractions Section */}
          {unselectedPlaces.length > 0 && (
            <div className="bg-white rounded-[32px] p-5 sm:p-7 border border-[#E8E2D9] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#084C61]">
                    Add More Places to Your Trip
                  </h3>
                  <p className="text-xs text-[#7D7D7D]">
                    {unselectedPlaces.length} more locations available within 25km radius
                  </p>
                </div>
                <button
                  id="planner-view-all-explore-btn"
                  onClick={() => setActiveTab('explore')}
                  className="text-xs font-bold text-[#E27D60] hover:underline cursor-pointer"
                >
                  Explore all &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unselectedPlaces.slice(0, 6).map((place) => (
                  <div
                    key={place.id}
                    className="bg-[#F2EDE4] p-3 rounded-[24px] border border-[#E8E2D9] flex items-center justify-between gap-2 shadow-2xs hover:border-[#084C61]/30 transition"
                  >
                    <div
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                      onClick={() => setSelectedPlaceForModal(place)}
                    >
                      <img
                        src={getVerifiedPlaceImage(place)}
                        alt={place.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#E8E2D9]"
                      />
                      <div className="min-w-0">
                        <h4 className="font-heading font-bold text-xs text-[#084C61] truncate">
                          {place.name}
                        </h4>
                        <span className="text-[11px] text-[#7D7D7D] block truncate">
                          {place.category} • {place.distanceKm}km
                        </span>
                      </div>
                    </div>

                    <button
                      id={`quick-add-${place.id}`}
                      onClick={() => addToPlan(place.id)}
                      className="p-2 rounded-full bg-white border border-[#E8E2D9] text-[#E27D60] hover:bg-[#E27D60] hover:text-white transition shrink-0 shadow-xs cursor-pointer"
                      title="Add to plan"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Live Route Map & Summary (Sticky on Desktop) */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
          
          <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-[#E8E2D9] shadow-md space-y-4">
            
            {/* Header with Stops Badge and Recenter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#084C61] text-white flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[#084C61]">
                    Live Route Map & Summary
                  </h3>
                  <span className="text-[11px] text-[#7D7D7D] block">
                    Starting from Home (7.231289, 81.845351)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#E27D60]/15 text-[#E27D60] font-black text-xs">
                  {selectedPlaces.length} Stops
                </span>
                <button
                  onClick={handleRecenterMap}
                  className="p-1.5 rounded-lg border border-[#E8E2D9] text-[#7D7D7D] hover:text-[#084C61] hover:bg-[#F2EDE4] transition cursor-pointer"
                  title="Recenter Route Map"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Embedded Live Leaflet Map */}
            <div className="relative rounded-2xl overflow-hidden border border-[#E8E2D9] shadow-inner bg-[#EBF1F3]">
              <div
                ref={mapContainerRef}
                id="planner-live-route-map"
                className="w-full h-72 sm:h-80 z-0"
              />

              {/* Watermark / Origin Indicator Pill */}
              <div className="absolute bottom-2.5 left-2.5 z-1000 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E8E2D9] text-[10px] font-bold text-[#084C61] shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Home: Akkaraipattu</span>
              </div>
            </div>

            {/* Route Stats Summary Box */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-[#F8F5F0] p-3 rounded-2xl border border-[#E8E2D9] text-center">
                <span className="text-[10px] font-bold text-[#7D7D7D] uppercase tracking-wider block">
                  Total Travel
                </span>
                <span className="font-heading font-black text-lg text-[#084C61]">
                  {totalDistanceKm.toFixed(1)} km
                </span>
              </div>

              <div className="bg-[#F8F5F0] p-3 rounded-2xl border border-[#E8E2D9] text-center">
                <span className="text-[10px] font-bold text-[#7D7D7D] uppercase tracking-wider block">
                  Est. Drive Time
                </span>
                <span className="font-heading font-black text-lg text-[#E27D60]">
                  ~{estimatedDriveTimeMins} mins
                </span>
              </div>
            </div>

            {/* Leg-By-Leg Route Breakdown */}
            {legs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
                <div className="flex items-center justify-between text-xs font-bold text-[#084C61]">
                  <span>Turn-by-Turn Leg Sequence</span>
                  <span className="text-[11px] text-[#7D7D7D] font-medium">Home ➔ Destination</span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {legs.map((leg, idx) => (
                    <div
                      key={idx}
                      onMouseEnter={() => setActiveLegIndex(idx)}
                      onMouseLeave={() => setActiveLegIndex(null)}
                      className={`p-2.5 rounded-xl border text-xs transition flex items-center justify-between gap-2 ${
                        activeLegIndex === idx
                          ? 'bg-[#F2EDE4] border-[#E27D60]'
                          : 'bg-[#FAF8F5] border-[#E8E2D9]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#084C61] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {leg.stopIndex}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-[#084C61] truncate">
                            {leg.toName}
                          </p>
                          <span className="text-[10px] text-[#7D7D7D] truncate block">
                            From {idx === 0 ? 'Home Origin' : `Stop ${idx}`}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-[#E27D60] block">
                          +{leg.distanceKm.toFixed(1)} km
                        </span>
                        <span className="text-[10px] text-[#7D7D7D]">
                          ~{leg.driveMins}m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Action: Open Full Multi-Stop Route in Google Maps */}
            <div className="pt-2">
              <a
                id="open-full-google-maps-route-btn"
                href={multiStopGoogleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#084C61] hover:bg-[#063b4b] text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-[#084C61]/25 cursor-pointer text-center"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Open Full Route in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
              <p className="text-[10px] text-[#7D7D7D] text-center mt-1.5">
                Launches Google Maps with Home Origin and all intermediate stops as waypoints.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};