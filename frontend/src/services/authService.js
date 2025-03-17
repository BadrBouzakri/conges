import api from './api';

// Service pour l'authentification
const authService = {
  // Fonction de login
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user_id,
        is_admin: response.data.is_admin,
        is_approver: response.data.is_approver
      }));
    }
    return response.data;
  },
  
  // Fonction de logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Récupérer l'utilisateur actuel
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },
  
  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Vérifier si l'utilisateur est admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.is_admin;
  },
  
  // Vérifier si l'utilisateur est approbateur
  isApprover: () => {
    const user = authService.getCurrentUser();
    return user && (user.is_approver || user.is_admin);
  }
};

export default authService;