import { Job } from 'src/jobs/entities/job.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  desc: string;

  @Column()
  address: string;

  @Column()
  website: string;

  @Column({ nullable: true })
  linkedin: string;

  @Column({ nullable: true })
  xLink: string;

  @Column({ nullable: true })
  logo: string;

  @OneToMany(() => Job, (job) => job.createdBy)
  jobs: Job[];

  @OneToOne(() => User, (user) => user.company)
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
