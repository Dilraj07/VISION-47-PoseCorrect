import { API_URL } from './config';

/**
 * Helper to fetch data with Clerk JWT token and handle response
 */
async function fetchWithAuth(endpoint, options = {}, getToken) {
    let token = null;
    if (getToken) {
        try {
            token = await getToken();
        } catch (err) {
            console.error("Failed to get Clerk JWT token:", err);
        }
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { detail: response.statusText };
        }
        throw new Error(errorData.detail || 'API request failed');
    }

    return response.json();
}

/**
 * Fetch workouts history for the user
 */
export async function getWorkouts(getToken) {
    return fetchWithAuth('/api/workouts', {}, getToken);
}

/**
 * Save a new workout (Note: auto-saved by analysis endpoint if using video)
 */
export async function saveWorkout(workoutData, getToken) {
    return fetchWithAuth('/api/workouts', {
        method: 'POST',
        body: JSON.stringify(workoutData),
    }, getToken);
}

/**
 * Fetch user stats for profile
 */
export async function getStats(getToken) {
    return fetchWithAuth('/api/stats', {}, getToken);
}

/**
 * Determine if API handles video uploads or just regular requests
 * If uploading video, use FormData, do not set Content-Type so browser sets correct boundary
 */
export async function analyzeVideo(file, exerciseType, getToken) {
    let token = null;
    if (getToken) {
        try {
            token = await getToken();
        } catch (err) {
            console.error("Failed to get Clerk JWT:", err);
        }
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('exercise_type', exerciseType);

    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { detail: response.statusText };
        }
        throw new Error(errorData.detail || 'Video analysis failed');
    }

    return response.json();
}
