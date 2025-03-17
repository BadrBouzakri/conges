import api from './api';

// Service pour les demandes de congés
const leaveRequestService = {
  // Récupérer toutes les demandes de congés
  getLeaveRequests: async () => {
    const response = await api.get('/leave-requests');
    return response.data;
  },
  
  // Récupérer les demandes de congés de l'utilisateur connecté
  getUserLeaveRequests: async () => {
    const response = await api.get('/leave-requests/me');
    return response.data;
  },
  
  // Récupérer les demandes de congés en attente
  getPendingLeaveRequests: async () => {
    const response = await api.get('/leave-requests/pending');
    return response.data;
  },
  
  // Récupérer une demande de congé par ID
  getLeaveRequest: async (id) => {
    const response = await api.get(`/leave-requests/${id}`);
    return response.data;
  },
  
  // Créer une nouvelle demande de congé
  createLeaveRequest: async (leaveRequestData) => {
    const response = await api.post('/leave-requests', leaveRequestData);
    return response.data;
  },
  
  // Mettre à jour une demande de congé
  updateLeaveRequest: async (id, leaveRequestData) => {
    const response = await api.put(`/leave-requests/${id}`, leaveRequestData);
    return response.data;
  },
  
  // Approuver ou rejeter une demande de congé
  processLeaveRequest: async (id, status, comment) => {
    const response = await api.post(`/leave-requests/${id}/approve`, {
      status,
      response_comment: comment
    });
    return response.data;
  },
  
  // Supprimer une demande de congé
  deleteLeaveRequest: async (id) => {
    const response = await api.delete(`/leave-requests/${id}`);
    return response.data;
  },
  
  // Récupérer les demandes de congés pour un mois spécifique (calendrier)
  getLeaveRequestsForCalendar: async (year, month) => {
    const response = await api.get(`/leave-requests/calendar/${year}/${month}`);
    return response.data;
  }
};

export default leaveRequestService;