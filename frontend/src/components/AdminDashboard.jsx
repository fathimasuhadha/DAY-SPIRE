import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  RotateCcw,
  Sparkles,
  MapPin,
  Compass,
  CircleDollarSign,
  Clock,
  X,
  Check,
  AlertCircle,
  Search,
  Upload,
  Link,
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { Place, PlaceCategory } from '../types';
import { getVerifiedPlaceImage } from '../utils/placeImages';

export const AdminDashboard = () => {
  const {
    places,
    addPlace,
    updatePlace,
    deletePlace,
    togglePlaceActive,
    resetAllPlacesToDefault,
    adminLogout,
    setSelectedPlaceForModal,
  } = usePlanner();

  const [adminSearch, setAdminSearch] = useState('');
  const [editingPlace, setEditingPlace] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Image Upload State
  const [imageInputMode, setImageInputMode] = useState('file'); // 'file' | 'url'
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Compress and process selected image file into Base64
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP, etc.).');
      return;
    }
    setUploadError('');
    setIsProcessingImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // High quality web scale down (max 1200px)
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.86);
        setFormData((prev) => ({ ...prev, image: optimizedBase64 }));
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setUploadError('Failed to process this image. Please try another image.');
        setIsProcessingImage(false);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setUploadError('Unable to read selected file.');
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Coastal/Nature',
    description: '',
    distanceKm: 5.0,
    direction: 'North',
    lat: 7.2312,
    lng: 81.8453,
    openingHours: '08:00 AM - 06:00 PM',
    isFree: true,
    costLkr: 0,
    feeDisplayText: 'Free Entry',
    address: '',
    googleMapsUrl: '',
    image: '',
    isFamilyFriendly: true,
    familyNotes: 'Suitable for all ages.',
    culturalEtiquette: '',
    nearbyFoodRest: '',
    safetyNotes: '',
    bestTimeToVisit: '',
    isActive: true,
    featured: false,
  });

  const [formErrors, setFormErrors] = useState({});

  const startEdit = (place) => {
    setEditingPlace(place);
    setIsAddingNew(false);
    setImageInputMode(place.image && place.image.startsWith('data:image/') ? 'file' : 'url');
    setUploadError('');
    setFormData({
      name: place.name,
      category: place.category,
      description: place.description,
      distanceKm: place.distanceKm,
      direction: place.direction,
      lat: place.coordinates?.lat || 7.2312,
      lng: place.coordinates?.lng || 81.8453,
      openingHours: place.openingHours || '08:00 AM - 06:00 PM',
      isFree: place.entryFee?.isFree ?? true,
      costLkr: place.entryFee?.costLkr || 0,
      feeDisplayText: place.entryFee?.displayText || 'Free Entry',
      address: place.address || '',
      googleMapsUrl: place.googleMapsUrl || '',
      image: place.image || '',
      isFamilyFriendly: place.familySuitability?.isFamilyFriendly ?? true,
      familyNotes: place.familySuitability?.notes || '',
      culturalEtiquette: place.culturalEtiquette || '',
      nearbyFoodRest: place.nearbyFoodRest || '',
      safetyNotes: place.safetyNotes || '',
      bestTimeToVisit: place.bestTimeToVisit || '',
      isActive: place.isActive ?? true,
      featured: place.featured || false,
    });
    setFormErrors({});
  };

  const startAdd = () => {
    setEditingPlace(null);
    setIsAddingNew(true);
    setImageInputMode('file');
    setUploadError('');
    setFormData({
      name: '',
      category: 'Coastal/Nature',
      description: '',
      distanceKm: 4.5,
      direction: 'East',
      lat: 7.2312,
      lng: 81.8453,
      openingHours: '08:00 AM - 06:00 PM',
      isFree: true,
      costLkr: 0,
      feeDisplayText: 'Free Entry',
      address: '',
      googleMapsUrl: '',
      image: '',
      isFamilyFriendly: true,
      familyNotes: 'Family-friendly area.',
      culturalEtiquette: '',
      nearbyFoodRest: '',
      safetyNotes: '',
      bestTimeToVisit: '',
      isActive: true,
      featured: false,
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Place name is required (DR-01).';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    if (isNaN(formData.distanceKm) || formData.distanceKm < 0) errors.distanceKm = 'Distance must be a non-negative number (DR-03).';
    if (isNaN(formData.lat) || isNaN(formData.lng)) errors.coordinates = 'Coordinates must be valid numbers (DR-02).';
    if (!formData.isFree && (isNaN(formData.costLkr) || formData.costLkr < 0)) {
      errors.costLkr = 'Entry fee cost must be a non-negative number (DR-03).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      description: formData.description.trim(),
      distanceKm: Number(formData.distanceKm),
      direction: formData.direction.trim() || 'North',
      coordinates: {
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      },
      openingHours: formData.openingHours.trim() || 'Not available / Not confirmed',
      address: formData.address?.trim() || '',
      googleMapsUrl: formData.googleMapsUrl?.trim() || `https://www.google.com/maps/search/?api=1&query=${formData.lat},${formData.lng}`,
      entryFee: {
        isFree: formData.isFree,
        costLkr: formData.isFree ? 0 : Number(formData.costLkr),
        displayText: formData.isFree ? 'Free Entry' : (formData.feeDisplayText.trim() || `LKR ${formData.costLkr}`),
      },
      image: formData.image.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      familySuitability: {
        isFamilyFriendly: formData.isFamilyFriendly,
        notes: formData.familyNotes.trim(),
      },
      culturalEtiquette: formData.culturalEtiquette.trim(),
      nearbyFoodRest: formData.nearbyFoodRest.trim(),
      safetyNotes: formData.safetyNotes.trim(),
      bestTimeToVisit: formData.bestTimeToVisit.trim(),
      isActive: formData.isActive,
      featured: formData.featured,
    };

    if (isAddingNew) {
      addPlace(payload);
    } else if (editingPlace) {
      updatePlace(editingPlace.id, payload);
    }

    setIsAddingNew(false);
    setEditingPlace(null);
  };

  const filteredPlaces = places.filter((p) => {
    if (!adminSearch.trim()) return true;
    const q = adminSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  return (
    <div id="admin-dashboard-view" className="space-y-6 sm:space-y-8 pb-14">
      
      {/* Top Admin Header */}
      <div className="bg-[#084C61] rounded-[32px] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E27D60] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Management Portal</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Place Catalogue Administration
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="admin-add-place-btn"
            onClick={startAdd}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#E27D60] hover:bg-[#C95F43] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#E27D6033] transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Place</span>
          </button>

          <button
            id="admin-restore-defaults-btn"
            onClick={resetAllPlacesToDefault}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#063b4b] hover:bg-[#052d3a] text-white text-xs font-bold uppercase tracking-wider transition border border-white/20"
            title="Reset to 10 verified default places"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            id="admin-logout-btn"
            onClick={adminLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-rose-900/60 hover:bg-rose-900/80 text-rose-100 text-xs font-bold uppercase tracking-wider transition border border-rose-700/50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[24px] border border-[#E8E2D9] shadow-xs">
          <span className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider">Total Places</span>
          <span className="font-heading font-bold text-2xl text-[#084C61] block mt-0.5">{places.length}</span>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-[#E8E2D9] shadow-xs">
          <span className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider">Active (Public)</span>
          <span className="font-heading font-bold text-2xl text-[#084C61] block mt-0.5">
            {places.filter((p) => p.isActive).length}
          </span>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-[#E8E2D9] shadow-xs">
          <span className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider">Inactive / Hidden</span>
          <span className="font-heading font-bold text-2xl text-amber-600 block mt-0.5">
            {places.filter((p) => !p.isActive).length}
          </span>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-[#E8E2D9] shadow-xs">
          <span className="text-[11px] font-bold text-[#7D7D7D] uppercase tracking-wider">Featured Places</span>
          <span className="font-heading font-bold text-2xl text-[#E27D60] block mt-0.5">
            {places.filter((p) => p.featured).length}
          </span>
        </div>
      </div>

      {/* Search Filter for Admin */}
      <div className="bg-white p-3 sm:p-4 rounded-full border border-[#E8E2D9] flex items-center gap-3">
        <Search className="w-4 h-4 text-[#7D7D7D] ml-2" />
        <input
          id="admin-filter-input"
          type="text"
          value={adminSearch}
          onChange={(e) => setAdminSearch(e.target.value)}
          placeholder="Filter places by name or category..."
          className="w-full text-xs sm:text-sm bg-transparent border-none text-[#084C61] placeholder:text-[#7D7D7D] focus:outline-none"
        />
      </div>

      {/* Places Management Table / List */}
      <div className="bg-white rounded-[32px] border border-[#E8E2D9] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#E8E2D9] flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-[#084C61]">
            Managed Attractions ({filteredPlaces.length})
          </h2>
          <span className="text-xs text-[#7D7D7D]">
            Click toggle to hide from public search without permanent deletion
          </span>
        </div>

        <div className="divide-y divide-[#E8E2D9]">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              id={`admin-place-row-${place.id}`}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                place.isActive ? 'bg-white' : 'bg-[#F2EDE4]/60 opacity-80'
              }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={getVerifiedPlaceImage(place)}
                  alt={place.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-[16px] object-cover shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        place.isActive
                          ? 'bg-[#F2EDE4] text-[#084C61] border border-[#E8E2D9]'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {place.isActive ? 'Active (Public)' : 'Inactive (Hidden)'}
                    </span>
                    <span className="text-xs font-semibold text-[#7D7D7D]">
                      {place.category}
                    </span>
                    <span className="text-xs text-[#7D7D7D]">•</span>
                    <span className="text-xs text-[#7D7D7D]">
                      {place.distanceKm} km ({place.direction})
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#084C61] mt-1">
                    {place.name}
                  </h3>

                  <div className="text-xs text-[#7D7D7D] mt-0.5 flex items-center gap-3">
                    <span>Hours: {place.openingHours}</span>
                    <span>Fee: {place.entryFee.displayText}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Active / Inactive Toggle (FR-047) */}
                <button
                  id={`admin-toggle-${place.id}`}
                  onClick={() => togglePlaceActive(place.id)}
                  className={`px-3 py-2 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
                    place.isActive
                      ? 'bg-[#F2EDE4] border-[#E8E2D9] text-[#084C61] hover:bg-[#E8E2D9]'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  }`}
                  title={place.isActive ? 'Deactivate (hide from visitors)' : 'Activate (make visible)'}
                >
                  {place.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="hidden sm:inline">{place.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>

                {/* Edit Button (FR-046) */}
                <button
                  id={`admin-edit-${place.id}`}
                  onClick={() => startEdit(place)}
                  className="p-2.5 rounded-full bg-[#F2EDE4] hover:bg-[#E8E2D9] border border-[#E8E2D9] text-[#084C61] transition"
                  title="Edit place information"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete Button (FR-047) */}
                {deleteConfirmId === place.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      id={`confirm-del-${place.id}`}
                      onClick={() => {
                        deletePlace(place.id);
                        setDeleteConfirmId(null);
                      }}
                      className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="p-1.5 rounded-full bg-slate-200 text-slate-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    id={`admin-del-${place.id}`}
                    onClick={() => setDeleteConfirmId(place.id)}
                    className="p-2.5 rounded-full bg-[#F2EDE4] hover:bg-rose-50 hover:text-rose-600 border border-[#E8E2D9] text-[#7D7D7D] transition"
                    title="Delete place permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Place Modal Form */}
      {(isAddingNew || editingPlace) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#FAF7F2] rounded-[32px] shadow-2xl border border-[#E8E2D9] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-white border-b border-[#E8E2D9] flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#084C61]">
                  {isAddingNew ? 'Add New Place of Interest' : `Edit "${editingPlace?.name}"`}
                </h3>
                <p className="text-xs text-[#7D7D7D] mt-0.5">
                  Update tourism database records within 25km Akkaraipattu radius
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingPlace(null);
                }}
                className="p-2 rounded-full hover:bg-[#F2EDE4] text-[#7D7D7D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              
              {/* Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="form-place-name" className="block font-bold text-[#084C61] mb-1">
                    Place Name *
                  </label>
                  <input
                    id="form-place-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Oluvil Beach Park"
                    className="w-full p-2.5 rounded-full border border-[#E8E2D9] bg-white text-[#084C61] focus:ring-2 focus:ring-[#E27D60]"
                  />
                  {formErrors.name && <p className="text-rose-600 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label htmlFor="form-place-category" className="block font-bold text-[#084C61] mb-1">
                    Category *
                  </label>
                  <select
                    id="form-place-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-full border border-[#E8E2D9] bg-white text-[#084C61] focus:ring-2 focus:ring-[#E27D60]"
                  >
                    <option value="Coastal/Nature">Coastal/Nature</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Religious">Religious</option>
                    <option value="Dining">Dining</option>
                    <option value="Recreation">Recreation</option>
                    <option value="Educational">Educational</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="form-place-desc" className="block font-bold text-[#084C61] mb-1">
                  Description *
                </label>
                <textarea
                  id="form-place-desc"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide an informative overview for foreign and local tourists..."
                  className="w-full p-3 rounded-[20px] border border-[#E8E2D9] bg-white text-[#084C61] focus:ring-2 focus:ring-[#E27D60]"
                />
                {formErrors.description && <p className="text-rose-600 text-xs mt-1">{formErrors.description}</p>}
              </div>

              {/* Distance, Direction & Coordinates */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-[20px] border border-[#E8E2D9]">
                <div>
                  <label htmlFor="form-place-dist" className="block text-[11px] font-bold text-[#7D7D7D] mb-1">
                    Distance (km) *
                  </label>
                  <input
                    id="form-place-dist"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.distanceKm}
                    onChange={(e) => setFormData({ ...formData, distanceKm: parseFloat(e.target.value) })}
                    className="w-full p-2 rounded-full border border-[#E8E2D9] text-xs text-[#084C61]"
                  />
                  {formErrors.distanceKm && <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.distanceKm}</p>}
                </div>

                <div>
                  <label htmlFor="form-place-dir" className="block text-[11px] font-bold text-[#7D7D7D] mb-1">
                    Direction
                  </label>
                  <input
                    id="form-place-dir"
                    type="text"
                    value={formData.direction}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                    placeholder="e.g. North-East"
                    className="w-full p-2 rounded-full border border-[#E8E2D9] text-xs text-[#084C61]"
                  />
                </div>

                <div>
                  <label htmlFor="form-place-lat" className="block text-[11px] font-bold text-[#7D7D7D] mb-1">
                    Latitude
                  </label>
                  <input
                    id="form-place-lat"
                    type="number"
                    step="0.0001"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                    className="w-full p-2 rounded-full border border-[#E8E2D9] text-xs text-[#084C61]"
                  />
                </div>

                <div>
                  <label htmlFor="form-place-lng" className="block text-[11px] font-bold text-[#7D7D7D] mb-1">
                    Longitude
                  </label>
                  <input
                    id="form-place-lng"
                    type="number"
                    step="0.0001"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                    className="w-full p-2 rounded-full border border-[#E8E2D9] text-xs text-[#084C61]"
                  />
                </div>
              </div>

              {/* Address and Google Maps Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="form-place-address" className="block font-bold text-[#084C61] mb-1">
                    Address / Plus Code
                  </label>
                  <input
                    id="form-place-address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Main Street, Akkaraipattu"
                    className="w-full p-2.5 rounded-full border border-[#E8E2D9] bg-white text-[#084C61] text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="form-place-maps-url" className="block font-bold text-[#084C61] mb-1">
                    Google Maps URL <span className="text-[11px] font-normal text-[#7D7D7D]">(Optional)</span>
                  </label>
                  <input
                    id="form-place-maps-url"
                    type="url"
                    value={formData.googleMapsUrl}
                    onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.app.goo.gl/... or leave blank"
                    className="w-full p-2.5 rounded-full border border-[#E8E2D9] bg-white text-[#084C61] text-xs"
                  />
                </div>
              </div>

              {/* Hours and Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="form-place-hours" className="block font-bold text-[#084C61] mb-1">
                    Opening Hours
                  </label>
                  <input
                    id="form-place-hours"
                    type="text"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    placeholder="e.g. 09:00 AM - 06:00 PM or Not confirmed"
                    className="w-full p-2.5 rounded-full border border-[#E8E2D9] bg-white text-[#084C61]"
                  />
                </div>

                <div>
                  <label htmlFor="form-place-fee-txt" className="block font-bold text-[#084C61] mb-1">
                    Entry Fee Display Text
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="form-place-fee-txt"
                      type="text"
                      value={formData.feeDisplayText}
                      onChange={(e) => setFormData({ ...formData, feeDisplayText: e.target.value })}
                      placeholder="e.g. Free Entry or LKR 300"
                      className="w-full p-2.5 rounded-full border border-[#E8E2D9] bg-white text-[#084C61]"
                    />
                  </div>
                </div>
              </div>

              {/* Image Input Section: Choose Image OR Provide URL */}
              <div className="bg-white p-4 rounded-[20px] border border-[#E8E2D9] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#084C61] text-xs sm:text-sm">
                    Place Cover Photo / Image *
                  </label>
                  
                  {/* Button Tab */}
                  <div className="flex bg-[#F2EDE4] p-0.5 rounded-full text-xs">
                    <button
                      type="button"
                      id="choose-image-tab-btn"
                      onClick={() => setImageInputMode('file')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium transition ${
                        imageInputMode === 'file'
                          ? 'bg-white text-[#084C61] shadow-xs'
                          : 'text-[#7D7D7D] hover:text-[#084C61]'
                      }`}
                    >
                      <span>Choose Image</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium transition ${
                        imageInputMode === 'url'
                          ? 'bg-white text-[#084C61] shadow-xs'
                          : 'text-[#7D7D7D] hover:text-[#084C61]'
                      }`}
                    >
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                {imageInputMode === 'file' ? (
                  <div>
                    {/* Drag and drop upload zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      className={`border-2 border-dashed rounded-[18px] p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                        isDragging
                          ? 'border-[#E27D60] bg-[#E27D60]/10 scale-[0.99]'
                          : 'border-[#E8E2D9] hover:border-[#084C61] bg-[#FAF7F2]'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processImageFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#E8E2D9] flex items-center justify-center text-[#084C61]">
                        <Upload className="w-5 h-5" />
                      </div>
                      
                      {/* நடுவில் உள்ள Box */}
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-[#084C61]">
                          Choose Image
                        </p>
                        <p className="text-[11px] text-[#7D7D7D] mt-0.5">
                          JPG, PNG or WEBP format
                        </p>
                      </div>
                    </div>

                    {isProcessingImage && (
                      <p className="text-xs text-[#084C61] font-medium mt-2 flex items-center gap-1.5 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5" />
                        Optimizing and preparing image...
                      </p>
                    )}

                    {uploadError && (
                      <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {uploadError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      id="form-place-img-url"
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Paste image web link (e.g. https://...)"
                      className="w-full p-2.5 rounded-full border border-[#E8E2D9] bg-white text-[#084C61] text-xs"
                    />
                  </div>
                )}

                {/* Selected Image Preview */}
                {formData.image && (
                  <div className="flex items-center gap-3 p-2.5 rounded-[16px] bg-[#FAF7F2] border border-[#E8E2D9]">
                    <div className="w-16 h-12 rounded-[10px] overflow-hidden bg-slate-200 border border-[#E8E2D9] shrink-0">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#084C61]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate">Image ready to display</span>
                      </div>
                      <p className="text-[10px] text-[#7D7D7D] truncate">
                        Image selected successfully
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 rounded-full transition"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Visitor Notes: Cultural, Family, Safety, Food */}
              <div className="space-y-3 bg-white p-4 rounded-[20px] border border-[#E8E2D9]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#7D7D7D]">
                  Visitor Notes & Etiquette Guidance
                </h4>

                <div>
                  <label htmlFor="form-place-etiquette" className="block text-xs font-semibold text-[#084C61] mb-0.5">
                    Cultural Etiquette / Dress Code
                  </label>
                  <input
                    id="form-place-etiquette"
                    type="text"
                    value={formData.culturalEtiquette}
                    onChange={(e) => setFormData({ ...formData, culturalEtiquette: e.target.value })}
                    placeholder="e.g. Modest attire required, remove footwear."
                    className="w-full p-2 rounded-full border border-[#E8E2D9] text-xs text-[#084C61]"
                  />
                </div>

                <div>
                  <label htmlFor="form-place-food" className="block text-xs font-semibold text-[#084C61] mb-0.5">
                    Nearby Food / Rest Facilities
                  </label>
                  <input
                    id="form-place-food"
                    type="text"
                    value={formData.nearbyFoodRest}
                    onChange={(e) => setFormData({ ...formData, nearbyFoodRest: e.target.value })}
                    placeholder="e.g. Tea stalls and bakeries located 100m away."
                    className="w-full p-2 rounded-full border border-[#E8E2D9] text-xs text-[#084C61]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="form-place-active-toggle"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-[#E27D60] accent-[#E27D60]"
                    />
                    <span className="text-xs font-bold text-[#084C61]">Publicly Active</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="form-place-featured-toggle"
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-[#E27D60] accent-[#E27D60]"
                    />
                    <span className="text-xs font-bold text-[#084C61]">Featured Highlight</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="form-place-family-toggle"
                      type="checkbox"
                      checked={formData.isFamilyFriendly}
                      onChange={(e) => setFormData({ ...formData, isFamilyFriendly: e.target.checked })}
                      className="w-4 h-4 rounded text-[#E27D60] accent-[#E27D60]"
                    />
                    <span className="text-xs font-bold text-[#084C61]">Family Friendly</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E8E2D9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingPlace(null);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#F2EDE4] hover:bg-[#E8E2D9] text-[#084C61] font-bold text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>

                <button
                  id="form-save-place-btn"
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#E27D60] hover:bg-[#C95F43] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#E27D6033] transition"
                >
                  Save Place Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};