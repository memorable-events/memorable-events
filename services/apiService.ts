
import { ContentResponse, LoginResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log("API URL:", API_BASE_URL); // Debug log
// Temporary debug: check if URL is correct
if (typeof window !== 'undefined' && !window.location.host.includes('localhost')) {
    // alert(`Debug: API URL is ${API_BASE_URL}`); 
}

const getHeaders = () => {
    const token = sessionStorage.getItem('admin_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

export const api = {
    login: async (password: string): Promise<LoginResponse> => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    },

    getContent: async (): Promise<ContentResponse> => {
        const response = await fetch(`${API_BASE_URL}/content`);
        if (!response.ok) throw new Error('Failed to fetch content');
        return response.json();
    },

    // Generic CRUD operations
    // resource examples: 'indoor-decorations', 'outdoor-plans', 'cakes'
    createItem: async (resource: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/${resource}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const text = await response.text().catch(() => 'no body');
            console.error('createItem error', { resource, status: response.status, body: text });
            throw new Error(`Failed to create ${resource}: ${response.status}`);
        }
        return response.json();
    },

    updateItem: async (resource: string, id: number, data: any) => {
        const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const text = await response.text().catch(() => 'no body');
            console.error('updateItem error', { resource, id, status: response.status, body: text });
            throw new Error(`Failed to update ${resource}: ${response.status}`);
        }
        return response.json();
    },

    deleteItem: async (resource: string, id: number) => {
        const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) {
            const text = await response.text().catch(() => 'no body');
            console.error('deleteItem error', { resource, id, status: response.status, body: text });
            throw new Error(`Failed to delete ${resource}: ${response.status}`);
        }
        return true;
    },

    uploadFile: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const headers = getHeaders();
        // Remove Content-Type to let browser set it with boundary for multipart
        delete headers['Content-Type'];

        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Upload failed';
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error) errorMessage = errorJson.error;
            } catch (e) {
                errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        const data = await response.json();
        return data.url;
    },

    fetchReel: async (url: string) => {
        const token = sessionStorage.getItem('admin_token');
        const res = await fetch(`${API_BASE_URL}/fetch-reel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ url })
        });
        if (!res.ok) throw new Error('Fetch reel failed');
        return res.json();
    },

    sendInquiry: async (data: { name: string; email: string; type: string; message: string }) => {
        const response = await fetch(`${API_BASE_URL}/inquiry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to send inquiry');
        return response.json();
    },

    updateSettings: async (settings: any) => {
        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(settings)
        });
        if (!response.ok) throw new Error('Failed to update settings');
        return response.json();
    }
};
