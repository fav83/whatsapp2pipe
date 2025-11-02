export const CONFIG = {
  backendUrl:
    import.meta.env.VITE_BACKEND_URL ||
    'https://func-whatsapp2pipe-prod.azurewebsites.net',
  websiteUrl:
    import.meta.env.VITE_WEBSITE_URL ||
    'https://dashboard.chat2deal.com',
  storage: {
    verificationCodeKey: 'verification_code',
  },
  endpoints: {
    authStart: '/api/auth/start',
    authCallback: '/api/auth/callback',
    userMe: '/api/user/me',
  },
} as const
