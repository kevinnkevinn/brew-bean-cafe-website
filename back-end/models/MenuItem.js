// backend/models/MenuItem.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, enum: ['Coffee', 'Pastry', 'Lite Bites'] }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);