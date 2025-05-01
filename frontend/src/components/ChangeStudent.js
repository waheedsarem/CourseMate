import React, { useState } from 'react';
import './ChangeStudent.css';

const ChangeStudent = () => {
  const [operation, setOperation] = useState(""); // "add", "delete", "update"
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    rollNumber: "",
    departmentId: "",
    batch: "",
    semester: "",
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
        const response = await fetch('http://localhost:5000/changestudent/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            rollNumber: formData.rollNumber,
            departmentId: formData.departmentId,
            batch: formData.batch,
            semester: formData.semester,
            email: formData.email
          }),
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Student added successfully.' });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setMessage({ type: 'error', text: 'Failed to add student.' });
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err);
        setMessage({ type: 'error', text: 'An error occurred while adding the student.' });
      }
    } else if (operation === "delete") {
      try {
        const response = await fetch('http://localhost:5000/changestudent/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            rollNumber: formData.rollNumber,
            departmentId: formData.departmentId,
            batch: formData.batch,
            semester: formData.semester,
            email: formData.email
          }),
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Student deleted successfully.' });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setMessage({ type: 'error', text: 'Failed to delete student.' });
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err);
        setMessage({ type: 'error', text: 'An error occurred while deleting the student.' });
      }
    } else if (operation === "update") {
      try {
        const response = await fetch('http://localhost:5000/changestudent/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            rollNumber: formData.rollNumber,
            departmentId: formData.departmentId,
            batch: formData.batch,
            semester: formData.semester,
            email: formData.email
          }),
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Student updated successfully.' });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setMessage({ type: 'error', text: 'Failed to update student.' });
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err);
        setMessage({ type: 'error', text: 'An error occurred while updating the student.' });
      }
    }
  };

  return (
    <div className="change-student-container">
      <div className="change-student-card">
        <h2 className="change-student-header">Student Management</h2>
        
        <div className="operation-buttons">
          <button 
            className={`operation-selector ${operation === "add" ? "active" : ""}`}
            onClick={() => setOperation("add")}
          >
            Add Student
          </button>
          <button 
            className={`operation-selector ${operation === "delete" ? "active" : ""}`}
            onClick={() => setOperation("delete")}
          >
            Delete Student
          </button>
          <button 
            className={`operation-selector ${operation === "update" ? "active" : ""}`}
            onClick={() => setOperation("update")}
          >
            Update Student
          </button>
        </div>

        {operation && (
          <form onSubmit={handleSubmit} className="student-form">
            <div className="form-group">
              <label htmlFor="rollNumber">Roll Number:</label>
              <input
                id="rollNumber"
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
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
                  <label htmlFor="departmentId">Department ID:</label>
                  <input
                    id="departmentId"
                    type="text"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="form-input"
                    required={operation === "add"}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="batch">Batch:</label>
                  <input
                    id="batch"
                    type="number"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    className="form-input"
                    required={operation === "add"}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="semester">Semester:</label>
                  <input
                    id="semester"
                    type="number"
                    name="semester"
                    value={formData.semester}
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
              {operation === "add" && "Add Student"}
              {operation === "delete" && "Delete Student"}
              {operation === "update" && "Update Student"}
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

export default ChangeStudent;