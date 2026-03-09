import { Applied } from 'src/applied/entities/applied.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Resume {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  resumeLink: string;

  // @Column({
  //   type: 'text',
  // })
  // cleanResumeText: string;

  @Column({ name: 'uploadedBy' })
  uploadedById: number;

  @OneToOne(() => User, (user) => user.resume)
  @JoinColumn({ name: 'uploadedBy', referencedColumnName: 'id' })
  uploadedBy: User;

  @OneToOne(() => Applied, (applied) => applied.usedResume)
  appliedJob: Applied;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
