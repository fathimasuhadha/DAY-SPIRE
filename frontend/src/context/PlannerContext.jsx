import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PLACES, AKKARAIPATTU_CENTER } from '../data/initialPlaces';
import { getVerifiedPlaceImage } from '../utils/placeImages';

const PlannerContext = createContext(undefined);

const PLACES_STORAGE_KEY = 'dayspire_places_v33_proposal_verified';
const PLAN_STORAGE_KEY = 'dayspire_plan_ids_v1';
const ADMIN_AUTH_KEY = 'dayspire_admin_auth_v1';
const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'https://day-spire-backend.vercel.app/api
  : '/api';

export const PlannerProvider = ({ children }) => {
  // Places state with verified authentic local images
  const [places, setPlaces] = useState(() => {
    try {
      const saved = localStorage.getItem(PLACES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p) => ({
            ...p,
            image: getVerifiedPlaceImage(p),
          }));
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_PLACES.map((p) => ({
      ...p,
      image: getVerifiedPlaceImage(p),
    }));
  });

  // Selected places for plan
  const [selectedPlaceIds, setSelectedPlaceIds] = useState(() => {
    try {
      const saved = localStorage.getItem(PLAN_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return ['place-1', 'place-5', 'place-7'];
  });

  const [activeTab, setActiveTab] = useState('home');
  const [selectedPlaceForModal, setSelectedPlaceForModal] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxDistanceKm, setMaxDistanceKm] = useState(25);
  const [filterFamilyOnly, setFilterFamilyOnly] = useState(false);
  const [filterFreeOnly, setFilterFreeOnly] = useState(false);
  
  // UI states
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);
  const [mapFallbackMode, setMapFallbackMode] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Admin Auth
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Sync with Backend API on mount
  useEffect(() => {
    const fetchPlacesFromBackend = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/places?all=true`);
        if (response.ok) {
          const backendPlaces = await response.json();
          if (Array.isArray(backendPlaces) && backendPlaces.length > 0) {
            const sanitized = backendPlaces.map((p) => ({
              ...p,
              image: getVerifiedPlaceImage(p),
            }));
            setPlaces(sanitized);
            console.log(`✅ Loaded ${sanitized.length} places from MongoDB Backend API with verified local images`);
          }
        }
      } catch (err) {
        console.log('ℹ️ Running in local cache mode with verified dataset.');
      }
    };
    fetchPlacesFromBackend();
  }, []);

  // Persist places to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(places));
    } catch (e) {
      console.error('Failed to save places to localStorage', e);
    }
  }, [places]);

  // Persist plan
  useEffect(() => {
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(selectedPlaceIds));
    } catch (e) {
      console.error('Failed to save plan to localStorage', e);
    }
  }, [selectedPlaceIds]);

  const showToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const activePlaces = places.filter((p) => p.isActive);

  // Plan functions
  const addToPlan = (placeId) => {
    if (selectedPlaceIds.includes(placeId)) {
      showToast('Place is already in your day plan!', 'info');
      return;
    }
    const place = places.find((p) => p.id === placeId);
    setSelectedPlaceIds((prev) => [...prev, placeId]);
    showToast(`Added "${place?.name || 'Place'}" to your Day Plan!`, 'success');
  };

  const removeFromPlan = (placeId) => {
    const place = places.find((p) => p.id === placeId);
    setSelectedPlaceIds((prev) => prev.filter((id) => id !== placeId));
    showToast(`Removed "${place?.name || 'Place'}" from your plan.`, 'info');
  };

  const reorderPlan = (startIndex, endIndex) => {
    if (startIndex < 0 || startIndex >= selectedPlaceIds.length || endIndex < 0 || endIndex >= selectedPlaceIds.length) {
      return;
    }
    const result = Array.from(selectedPlaceIds);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setSelectedPlaceIds(result);
  };

  const clearPlan = () => {
    setSelectedPlaceIds([]);
    setGeneratedPlan(null);
    showToast('Cleared your Day Plan.', 'info');
  };

  const loadPresetPlan = (placeIds) => {
    setSelectedPlaceIds(placeIds);
    setActiveTab('planner');
    showToast('Loaded preset itinerary into Day Planner!', 'success');
  };

  // Distance helper
  const calcDistance = (lat1, lon1, lat2, lon2) => {
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

  const optimizeRouteSequence = () => {
    if (selectedPlaceIds.length <= 1) {
      showToast('Add at least 2 places to optimize sequence.', 'info');
      return;
    }

    const currentPlaces = selectedPlaceIds
      .map((id) => places.find((p) => p.id === id))
      .filter((p) => p !== undefined && p.isActive);

    const unvisited = [...currentPlaces];
    const ordered = [];

    const sunriseIdx = unvisited.findIndex(
      (p) => p.name.toLowerCase().includes('beach') || p.name.toLowerCase().includes('sunrise')
    );
    let currentPoint = { lat: AKKARAIPATTU_CENTER.lat, lng: AKKARAIPATTU_CENTER.lng };

    if (sunriseIdx !== -1) {
      const first = unvisited.splice(sunriseIdx, 1)[0];
      ordered.push(first);
      currentPoint = first.coordinates;
    }

    while (unvisited.length > 0) {
      let nearestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const d = calcDistance(
          currentPoint.lat,
          currentPoint.lng,
          unvisited[i].coordinates.lat,
          unvisited[i].coordinates.lng
        );
        if (d < minDistance) {
          minDistance = d;
          nearestIdx = i;
        }
      }

      const nextPlace = unvisited.splice(nearestIdx, 1)[0];
      ordered.push(nextPlace);
      currentPoint = nextPlace.coordinates;
    }

    setSelectedPlaceIds(ordered.map((p) => p.id));
    showToast('Reordered stops for geographic efficiency & visit timing!', 'success');
  };

  const generatePlan = () => {
    if (selectedPlaceIds.length === 0) {
      showToast('Please select at least one place to generate your plan!', 'error');
      return false;
    }

    const planStops = selectedPlaceIds
      .map((id) => places.find((p) => p.id === id))
      .filter((p) => p !== undefined && p.isActive);

    let totalDist = 0;
    let prevCoords = { lat: AKKARAIPATTU_CENTER.lat, lng: AKKARAIPATTU_CENTER.lng };

    planStops.forEach((stop) => {
      totalDist += calcDistance(prevCoords.lat, prevCoords.lng, stop.coordinates.lat, stop.coordinates.lng);
      prevCoords = stop.coordinates;
    });

    const totalFee = planStops.reduce((sum, p) => sum + (p.entryFee?.costLkr || 0), 0);

    const newPlan = {
      id: 'plan-' + Date.now(),
      title: 'My Akkaraipattu Day Tour',
      date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      stops: planStops,
      totalDistanceKm: parseFloat(totalDist.toFixed(1)),
      totalEstimatedFeeLkr: totalFee,
      createdAt: new Date().toISOString(),
    };

    setGeneratedPlan(newPlan);
    setActiveTab('summary');
    showToast('One-day itinerary successfully generated!', 'success');

    fetch(`${API_BASE_URL}/itineraries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newPlan.title,
        visitDate: newPlan.date,
        selectedPlaceIds: planStops.map((s) => s.id),
        orderedPlaceIds: planStops.map((s) => s.id),
      }),
    }).catch(() => {});

    return true;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMaxDistanceKm(25);
    setFilterFamilyOnly(false);
    setFilterFreeOnly(false);
    showToast('Filters reset to default.', 'info');
  };

  // Admin functions
  const adminLogin = (username, pass) => {
    if (username.trim() === 'admin' && pass.trim() === 'dayspire2026') {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      } catch {}
      showToast('Logged in as Administrator.', 'success');
      return true;
    }
    showToast('Invalid credentials. Please try again.', 'error');
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {}
    showToast('Logged out of Admin panel.', 'info');
    setActiveTab('home');
  };

  const addPlace = (newPlaceData) => {
    if (!newPlaceData.name?.trim() || !newPlaceData.category) {
      showToast('Place name and category are required.', 'error');
      return false;
    }
    const newPlace = {
      ...newPlaceData,
      id: 'place-' + Date.now(),
      image: getVerifiedPlaceImage(newPlaceData),
    };
    setPlaces((prev) => [newPlace, ...prev]);
    showToast(`Successfully added "${newPlace.name}" to catalogue!`, 'success');

    fetch(`${API_BASE_URL}/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlace),
    }).catch((err) => {
      console.warn('Backend offline, saved to local store:', err);
    });

    return true;
  };

  const updatePlace = (id, updatedFields) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    showToast('Place details successfully updated!', 'success');

    fetch(`${API_BASE_URL}/places/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    }).catch((err) => {
      console.warn('Backend offline, updated in local store:', err);
    });

    return true;
  };

  const deletePlace = (id) => {
    const place = places.find((p) => p.id === id);
    setPlaces((prev) => prev.filter((p) => p.id !== id));
    setSelectedPlaceIds((prev) => prev.filter((pid) => pid !== id));
    showToast(`Deleted "${place?.name || 'place'}" from database.`, 'info');

    fetch(`${API_BASE_URL}/places/${id}`, {
      method: 'DELETE',
    }).catch((err) => {
      console.warn('Backend offline, deleted in local store:', err);
    });

    return true;
  };

  const togglePlaceActive = (id) => {
    const targetPlace = places.find((p) => p.id === id);
    if (!targetPlace) return;

    const nextActive = !targetPlace.isActive;
    showToast(`Place "${targetPlace.name}" is now ${nextActive ? 'Active' : 'Inactive / Hidden'}.`, 'info');

    fetch(`${API_BASE_URL}/places/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: nextActive }),
    }).catch((err) => {
      console.warn('Backend offline, toggled in local store:', err);
    });

    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: nextActive } : p))
    );
  };

  const resetAllPlacesToDefault = () => {
    setPlaces(INITIAL_PLACES.map((p) => ({ ...p, image: getVerifiedPlaceImage(p) })));
    setSelectedPlaceIds(['place-1', 'place-5', 'place-7']);
    setGeneratedPlan(null);
    showToast('Restored catalogue to original 10 verified Akkaraipattu places.', 'success');
  };

  return (
    <PlannerContext.Provider
      value={{
        places,
        activePlaces,
        selectedPlaceIds,
        activeTab,
        setActiveTab,
        selectedPlaceForModal,
        setSelectedPlaceForModal,
        addToPlan,
        removeFromPlan,
        reorderPlan,
        clearPlan,
        loadPresetPlan,
        optimizeRouteSequence,
        generatedPlan,
        generatePlan,
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
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
        addPlace,
        updatePlace,
        deletePlace,
        togglePlaceActive,
        resetAllPlacesToDefault,
        toasts,
        showToast,
        removeToast,
        isLoadingSkeleton,
        setIsLoadingSkeleton,
        mapFallbackMode,
        setMapFallbackMode,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};