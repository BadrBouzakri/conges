import React, { useState, useEffect } from 'react';
import { Grid, Typography, Paper } from '@mui/material';
import { leaveTypeService } from '../services/leaveTypeService';

const Dashboard = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const types = await leaveTypeService.getLeaveTypes();
        setLeaveTypes(types);
      } catch (error) {
        console.error('Erreur lors du chargement des types de congés:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Types de congés disponibles
          </Typography>
          <Grid container spacing={2}>
            {leaveTypes.map((type) => (
              <Grid item xs={12} key={type.id}>
                <Typography>
                  {type.name} - {type.days_available} jours disponibles
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;