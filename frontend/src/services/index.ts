import api from './api';

export const dashboardService = {
    async getKPIs() {
        const response = await api.get('/dashboard/kpis');
        return response.data;
    },

    async getRecentActivity(limit = 10) {
        const response = await api.get('/dashboard/recent-activity', {
            params: { limit }
        });
        return response.data;
    }
};

export const assetService = {
    async getAll(params?: any) {
        const response = await api.get('/assets', { params });
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/assets', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/assets/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/assets/${id}`);
        return response.data;
    },

    async exportExcel() {
        const response = await api.get('/assets/export/excel', {
            responseType: 'blob'
        });

        // Criar link de download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'ativos.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    async importExcel(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/assets/import/excel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};

export const certificateService = {
    async getAll(params?: any) {
        const response = await api.get('/certificates', { params });
        return response.data;
    },

    async getExpiring(days = 30) {
        const response = await api.get('/certificates/expiring/soon', {
            params: { days }
        });
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/certificates', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/certificates/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/certificates/${id}`);
        return response.data;
    }
};

export const kbService = {
    async getAll(params?: any) {
        const response = await api.get('/kb', { params });
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`/kb/${id}`);
        return response.data;
    },

    async search(query: string) {
        const response = await api.get('/kb/search/related', {
            params: { query }
        });
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/kb', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/kb/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/kb/${id}`);
        return response.data;
    }
};

export const boletoService = {
    async getAll(params?: any) {
        const response = await api.get('/boletos', { params });
        return response.data;
    },

    async getPending() {
        const response = await api.get('/boletos/pending/list');
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/boletos', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/boletos/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/boletos/${id}`);
        return response.data;
    }
};

export const notificationService = {
    async getAll(isRead?: boolean) {
        const response = await api.get('/notifications', {
            params: isRead !== undefined ? { isRead } : {}
        });
        return response.data;
    },

    async markAsRead(id: string) {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },

    async markAllAsRead() {
        const response = await api.put('/notifications/read-all');
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    }
};

export const reportService = {
    async getAll() {
        const response = await api.get('/reports');
        return response.data;
    },

    async generate(data: any) {
        const response = await api.post('/reports/generate', data, {
            responseType: 'blob'
        });

        // Criar link de download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const filename = `relatorio_${data.type}_${Date.now()}.xlsx`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true };
    },

    async delete(id: string) {
        const response = await api.delete(`/reports/${id}`);
        return response.data;
    }
};

