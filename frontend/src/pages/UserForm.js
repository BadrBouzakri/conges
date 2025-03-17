import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Paper, Typography, Button, TextField, Grid, Box, 
  FormControl, InputLabel, Select, MenuItem, Alert,
  Switch, FormControlLabel
} from '@mui/material';

import { userService } from '../services/userService';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    department: '',
    role: 'EMPLOYEE',
    is_active: true
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchUser = async () => {
        try {
          const user = await userService.getById(id);
          setFormData({
            ...user,
            password: '' // Don't show the password
          });
        } catch (err) {
          setError("Failed to load user data");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.first_name || !formData.last_name || 
        (!isEditMode && !formData.password) || !formData.role) {
      setError("Please fill in all required fields");
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Only include password if it's provided (for edit mode)
      const userData = {
        ...formData,
        password: formData.password || undefined
      };
      
      if (isEditMode) {
        await userService.update(id, userData);
      } else {
        await userService.create(userData);
      }
      
      navigate('/users');
    } catch (err) {
      setError("Failed to save user data. Please try again.");
      console.error(err);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEditMode ? 'Edit User' : 'New User'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              name="first_name"
              label="First Name *"
              value={formData.first_name}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="last_name"
              label="Last Name *"
              value={formData.last_name}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="email"
              label="Email *"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="password"
              label={isEditMode ? "Password (leave blank to keep current)" : "Password *"}
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required={!isEditMode}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="department"
              label="Department"
              value={formData.department || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Role *</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role *"
                required
              >
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
                <MenuItem value="APPROVER">Approver</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {isEditMode && (
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/users')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
              >
                {isEditMode ? 'Update' : 'Create'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default UserForm;