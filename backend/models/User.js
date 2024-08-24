// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  name: { type: String, required: true },
  batch: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
