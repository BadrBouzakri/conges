import api from './api';

// Service pour les types de congés
export const leaveTypeService = {
  // Récupérer tous les types de congés
  getLeaveTypes: async () => {
    const response = await api.get('/leave-types');
    return response.data;
  },
  
  // Récupérer un type de congé par ID
  getLeaveType: async (id) => {
    const response = await api.get(`/leave-types/${id}`);
    return response.data;
  },
  
  // Créer un nouveau type de congé
  createLeaveType: async (leaveTypeData) => {
    const response = await api.post('/leave-types', leaveTypeData);
    return response.data;
  },
  
  // Mettre à jour un type de congé
  updateLeaveType: async (id, leaveTypeData) => {
    const response = await api.put(`/leave-types/${id}`, leaveTypeData);
    return response.data;
  },
  
  // Supprimer un type de congé
  deleteLeaveType: async (id) => {
    const response = await api.delete(`/leave-types/${id}`);
    return response.data;
  }
};