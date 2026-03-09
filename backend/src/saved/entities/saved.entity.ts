import { Job } from 'src/jobs/entities/job.entity';
import { User } from 'src/users/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index(['userId', 'jobId'], { unique: true })
@Entity()
export class Saved {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  jobId: number;

  @ManyToOne(() => User, (user) => user.savedJobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Job, (job) => job.savedByUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId', referencedColumnName: 'id' })
  job: Job;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
