export const jobTypes = [
  { id: 1, value: "full-time", label: "Full Time" },
  { id: 2, value: "part-time", label: "Part Time" },
  { id: 3, value: "contract", label: "Contract" },
  { id: 4, value: "internship", label: "Internship" },
  { id: 5, value: "temporary", label: "Temporary" },
];

export const locations = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Switzerland",
  "Australia",
  "New Zealand",
  "Japan",
  "Singapore",
  "South Korea",
  "India",
  "Remote",
];

export const timeFilterOptions = [
  { id: 1, value: "all", label: "All Time" },
  { id: 2, value: "1h", label: "Last Hour" },
  { id: 3, value: "1d", label: "Last 24 Hours" },
  { id: 4, value: "7d", label: "Last 7 Days" },
  { id: 5, value: "30d", label: "Last 30 Days" },
  { id: 6, value: "90d", label: "Last 90 Days" },
];

export const TOKEN_REFRESH_THRESHOLD_MS = 30 * 1000;

export const MIN_DESCRIPTION_LENGTH = 50;

export const MAX_JOB_TITLE_LENGTH = 200;

export const MIN_JOB_DESCRIPTION_LENGTH = 10;

export const MAX_JOB_DESCRIPTION_LENGTH = 5000;

export const MAX_TWITTER_HANDLE_LENGTH = 15;

export const JOBS_PER_PAGE = 10;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
} as const;

export const CACHE = {
  FIRESTORE_SIZE_BYTES: 40 * 1024 * 1024,

  QUERY_STALE_TIME: 2 * 60 * 1000,
  QUERY_GC_TIME: 5 * 60 * 1000,
} as const;

export const FILE_LIMITS = {
  MAX_RESUME_SIZE: 5 * 1024 * 1024,
  MAX_IMAGE_SIZE: 2 * 1024 * 1024,
  MAX_LOGO_SIZE: 2 * 1024 * 1024,
} as const;

export const VALIDATION = {
  JOB_TITLE_MIN_LENGTH: 1,
  JOB_TITLE_MAX_LENGTH: 200,
  JOB_DESCRIPTION_MIN_LENGTH: 10,
  JOB_DESCRIPTION_MAX_LENGTH: 5000,
  COMPANY_NAME_MIN_LENGTH: 1,
  COMPANY_NAME_MAX_LENGTH: 200,
  MIN_SALARY: 0,
  MAX_SALARY: 10000000,
  MIN_LISTING_DURATION: 1,
  MAX_LISTING_DURATION: 365,
  MIN_DESCRIPTION_LENGTH: 50,
  MAX_TWITTER_HANDLE_LENGTH: 15,
} as const;

export const TIME_FILTERS = {
  ONE_HOUR: 60 * 60 * 1000,
  TWENTY_FOUR_HOURS: 24 * 60 * 60 * 1000,
  SEVEN_DAYS: 7 * 24 * 60 * 60 * 1000,
  THIRTY_DAYS: 30 * 24 * 60 * 60 * 1000,
  NINETY_DAYS: 90 * 24 * 60 * 60 * 1000,
} as const;

export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  FILE_UPLOADS_PER_HOUR: 10,
  JOB_POSTS_PER_DAY: 20,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
} as const;

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

export const REDIRECT_DELAY_MS = 1500;
