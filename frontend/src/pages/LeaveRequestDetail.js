import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Paper, Typography, Button, Chip, Grid, Box, 
  Divider, Card, CardContent, TextField, Alert, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import leaveRequestService from '../services/leaveRequestService';
import { useAuth } from '../contexts/AuthContext';

const LeaveRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [leaveRequest, setLeaveRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  
  useEffect(() => {
    const fetchLeaveRequest = async () => {
      try {
        const data = await leaveRequestService.getById(id);
        setLeaveRequest(data);
      } catch (error) {
        setError("Failed to load leave request details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveRequest();
  }, [id]);
  
  const getStatusChip = (status) => {
    let color;
    switch (status) {
      case 'PENDING':
        color = 'warning';
        break;
      case 'APPROVED':
        color = 'success';
        break;
      case 'REJECTED':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    return <Chip label={status} color={color} size="small" />;
  };
  
  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };
  
  const openDialog = (type) => {
    setActionType(type);
    setDialogOpen(true);
  };
  
  const closeDialog = () => {
    setDialogOpen(false);
    setActionType(null);
  };
  
  const handleAction = async () => {
    try {
      if (actionType === 'approve') {
        await leaveRequestService.approve(id, { comment });
      } else if (actionType === 'reject') {
        await leaveRequestService.reject(id, { comment });
      }
      
      // Refresh the leave request data
      const updatedRequest = await leaveRequestService.getById(id);
      setLeaveRequest(updatedRequest);
      setComment('');
      closeDialog();
    } catch (error) {
      setError(`Failed to ${actionType} leave request`);
      console.error(error);
    }
  };
  
  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  
  if (error) {
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
  
  if (!leaveRequest) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="warning">Leave request not found</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => navigate('/leave-requests')}>
            Back to Leave Requests
          </Button>
        </Box>
      </Paper>
    );
  }

  const canApprove = user.role === 'APPROVER' || user.role === 'ADMIN';
  const canEdit = leaveRequest.status === 'PENDING' && leaveRequest.user_id === user.id;
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Leave Request Details</Typography>
        <Box>
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/leave-requests/${id}/edit`)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => navigate('/leave-requests')}
          >
            Back
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Request Information</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 1 }}>{getStatusChip(leaveRequest.status)}</Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Leave Type</Typography>
                  <Typography variant="body1">{leaveRequest.leave_type.name}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Start Date</Typography>
                  <Typography variant="body1">
                    {new Date(leaveRequest.start_date).toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">End Date</Typography>
                  <Typography variant="body1">
                    {new Date(leaveRequest.end_date).toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">{leaveRequest.duration} working days</Typography>
                </Grid>
                
                {leaveRequest.reason && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Reason</Typography>
                    <Typography variant="body1">{leaveRequest.reason}</Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Requested By</Typography>
                  <Typography variant="body1">
                    {leaveRequest.user.first_name} {leaveRequest.user.last_name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Requested On</Typography>
                  <Typography variant="body1">
                    {new Date(leaveRequest.created_at).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {leaveRequest.status !== 'PENDING' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Decision Information</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Decision</Typography>
                    <Typography variant="body1">
                      {leaveRequest.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                    </Typography>
                  </Grid>
                  
                  {leaveRequest.approver && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Decided By</Typography>
                      <Typography variant="body1">
                        {leaveRequest.approver.first_name} {leaveRequest.approver.last_name}
                      </Typography>
                    </Grid>
                  )}
                  
                  {leaveRequest.updated_at && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Decided On</Typography>
                      <Typography variant="body1">
                        {new Date(leaveRequest.updated_at).toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                  
                  {leaveRequest.comment && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Comment</Typography>
                      <Typography variant="body1">{leaveRequest.comment}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        {leaveRequest.status === 'PENDING' && canApprove && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Decision</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TextField
                  label="Comment (optional)"
                  multiline
                  rows={4}
                  value={comment}
                  onChange={handleCommentChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => openDialog('reject')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => openDialog('approve')}
                  >
                    Approve
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
      
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {actionType} this leave request?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button 
            onClick={handleAction} 
            color={actionType === 'approve' ? 'success' : 'error'} 
            variant="contained"
            autoFocus
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LeaveRequestDetail;