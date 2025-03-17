import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Paper, Typography, Button, TextField, Grid, Box, 
  FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { leaveRequestService } from '../services/leaveRequestService';
import { leaveTypeService } from '../services/leaveTypeService';
import { useAuth } from '../contexts/AuthContext';

const LeaveRequestForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: null,
    end_date: null,
    reason: '',
  });
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch leave types
        const types = await leaveTypeService.getAll();
        setLeaveTypes(types);

        // If edit mode, fetch the leave request
        if (isEditMode) {
          const request = await leaveRequestService.getById(id);
          
          // Only allow editing if the request is PENDING and belongs to the user
          if (request.status !== 'PENDING' || request.user_id !== user.id) {
            setError("You cannot edit this leave request.");
            return;
          }
          
          setFormData({
            leave_type_id: request.leave_type_id,
            start_date: new Date(request.start_date),
            end_date: new Date(request.end_date),
            reason: request.reason || '',
          });
          setDuration(request.duration);
        }
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, user.id]);

  useEffect(() => {
    // Calculate duration when dates change
    if (formData.start_date && formData.end_date) {
      const calculateDuration = async () => {
        try {
          const response = await leaveRequestService.calculateDuration(
            formData.start_date.toISOString().split('T')[0],
            formData.end_date.toISOString().split('T')[0]
          );
          setDuration(response.duration);
        } catch (err) {
          console.error("Failed to calculate duration:", err);
        }
      };
      calculateDuration();
    }
  }, [formData.start_date, formData.end_date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.leave_type_id || !formData.start_date || !formData.end_date) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        ...formData,
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date.toISOString().split('T')[0],
      };

      if (isEditMode) {
        await leaveRequestService.update(id, payload);
      } else {
        await leaveRequestService.create(payload);
      }

      navigate('/leave-requests');
    } catch (err) {
      setError("Failed to save leave request. Please try again.");
      console.error(err);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error && isEditMode) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => navigate('/leave-requests')}>
            Back to Leave Requests
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEditMode ? 'Edit Leave Request' : 'New Leave Request'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Leave Type *</InputLabel>
              <Select
                name="leave_type_id"
                value={formData.leave_type_id}
                onChange={handleChange}
                label="Leave Type *"
                required
              >
                {leaveTypes.map(type => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date *"
                value={formData.start_date}
                onChange={(date) => handleDateChange('start_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date *"
                value={formData.end_date}
                onChange={(date) => handleDateChange('end_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                minDate={formData.start_date || undefined}
              />
            </Grid>
          </LocalizationProvider>

          {duration > 0 && (
            <Grid item xs={12} md={6}>
              <TextField
                label="Duration (working days)"
                value={duration}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              name="reason"
              label="Reason"
              value={formData.reason}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/leave-requests')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
              >
                {isEditMode ? 'Update' : 'Submit'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default LeaveRequestForm;