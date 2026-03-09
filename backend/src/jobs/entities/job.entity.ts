import { Applied } from 'src/applied/entities/applied.entity';
import { Company } from 'src/companies/entities/company.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobStatus, JobType } from './job.enum';
import { Industry } from 'src/industry/entities/industry.entity';
import { Saved } from 'src/saved/entities/saved.entity';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  desc: string;

  // TODO: fix this
  // @Column('text', { array: true })
  // tags: string[];

  @ManyToMany(() => Industry, (industry) => industry.jobs)
  industries: Industry[];

  @Column()
  resp: string;

  @Column()
  req: string;

  @Column()
  location: string;

  @Column()
  applyBy: Date;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.OPEN,
  })
  status: JobStatus;

  @Column({ default: 0 })
  applicants: number;

  @Column()
  minSalary: number;

  @Column()
  maxSalary: number;

  @Column({
    type: 'enum',
    enum: JobType,
    default: JobType.FULL,
  })
  type: JobType;

  @OneToMany(() => Applied, (applied) => applied.jobId)
  appliers: Applied[];

  @ManyToOne(() => Company, (company) => company.jobs)
  @JoinColumn({ name: 'createdBy' })
  createdBy: Company;

  @OneToMany(() => Saved, (saved) => saved.job)
  savedByUsers: Saved[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
