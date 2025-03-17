import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Container,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ListAlt as ListAltIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { isAdmin, isApprover } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const menuItems = [
    { 
      text: 'Tableau de bord', 
      icon: <DashboardIcon />, 
      path: '/',
      roles: ['all']
    },
    { 
      text: 'Mes demandes', 
      icon: <ListAltIcon />, 
      path: '/leave-requests',
      roles: ['all']
    },
    { 
      text: 'Approbations', 
      icon: <AssignmentIcon />, 
      path: '/approvals',
      roles: ['approver', 'admin']
    },
    { 
      text: 'Utilisateurs', 
      icon: <PersonIcon />, 
      path: '/users',
      roles: ['admin']
    },
    { 
      text: 'Types de congés', 
      icon: <CategoryIcon />, 
      path: '/leave-types',
      roles: ['admin']
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Gestion des Congés
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;