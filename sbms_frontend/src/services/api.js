const API_URL = 'http://localhost:8000/api';

export const EligibilityProcessingService = {
    scanSchemes: async (uid) => {
        try {
            const response = await fetch(`${API_URL}/schemes/scan/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid }),
            });
            return await response.json();
        } catch (error) {
            console.error("Error scanning schemes:", error);
            throw error;
        }
    }
};

export const ProfileSyncService = {
    updateProfile: async (data) => {
        try {
            const response = await fetch(`${API_URL}/profile/update/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            return await response.json();
        } catch (error) {
            console.error("Error syncing profile:", error);
            throw error;
        }
    }
};

export const AdminAnalyticsSyncService = {
    getMetrics: async () => {
        try {
            const response = await fetch(`${API_URL}/admin/metrics/`, {
                method: 'GET',
            });
            return await response.json();
        } catch (error) {
            console.error("Error fetching metrics:", error);
            throw error;
        }
    },
    getGrievances: async () => {
        try {
            const response = await fetch(`${API_URL}/admin/grievances/`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching admin grievances:", error);
            throw error;
        }
    },
    resolveGrievance: async (grievanceId) => {
        try {
            const response = await fetch(`${API_URL}/admin/grievances/${grievanceId}/resolve/`, {
                method: 'POST'
            });
            return await response.json();
        } catch (error) {
            console.error("Error resolving grievance:", error);
            throw error;
        }
    },
    getAdvancedAnalytics: async (adminId) => {
        try {
            const response = await fetch(`${API_URL}/admin/analytics/`, {
                headers: { 'X-User-ID': adminId }
            });
            return await response.json();
        } catch (error) {
            console.error("Error fetching admin analytics:", error);
            throw error;
        }
    }
};

export const AuthService = {
    register: async (email, password, fullName) => {
        try {
            const response = await fetch(`${API_URL}/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, full_name: fullName }),
            });
            return await response.json();
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    },
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            return await response.json();
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },
    googleAuth: async (email, name) => {
        try {
            const response = await fetch(`${API_URL}/auth/google/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name }),
            });
            return await response.json();
        } catch (error) {
            console.error("Google Auth error:", error);
            throw error;
        }
    }
};

export const CitizenService = {
    getDashboardData: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/citizen/dashboard/${userId}/`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            throw error;
        }
    },
    getApplications: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/citizen/applications/${userId}/`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching applications:", error);
            throw error;
        }
    },
    applyScheme: async (userId, schemeId) => {
        try {
            const response = await fetch(`${API_URL}/citizen/applications/${userId}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scheme_id: schemeId })
            });
            return await response.json();
        } catch (error) {
            console.error("Error applying to scheme:", error);
            throw error;
        }
    },
    getGrievances: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/citizen/grievances/${userId}/`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching grievances:", error);
            throw error;
        }
    },
    submitGrievance: async (userId, complaint) => {
        try {
            const response = await fetch(`${API_URL}/citizen/grievances/${userId}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ complaint })
            });
            return await response.json();
        } catch (error) {
            console.error("Error submitting grievance:", error);
            throw error;
        }
    },
    searchSchemes: async (query, state, type) => {
        try {
            const response = await fetch(`${API_URL}/citizen/schemes/search/?q=${query}&state=${state}&type=${type}`);
            return await response.json();
        } catch (error) {
            console.error("Error searching schemes:", error);
            throw error;
        }
    },
    getProfile: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/citizen/profile/${userId}/`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching profile:", error);
            throw error;
        }
    },
    updateProfile: async (userId, data) => {
        try {
            const response = await fetch(`${API_URL}/citizen/profile/${userId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    },
    getAIRecommendations: async (userId, query = '') => {
        try {
            const response = await fetch(`${API_URL}/citizen/recommendations/${userId}/?q=${query}`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching AI recommendations:", error);
            throw error;
        }
    }
};
