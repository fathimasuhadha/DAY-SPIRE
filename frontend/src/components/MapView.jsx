import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Compass,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Search,
  SlidersHorizontal,
  LocateFixed,
  Heart,
  Star,
  Trees,
  Landmark,
  Utensils,
  ShoppingBag,
  Waves,
  CalendarDays,
  X,
  ChevronRight,
  Check,
  CircleDollarSign,
  Users,
  Eye,
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { AKKARAIPATTU_CENTER } from '../data/initialPlaces';
import { getGoogleMapsDirectionsUrl } from '../utils/navigation';
import { getVerifiedPlaceImage } from '../utils/placeImages';

const FAVORITES_STORAGE_KEY = 'dayspire_favorite_places_v1';

// Category color definitions matching archetype design
const CATEGORY_COLORS = {
  'Coastal/Nature': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-700', pinHex: '#059669' },
  'Religious': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-700', pinHex: '#7E22CE' },
  'Heritage': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-700', pinHex: '#D97706' },
  'Educational': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-700', pinHex: '#2563EB' },
  'Recreation': { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-700', pinHex: '#E11D48' },
  'Dining': { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-700', pinHex: '#E27D60' },
  'Shopping': { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-700', pinHex: '#084C61' },
};

export const MapView = () => {
  const {
    activePlaces,
    selectedPlaceIds,
    setSelectedPlaceForModal,
    setActiveTab,
    mapFallbackMode,
    setMapFallbackMode,
    showToast,
  } = usePlanner();

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersLayerGroupRef = useRef(null);
  const userLocationMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const placeMarkersMapRef = useRef(new Map());

  // Filter States
  const [selectedPlaceOnMap, setSelectedPlaceOnMap] = useState(null);
  const [mapLayerType, setMapLayerType] = useState('map');
  const [viewFilterMode, setViewFilterMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([
    'Coastal/Nature',
    'Religious',
    'Educational',
    'Recreation',
    'Dining',
    'Shopping',
  ]);
  const [maxDistance, setMaxDistance] = useState(25);
  const [feeFilter, setFeeFilter] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [familyOnly, setFamilyOnly] = useState(false);
  
  // Drawer / Popover State
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['place-1', 'place-4'];
    } catch {
      return ['place-1', 'place-4'];
    }
  });

  // Save favorites
  const toggleFavorite = (placeId) => {
    setFavorites((prev) => {
      const isFav = prev.includes(placeId);
      const updated = isFav ? prev.filter((id) => id !== placeId) : [...prev, placeId];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      showToast(isFav ? 'Removed from favorites' : 'Added to favorites!', isFav ? 'info' : 'success');
      return updated;
    });
  };

  // Toggle single category filter
  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const allCategoryList = [
    'Coastal/Nature',
    'Religious',
    'Educational',
    'Recreation',
    'Dining',
    'Shopping',
  ];

  // Count how many non-default filters are active
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length < allCategoryList.length) count++;
    if (maxDistance < 25) count++;
    if (feeFilter !== 'all') count++;
    if (minRating > 0) count++;
    if (familyOnly) count++;
    if (viewFilterMode !== 'all') count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [selectedCategories, maxDistance, feeFilter, minRating, familyOnly, viewFilterMode, searchQuery]);

  // Reset all filters
  const resetAllFilters = () => {
    setSelectedCategories(allCategoryList);
    setMaxDistance(25);
    setFeeFilter('all');
    setMinRating(0);
    setFamilyOnly(false);
    setViewFilterMode('all');
    setSearchQuery('');
    showToast('All filters have been reset.', 'info');
  };

  // Filtered places based on all active criteria
  const filteredPlaces = useMemo(() => {
    return activePlaces.filter((place) => {
      // View Mode check
      if (viewFilterMode === 'mytrip' && !selectedPlaceIds.includes(place.id)) {
        return false;
      }
      if (viewFilterMode === 'favorites' && !favorites.includes(place.id)) {
        return false;
      }

      // Category check
      if (selectedCategories.length > 0 && !selectedCategories.includes(place.category)) {
        return false;
      }

      // Max Distance check from Home (7.231289, 81.845351)
      if (place.distanceKm > maxDistance) {
        return false;
      }

      // Fee check
      if (feeFilter === 'free' && !place.entryFee.isFree) {
        return false;
      }
      if (feeFilter === 'paid' && place.entryFee.isFree) {
        return false;
      }

      // Minimum Rating check
      if (minRating > 0 && (place.rating || 4.5) < minRating) {
        return false;
      }

      // Family Friendly check
      if (familyOnly && !place.familySuitability?.isFamilyFriendly) {
        return false;
      }

      // Search Query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = place.name.toLowerCase().includes(q);
        const matchCat = place.category.toLowerCase().includes(q);
        const matchDesc = place.description.toLowerCase().includes(q);
        const matchAddr = place.address?.toLowerCase().includes(q) || false;
        return matchName || matchCat || matchDesc || matchAddr;
      }

      return true;
    });
  }, [
    activePlaces,
    viewFilterMode,
    selectedPlaceIds,
    favorites,
    selectedCategories,
    maxDistance,
    feeFilter,
    minRating,
    familyOnly,
    searchQuery,
  ]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapFallbackMode || !mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [AKKARAIPATTU_CENTER.lat, AKKARAIPATTU_CENTER.lng],
        zoom: 11,
        zoomControl: false,
      });

      // Map tile layers
      const tileLayers = {
        map: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap contributors',
        }),
        satellite: L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 18,
            attribution: '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
          }
        ),
        terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          maxZoom: 17,
          attribution: '&copy; OpenTopoMap contributors',
        }),
      };

      tileLayers[mapLayerType].addTo(map);

      // 25 km boundary circle centered on User's Home Origin (7.231289, 81.845351)
      L.circle([AKKARAIPATTU_CENTER.lat, AKKARAIPATTU_CENTER.lng], {
        radius: AKKARAIPATTU_CENTER.radiusKm * 1000,
        color: '#E27D60',
        fillColor: '#E27D60',
        fillOpacity: 0.04,
        weight: 2,
        dashArray: '6, 6',
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 3px;">
            <b style="color: #084C61;">25 km Tour Study Perimeter</b><br/>
            <span style="font-size: 11px; color: #666;">Radius from Home Origin (7.231289, 81.845351)</span>
          </div>
        `);

      // Home / Origin Reference Marker (7.231289, 81.845351)
      const homeCenterIcon = L.divIcon({
        className: 'custom-center-pin',
        html: `
          <div style="
            background-color: #084C61;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(8,76,97,0.45);
            border: 3px solid #FFF;
            font-size: 16px;
            cursor: pointer;
          ">🏠</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([AKKARAIPATTU_CENTER.lat, AKKARAIPATTU_CENTER.lng], { icon: homeCenterIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px;">
            <div style="font-weight: bold; color: #084C61; font-size: 13px;">🏠 My Location (Home Base)</div>
            <div style="font-size: 11px; color: #E27D60; font-weight: 600; margin-top: 2px;">7.231289, 81.845351</div>
            <div style="font-size: 11px; color: #666; margin-top: 3px;">Starting origin for all 25 km day-tour places.</div>
          </div>
        `);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = markersGroup;
      leafletMapRef.current = map;
    } catch (err) {
      console.warn('Leaflet map initialization notice:', err);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapFallbackMode, mapLayerType]);

  // Update Markers and Polyline when filteredPlaces or selectedPlaceIds change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !markersLayerGroupRef.current) return;

    markersLayerGroupRef.current.clearLayers();
    placeMarkersMapRef.current.clear();

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    // Render Attraction Markers
    filteredPlaces.forEach((place) => {
      const isPlanStop = selectedPlaceIds.includes(place.id);
      const planIndex = selectedPlaceIds.indexOf(place.id);
      const catConfig = CATEGORY_COLORS[place.category] || { pinHex: '#084C61' };
      const pinColor = isPlanStop ? '#E27D60' : catConfig.pinHex;

      const markerHtml = `
        <div style="
          position: relative;
          background-color: ${pinColor};
          color: white;
          width: ${isPlanStop ? '36px' : '32px'};
          height: ${isPlanStop ? '36px' : '32px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          border: ${isPlanStop ? '3px solid #FFF' : '2px solid #FFF'};
          font-weight: bold;
          font-size: ${isPlanStop ? '13px' : '11px'};
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          ${isPlanStop ? `<span>${planIndex + 1}</span>` : '📍'}
          ${isPlanStop ? `<span style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; background-color: #22c55e; border-radius: 50%; border: 1.5px solid white;"></span>` : ''}
        </div>
      `;

      const placeIcon = L.divIcon({
        className: 'custom-place-pin',
        html: markerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([place.coordinates.lat, place.coordinates.lng], { icon: placeIcon });
      
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 170px;">
          <div style="font-weight: bold; color: #084C61; font-size: 13px; margin-bottom: 2px;">${place.name}</div>
          <div style="font-size: 11px; color: #E27D60; font-weight: 600;">${place.category} • ${place.distanceKm} km (${place.direction})</div>
          <div style="font-size: 11px; color: #555; margin-top: 3px;">${place.entryFee.displayText}</div>
          <div style="margin-top: 6px; display: flex; gap: 4px;">
            <a href="${getGoogleMapsDirectionsUrl(place)}" target="_blank" rel="noopener noreferrer" style="font-size: 10px; color: #084C61; font-weight: bold; text-decoration: underline;">Open Directions ↗</a>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedPlaceOnMap(place);
      });

      markersLayerGroupRef.current?.addLayer(marker);
      placeMarkersMapRef.current.set(place.id, marker);
    });

    // Add Route Polyline if in "My Trip" mode or if plan places exist
    if (selectedPlaceIds.length > 0) {
      const planCoordinates = [
        [AKKARAIPATTU_CENTER.lat, AKKARAIPATTU_CENTER.lng],
        ...selectedPlaceIds
          .map((id) => activePlaces.find((p) => p.id === id))
          .filter((p) => p !== undefined)
          .map((p) => [p.coordinates.lat, p.coordinates.lng]),
      ];

      if (planCoordinates.length > 1) {
        const polyline = L.polyline(planCoordinates, {
          color: '#E27D60',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '6, 8',
        }).addTo(map);
        routePolylineRef.current = polyline;
      }
    }
  }, [filteredPlaces, selectedPlaceIds, activePlaces]);

  // Handle "My Locations" / "My Current Location"
  const handleLocateMe = () => {
    setIsLocating(true);
    const homeLat = AKKARAIPATTU_CENTER.lat; // 7.231289
    const homeLng = AKKARAIPATTU_CENTER.lng; // 81.845351

    const map = leafletMapRef.current;
    if (map) {
      map.flyTo([homeLat, homeLng], 14, { duration: 1.2 });

      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
      }

      const userGpsIcon = L.divIcon({
        className: 'custom-home-location-gps-pin',
        html: `
          <div style="position: relative; width: 34px; height: 34px;">
            <div style="position: absolute; width: 34px; height: 34px; background: rgba(8, 76, 97, 0.25); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; top: 3px; left: 3px; width: 28px; height: 28px; background-color: #084C61; border: 2.5px solid #FFF; border-radius: 50%; box-shadow: 0 3px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">🏠</div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([homeLat, homeLng], { icon: userGpsIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px;">
            <div style="font-weight: bold; color: #084C61; font-size: 13px;">🏠 My Location (Home Base)</div>
            <div style="font-size: 11px; color: #E27D60; font-weight: 600; margin-top: 2px;">7.231289, 81.845351</div>
            <div style="font-size: 11px; color: #666; margin-top: 3px;">Akkaraipattu Home Starting Point (25 km Radius Zone)</div>
          </div>
        `)
        .openPopup();

      userLocationMarkerRef.current = marker;
    }

    setTimeout(() => {
      setIsLocating(false);
      showToast('Centered to your Home Location (7.231289, 81.845351)!', 'success');
    }, 400);
  };

  const handleResetView = () => {
    const map = leafletMapRef.current;
    if (map) {
      map.flyTo([AKKARAIPATTU_CENTER.lat, AKKARAIPATTU_CENTER.lng], 11, { duration: 1.2 });
      showToast('Map centered to Akkaraipattu 25km Zone (7.231289, 81.845351).', 'info');
    }
  };

  const handleZoomIn = () => {
    leafletMapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    leafletMapRef.current?.zoomOut();
  };

  const handleSelectPlace = (place) => {
    setSelectedPlaceOnMap(place);
    const map = leafletMapRef.current;
    if (map) {
      map.flyTo([place.coordinates.lat, place.coordinates.lng], 13, { duration: 1.2 });
      const targetMarker = placeMarkersMapRef.current.get(place.id);
      if (targetMarker) {
        targetMarker.openPopup();
      }
    }
  };

  const categoryItems = [
    { id: 'Coastal/Nature', label: 'Nature & Coastal', icon: <Trees className="w-4 h-4 text-emerald-600" /> },
    { id: 'Religious', label: 'Religious & Sacred', icon: <Landmark className="w-4 h-4 text-purple-600" /> },
    { id: 'Educational', label: 'Heritage & Culture', icon: <Landmark className="w-4 h-4 text-blue-600" /> },
    { id: 'Recreation', label: 'Recreation & Parks', icon: <Waves className="w-4 h-4 text-rose-600" /> },
    { id: 'Dining', label: 'Food & Dining', icon: <Utensils className="w-4 h-4 text-orange-600" /> },
    { id: 'Shopping', label: 'Shopping & Bazaars', icon: <ShoppingBag className="w-4 h-4 text-teal-600" /> },
  ];

  return (
    <div id="map-view" className="space-y-5 pb-12">
      
      {/* Top Exploration Header Bar */}
      <div className="bg-white rounded-[28px] p-4 sm:p-5 border border-[#E8E2D9] shadow-xs flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          <div>
            <h1 className="font-heading font-black text-xl sm:text-2xl text-[#084C61] tracking-tight">
              Explore Akkaraipattu on Map
            </h1>
            <p className="text-xs text-[#7D7D7D] mt-0.5">
              25 km radius tour guide from Home Location (7.231289, 81.845351).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            
            <div className="relative flex-1 sm:w-72 min-w-[200px]">
              <Search className="w-4 h-4 text-[#7D7D7D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="map-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places, attractions, activities..."
                className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-[#084C61] placeholder:text-[#9E9E9E] focus:outline-hidden focus:border-[#084C61] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9E9E9E] hover:text-[#084C61]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              id="map-filters-btn"
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition shadow-xs cursor-pointer ${
                showFiltersDrawer || activeFiltersCount > 0
                  ? 'bg-[#084C61] text-white border-[#084C61]'
                  : 'bg-white text-[#084C61] border-[#E8E2D9] hover:bg-[#F2EDE4]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#E27D60] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              id="map-my-locations-btn"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#084C61] hover:bg-[#063b4b] text-white text-xs sm:text-sm font-bold tracking-wide shadow-md shadow-[#084C61]/20 transition disabled:opacity-50 cursor-pointer"
            >
              <LocateFixed className={`w-4 h-4 text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'My Locations'}</span>
            </button>

            <button
              id="toggle-map-fallback-btn"
              onClick={() => setMapFallbackMode(!mapFallbackMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold shadow-xs transition cursor-pointer ${
                mapFallbackMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white text-[#7D7D7D] border-[#E8E2D9] hover:bg-[#F2EDE4]'
              }`}
              title="Toggle fallback mode for network interruption"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{mapFallbackMode ? 'Disable Fallback' : 'Offline Mode'}</span>
            </button>

          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="pt-2 border-t border-[#E8E2D9] flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-[#7D7D7D]">Active Filters:</span>
            
            {viewFilterMode !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-[#084C61]/10 text-[#084C61] px-2.5 py-1 rounded-lg font-semibold">
                {viewFilterMode === 'mytrip' ? '🎒 My Trip' : '❤️ Favorites'}
                <button onClick={() => setViewFilterMode('all')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}

            {selectedCategories.length < allCategoryList.length && (
              <span className="inline-flex items-center gap-1 bg-[#084C61]/10 text-[#084C61] px-2.5 py-1 rounded-lg font-semibold">
                {selectedCategories.length} Categories
                <button onClick={() => setSelectedCategories(allCategoryList)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}

            {maxDistance < 25 && (
              <span className="inline-flex items-center gap-1 bg-[#084C61]/10 text-[#084C61] px-2.5 py-1 rounded-lg font-semibold">
                ≤ {maxDistance} km
                <button onClick={() => setMaxDistance(25)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}

            {feeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-[#084C61]/10 text-[#084C61] px-2.5 py-1 rounded-lg font-semibold">
                {feeFilter === 'free' ? 'Free Entry Only' : 'Paid Entry Only'}
                <button onClick={() => setFeeFilter('all')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}

            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 bg-[#084C61]/10 text-[#084C61] px-2.5 py-1 rounded-lg font-semibold">
                ★ {minRating}+
                <button onClick={() => setMinRating(0)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}

            {familyOnly && (
              <span className="inline-flex items-center gap-1 bg-[#084C61]/10 text-[#084C61] px-2.5 py-1 rounded-lg font-semibold">
                Family Friendly
                <button onClick={() => setFamilyOnly(false)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}

            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 bg-[#084C61]/10 text-[#084C61] px-2.5 py-1 rounded-lg font-semibold">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}

            <button
              onClick={resetAllFilters}
              className="text-[11px] font-bold text-[#E27D60] hover:underline ml-auto"
            >
              Reset All
            </button>
          </div>
        )}

      </div>

      {/* Expandable Interactive Filters Panel / Drawer */}
      {showFiltersDrawer && (
        <div id="map-filters-drawer" className="bg-white rounded-[28px] p-6 border-2 border-[#084C61]/30 shadow-lg space-y-5 animate-in fade-in slide-in-from-top-4 duration-200">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#084C61] text-white flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[#084C61]">
                  Map Filters & Discovery Preferences
                </h3>
                <p className="text-xs text-[#7D7D7D]">
                  Customise which attractions and places appear on the 25km radius map.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetAllFilters}
                className="text-xs font-bold text-[#E27D60] hover:underline px-2 py-1"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFiltersDrawer(false)}
                className="w-8 h-8 rounded-full bg-[#F2EDE4] hover:bg-[#E8E2D9] text-[#084C61] flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Category Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#084C61] uppercase tracking-wider">
                  Attraction Category
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedCategories.length === allCategoryList.length) {
                      setSelectedCategories([]);
                    } else {
                      setSelectedCategories(allCategoryList);
                    }
                  }}
                  className="text-[10px] font-bold text-[#084C61] hover:underline"
                >
                  {selectedCategories.length === allCategoryList.length ? 'Clear All' : 'Select All'}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-1.5">
                {categoryItems.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                        isChecked
                          ? 'bg-[#084C61] text-white border-[#084C61]'
                          : 'bg-[#F8F5F0] text-[#084C61] border-[#E8E2D9] hover:bg-[#F2EDE4]'
                      }`}
                    >
                      <span className="shrink-0">{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Maximum Distance from Home */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#084C61] uppercase tracking-wider">
                  Max Distance from Home
                </label>
                <span className="text-xs font-bold text-[#E27D60] font-mono">
                  ≤ {maxDistance} km
                </span>
              </div>

              <input
                type="range"
                min="3"
                max="25"
                step="1"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full h-2 bg-[#E8E2D9] rounded-lg appearance-none cursor-pointer accent-[#084C61]"
              />

              <div className="flex justify-between gap-1 pt-1">
                {[5, 10, 15, 20, 25].map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => setMaxDistance(dist)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                      maxDistance === dist
                        ? 'bg-[#084C61] text-white border-[#084C61]'
                        : 'bg-[#F8F5F0] text-[#7D7D7D] border-[#E8E2D9] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    {dist}km
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Pricing & Entry Fee */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-[#084C61] uppercase tracking-wider block">
                Admission / Entry Fee
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFeeFilter('all')}
                  className={`py-2 rounded-xl text-xs font-bold border text-center transition ${
                    feeFilter === 'all'
                      ? 'bg-[#084C61] text-white border-[#084C61]'
                      : 'bg-[#F8F5F0] text-[#7D7D7D] border-[#E8E2D9] hover:bg-[#F2EDE4]'
                  }`}
                >
                  All Places
                </button>
                <button
                  type="button"
                  onClick={() => setFeeFilter('free')}
                  className={`py-2 rounded-xl text-xs font-bold border text-center transition ${
                    feeFilter === 'free'
                      ? 'bg-[#084C61] text-white border-[#084C61]'
                      : 'bg-[#F8F5F0] text-[#7D7D7D] border-[#E8E2D9] hover:bg-[#F2EDE4]'
                  }`}
                >
                  Free Entry
                </button>
                <button
                  type="button"
                  onClick={() => setFeeFilter('paid')}
                  className={`py-2 rounded-xl text-xs font-bold border text-center transition ${
                    feeFilter === 'paid'
                      ? 'bg-[#084C61] text-white border-[#084C61]'
                      : 'bg-[#F8F5F0] text-[#7D7D7D] border-[#E8E2D9] hover:bg-[#F2EDE4]'
                  }`}
                >
                  Ticket / Paid
                </button>
              </div>

              {/* Family Friendly Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8F5F0] border border-[#E8E2D9] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={familyOnly}
                    onChange={(e) => setFamilyOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#084C61] focus:ring-0 accent-[#084C61] cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#084C61]" />
                    <span className="text-xs font-semibold text-[#084C61]">Family & Kids Friendly Only</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 4. Rating & View Mode */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-[#084C61] uppercase tracking-wider block">
                Minimum Rating
              </label>

              <div className="flex gap-1.5">
                {[
                  { value: 0, label: 'Any' },
                  { value: 4.0, label: '★ 4.0+' },
                  { value: 4.5, label: '★ 4.5+' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMinRating(item.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border text-center transition ${
                      minRating === item.value
                        ? 'bg-[#084C61] text-white border-[#084C61]'
                        : 'bg-[#F8F5F0] text-[#7D7D7D] border-[#E8E2D9] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* View mode shortcut */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider block mb-1.5">
                  Saved / Trip Focus
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewFilterMode(viewFilterMode === 'favorites' ? 'all' : 'favorites')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition ${
                      viewFilterMode === 'favorites'
                        ? 'bg-[#E27D60] text-white border-[#E27D60]'
                        : 'bg-[#F8F5F0] text-[#7D7D7D] border-[#E8E2D9] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>Favorites ({favorites.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewFilterMode(viewFilterMode === 'mytrip' ? 'all' : 'mytrip')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition ${
                      viewFilterMode === 'mytrip'
                        ? 'bg-[#084C61] text-white border-[#084C61]'
                        : 'bg-[#F8F5F0] text-[#7D7D7D] border-[#E8E2D9] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>My Trip ({selectedPlaceIds.length})</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Action Bar inside Filter Drawer */}
          <div className="pt-3 border-t border-[#E8E2D9] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#084C61]">
              Showing <span className="text-[#E27D60] font-black text-sm">{filteredPlaces.length}</span> of {activePlaces.length} attractions matching your filters
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#7D7D7D] hover:bg-[#F2EDE4] transition"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFiltersDrawer(false);
                  showToast(`Applied filters: Showing ${filteredPlaces.length} places on map.`, 'success');
                }}
                className="px-6 py-2 rounded-xl bg-[#084C61] hover:bg-[#063b4b] text-white text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply Filters ({filteredPlaces.length} Places)</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Main 3-Column Interactive Map Experience */}
      {mapFallbackMode ? (
        <div id="map-fallback-view" className="bg-white rounded-[32px] p-6 sm:p-8 border border-amber-200 shadow-sm">
          <div className="flex items-start gap-4 p-4 rounded-[24px] bg-amber-50 border border-amber-200 mb-6 text-amber-900">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Map temporarily unavailable — showing saved details.
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 mt-1">
                Offline or network map failures do not block access to locally stored attraction coordinates and directions from Home Location (7.231289, 81.845351).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePlaces.map((place) => (
              <div
                key={place.id}
                className="bg-[#F2EDE4] p-4 rounded-[24px] border border-[#E8E2D9] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#E27D60] mb-1">
                    <span>{place.category}</span>
                    <span>{place.distanceKm} km ({place.direction})</span>
                  </div>
                  <h4 className="font-heading font-bold text-base text-[#084C61]">
                    {place.name}
                  </h4>
                  <p className="text-xs text-[#4A4A4A] mt-1 line-clamp-2">
                    {place.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E2D9] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#084C61]">{place.entryFee.displayText}</span>
                  <a
                    href={getGoogleMapsDirectionsUrl(place)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold uppercase tracking-wider text-[#E27D60] hover:underline flex items-center gap-1"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-3 space-y-4">
            
            <div className="bg-white rounded-[28px] p-5 border border-[#E8E2D9] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-[#084C61]">
                  View on Map
                </h3>
                {selectedCategories.length < categoryItems.length && (
                  <button
                    onClick={() => setSelectedCategories(categoryItems.map((c) => c.id))}
                    className="text-[11px] font-bold text-[#E27D60] hover:underline"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* View on Map Toggle Tabs */}
              <div className="grid grid-cols-2 p-1 bg-[#F8F5F0] rounded-2xl border border-[#E8E2D9]">
                <button
                  id="view-all-places-tab"
                  onClick={() => setViewFilterMode('all')}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    viewFilterMode === 'all'
                      ? 'bg-[#084C61] text-white shadow-xs'
                      : 'text-[#7D7D7D] hover:text-[#084C61]'
                  }`}
                >
                  <span>All Places</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                    {activePlaces.length}
                  </span>
                </button>
                <button
                  id="view-my-trip-tab"
                  onClick={() => setViewFilterMode('mytrip')}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    viewFilterMode === 'mytrip'
                      ? 'bg-[#084C61] text-white shadow-xs'
                      : 'text-[#7D7D7D] hover:text-[#084C61]'
                  }`}
                >
                  <span>My Trip</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E27D60] text-white font-bold">
                    {selectedPlaceIds.length}
                  </span>
                </button>
              </div>

              {/* Category Checkboxes List */}
              <div className="space-y-1.5 pt-1">
                {categoryItems.map((cat) => {
                  const count = activePlaces.filter((p) => p.category === cat.id).length;
                  const isChecked = selectedCategories.includes(cat.id);

                  return (
                    <label
                      key={cat.id}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition select-none ${
                        isChecked ? 'bg-[#F8F5F0] hover:bg-[#F2EDE4]' : 'hover:bg-slate-50 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(cat.id)}
                          className="w-4 h-4 rounded-md text-[#084C61] focus:ring-0 cursor-pointer accent-[#084C61]"
                        />
                        <div className="flex items-center gap-2">
                          {cat.icon}
                          <span className="text-xs font-semibold text-[#084C61]">
                            {cat.label}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#7D7D7D] bg-white px-2 py-0.5 rounded-lg border border-[#E8E2D9]">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>

            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-[28px] p-5 border border-[#E8E2D9] shadow-xs space-y-3">
              <h3 className="font-heading font-bold text-base text-[#084C61]">
                Quick Actions
              </h3>
              
              <div className="space-y-2">
                <button
                  id="qa-my-location-btn"
                  onClick={handleLocateMe}
                  className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[#F8F5F0] hover:bg-[#F2EDE4] border border-[#E8E2D9] text-left transition group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#084C61] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <LocateFixed className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#084C61] block group-hover:underline">
                      My Current Location
                    </span>
                    <span className="text-[10px] text-[#7D7D7D] block font-mono">
                      7.231289, 81.845351 (Home Base)
                    </span>
                  </div>
                </button>

                <button
                  id="qa-nearby-places-btn"
                  onClick={() => {
                    resetAllFilters();
                    handleResetView();
                    showToast('Showing all places within 25km radius!', 'info');
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[#F8F5F0] hover:bg-[#F2EDE4] border border-[#E8E2D9] text-left transition group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#E27D60] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Compass className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#084C61] block group-hover:underline">
                      Nearby Places
                    </span>
                    <span className="text-[10px] text-[#7D7D7D] block">
                      Within 25km radius
                    </span>
                  </div>
                </button>

                <button
                  id="qa-save-view-btn"
                  onClick={handleResetView}
                  className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[#F8F5F0] hover:bg-[#F2EDE4] border border-[#E8E2D9] text-left transition group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#084C61]/10 text-[#084C61] flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#084C61] block group-hover:underline">
                      Reset Map View
                    </span>
                    <span className="text-[10px] text-[#7D7D7D] block">
                      Center to Home Origin
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Plan Your Perfect Trip Card */}
            <div className="bg-gradient-to-br from-[#084C61] to-[#042833] rounded-[28px] p-5 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFB703]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
                    One-Day Assistant
                  </span>
                </div>
                <h4 className="font-heading font-bold text-base leading-snug">
                  Plan Your Perfect Trip
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Add places to your planner and create your optimized one-day Akkaraipattu adventure!
                </p>
                <button
                  id="sidebar-go-to-planner-btn"
                  onClick={() => setActiveTab('planner')}
                  className="mt-2 w-full py-2.5 rounded-xl bg-[#E27D60] hover:bg-[#cf6347] text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-[#E27D60]/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Go to Planner</span>
                </button>
              </div>
            </div>

          </div>

          {/* CENTER MAP CONTAINER */}
          <div className="lg:col-span-6 relative rounded-[32px] overflow-hidden border border-[#E8E2D9] shadow-md bg-slate-100 h-[640px] flex flex-col">
            
            {/* Top Map Layer Pill */}
            <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-[#E8E2D9] shadow-md flex items-center gap-1">
              <button
                onClick={() => setMapLayerType('map')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  mapLayerType === 'map'
                    ? 'bg-[#084C61] text-white shadow-xs'
                    : 'text-[#7D7D7D] hover:text-[#084C61]'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setMapLayerType('satellite')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  mapLayerType === 'satellite'
                    ? 'bg-[#084C61] text-white shadow-xs'
                    : 'text-[#7D7D7D] hover:text-[#084C61]'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setMapLayerType('terrain')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  mapLayerType === 'terrain'
                    ? 'bg-[#084C61] text-white shadow-xs'
                    : 'text-[#7D7D7D] hover:text-[#084C61]'
                }`}
              >
                Terrain
              </button>
            </div>

            {/* Floating Controls */}
            <div className="absolute right-4 bottom-8 z-20 flex flex-col gap-2">
              <button
                onClick={handleLocateMe}
                title="Locate Home Position (7.231289, 81.845351)"
                className="w-10 h-10 rounded-2xl bg-white hover:bg-[#F2EDE4] border border-[#E8E2D9] text-[#084C61] flex items-center justify-center shadow-md transition cursor-pointer"
              >
                <LocateFixed className="w-4 h-4 text-[#084C61]" />
              </button>
              <button
                onClick={handleZoomIn}
                title="Zoom in"
                className="w-10 h-10 rounded-2xl bg-white hover:bg-[#F2EDE4] border border-[#E8E2D9] text-[#084C61] font-bold text-lg flex items-center justify-center shadow-md transition cursor-pointer"
              >
                +
              </button>
              <button
                onClick={handleZoomOut}
                title="Zoom out"
                className="w-10 h-10 rounded-2xl bg-white hover:bg-[#F2EDE4] border border-[#E8E2D9] text-[#084C61] font-bold text-lg flex items-center justify-center shadow-md transition cursor-pointer"
              >
                -
              </button>
            </div>

            {/* Scale & Zone Indicator */}
            <div className="absolute left-4 bottom-4 z-20 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-[11px] font-bold text-[#084C61] shadow-xs flex items-center gap-1.5">
              <span>🏠 Origin: 7.231289, 81.845351</span>
              <span className="text-[#7D7D7D]">|</span>
              <span className="text-[#E27D60]">25 km Radius</span>
            </div>

            <div ref={mapContainerRef} className="w-full h-full z-10" />

          </div>

          {/* RIGHT SIDEBAR: Popular Places Near You List with Verified Images */}
          <div className="lg:col-span-3 space-y-4">
            
            <div className="bg-white rounded-[28px] p-5 border border-[#E8E2D9] shadow-xs flex flex-col max-h-[640px]">
              
              <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-[#E8E2D9]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E27D60]" />
                  <h3 className="font-heading font-bold text-base text-[#084C61]">
                    Popular Places Near You
                  </h3>
                </div>
                <span className="text-xs text-[#7D7D7D] font-bold">
                  {filteredPlaces.length}
                </span>
              </div>

              <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
                {filteredPlaces.length === 0 ? (
                  <div className="text-center py-12 px-2 text-[#7D7D7D] space-y-2">
                    <p className="text-xs font-semibold">No places matched your active filters.</p>
                    <button
                      onClick={resetAllFilters}
                      className="text-xs font-bold text-[#E27D60] underline cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  filteredPlaces.map((place) => {
                    const isFav = favorites.includes(place.id);
                    const isSelected = selectedPlaceOnMap?.id === place.id;
                    const inPlan = selectedPlaceIds.includes(place.id);

                    return (
                      <div
                        key={place.id}
                        onClick={() => handleSelectPlace(place)}
                        className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 group ${
                          isSelected
                            ? 'bg-[#F2EDE4] border-[#084C61] shadow-2xs'
                            : 'bg-white hover:bg-[#F8F5F0] border-[#E8E2D9]'
                        }`}
                      >
                        {/* Thumbnail Image with Verified Local Photo */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                          <img
                            src={getVerifiedPlaceImage(place)}
                            alt={place.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          {inPlan && (
                            <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#E27D60] text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                              ✓
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-[#084C61] truncate group-hover:underline">
                              {place.name}
                            </h4>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(place.id);
                              }}
                              className="text-[#7D7D7D] hover:text-[#E27D60] transition shrink-0"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  isFav ? 'fill-[#E27D60] text-[#E27D60]' : 'text-[#7D7D7D]'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="text-[11px] text-[#7D7D7D] mt-0.5 flex items-center gap-1.5">
                            <span>{place.category}</span>
                          </div>

                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#E8E2D9]/60">
                            <span className="text-[10px] font-bold text-[#E27D60]">
                              {place.distanceKm} km away
                            </span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{place.rating || 4.7}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Button: View All Places */}
              <div className="pt-3 mt-2 border-t border-[#E8E2D9]">
                <button
                  id="map-view-all-places-btn"
                  onClick={() => setActiveTab('explore')}
                  className="w-full py-2 rounded-xl bg-[#F8F5F0] hover:bg-[#F2EDE4] border border-[#E8E2D9] text-[#084C61] text-xs font-bold uppercase tracking-wider transition text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View All Places</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};