const paypalMode =
  import.meta.env.VITE_PAYPAL_MODE === 'live'
    ? 'live'
    : 'sandbox'

if (
    paypalMode !== 'sandbox'
    && paypalMode !== 'live'
) {
    throw new Error(
        'VITE_PAYPAL_MODE must be "sandbox" or "live".',
    )
}

const apiUrl =
  paypalMode === 'live'
    ? import.meta.env.VITE_API_URL
    : import.meta.env.VITE_SANDBOX_API_URL

if (!apiUrl) {
  throw new Error(
    paypalMode === 'live'
      ? 'Missing VITE_API_URL in your environment file.'
      : 'Missing VITE_SANDBOX_API_URL in your environment file.',
  )
}

export const API_URL =
  apiUrl.replace(/\/$/, '')