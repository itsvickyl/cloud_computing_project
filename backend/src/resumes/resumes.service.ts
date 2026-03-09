import { Injectable } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { Resume } from './entities/resume.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ResumesService {
  private resumes: Resume[] = [];
  private idCounter = 1;

  create(
    createResumeDto: CreateResumeDto & {
      resumeLink: string;
    },
  ) {
    const resume = new Resume();
    resume.id = this.idCounter++;
    resume.name = createResumeDto.name;
    resume.resumeLink = createResumeDto.resumeLink;
    resume.uploadedBy = { id: +createResumeDto.userId } as User;

    this.resumes.push(resume);
    return Promise.resolve({ identifiers: [{ id: resume.id }] });
  }

  findByUserId(userId: number) {
    const resume = this.resumes.find((r) => r.uploadedBy.id === userId);
    return Promise.resolve(resume || null);
  }

  remove(id: number) {
    const index = this.resumes.findIndex((r) => r.id === id);
    if (index > -1) {
      this.resumes.splice(index, 1);
    }
    return Promise.resolve({ affected: index > -1 ? 1 : 0 });
  }
}
