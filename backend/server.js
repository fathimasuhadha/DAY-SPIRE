import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Place from './models/Place.js';
import Itinerary from './models/Itinerary.js';
import Category from './models/Category.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database connection & auto-seed if database is empty
async function initDB() {
  const connected = await connectDB();
  if (connected) {
    try {
      const count = await Place.countDocuments();
     if (count === 0) {
  console.log('MongoDB collection is empty.');
} else {
        console.log(`ℹ️ MongoDB Atlas already has ${count} places stored.`);
      }
    } catch (seedErr) {
      console.error('⚠️ Seeding error:', seedErr.message);
    }
  }
}
initDB();

// 1. Health & Database Status Route
app.get('/api/health', async (_req, res) => {
  let placesCount = 0;
  try {
    placesCount = await Place.countDocuments();
  } catch (e) {
    // ignore
  }
  res.json({
    status: 'ok',
    message: 'DaySpire Akkaraipattu Day Tour API is running',
    version: '1.0.0',
    database: 'MongoDB Atlas',
    placesInAtlas: placesCount,
    timestamp: new Date().toISOString(),
  });
});

// Force Seed / Sync Endpoint
app.post('/api/seed', async (req, res) => {
  try {
    const { overwrite } = req.body || {};
    if (overwrite) {
      await Place.deleteMany({});
    }
    for (const place of SEED_PLACES) {
      await Place.findOneAndUpdate({ id: place.id }, place, { upsert: true, new: true });
    }
    const count = await Place.countDocuments();
    res.json({
      success: true,
      message: `Successfully synced ${count} verified places to MongoDB Atlas database "dayspire"!`,
      totalPlaces: count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Place Routes
app.get('/api/places', async (req, res) => {
  try {
    const { all, category } = req.query;
    const filter = all === 'true' ? {} : { isActive: true };
    if (category && category !== 'All') {
      filter.category = category;
    }
    const places = await Place.find(filter).sort({ distanceKm: 1 }).exec();
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/places', async (req, res) => {
  try {
    const { name, category, description, distanceKm, direction, coordinates } = req.body;
    if (!name || !category || !description || distanceKm === undefined || !coordinates) {
      return res.status(400).json({ error: 'Missing required place fields' });
    }
    const newPlace = new Place({
      ...req.body,
      id: req.body.id || `place-${Date.now()}`,
    });
    await newPlace.save();
    res.status(201).json(newPlace);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Place.findOneAndUpdate({ id }, req.body, { new: true }).exec();
    if (!updated) return res.status(404).json({ error: 'Place not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Place.findOneAndDelete({ id }).exec();
    res.json({ success: true, message: 'Place deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Itinerary Routes
app.get('/api/itineraries', async (_req, res) => {
  try {
    const itineraries = await Itinerary.find().sort({ createdAt: -1 }).exec();
    res.json(itineraries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/itineraries', async (req, res) => {
  try {
    const { title, visitDate, selectedPlaceIds, orderedPlaceIds } = req.body;
    const itinerary = new Itinerary({
      itineraryId: `itin-${Date.now()}`,
      title: title || 'One-Day Visit Plan',
      visitDate,
      selectedPlaceIds: selectedPlaceIds || [],
      orderedPlaceIds: orderedPlaceIds || [],
    });
    await itinerary.save();
    res.status(201).json(itinerary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Categories Route
app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await Category.find().exec();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 DaySpire Backend Server running on http://localhost:${PORT}`);
});
