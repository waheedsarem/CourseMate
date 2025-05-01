import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './SwapSection.css';

function SwapSection() {
  const { state } = useLocation();
  const rollNo = state?.rollNo;
  
  // State declarations
  const [pendingRequest, setPendingRequest] = useState([]);
  const [currentEnrol, setCurrentEnrol] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedForDrop, setSelectedForDrop] = useState("");
  const [selectedForAdd, setSelectedForAdd] = useState("");
  const [errorNoDrop, setErrorNoDrop] = useState("");
  const [errorNoAdd, setErrorNoAdd] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const enterSwapperEntry = async () => {
      try {
        const response0 = await fetch('http://localhost:5000/SwapSection/LodgeRequest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            roll_no: rollNo, 
            course_add: selectedForAdd,
            course_drop: selectedForDrop 
          }),
        });

        const data0 = await response0.json();

        if (!response0.ok) {
          console.log("❌ Error: ", data0.error || "Unknown error");
        } 
      } catch (err) {
        console.error("❌ Fetch failed:", err);
      }
    }

    if (selectedForDrop === "") {
      setErrorNoDrop("You need to select a course to Drop");
    } else {
      setErrorNoDrop("");
    }

    if (selectedForAdd === "") {
      setErrorNoAdd("You need to select a course to add");
    } else {
      setErrorNoAdd("");
    }

    if (selectedForDrop && selectedForAdd) {
      enterSwapperEntry();
    }
  }

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response1 = await fetch('http://localhost:5000/SwapSection/Pending', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roll_no: rollNo }),
        });

        const data1 = await response1.json();

        if (!response1.ok) {
          console.log("❌ Error: ", data1.error || "Unknown error");
        } else {
          setPendingRequest(data1);
          console.log("✅ Fetched pending Requests:", data1);
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err);
      }

      try {
        const response2 = await fetch('http://localhost:5000/SwapSection/Enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roll_no: rollNo }),
        });

        const data2 = await response2.json();

        if (!response2.ok) {
          console.log("❌ Error: ", data2.error || "Unknown error");
        } else {
          setCurrentEnrol(data2);
          console.log("✅ Fetched Current Enrollment:", data2);
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err);
      }

      try {
        const response3 = await fetch('http://localhost:5000/SwapSection/Available', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roll_no: rollNo }),
        });

        const data3 = await response3.json();

        if (!response3.ok) {
          console.log("❌ Error: ", data3.error || "Unknown error");
        } else {
          setAvailableSections(data3);
          console.log("✅ Fetched Available Sections:", data3);
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err);
      }
    };

    if (rollNo) {
      fetchPendingRequests();
    }
  }, [rollNo]);

  return (
    <div className="Swap-container">
      <h2 className="Swap-header">Swap Section</h2>
      <p>Swapping sections for: <strong>{rollNo}</strong></p>
      
      {pendingRequest.length > 0 ? (
        <>
          <h3 className="Swap-subheader">Your Pending Swap Requests</h3>
          <table className="Swap-table">
            <thead>
              <tr>
                <th>SR#</th>
                <th>Course to Add</th>
                <th>Course to Drop</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequest.map((row, idx) => (
                <tr key={idx}>          
                  <td>{idx + 1}</td>
                  <td>{row.courseToBeAdded}</td>
                  <td>{row.courseToBeDropped}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="No-requests">You have no current swap requests</p>
      )}

      <h3 className="Swap-subheader">Your Current Enrollments</h3>
      <table className="Swap-table">
        <thead>
          <tr>
            <th>Select to Drop</th>
            <th>Section</th>
            <th>Teacher Name</th>
            <th>Course ID</th>
          </tr>
        </thead>
        <tbody>
          {currentEnrol.map((row, idx) => (
            <tr key={idx}>
              <td>
                <input 
                  className="Radio-input" 
                  type="radio" 
                  onChange={() => setSelectedForDrop(row.teacherCourseCode)}
                  name="dropCourse" 
                  checked={selectedForDrop === row.teacherCourseCode}
                />
              </td>
              <td>{row.teacherCourseCode}</td>
              <td>{row.teacherName}</td>
              <td>{row.courseCode}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {errorNoDrop && <div className="Error-message">{errorNoDrop}</div>}

      <h3 className="Swap-subheader">Available Courses</h3>
      <table className="Swap-table">
        <thead>
          <tr>
            <th>Select to Add</th>
            <th>Section</th>
            <th>Teacher Name</th>
            <th>Course ID</th>
          </tr>
        </thead>
        <tbody>
          {availableSections.map((row, idx) => (
            <tr key={idx}>
              <td>
                <input 
                  className="Radio-input" 
                  type="radio" 
                  onChange={() => setSelectedForAdd(row.teacherCourseCode)}
                  name="addCourse" 
                  checked={selectedForAdd === row.teacherCourseCode}
                />
              </td>
              <td>{row.teacherCourseCode}</td>
              <td>{row.teacherName}</td>
              <td>{row.courseCode}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {errorNoAdd && <div className="Error-message">{errorNoAdd}</div>}

      <button className="Swap-button" onClick={handleSubmit}>
        Initiate Swap Request
      </button>
    </div>
  );
}

export default SwapSection;