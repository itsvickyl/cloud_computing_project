export interface User {
  id: number;
  username?: string;
  email: string;
  password: string;
  // emailVerified?: Date;
  profilePic?: string;
  type?: "org" | "user";
  // onboardingComplete: boolean;
  // companyId?: string;
  // jobSeekerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Applied {
  id: number;
  status: "applied" | "rejected" | "interviewing" | "archieved";
  usedResume: string;
  userId: User;
  jobId: Job;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  desc: string;
  website: string;
  logo: string;
  xAccount?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobSeeker {
  id: string;
  name: string;
  about: string;
  resume: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: number;
  title: string;
  desc: string;
  type: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  applyBy: Date;
  resp: string;
  req: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: Company;
}

export interface SavedJob {
  id: number;
  jobId: number;
  job: Job;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobSeekerId: string;
  resume: string;
  coverLetter?: string;
  prevPosition?: string;
  prevCompany?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rank {
  resumeLink: string;
  rank: number;
  score: number;
  user: User;
}

export interface Result {
  id: number;
  jobId: number;
  ranking: Rank[];
}

export type UserType = "COMPANY" | "JOB_SEEKER";
export type JobStatus = "DRAFT" | "ACTIVE" | "EXPIRED";
