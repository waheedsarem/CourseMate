import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const rollNo = state?.rollNo;
  const [student, setStudent] = useState(null);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');  // Remove JWT token
    navigate('/');  // Redirect to the login page
  };

  useEffect(() => {
    const fetchStudent = async () => {
      const token = localStorage.getItem('token'); // Get the JWT token from localStorage

      try {
        const response = await fetch(`http://localhost:5000/student/${rollNo}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          },
        });

        const data = await response.json();
        setStudent(data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    if (rollNo) fetchStudent();
  }, [rollNo]);

  if (!student) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          <h1>Loading Student Data</h1>
          <div className="student-details">
            <span className="label">Status</span>
            <span className="value">Please wait...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <h1>Welcome back, {student.first_name}</h1>

        <div className="student-details">
          <span className="label">Student ID</span>
          <span className="value">{student.roll_no}</span>

          <span className="label">Department</span>
          <span className="value">{student.department_id}</span>

          <span className="label">Academic Year</span>
          <span className="value">Batch of {student.batch}</span>

          <span className="label">Current Semester</span>
          <span className="value">Semester {student.semester}</span>

          <span className="label">Contact Email</span>
          <span className="value">
            {student.email || <span className="null-value">No email registered</span>}
          </span>
        </div>

        <div className="button-container">
          <button onClick={() => navigate('/transcript', { state: { rollNo } })}>
            View Academic Transcript
          </button>
          <button onClick={() => navigate('/register', { state: { rollNo } })}>
            Course Registration Portal
          </button>
          <button onClick={() => navigate('/swap', { state: { rollNo } })}>
            Section Swap Requests
          </button>
          <button onClick={() => navigate('/reset-password', { state: { rollNo } })}>
            Reset Password
          </button>
          <button onClick={() => navigate('/enrolled-courses', { state: { rollNo } })}>
            Enrolled Courses
          </button>
          {/* Logout Button */}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}



export default Dashboard;
