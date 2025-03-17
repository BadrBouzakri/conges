import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Paper, Typography, Button, Chip, Grid, Box, 
  Divider, Card, CardContent, TextField, Alert, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import { leaveRequestService } from '../services/leaveRequestService';
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
        const data = await leaveRequestService.getLeaveRequest(id);
        setLeaveRequest(data);
      } catch (error) {
        setError("Failed to load leave request details");
        console.error('Erreur lors du chargement de la demande:', error);
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
        await leaveRequestService.approveLeaveRequest(id);
      } else if (actionType === 'reject') {
        await leaveRequestService.rejectLeaveRequest(id);
      }
      
      // Refresh the leave request data
      const updatedRequest = await leaveRequestService.getLeaveRequest(id);
      setLeaveRequest(updatedRequest);
      setComment('');
      closeDialog();
    } catch (error) {
      setError(`Failed to ${actionType} leave request`);
      console.error('Erreur lors de l\'approbation:', error);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
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
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/leave-requests')}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Détails de la demande de congés
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">
              Type de congé
            </Typography>
            <Typography variant="body1">{leaveRequest.leave_type.name}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">
              Statut
            </Typography>
            <Chip
              label={leaveRequest.status}
              color={
                leaveRequest.status === 'APPROVED'
                  ? 'success'
                  : leaveRequest.status === 'REJECTED'
                  ? 'error'
                  : 'warning'
              }
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">
              Date de début
            </Typography>
            <Typography variant="body1">
              {new Date(leaveRequest.start_date).toLocaleDateString()}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">
              Date de fin
            </Typography>
            <Typography variant="body1">
              {new Date(leaveRequest.end_date).toLocaleDateString()}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">
              Commentaire
            </Typography>
            <Typography variant="body1">{leaveRequest.comment || 'Aucun commentaire'}</Typography>
          </Grid>

          {leaveRequest.status === 'PENDING' && canApprove && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => openDialog('reject')}
                >
                  Rejeter
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => openDialog('approve')}
                >
                  Approuver
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

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
    </Box>
  );
};

export default LeaveRequestDetail;