import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import leaveRequestService from '../services/leaveRequestService';
import leaveTypeService from '../services/leaveTypeService';

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const statusIcons = {
  pending: <HourglassEmptyIcon />,
  approved: <CheckIcon />,
  rejected: <CloseIcon />,
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const { isApprover } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Charger le profil utilisateur
        const userProfileData = await userService.getCurrentUserProfile();
        setUserProfile(userProfileData);

        // Charger les demandes récentes de l'utilisateur
        const userRequests = await leaveRequestService.getUserLeaveRequests();
        setRecentRequests(userRequests.slice(0, 5)); // 5 dernières demandes

        // Charger les demandes en attente si l'utilisateur est approbateur
        if (isApprover) {
          const pendingRequestsData = await leaveRequestService.getPendingLeaveRequests();
          setPendingRequests(pendingRequestsData.slice(0, 5)); // 5 dernières demandes en attente
        }

        // Simuler le chargement des soldes de congés (à remplacer par un vrai appel API)
        // Note: l'API actuelle n'a pas d'endpoint pour récupérer les soldes, donc on simule
        setTimeout(() => {
          setLeaveBalances([
            { name: 'Congés payés', balance: 20 },
            { name: 'Repos compensatoire', balance: 5 },
          ]);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isApprover]);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tableau de bord
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/leave-requests/new')}
        >
          Nouvelle demande
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Soldes de congés */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Mes soldes de congés
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {leaveBalances.length > 0 ? (
              <List>
                {leaveBalances.map((balance, index) => (
                  <ListItem key={index} divider={index < leaveBalances.length - 1}>
                    <ListItemText primary={balance.name} />
                    <Chip
                      label={`${balance.balance} jours`}
                      color={balance.balance > 0 ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">Aucun solde disponible</Typography>
            )}
          </Paper>
        </Grid>

        {/* Demandes récentes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Mes demandes récentes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentRequests.length > 0 ? (
              <List>
                {recentRequests.map((request) => (
                  <ListItem
                    key={request.id}
                    button
                    onClick={() => navigate(`/leave-requests/${request.id}`)}
                    divider
                  >
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item xs={8}>
                        <ListItemText
                          primary={`Du ${formatDate(request.start_date)} au ${formatDate(request.end_date)}`}
                          secondary={`${request.days_count} jour(s)`}
                        />
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Chip
                          icon={statusIcons[request.status]}
                          label={request.status === 'pending' ? 'En attente' : request.status === 'approved' ? 'Approuvé' : 'Refusé'}
                          color={statusColors[request.status]}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">Aucune demande récente</Typography>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/leave-requests')}
                endIcon={<AssignmentIcon />}
              >
                Voir toutes mes demandes
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Demandes en attente (pour les approbateurs) */}
        {isApprover && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Demandes en attente d'approbation
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {pendingRequests.length > 0 ? (
                <List>
                  {pendingRequests.map((request) => (
                    <ListItem
                      key={request.id}
                      button
                      onClick={() => navigate(`/leave-requests/${request.id}`)}
                      divider
                    >
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item xs={4}>
                          <ListItemText
                            primary={`Employé: ${request.employee_name || 'N/A'}`}
                            secondary={`Type: ${request.leave_type_name || 'N/A'}`}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <ListItemText
                            primary={`Du ${formatDate(request.start_date)} au ${formatDate(request.end_date)}`}
                            secondary={`${request.days_count} jour(s)`}
                          />
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/leave-requests/${request.id}`);
                            }}
                          >
                            Traiter
                          </Button>
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">Aucune demande en attente</Typography>
              )}
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/approvals')}
                  endIcon={<AssignmentIcon />}
                >
                  Voir toutes les demandes en attente
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;