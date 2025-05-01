import React, { useState } from 'react';
import './ChangeTeacher.css';

const ChangeTeacher = () => {
  const [operation, setOperation] = useState(""); // "add", "delete", "update"
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    teacherId: "",
    email: ""
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (operation === "add") {
      try {
        const response = await fetch('http://localhost:5000/changeteacher/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            teacherId: formData.teacherId,
            email: formData.email
          }),
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Teacher added successfully.' });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setMessage({ type: 'error', text: 'Failed to add teacher.' });
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err);
        setMessage({ type: 'error', text: 'An error occurred while adding the teacher.' });
      }
    } else if (operation === "delete") {
      try {
        const response = await fetch('http://localhost:5000/changeteacher/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            teacherId: formData.teacherId,
            email: formData.email
          }),
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Teacher deleted successfully.' });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setMessage({ type: 'error', text: 'Failed to delete teacher.' });
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err);
        setMessage({ type: 'error', text: 'An error occurred while deleting the teacher.' });
      }
    } else if (operation === "update") {
      try {
        const response = await fetch('http://localhost:5000/changeteacher/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            teacherId: formData.teacherId,
            email: formData.email
          }),
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Teacher updated successfully.' });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setMessage({ type: 'error', text: 'Failed to update teacher.' });
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err);
        setMessage({ type: 'error', text: 'An error occurred while updating the teacher.' });
      }
    }
  };

  return (
    <div className="change-teacher-container">
      <div className="change-teacher-card">
        <h2 className="change-teacher-header">Teacher Management</h2>
        
        <div className="operation-buttons">
          <button 
            className={`operation-selector ${operation === "add" ? "active" : ""}`}
            onClick={() => setOperation("add")}
          >
            Add Teacher
          </button>
          <button 
            className={`operation-selector ${operation === "delete" ? "active" : ""}`}
            onClick={() => setOperation("delete")}
          >
            Delete Teacher
          </button>
          <button 
            className={`operation-selector ${operation === "update" ? "active" : ""}`}
            onClick={() => setOperation("update")}
          >
            Update Teacher
          </button>
        </div>

        {operation && (
          <form onSubmit={handleSubmit} className="teacher-form">
            <div className="form-group">
              <label htmlFor="teacherId">Teacher ID:</label>
              <input
                id="teacherId"
                type="text"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {(operation === "add" || operation === "update") && (
              <>
                <div className="form-group">
                  <label htmlFor="firstName">First Name:</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input"
                    required={operation === "add"}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name:</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                    required={operation === "add"}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    required={operation === "add"}
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              className={`submit-button ${operation}`}
            >
              {operation === "add" && "Add Teacher"}
              {operation === "delete" && "Delete Teacher"}
              {operation === "update" && "Update Teacher"}
            </button>
          </form>
        )}
        
        {message.text && (
          <div className={`message ${message.type}-message`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangeTeacher;