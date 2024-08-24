// src/Login.js
import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';
import './Login.css'; // Import CSS for styling

const Login = ({ setUser }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if user data exists in local storage
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser)); // Load user from local storage
    }
  }, [setUser]);

  const handleSuccess = async (response) => {
    const decodedToken = jwtDecode(response.credential);
    const email = decodedToken.email;
    const name = decodedToken.name;
    const batch = email.split('_')[1].split('@')[0];

    // Temporarily store user data without phone number
    setUserData({ email, name, batch });
  };

  const handleSubmitPhoneNumber = async () => {
    if (!phoneNumber) {
      alert('Please enter your phone number.');
      return;
    }

    const completeUserData = { ...userData, phoneNumber };

    try {
      const res = await fetch('https://ashoka-room-trading-site.onrender.com/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeUserData),
      });

      if (!res.ok) {
        throw new Error('Failed to save user');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token); // Store the JWT token
      localStorage.setItem('user', JSON.stringify(completeUserData)); // Store user data
      setUser(completeUserData); // Update state with user data
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  const handleError = () => {
    console.error('Error during login.');
  };

  return (
    <div className='login-page'>
    <div className="login">
      {!userData ? (
        <div className="login__container">
          <h2>Login with Ashoka ID</h2>
          <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
        </div>
      ) : (
        <div className="login__container">
          <h2>Enter Your Phone Number</h2>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="login__input" // Uniform input styling
          />
          <button onClick={handleSubmitPhoneNumber} className="login__button">Submit Phone Number</button>
        </div>
      )}
    </div>
    </div>
  );
};

export default Login;
