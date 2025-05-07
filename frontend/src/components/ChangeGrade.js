import React, { useState } from 'react';
import './ChangeGrade.css';

const ChangeGrade = () => {
  const [operation, setOperation] = useState(""); // "add", "delete", "update"
  const [formData, setFormData] = useState({
    courseCode: "",
    rollNumber: "",
    grade: ""
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = `http://localhost:5000/changegrade/${operation}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(`Grade ${operation}d successfully.`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData?.message || "Something went wrong."));
      }
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      alert("Error: Could not connect to server.");
    }
  };

  return (
    <div className="change-grade-container">
      <div className="change-grade-card">
        <h2 className="change-grade-header">Grade/Transcript Management</h2>

        <div className="operation-buttons">
          <button className="operation-selector" onClick={() => setOperation("add")}>Add Grade Entry</button>
          <button className="operation-selector" onClick={() => setOperation("delete")}>Delete Grade Entry</button>
          <button className="operation-selector" onClick={() => setOperation("update")}>Update Grade Entry</button>
        </div>

        {operation && (
          <form onSubmit={handleSubmit} className="grade-form">
            <div className="form-group">
              <label htmlFor="courseCode">Course Code</label>
              <input
                type="text"
                id="courseCode"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rollNumber">Roll Number</label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {(operation === "add" || operation === "update") && (
              <div className="form-group">
                <label htmlFor="grade">Grade</label>
                <input
                  type="text"
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className={`submit-button ${operation}`}
            >
              {operation === "add" && "Add Grade Entry"}
              {operation === "delete" && "Delete Grade Entry"}
              {operation === "update" && "Update Grade Entry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangeGrade;
