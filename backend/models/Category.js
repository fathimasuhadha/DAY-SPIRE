import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    categoryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export default Category;
