import { JobType } from '../entities/job.enum';

export class CreateJobDto {
  title: string;
  resp: string;
  req: string;
  desc: string;
  // tags: string[];
  applyBy: Date;
  // industries: number[];
  minSalary: number;
  maxSalary: number;
  type: JobType;
  location: string;
}
