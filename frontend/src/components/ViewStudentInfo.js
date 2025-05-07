// ViewStudentInfo.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ViewStudentInfo.css'; // ✅ Import the CSS file

const ViewStudentInfo = () => {
  const { state } = useLocation();
  const rollNo = state?.rollNo;
  const [selectedOption, setSelectedOption] = useState('');
  const [studentInfo, setStudentInfo] = useState([]);

  useEffect(() => {
    const fetchSemesterData = async () => {
      if (!selectedOption) return;

      try {
        const response = await fetch('http://localhost:5000/viewstudentinfo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ semester: parseInt(selectedOption) }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("❌ Error:", data.error || "Unknown error");
        } else {
          setStudentInfo(data);
          console.log("✅ Fetched student data:", data);
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err);
      }
    };

    fetchSemesterData();
  }, [selectedOption]);

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className="view-student-container">
      <h2 className="view-student-header">Student Info by Semester</h2>

      <label htmlFor="my-dropdown" className="semester-select-label">Choose a semester:</label>
      <select
        id="my-dropdown"
        value={selectedOption}
        onChange={handleChange}
        className="semester-select-dropdown"
      >
        <option value="">-- Select --</option>
        {[...Array(8)].map((_, i) => (
          <option key={i + 1} value={i + 1}>
            Semester {i + 1}
          </option>
        ))}
      </select>

      {selectedOption && (
        <p className="selected-semester">You selected: Semester {selectedOption}</p>
      )}

      {studentInfo.length > 0 && (
        <table className="Transcript-table">
          <thead>
            <tr>
              <th>Serial No.</th>
              <th>Name</th>
              <th>Roll No</th>
              <th>Current CGPA</th>
            </tr>
          </thead>
          <tbody>
            {studentInfo.map((row, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{row.name}</td>
                <td>{row.rollNumber}</td>
                <td>{(Math.floor(row.cgpa * 100) / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewStudentInfo;
