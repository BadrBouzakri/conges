import React, { useState, useEffect } from 'react';
import { 
  Paper, Typography, Button, TextField, Grid, Box, 
  Divider, Alert, Card, CardContent, Chip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';

import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const userData = await userService.getProfile();
        setFormData({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          department: userData.department || '',
        });
        
        // Fetch leave balances
        const balances = await userService.getLeaveBalances();
        setLeaveBalances(balances);
      } catch (err) {
        setProfileError("Failed to load user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear success message when form is changed
    if (profileSuccess) setProfileSuccess(false);
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    // Clear success message when form is changed
    if (passwordSuccess) setPasswordSuccess(false);
  };
  
  const validateProfileForm = () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setProfileError("Please fill in all required fields");
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setProfileError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };
  
  const validatePasswordForm = () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError("Please fill in all password fields");
      return false;
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New password and confirmation do not match");
      return false;
    }
    
    if (passwordData.new_password.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return false;
    }
    
    return true;
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError(null);
    
    if (!validateProfileForm()) {
      return;
    }
    
    try {
      await userService.updateProfile(formData);
      setProfileSuccess(true);
      
      // Update context with new user info
      updateUser({
        ...user,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
    } catch (err) {
      setProfileError("Failed to update profile. Please try again.");
      console.error(err);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      await userService.changePassword(passwordData);
      setPasswordSuccess(true);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      setPasswordError("Failed to change password. Please check your current password.");
      console.error(err);
    }
  };
  
  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Profile Information</Typography>
          <Divider sx={{ mb: 3 }} />
          
          {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
          {profileSuccess && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}
          
          <form onSubmit={handleProfileSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="first_name"
                  label="First Name *"
                  value={formData.first_name}
                  onChange={handleProfileChange}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="last_name"
                  label="Last Name *"
                  value={formData.last_name}
                  onChange={handleProfileChange}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="email"
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  fullWidth
                  required
                  disabled
                  helperText="Email cannot be changed. Contact administrator for changes."
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="department"
                  label="Department"
                  value={formData.department}
                  onChange={handleProfileChange}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>Change Password</Typography>
              <Divider sx={{ mb: 3 }} />
              
              {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
              {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>Password changed successfully!</Alert>}
              
              <form onSubmit={handlePasswordSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      name="current_password"
                      label="Current Password *"
                      type="password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      name="new_password"
                      label="New Password *"
                      type="password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      name="confirm_password"
                      label="Confirm New Password *"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<LockResetIcon />}
                      >
                        Change Password
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Leave Balances</Typography>
                <Divider sx={{ mb: 2 }} />
                
                {leaveBalances.length === 0 ? (
                  <Typography>No leave balances available</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {leaveBalances.map((balance) => (
                      <Grid item xs={12} key={balance.leave_type.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1">{balance.leave_type.name}</Typography>
                          <Chip 
                            label={`${balance.remaining_days} days remaining`}
                            color={balance.remaining_days > 0 ? 'primary' : 'default'}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Profile;