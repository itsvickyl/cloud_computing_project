

export const ROUTES = {
  // Public routes
  HOME: '/',
  PRICING: '/pricing',

  // Authentication routes
  LOGIN: '/login',
  REGISTER: '/register',
  AUTH_CALLBACK: '/auth/callback',
  AUTH_ERROR: '/auth/error',

  // Job routes
  POST_JOB: '/post-job',
  MY_JOBS: '/my-jobs',

  // User routes
  FAVORITES: '/favorites',
  MY_APPLICATIONS: '/my-applications',
  MY_JOB_APPLICATIONS: '/my-job-applications',

  
} as const;


export const getDynamicRoute = {
  
  job: (jobId: string | number) => `/job/${jobId}`,

  
  editJob: (jobId: string | number) => `/edit-job/${jobId}`,


  loginWithRedirect: (redirectPath: string) =>
    `${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectPath)}`,

 
  registerWithRedirect: (redirectPath?: string, isNew?: boolean) => {
    const params = new URLSearchParams();
    if (redirectPath) params.set('redirect', redirectPath);
    if (isNew) params.set('new', 'true');
    return `${ROUTES.REGISTER}${params.toString() ? `?${params.toString()}` : ''}`;
  },

  registerWithError: (error: string) =>
    `${ROUTES.REGISTER}?error=${encodeURIComponent(error)}`,


  loginWithError: (error: string) =>
    `${ROUTES.LOGIN}?error=${encodeURIComponent(error)}`,
} as const;


export const isRoute = {
  
  home: (path: string) => path === ROUTES.HOME,


  auth: (path: string) =>
    path.startsWith(ROUTES.LOGIN) ||
    path.startsWith(ROUTES.REGISTER) ||
    path.startsWith(ROUTES.AUTH_CALLBACK) ||
    path.startsWith(ROUTES.AUTH_ERROR),

 
  protected: (path: string) =>
    path.startsWith(ROUTES.POST_JOB) ||
    path.startsWith(ROUTES.MY_JOBS) ||
    path.startsWith(ROUTES.FAVORITES) ||
    path.startsWith(ROUTES.MY_APPLICATIONS) ||
    path.startsWith(ROUTES.MY_JOB_APPLICATIONS) ||
    path.startsWith('/edit-job'),
} as const;
