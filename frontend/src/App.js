import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Transcript from './components/Transcript';
import RegisterCourses from './components/RegisterCourses';
import SwapSection from './components/SwapSection';
import ResetPassword from './components/ResetPassword';  
import EnrolledCourses from './components/EnrolledCourses';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ChangeCourse from './components/ChangeCourse';
import ChangeSection from './components/ChangeSection';
import ChangeStudent from './components/ChangeStudent';
import ChangeTeacher from './components/ChangeTeacher';
import ChangeGrade from './components/ChangeGrade';
import ChangeEnrolled from './components/ChangeEnrolled';
import ChangeLogIn from './components/ChangeLogIn';
import ChangeAdmin from './components/ChangeAdmin';
import SeeEnrolled from './components/SeeEnrolled'; 
import ViewStudentInfo from './components/ViewStudentInfo';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteAdmin from './components/ProtectedRouteAdmin';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} />

        {/* Student Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/transcript" element={<ProtectedRoute><Transcript /></ProtectedRoute>} />
        <Route path="/register" element={<ProtectedRoute><RegisterCourses /></ProtectedRoute>} />
        <Route path="/swap" element={<ProtectedRoute><SwapSection /></ProtectedRoute>} />
        <Route path="/reset-password" element={<ProtectedRoute><ResetPassword /></ProtectedRoute>} />
        <Route path="/enrolled-courses" element={<ProtectedRoute><EnrolledCourses /></ProtectedRoute>} />

        {/* Admin Protected Routes */}
        <Route path="/AdminDashboard" element={<ProtectedRouteAdmin><AdminDashboard /></ProtectedRouteAdmin>} />
        <Route path="/changecourse" element={<ProtectedRouteAdmin><ChangeCourse /></ProtectedRouteAdmin>} />
        <Route path="/changesection" element={<ProtectedRouteAdmin><ChangeSection /></ProtectedRouteAdmin>} />
        <Route path="/changestudent" element={<ProtectedRouteAdmin><ChangeStudent /></ProtectedRouteAdmin>} />
        <Route path="/changeteacher" element={<ProtectedRouteAdmin><ChangeTeacher /></ProtectedRouteAdmin>} />
        <Route path="/changelogin" element={<ProtectedRouteAdmin><ChangeLogIn /></ProtectedRouteAdmin>} />
        <Route path="/changeenrolled" element={<ProtectedRouteAdmin><ChangeEnrolled /></ProtectedRouteAdmin>} />
        <Route path="/changegrade" element={<ProtectedRouteAdmin><ChangeGrade /></ProtectedRouteAdmin>} />
        <Route path="/changeadmin" element={<ProtectedRouteAdmin><ChangeAdmin /></ProtectedRouteAdmin>} />
        <Route path="/seeenrolled" element={<ProtectedRouteAdmin><SeeEnrolled /></ProtectedRouteAdmin>} /> 
        <Route path="/viewstudentinfo" element={<ProtectedRouteAdmin><ViewStudentInfo /></ProtectedRouteAdmin>} /> 
      </Routes>
    </Router>
  );
}

export default App;
