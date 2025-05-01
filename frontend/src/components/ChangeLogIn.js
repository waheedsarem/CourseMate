import React, { useState } from 'react';
import axios from 'axios';
import './ChangeLogIn.css';

const ChangeLogIn = () => {
  const [operation, setOperation] = useState('add');
  const [formData, setFormData] = useState({
    rollNumber: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      switch (operation) {
        case 'add':
          response = await axios.post('http://localhost:3001/api/login', formData);
          setMessage('Login credentials added successfully!');
          break;
        case 'delete':
          response = await axios.delete(`http://localhost:3001/api/login/${formData.rollNumber}`);
          setMessage('Login credentials deleted successfully!');
          break;
        case 'update':
          response = await axios.put(`http://localhost:3001/api/login/${formData.rollNumber}`, { 
            newPassword: formData.newPassword 
          });
          setMessage('Password updated successfully!');
          break;
        default:
          break;
      }
      setFormData({
        rollNumber: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="change-login-container">
      <div className="change-login-card">
        <h2 className="change-login-header">Login Management</h2>
        
        <div className="operation-buttons">
          <button
            className={`operation-selector ${operation === 'add' ? 'active' : ''}`}
            onClick={() => setOperation('add')}
          >
            Add Login
          </button>
          <button
            className={`operation-selector ${operation === 'delete' ? 'active' : ''}`}
            onClick={() => setOperation('delete')}
          >
            Delete Login
          </button>
          <button
            className={`operation-selector ${operation === 'update' ? 'active' : ''}`}
            onClick={() => setOperation('update')}
          >
            Update Password
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="rollNumber">Roll Number</label>
            <input
              type="text"
              id="rollNumber"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter roll number"
              required
            />
          </div>

          {(operation === 'add' || operation === 'update') && (
            <>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter new password"
                  required
                />
              </div>

              {operation === 'add' && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className={`submit-button ${operation}`}
          >
            {operation === 'add' && 'Add Login'}
            {operation === 'delete' && 'Delete Login'}
            {operation === 'update' && 'Update Password'}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success-message' : 'error-message'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangeLogIn;
