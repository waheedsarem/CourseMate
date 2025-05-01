import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import './ChangeGrade.css';


const ChangeGrade = () => {
    const [operation, setOperation] = useState(""); // "add", "delete", "update"
    const [formData, setFormData] = useState({
      courseCode: "",
      rollNumber:"",
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
      if (operation === "add") {
                try {
                  const response = await fetch('http://localhost:5000/changegrade/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({   courseCode: formData.courseCode,
                        rollNumber:formData.rollNumber,
                        grade: formData.grade }),
                  });
          
                  if (response.ok) {
                    alert("grade entry added successfully.");
                    //setSelectedCourses([]);
                    setTimeout(() => window.location.reload(), 1500); // Optional: reload to sync state
                  }
                } catch (err) {
                  console.error("❌ Fetch failed:", err);
                }
        // call add API
        console.log("Add grade:", formData);
      } else if (operation === "delete") {
        // call delete API
        try {
          const response = await fetch('http://localhost:5000/changegrade/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({  courseCode: formData.courseCode,
                rollNumber:formData.rollNumber,
                grade: formData.grade }),
          });
  
          if (response.ok) {
            alert("Grade deleted successfully.");
            //setSelectedCourses([]);
            setTimeout(() => window.location.reload(), 1500); // Optional: reload to sync state
          }
        } catch (err) {
          console.error("❌ Fetch failed:", err);
        }
        console.log("Delete grade:", formData.courseCode);
      } else if (operation === "update") {
        try {
          const response = await fetch('http://localhost:5000/changegrade/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({  courseCode: formData.courseCode,
                rollNumber:formData.rollNumber,
                grade: formData.grade }),
          });
  
          if (response.ok) {
            alert("grade updated successfully.");
            //setSelectedCourses([]);
            setTimeout(() => window.location.reload(), 1500); // Optional: reload to sync state
          }
        } catch (err) {
          console.error("❌ Fetch failed:", err);
        }
        // call update API
        console.log("Update grade:", formData);
      }
    };
  
    return (
      <div style={{ padding: '20px' }}>
        <h2>Grade/Transcript Management</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setOperation("add")}>Add Grade Entry</button>
          <button onClick={() => setOperation("delete")}>Delete Grade Entry</button>
          <button onClick={() => setOperation("update")}>Update Grade Entry</button>
        </div>
  
        {operation && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
            <label>
              Course:
              <input
                type="text"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
               // required
              />
            </label>
            <label>
                  Roll Number:
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                 //   required
                  />
                </label>
  
            {(operation === "add" || operation === "update") && (
              <>
                   
                <label>
                  Grade:
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                  />
                </label>
               
              </>
            )}
  
            <button type="submit">
              {operation === "add" && "Add Grade Entry"}
              {operation === "delete" && "Delete Grade Entry"}
              {operation === "update" && "Update Grade Entry"}
            </button>
          </form>
        )}
      </div>
    );
  
  
  }
  
    

export default ChangeGrade