const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
    throw new Error(
        'Missing VITE_API_URL in your environment file.'
    )
}

export const API_URL = apiUrl.replace(/\/$/, '')