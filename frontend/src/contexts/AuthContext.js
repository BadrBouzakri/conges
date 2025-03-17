import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// Créer le contexte
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  isAdmin: false,
  isApprover: false,
  login: () => {},
  logout: () => {},
});

// Créer le provider
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApprover, setIsApprover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAdmin(currentUser?.is_admin || false);
        setIsApprover(currentUser?.is_approver || currentUser?.is_admin || false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setIsAuthenticated(true);
      
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsAdmin(currentUser?.is_admin || false);
      setIsApprover(currentUser?.is_approver || currentUser?.is_admin || false);
      
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Échec de la connexion' 
      };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setIsAdmin(false);
    setIsApprover(false);
  };

  // Fournir les valeurs et fonctions au contexte
  const value = {
    isAuthenticated,
    user,
    isAdmin,
    isApprover,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => useContext(AuthContext);

export default AuthContext;