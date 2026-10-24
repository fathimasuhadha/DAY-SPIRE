import mongoose from 'mongoose';

const ItinerarySchema = new mongoose.Schema(
  {
    itineraryId: { type: String, required: true, unique: true },
    title: { type: String, default: 'One-Day Visit Plan' },
    visitDate: { type: String },
    selectedPlaceIds: [{ type: String }],
    orderedPlaceIds: [{ type: String }],
  },
  { timestamps: true }
);

const Itinerary = mongoose.models.Itinerary || mongoose.model('Itinerary', ItinerarySchema);
export default Itinerary;
