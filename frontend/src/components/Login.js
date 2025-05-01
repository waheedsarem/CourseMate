import './Login.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import courseMateLogo from './CourseMate.jpeg';

function Login() {
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roll_no: rollNo, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token); // ✅ Store JWT token
        setMessage('Login successful!');
        setError('');
        navigate('/dashboard', { state: { rollNo } }); // 👉 You can remove state if using token only
      } else {
        setError(data.error || 'Incorrect username or password');
        setMessage('');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="login-wrapper" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Section */}
      <div className="login-container" style={{ flex: 1, padding: '40px', textAlign: 'center' }}>
        <img src={courseMateLogo} alt="CourseMate Logo" className="logo" style={{ maxWidth: '180px', marginBottom: '20px' }} />
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="rollNo">Roll No:</label>
          <input
            type="text"
            id="rollNo"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            required
          />
          <p className="helper-text" style={{ fontSize: '12px', color: '#888' }}>
            Roll Number i.e (23L-1234)
          </p>

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        {message && <p className="success" style={{ color: 'green' }}>{message}</p>}
        {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
      </div>

      {/* Right Section - Background image or decorative side */}
      <div className="image-container" style={{ flex: 1, backgroundColor: '#f4f4f4' }}></div>
    </div>
  );
}

export default Login;
