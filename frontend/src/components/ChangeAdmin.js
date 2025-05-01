import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ChangeAdmin.css';

const ChangeAdmin = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const rollNo = state?.rollNo;
  const [message, setMessage] = useState('');
  const [operation, setOperation] = useState("");
  const [formData, setFormData] = useState({
    adminId: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      if (operation === "add") endpoint = 'changeadmin/add';
      else if (operation === "delete") endpoint = 'changeadmin/delete';
      else if (operation === "update") endpoint = 'changeadmin/update';

      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const msg = `Admin ${operation}d successfully`;
        setMessage(msg);
        setTimeout(() => {
          setMessage('');
          setOperation('');
          setFormData({ adminId: "", newPassword: "" });
        }, 2000);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage('Operation failed. Please try again.');
    }
  };

  return (
    <div className="change-admin-container">
      <div className="change-admin-card">
        <h1 className="change-admin-header">Admin Management</h1>
        
        <div className="operation-buttons">
          <button 
            className="operation-selector"
            onClick={() => setOperation("add")}
          >
            Add Admin
          </button>
          <button 
            className="operation-selector"
            onClick={() => setOperation("delete")}
          >
            Delete Admin
          </button>
          <button 
            className="operation-selector"
            onClick={() => setOperation("update")}
          >
            Update Admin
          </button>
        </div>

        {operation && (
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="adminId">Admin ID</label>
              <input
                type="text"
                id="adminId"
                name="adminId"
                value={formData.adminId}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter admin ID"
              />
            </div>

            {(operation === "add" || operation === "update") && (
              <div className="form-group">
                <label htmlFor="newPassword">Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Enter new password"
                />
              </div>
            )}

            <button 
              type="submit" 
              className={`submit-button ${operation}`}
            >
              {operation === "add" && "Add Admin"}
              {operation === "delete" && "Delete Admin"}
              {operation === "update" && "Update Admin"}
            </button>
          </form>
        )}

        {message && (
          <p className={`message ${message.includes('failed') ? 'error-message' : 'success-message'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChangeAdmin;