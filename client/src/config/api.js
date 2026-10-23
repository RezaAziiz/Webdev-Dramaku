const trimTrailingSlashes = (value) => {
    let endIndex = value.length;
    while (endIndex > 0 && value[endIndex - 1] === '/') {
        endIndex -= 1;
    }
    return value.slice(0, endIndex);
};

const API_BASE_URL = trimTrailingSlashes(
    process.env.REACT_APP_API_URL ||
    'https://webdev-dramaku-production.up.railway.app'
);

export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    '193966095713-ooq3r03aaanmf67tudroa67ccctfqvk6.apps.googleusercontent.com';

export const apiUrl = (path) => `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;