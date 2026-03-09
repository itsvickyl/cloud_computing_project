import { Job } from 'src/jobs/entities/job.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppliedStatus } from './applied.enum';

@Entity()
export class Applied {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AppliedStatus,
    default: AppliedStatus.APPLIED,
  })
  status: AppliedStatus;

  @Column()
  usedResume: string;

  // @Column({
  //   type: 'text',
  // })
  // cleanText: string;

  @ManyToOne(() => User, (user) => user.appliedJobs)
  @JoinColumn({ name: 'userId' })
  userId: User;

  @ManyToOne(() => Job, (job) => job.appliers)
  @JoinColumn({ name: 'jobId' })
  jobId: Job;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
