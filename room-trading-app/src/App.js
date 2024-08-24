// src/App.js
import React, { useState, useEffect } from 'react';
import Login from './Login';
import TradeForm from './TradeForm';

function App() {
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    // Check if user is already logged in by checking local storage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="App">
      {!user ? (
        <Login setUser={setUser} />
      ) : (
        <div>
          <h1>Welcome, {user.name} ({user.batch.toUpperCase()})</h1>
          <TradeForm user={user} trades={trades} setTrades={setTrades} />
        </div>
      )}
    </div>
  );
}

export default App;
