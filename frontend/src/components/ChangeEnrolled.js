import React, { useState } from 'react';
import './ChangeEnrolled.css';

const ChangeEnrolled = () => {
  const [operation, setOperation] = useState(""); // "add", "delete"
  const [formData, setFormData] = useState({
    teacherCourseCode: "",
    rollNumber: ""
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint =
      operation === "add"
        ? "http://localhost:5000/changeenrolled/add"
        : "http://localhost:5000/changeenrolled/delete";

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`Enrollment ${operation}ed successfully.`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const errText = await response.text();
        alert(`Server Error: ${errText}`);
      }
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      alert("Request failed. Check console for details.");
    }
  };

  return (
    <div className="change-grade-container">
      <div className="change-grade-card">
        <h2 className="change-grade-header">Enrollment Management</h2>

        <div className="operation-buttons">
          <button
            className="operation-selector"
            onClick={() => setOperation("add")}
          >
            Add Enrollment
          </button>
          <button
            className="operation-selector"
            onClick={() => setOperation("delete")}
          >
            Delete Enrollment
          </button>
        </div>

        {operation && (
          <form className="grade-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="teacherCourseCode">Teacher Course Code</label>
              <input
                type="text"
                id="teacherCourseCode"
                name="teacherCourseCode"
                className="form-input"
                value={formData.teacherCourseCode}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rollNumber">Roll Number</label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                className="form-input"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className={`submit-button ${operation}`}
            >
              {operation === "add" && "Add Enrollment"}
              {operation === "delete" && "Delete Enrollment"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangeEnrolled;
