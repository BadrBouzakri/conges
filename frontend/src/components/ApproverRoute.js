import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Composant pour protéger les routes qui nécessitent des privilèges d'approbateur
const ApproverRoute = ({ children }) => {
  const { isAuthenticated, isApprover, isLoading } = useAuth();

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Rediriger vers la page d'accueil si l'utilisateur n'est pas approbateur
  if (!isAuthenticated || !isApprover) {
    return <Navigate to="/" />;
  }

  // Afficher le contenu protégé si l'utilisateur est approbateur
  return children;
};

export default ApproverRoute;