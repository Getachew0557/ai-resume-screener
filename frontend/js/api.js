const API_BASE = 'http://localhost:8000/api';

export const api = {
    async getJDs() {
        const res = await fetch(`${API_BASE}/jds`);
        if (!res.ok) throw new Error('Failed to fetch JDs');
        return res.json();
    },

    async uploadJD(formData) {
        const res = await fetch(`${API_BASE}/jds/upload`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Failed to upload JD');
        return res.json();
    },

    async screenResume(formData) {
        const res = await fetch(`${API_BASE}/screen`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Failed to screen resume');
        return res.json();
    }
};
