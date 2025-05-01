import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ChangeSection.css';

const ChangeSection = () => {
   const [operation, setOperation] = useState(""); // "add", "delete", "update"
   const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
      teacherCourseCode: "",
      courseCode: "",
      teacherCode: "",
      availableSeats:""
    });
  
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
          const response = await fetch('http://localhost:5000/changesection/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({    teacherCourseCode:formData.teacherCourseCode,
              courseCode: formData.courseCode,
              teacherCode: formData.teacherCode,
              availableSeats:formData.availableSeats}),
          });
  
          if (response.ok) {
            setMessage("Section added successfully.");
            setTimeout(() => {
              setMessage('');
              setOperation('');
              setFormData({
                teacherCourseCode: "",
                courseCode: "",
                teacherCode: "",
                availableSeats: ""
              });
            }, 2000);
          }
        } catch (err) {
          console.error("❌ Fetch failed:", err);
          setMessage('Operation failed. Please try again.');
        }
      } else if (operation === "delete") {
        try {
          const response = await fetch('http://localhost:5000/changesection/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({    teacherCourseCode:formData.teacherCourseCode,
              courseCode: formData.courseCode,
              teacherCode: formData.teacherCode,
              availableSeats:formData.availableSeats}),
          });
  
          if (response.ok) {
            setMessage("Section deleted successfully.");
            setTimeout(() => {
              setMessage('');
              setOperation('');
              setFormData({
                teacherCourseCode: "",
                courseCode: "",
                teacherCode: "",
                availableSeats: ""
              });
            }, 2000);
          }
        } catch (err) {
          console.error("❌ Fetch failed:", err);
          setMessage('Operation failed. Please try again.');
        }       
      } else if (operation === "update") {
        try {
          const response = await fetch('http://localhost:5000/changesection/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({    teacherCourseCode:formData.teacherCourseCode,
              courseCode: formData.courseCode,
              teacherCode: formData.teacherCode,
              availableSeats:formData.availableSeats}),
          });
  
          if (response.ok) {
            setMessage("Section updated successfully.");
            setTimeout(() => {
              setMessage('');
              setOperation('');
              setFormData({
                teacherCourseCode: "",
                courseCode: "",
                teacherCode: "",
                availableSeats: ""
              });
            }, 2000);
          }
        } catch (err) {
          console.error("❌ Fetch failed:", err);
          setMessage('Operation failed. Please try again.');
        }
      }
    };
  
    return (
      <div className="change-section-container">
        <div className="change-section-card">
          <h1 className="change-section-header">Section Management</h1>
          
          <div className="operation-buttons">
            <button 
              className="operation-selector"
              onClick={() => setOperation("add")}
            >
              Add Section
            </button>
            <button 
              className="operation-selector"
              onClick={() => setOperation("delete")}
            >
              Delete Section
            </button>
            <button 
              className="operation-selector"
              onClick={() => setOperation("update")}
            >
              Update Section
            </button>
          </div>
  
          {operation && (
            <form onSubmit={handleSubmit} className="section-form">
              <div className="form-group">
                <label htmlFor="teacherCourseCode">Teacher Course Code</label>
                <input
                  type="text"
                  id="teacherCourseCode"
                  name="teacherCourseCode"
                  value={formData.teacherCourseCode}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Enter teacher course code"
                />
              </div>
  
              {(operation === "add" || operation === "update") && (
                <>
                  <div className="form-group">
                    <label htmlFor="courseCode">Course Code</label>
                    <input
                      type="text"
                      id="courseCode"
                      name="courseCode"
                      value={formData.courseCode}
                      onChange={handleChange}
                      required={operation === "add"}
                      className="form-input"
                      placeholder="Enter course code"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="teacherCode">Teacher Code</label>
                    <input
                      type="text"
                      id="teacherCode"
                      name="teacherCode"
                      value={formData.teacherCode}
                      onChange={handleChange}
                      required={operation === "add"}
                      className="form-input"
                      placeholder="Enter teacher code"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="availableSeats">Available Seats</label>
                    <input
                      type="number"
                      id="availableSeats"
                      name="availableSeats"
                      value={formData.availableSeats}
                      onChange={handleChange}
                      required={operation === "add"}
                      className="form-input"
                      placeholder="Enter available seats"
                    />
                  </div>
                </>
              )}
  
              <button 
                type="submit" 
                className={`submit-button ${operation}`}
              >
                {operation === "add" && "Add Section"}
                {operation === "delete" && "Delete Section"}
                {operation === "update" && "Update Section"}
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
}

export default ChangeSection;