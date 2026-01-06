
const getApiUrl = () => {
    // Get the env var
    let url = import.meta.env.VITE_API_URL;

    // If not set, allow dynamic local network access
    // This allows the phone to connect to http://192.168.x.x:10000 automatically
    if (!url) {
        const hostname = window.location.hostname;
        return `http://${hostname}:8001`;
    }

    // If protocol is missing (Render provided just the host), prepend https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
    }

    // Remove trailing slash
    return url.replace(/\/$/, '');
};

export const API_URL = getApiUrl();
