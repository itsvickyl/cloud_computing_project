import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';
import { Company } from 'src/companies/entities/company.entity';

@Injectable()
export class JobsService {
  private jobs: Job[] = [];
  private idCounter = 1;

  create(createJobDto: CreateJobDto, companyId: number) {
    const job = new Job();
    job.id = this.idCounter++;
    Object.assign(job, createJobDto);
    job.createdBy = { id: companyId } as Company;
    job.appliers = [];
    job.savedByUsers = [];

    this.jobs.push(job);
    return Promise.resolve({ identifiers: [{ id: job.id }] });
  }

  async findAll(filters?: Record<string, any>) {
    if (!filters || Object.keys(filters).length === 0) {
      return this.jobs;
    }
    return this.jobs.filter((job) => {
      for (const key of Object.keys(filters)) {
        if ((job as any)[key] !== filters[key]) return false;
      }
      return true;
    });
  }

  findOne(id: number) {
    const job = this.jobs.find((j) => j.id === id);
    return Promise.resolve(job || null);
  }

  async findWhere(companyId: number) {
    return this.jobs.filter((j) => j.createdBy.id === companyId);
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    const job = this.jobs.find((j) => j.id === id);
    if (job) {
      Object.assign(job, updateJobDto);
    }
    return Promise.resolve({ affected: job ? 1 : 0 });
  }

  remove(id: number) {
    const index = this.jobs.findIndex((j) => j.id === id);
    if (index > -1) {
      this.jobs.splice(index, 1);
    }
    return Promise.resolve({ affected: index > -1 ? 1 : 0 });
  }
}
