const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  icon: String,
  color: String
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
