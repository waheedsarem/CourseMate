import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const rollNo = state?.rollNo;
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');  // Clear JWT
    navigate('/admin');  // Redirect to login page
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-card">
        <h2 className="dashboard-header">Admin Dashboard</h2>
        
        <div className="dashboard-actions">
          <button 
            className="dashboard-button" 
            onClick={() => navigate('/changecourse', { state: { rollNo } })}
          >
            Change Course Info
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => navigate('/changesection', { state: { rollNo } })}
          >
            Change Section Info
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => navigate('/changeteacher', { state: { rollNo } })}
          >
            Change Teacher Info
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => navigate('/changestudent', { state: { rollNo } })}
          >
            Change Student Info
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => navigate('/changelogin', { state: { rollNo } })}
          >
            Change Student Login Info
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => navigate('/changeadmin', { state: { rollNo } })}
          >
            Change Admin Info
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => navigate('/changegrade', { state: { rollNo } })}
          >
            Change Grade/Transcript Info
          </button>
          <button 
            className="dashboard-button" 
            onClick={() => navigate('/changeenrolled', { state: { rollNo } })}
          >
            Change Enrollment Info
          </button>
        </div>
        
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;