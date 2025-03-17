import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Typography, Button, Chip, IconButton, Box, Tooltip, TablePagination 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { leaveRequestService } from '../services/leaveRequestService';
import { useAuth } from '../contexts/AuthContext';

const LeaveRequestList = ({ isApprovalPage = false }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        let data;
        if (isApprovalPage) {
          data = await leaveRequestService.getPendingApprovals();
        } else {
          data = await leaveRequestService.getAll();
        }
        setLeaveRequests(data);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [isApprovalPage]);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      try {
        await leaveRequestService.deleteLeaveRequest(id);
        setLeaveRequests(leaveRequests.filter(request => request.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          {isApprovalPage ? 'Pending Approvals' : 'Leave Requests'}
        </Typography>
        {!isApprovalPage && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/leave-requests/new"
          >
            New Request
          </Button>
        )}
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : leaveRequests.length === 0 ? (
        <Typography>No leave requests found.</Typography>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveRequests
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.leave_type.name}</TableCell>
                      <TableCell>{new Date(request.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(request.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>{request.duration} days</TableCell>
                      <TableCell>{getStatusChip(request.status)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/leave-requests/${request.id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {request.status === 'PENDING' && request.user_id === user.id && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/leave-requests/${request.id}/edit`)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(request.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={leaveRequests.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Paper>
  );
};

export default LeaveRequestList;