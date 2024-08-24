// routes/api.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TradeRequest = require('../models/TradeRequest');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Route to create or update user and return JWT
router.post('/user', async (req, res) => {
  const { email, phoneNumber, name, batch } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.phoneNumber = phoneNumber;
      existingUser.name = name;
      existingUser.batch = batch;
      await existingUser.save();
    } else {
      const newUser = new User({ email, phoneNumber, name, batch });
      await newUser.save();
    }

    // Create and return JWT token
    const payload = {
      user: {
        id: email
      }
    };

    jwt.sign(
      payload,
      "mySuperSecretJWTKey123!@#",
      { expiresIn: 3600 }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Route to create a trade request
router.post('/trade', auth, async (req, res) => {
  const {
    userEmail,
    requestFloor,
    requestRH,
    offerFloor,
    offerRH,
    live,
    phoneNumber,
    name,
  } = req.body;

  try {
    const newTradeRequest = new TradeRequest({
      userEmail,
      requestFloor,
      requestRH,
      offerFloor,
      offerRH,
      live,
      phoneNumber,
      name,
    });

    await newTradeRequest.save();
    res.status(201).json(newTradeRequest);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Authenticated route to update user phone number
router.put('/user/phone', auth, async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const user = await User.findOne({ email: req.user.id });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.phoneNumber = phoneNumber;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Authenticated route to update a trade request
router.put('/trade/:id', auth, async (req, res) => {
  const { requestFloor, requestRH, offerFloor, offerRH, live } = req.body;

  try {
    const trade = await TradeRequest.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({ msg: 'Trade request not found' });
    }

    if (trade.userEmail !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    trade.requestFloor = requestFloor || trade.requestFloor;
    trade.requestRH = requestRH || trade.requestRH;
    trade.offerFloor = offerFloor || trade.offerFloor;
    trade.offerRH = offerRH || trade.offerRH;
    trade.live = live !== undefined ? live : trade.live;

    await trade.save();
    res.json(trade);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Route to get all trade requests (could also secure this route with auth if needed)
router.get('/trades', async (req, res) => {
  try {
    const trades = await TradeRequest.find();
    res.status(200).json(trades);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
