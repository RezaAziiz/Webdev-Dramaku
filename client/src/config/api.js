const trimTrailingSlashes = (value) => {
    let endIndex = value.length;
    while (endIndex > 0 && value[endIndex - 1] === '/') {
        endIndex -= 1;
    }
    return value.slice(0, endIndex);
};

const getApiBaseUrl = () => {
    const configuredUrl =
        process.env.REACT_APP_API_URL ||
        'https://webdev-dramaku-production.up.railway.app';

    if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
        return configuredUrl;
    }

    const url = new URL(configuredUrl);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        url.hostname = window.location.hostname;
    }
    return url.toString();
};

const API_BASE_URL = trimTrailingSlashes(getApiBaseUrl());

export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const apiUrl = (path) => `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;