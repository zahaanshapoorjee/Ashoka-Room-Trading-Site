// models/TradeRequest.js
const mongoose = require('mongoose');

const tradeRequestSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  requestFloor: { type: String, required: true },
  requestRH: { type: String, required: true },
  offerFloor: { type: String, required: true },
  offerRH: { type: String, required: true },
  live: { type: Boolean, default: true },
  phoneNumber: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TradeRequest', tradeRequestSchema);
