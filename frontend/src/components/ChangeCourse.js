import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ChangeCourse.css';

const ChangeCourse = () => {
  const [operation, setOperation] = useState(""); // "add", "delete", "update"
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName:"",
    courseType: "",
    creditHours: "",
    department: "",
    preReq:""
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
                const response = await fetch('http://localhost:5000/changecourse/add', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({   courseCode: formData.courseCode,
                    courseName:formData.courseName,
                    courseType: formData.courseType,
                    creditHours: formData.creditHours,
                    department: formData.department,
                    preReq:formData.preReq }),
                });
        
                if (response.ok) {
                  setMessage("Course added successfully.");
                  setTimeout(() => {
                    setMessage('');
                    setOperation('');
                    setFormData({
                      courseCode: "",
                      courseName: "",
                      courseType: "",
                      creditHours: "",
                      department: "",
                      preReq: ""
                    });
                  }, 2000);
                }
              } catch (err) {
                console.error("❌ Fetch failed:", err);
                setMessage('Operation failed. Please try again.');
              }
    } else if (operation === "delete") {
      try {
        const response = await fetch('http://localhost:5000/changecourse/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({   courseCode: formData.courseCode,
            courseName:formData.courseName,
            courseType: formData.courseType,
            creditHours: formData.creditHours,
            department: formData.department,
            preReq:formData.preReq }),
        });

        if (response.ok) {
          setMessage("Course deleted successfully.");
          setTimeout(() => {
            setMessage('');
            setOperation('');
            setFormData({
              courseCode: "",
              courseName: "",
              courseType: "",
              creditHours: "",
              department: "",
              preReq: ""
            });
          }, 2000);
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err);
        setMessage('Operation failed. Please try again.');
      }
    } else if (operation === "update") {
      try {
        const response = await fetch('http://localhost:5000/changecourse/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({   courseCode: formData.courseCode,
            courseName:formData.courseName,
            courseType: formData.courseType,
            creditHours: formData.creditHours,
            department: formData.department,
            preReq:formData.preReq }),
        });

        if (response.ok) {
          setMessage("Course updated successfully.");
          setTimeout(() => {
            setMessage('');
            setOperation('');
            setFormData({
              courseCode: "",
              courseName: "",
              courseType: "",
              creditHours: "",
              department: "",
              preReq: ""
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
    <div className="change-course-container">
      <div className="change-course-card">
        <h1 className="change-course-header">Course Management</h1>
        
        <div className="operation-buttons">
          <button 
            className="operation-selector"
            onClick={() => setOperation("add")}
          >
            Add Course
          </button>
          <button 
            className="operation-selector"
            onClick={() => setOperation("delete")}
          >
            Delete Course
          </button>
          <button 
            className="operation-selector"
            onClick={() => setOperation("update")}
          >
            Update Course
          </button>
        </div>

        {operation && (
          <form onSubmit={handleSubmit} className="course-form">
            <div className="form-group">
              <label htmlFor="courseCode">Course Code</label>
              <input
                type="text"
                id="courseCode"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter course code"
              />
            </div>

            {(operation === "add" || operation === "update") && (
              <>
                <div className="form-group">
                  <label htmlFor="courseName">Course Name</label>
                  <input
                    type="text"
                    id="courseName"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                    required={operation === "add"}
                    className="form-input"
                    placeholder="Enter course name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="courseType">Course Type</label>
                  <input
                    type="text"
                    id="courseType"
                    name="courseType"
                    value={formData.courseType}
                    onChange={handleChange}
                    required={operation === "add"}
                    className="form-input"
                    placeholder="Enter course type"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="creditHours">Credit Hours</label>
                  <input
                    type="number"
                    id="creditHours"
                    name="creditHours"
                    value={formData.creditHours}
                    onChange={handleChange}
                    required={operation === "add"}
                    className="form-input"
                    placeholder="Enter credit hours"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="preReq">Pre-requisite</label>
                  <input
                    type="text"
                    id="preReq"
                    name="preReq"
                    value={formData.preReq}
                    onChange={handleChange}
                    required={operation === "add"}
                    className="form-input"
                    placeholder="Enter pre-requisite"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required={operation === "add"}
                    className="form-input"
                    placeholder="Enter department"
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              className={`submit-button ${operation}`}
            >
              {operation === "add" && "Add Course"}
              {operation === "delete" && "Delete Course"}
              {operation === "update" && "Update Course"}
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

export default ChangeCourse;