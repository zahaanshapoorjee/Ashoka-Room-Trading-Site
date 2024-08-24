import React, { useState, useEffect } from 'react';
import './TradeForm.css'; // Import CSS for styling

const handleUnauthorized = (setUser) => {
  alert('Your session has expired. Please log in again.');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
};

const TradeForm = ({ user, trades, setTrades, setUser }) => {
  const [requestFloor, setRequestFloor] = useState('');
  const [requestRH, setRequestRH] = useState('');
  const [offerFloor, setOfferFloor] = useState('');
  const [offerRH, setOfferRH] = useState('');
  const [live, setLive] = useState(true);
  const [matchingTrades, setMatchingTrades] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);

  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch all trades initially to check for matches
    fetch('https://ashoka-room-trading-site.onrender.com/api/trades', {
      headers: {
        'x-auth-token': token,
      },
    })
      .then(res => {
        if (res.status === 401) {
          handleUnauthorized(setUser);
          return Promise.reject('Unauthorized');
        }
        return res.json();
      })
      .then(data => setTrades(data))
      .catch(err => console.error('Error fetching trades:', err));
  }, [setTrades, setUser, token]);

  useEffect(() => {
    // Ensure only live matching trades are displayed
    const userRequests = trades.filter(trade => trade.userEmail === user.email);
    const matches = trades.filter(trade =>
      userRequests.some(
        req =>
          req.requestFloor === trade.offerFloor &&
          req.requestRH === trade.offerRH &&
          trade.live // Check if trade is live
      )
    );
    setMatchingTrades(matches);
  }, [trades, user.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTrade = {
      userEmail: user.email,
      requestFloor,
      requestRH,
      offerFloor,
      offerRH,
      live,
      phoneNumber: user.phoneNumber,
      name: user.name,
    };

    try {
      const res = await fetch('https://ashoka-room-trading-site.onrender.com/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(newTrade),
      });

      if (res.status === 401) {
        handleUnauthorized(setUser);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to create trade request');
      }

      const data = await res.json();
      setTrades([...trades, data]);
      setRequestFloor('');
      setRequestRH('');
      setOfferFloor('');
      setOfferRH('');
    } catch (err) {
      console.error('Error creating trade request:', err);
    }
  };

  const handleToggleLive = async (id, currentLiveStatus) => {
    try {
      const res = await fetch(`https://ashoka-room-trading-site.onrender.com/api/trade/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ live: !currentLiveStatus }), // Toggle based on current status
      });

      if (res.status === 401) {
        handleUnauthorized(setUser);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to update trade request');
      }

      // Fetch updated trades to refresh the UI
      const updatedTrades = await fetch('https://ashoka-room-trading-site.onrender.com/api/trades', {
        headers: {
          'x-auth-token': token,
        },
      })
        .then(res => {
          if (res.status === 401) {
            handleUnauthorized(setUser);
            return Promise.reject('Unauthorized');
          }
          return res.json();
        });
      setTrades(updatedTrades);
    } catch (err) {
      console.error('Error updating trade request:', err);
    }
  };

  const handlePhoneNumberChange = async () => {
    try {
      const res = await fetch('https://ashoka-room-trading-site.onrender.com/api/user/phone', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (res.status === 401) {
        handleUnauthorized(setUser);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to update phone number');
      }

      const updatedUser = await res.json();
      setPhoneNumber(updatedUser.phoneNumber);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error updating phone number:', err);
    }
  };

  // Function to generate dropdown options
  const generateOptions = () => {
    const options = [];
    for (let i = 1; i <= 10; i++) {
      options.push(
        <option key={i} value={i.toString()}>
          {i}
        </option>
      );
    }
    options.push(
      <option key="any" value="Any">
        Any
      </option>
    );
    return options;
  };

  return (
    <div className="trade-form">
      <form onSubmit={handleSubmit} className="trade-form__form">
        <h2>Create a Trade Request</h2>
        <label>
          Request Floor:
          <select
            value={requestFloor}
            onChange={(e) => setRequestFloor(e.target.value)}
            required
            className="trade-form__input" // Uniform input styling
          >
            <option value="" disabled>Select Floor</option>
            {generateOptions()}
          </select>
        </label>
        <label>
          Request RH:
          <select
            value={requestRH}
            onChange={(e) => setRequestRH(e.target.value)}
            required
            className="trade-form__input" // Uniform input styling
          >
            <option value="" disabled>Select RH</option>
            {generateOptions()}
          </select>
        </label>
        <label>
          Offer Floor:
          <select
            value={offerFloor}
            onChange={(e) => setOfferFloor(e.target.value)}
            required
            className="trade-form__input" // Uniform input styling
          >
            <option value="" disabled>Select Floor</option>
            {generateOptions()}
          </select>
        </label>
        <label>
          Offer RH:
          <select
            value={offerRH}
            onChange={(e) => setOfferRH(e.target.value)}
            required
            className="trade-form__input" // Uniform input styling
          >
            <option value="" disabled>Select RH</option>
            {generateOptions()}
          </select>
        </label>
        <button type="submit" className="trade-form__button">Submit Trade Request</button>
      </form>

      <div className="trade-form__phone-update">
        <h2>Update Phone Number</h2>
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="trade-form__input" // Uniform input styling
        />
        <button onClick={handlePhoneNumberChange} className="trade-form__button">Update Phone Number</button>
      </div>

      <h2>Your Current Requests</h2>
      {trades.filter((trade) => trade.userEmail === user.email).map((trade) => (
        <div key={trade._id} className="trade-form__request">
          <p>
            Requesting Floor {trade.requestFloor}, RH {trade.requestRH} for Floor{' '}
            {trade.offerFloor}, RH {trade.offerRH}
          </p>
          <button
            onClick={() => handleToggleLive(trade._id, trade.live)}
            className="trade-form__button"
          >
            {trade.live ? 'Set Inactive' : 'Set Active'}
          </button>
        </div>
      ))}

      <h2>Matching Requests</h2>
      {matchingTrades.map((trade) => (
        <div key={trade._id} className="trade-form__match">
          <p>
            {trade.userEmail} is offering Floor {trade.offerFloor}, RH {trade.offerRH} for Floor{' '}
            {trade.requestFloor}, RH {trade.requestRH}
          </p>
          <a target='_blank' href={`https://wa.me/${trade.phoneNumber}`} className="trade-form__link">
            Contact via WhatsApp
          </a>
        </div>
      ))}

      <h2>All Live Requests</h2>
      {trades.filter(trade => trade.live).map((trade) => (
        <div key={trade._id} className="trade-form__live-request">
          <p>
            {trade.userEmail} is requesting Floor {trade.requestFloor}, RH {trade.requestRH} for Floor{' '}
            {trade.offerFloor}, RH {trade.offerRH}
          </p>
          <a href={`https://wa.me/${trade.phoneNumber}`} className="trade-form__link">
            Contact via WhatsApp
          </a>
        </div>
      ))}
    </div>
  );
};

export default TradeForm;
