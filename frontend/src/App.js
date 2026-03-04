import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/student/Login';
import Dashboard from './components/student/Dashboard';
import Transcript from './components/student/Transcript';
import RegisterCourses from './components/student/RegisterCourses';
import SwapSection from './components/student/SwapSection';
import ResetPassword from './components/student/ResetPassword';  
import EnrolledCourses from './components/student/EnrolledCourses';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import ChangeCourse from './components/admin/ChangeCourse';
import ChangeSection from './components/admin/ChangeSection';
import ChangeStudent from './components/admin/ChangeStudent';
import ChangeTeacher from './components/admin/ChangeTeacher';
import ChangeGrade from './components/admin/ChangeGrade';
import ChangeEnrolled from './components/admin/ChangeEnrolled';
import ChangeLogin from './components/admin/ChangeLogin';
import ChangeAdmin from './components/admin/ChangeAdmin';
import SeeEnrolled from './components/admin/SeeEnrolled'; 
import ViewStudentInfo from './components/admin/ViewStudentInfo';
import ProtectedRoute from './components/shared/ProtectedRoute';
import ProtectedRouteAdmin from './components/shared/ProtectedRouteAdmin';

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
        <Route path="/admin-dashboard" element={<ProtectedRouteAdmin><AdminDashboard /></ProtectedRouteAdmin>} />
        <Route path="/changecourse" element={<ProtectedRouteAdmin><ChangeCourse /></ProtectedRouteAdmin>} />
        <Route path="/changesection" element={<ProtectedRouteAdmin><ChangeSection /></ProtectedRouteAdmin>} />
        <Route path="/changestudent" element={<ProtectedRouteAdmin><ChangeStudent /></ProtectedRouteAdmin>} />
        <Route path="/changeteacher" element={<ProtectedRouteAdmin><ChangeTeacher /></ProtectedRouteAdmin>} />
        <Route path="/changelogin" element={<ProtectedRouteAdmin><ChangeLogin /></ProtectedRouteAdmin>} />
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
