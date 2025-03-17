import api from './api';

// Service pour les utilisateurs
export const userService = {
  // Récupérer tous les utilisateurs
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  // Récupérer un utilisateur par ID
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  // Récupérer le profil de l'utilisateur connecté
  getCurrentUserProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  // Créer un nouvel utilisateur
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  // Mettre à jour un utilisateur
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  // Mettre à jour le profil de l'utilisateur connecté
  updateCurrentUserProfile: async (userData) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },
  
  // Supprimer un utilisateur
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  
  // Récupérer la liste des approbateurs
  getApprovers: async () => {
    const response = await api.get('/users/approvers');
    return response.data;
  },

  // Mettre à jour le profil de l'utilisateur connecté
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  }
};