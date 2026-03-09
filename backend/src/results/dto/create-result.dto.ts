import { User } from 'src/users/entities/user.entity';

export class CreateResultDto {
  jobId: number;
  userId: number;
  rank: number;
  score: number;
  resumeLink: string;
}
