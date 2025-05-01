import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'

const ChangeEnrolled = () => {
    const [operation, setOperation] = useState(""); // "add", "delete", "update"
    const [formData, setFormData] = useState({
      teacherCourseCode: "",
      rollNumber:""
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
                  const response = await fetch('http://localhost:5000/changeenrolled/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({   teacherCourseCode: formData.teacherCourseCode,
                        rollNumber:formData.rollNumber }),
                  });
          
                  if (response.ok) {
                    alert("Enrollment added successfully.");
                    //setSelectedCourses([]);
                    setTimeout(() => window.location.reload(), 1500); // Optional: reload to sync state
                  }
                } catch (err) {
                  console.error("❌ Fetch failed:", err);
                }
        // call add API
        console.log("Add enrollment:", formData);
      } else if (operation === "delete") {
        // call delete API
        try {
          const response = await fetch('http://localhost:5000/changeenrolled/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({    teacherCourseCode:formData.teacherCourseCode,
                rollNumber:formData.rollNumber }),
          });
  
          if (response.ok) {
            alert("Enrollment deleted successfully.");
            //setSelectedCourses([]);
            setTimeout(() => window.location.reload(), 1500); // Optional: reload to sync state
          }
        } catch (err) {
          console.error("❌ Fetch failed:", err);
        }
        console.log("Delete enrollment:", formData.courseCode);
      } else if (operation === "update") {
        // try {
        //   const response = await fetch('http://localhost:5000/changeenrollment/update', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({   teacherCourseCode:formData.teacherCourseCode,
        //         rollNumber:formData.rollNumber }),
        //   });
  
        //   if (response.ok) {
        //     alert("Cours updated successfully.");
        //     //setSelectedCourses([]);
        //     setTimeout(() => window.location.reload(), 1500); // Optional: reload to sync state
        //   }
        // } catch (err) {
        //   console.error("❌ Fetch failed:", err);
        // }
        // // call update API
        // console.log("Update course:", formData);
      }
    };
  
    return (
      <div style={{ padding: '20px' }}>
        <h2>Enrollment Management</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setOperation("add")}>Add Enrollment</button>
          <button onClick={() => setOperation("delete")}>Delete Enrollment</button>
          {/* <button onClick={() => setOperation("update")}>Update Course</button> */}
        </div>
  
        {operation && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
            <label>
              Teacher Course Code:
              <input
                type="text"
                name="teacherCourseCode"
                value={formData.teacherCourseCode}
                onChange={handleChange}
                required={operation === "add"}
              />
            </label>
            <label>
                  roll Number
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    required={operation === "add"}
                  />
              </label>         
                   
  
            <button type="submit">
              {operation === "add" && "Add enrollment"}
              {operation === "delete" && "Delete enrollment"}
              {operation === "update" && "Update Course"}
            </button>
          </form>
        )}
      </div>
    );
  
  
  }
  
  
  

export default ChangeEnrolled