import { Injectable } from '@nestjs/common';
import { UpdateAppliedDto } from './dto/update-applied.dto';
import { Applied } from './entities/applied.entity';
import { User } from 'src/users/entities/user.entity';
import { Job } from 'src/jobs/entities/job.entity';

@Injectable()
export class AppliedService {
  private appliedList: Applied[] = [];
  private idCounter = 1;

  create(userId: number, jobId: number, usedResume: string) {
    const applied = new Applied();
    applied.id = this.idCounter++;
    applied.userId = { id: userId } as User;
    applied.jobId = { id: jobId } as Job;
    applied.usedResume = usedResume;

    this.appliedList.push(applied);
    return Promise.resolve({ identifiers: [{ id: applied.id }] });
  }

  findAll() {
    return Promise.resolve(this.appliedList);
  }

  findOne(id: number) {
    const result = this.appliedList.filter((a) => a.id === id);
    return Promise.resolve(result);
  }

  findWhere(where: Record<string, any>) {
    const results = this.appliedList.filter((a) => {
      for (const key of Object.keys(where)) {
        if (key === 'userId' && a.userId.id !== where[key]?.id) return false;
        if (key === 'jobId' && a.jobId.id !== where[key]?.id) return false;
      }
      return true;
    });
    return Promise.resolve(results);
  }

  update(id: number, updateAppliedDto: UpdateAppliedDto) {
    const applied = this.appliedList.find((a) => a.id === id);
    if (applied) {
      Object.assign(applied, updateAppliedDto);
    }
    return Promise.resolve(applied);
  }

  remove(id: number) {
    const index = this.appliedList.findIndex((a) => a.id === id);
    if (index > -1) {
      this.appliedList.splice(index, 1);
    }
    return Promise.resolve({ affected: index > -1 ? 1 : 0 });
  }
}
