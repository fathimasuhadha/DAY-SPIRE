import mongoose from 'mongoose';

const PlaceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    distanceKm: { type: Number, required: true, min: [0, 'Distance cannot be negative (DR-03)'] },
    direction: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: { type: String },
    googleMapsUrl: { type: String },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 10, min: 0 },
    openingHours: { type: String },
    entryFee: {
      isFree: { type: Boolean, default: true },
      costLkr: { type: Number, default: 0, min: [0, 'Entry fee cannot be negative (DR-03)'] },
      displayText: { type: String, default: 'Free Entry' },
      foreignTouristNote: { type: String },
    },
    image: { type: String },
    familySuitability: {
      isFamilyFriendly: { type: Boolean, default: true },
      notes: { type: String },
    },
    culturalEtiquette: { type: String },
    nearbyFoodRest: { type: String },
    safetyNotes: { type: String },
    bestTimeToVisit: { type: String },
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Place = mongoose.models.Place || mongoose.model('Place', PlaceSchema);
export default Place;
