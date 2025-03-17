import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ApproverRoute from './components/ApproverRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeaveRequestList from './pages/LeaveRequestList';
import LeaveRequestForm from './pages/LeaveRequestForm';
import LeaveRequestDetail from './pages/LeaveRequestDetail';
import UserList from './pages/UserList';
import UserForm from './pages/UserForm';
import Profile from './pages/Profile';
import LeaveTypeList from './pages/LeaveTypeList';
import LeaveTypeForm from './pages/LeaveTypeForm';
import NotFound from './pages/NotFound';

import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          
          <Route path="leave-requests">
            <Route index element={<LeaveRequestList />} />
            <Route path="new" element={<LeaveRequestForm />} />
            <Route path=":id" element={<LeaveRequestDetail />} />
            <Route path=":id/edit" element={<LeaveRequestForm />} />
          </Route>
          
          <Route path="approvals" element={<ApproverRoute><LeaveRequestList isApprovalPage /></ApproverRoute>} />
          
          <Route path="users" element={<AdminRoute><UserList /></AdminRoute>} />
          <Route path="users/new" element={<AdminRoute><UserForm /></AdminRoute>} />
          <Route path="users/:id" element={<AdminRoute><UserForm /></AdminRoute>} />
          
          <Route path="leave-types" element={<AdminRoute><LeaveTypeList /></AdminRoute>} />
          <Route path="leave-types/new" element={<AdminRoute><LeaveTypeForm /></AdminRoute>} />
          <Route path="leave-types/:id" element={<AdminRoute><LeaveTypeForm /></AdminRoute>} />
          
          <Route path="profile" element={<Profile />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Box>
  );
}

export default App;