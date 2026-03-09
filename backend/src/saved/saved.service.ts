import { Injectable } from '@nestjs/common';
import { CreateSavedDto } from './dto/create-saved.dto';
import { Saved } from './entities/saved.entity';
import { User } from 'src/users/entities/user.entity';
import { Job } from 'src/jobs/entities/job.entity';

@Injectable()
export class SavedService {
  private savedJobs: Saved[] = [];
  create(createSavedDto: CreateSavedDto, userId: number) {
    const savedJob = new Saved();
    savedJob.userId = userId;
    savedJob.jobId = createSavedDto.jobId;
    savedJob.user = { id: userId } as User;
    savedJob.job = { id: createSavedDto.jobId } as unknown as Job;

    this.savedJobs.push(savedJob);
    return Promise.resolve({ identifiers: [{ userId, jobId: createSavedDto.jobId }] });
  }

  findWhere(where: Record<string, any>, relations: string[]) {
    const results = this.savedJobs.filter((s) => {
      for (const key of Object.keys(where)) {
        if ((s as any)[key] !== where[key]) return false;
      }
      return true;
    });
    return Promise.resolve(results);
  }

  findOne(userId: number, jobId: number) {
    const savedJob = this.savedJobs.find((s) => s.userId === userId && s.jobId === jobId);
    return Promise.resolve(savedJob || null);
  }

  async remove(jobId: number, userId: number) {
    const index = this.savedJobs.findIndex(
      (s) => s.jobId === jobId && s.userId === userId,
    );
    if (index > -1) {
      this.savedJobs.splice(index, 1);
    }
    return true;
  }
}
