import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AwsService } from 'src/aws/aws.service';
import { JobsService } from 'src/jobs/jobs.service';
import { ResultsService } from 'src/results/results.service';
import { Result } from 'src/results/entities/result.entity';
import { ResumesService } from 'src/resumes/resumes.service';
import { UsersService } from 'src/users/users.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly jobService: JobsService,
    private readonly awsService: AwsService,
    private readonly userService: UsersService,
    private readonly resultService: ResultsService,
    private readonly resumeService: ResumesService,
  ) { }

  @UseGuards(JWTAuthGuard)
  @Post('predict')
  async getPrediction(@Body() inputDto: { jobId: number; applicants: number }) {
    const job = await this.jobService.findOne(inputDto.jobId);
    if (!job) {
      throw new NotFoundException();
    }
    const job_description = job.desc + job.req + job.resp;

    const predictionResult = await this.awsService.predict(
      job_description,
      inputDto.applicants,
    );

    const ranked_resumes = predictionResult.ranked_resumes as {
      match_score: number;
      email: string;
    }[];

    const resultsToSave: Result[] = [];

    for (let i = 0; i < ranked_resumes.length; i++) {
      const user = await this.userService.findByEmail(ranked_resumes[i].email);
      if (!user) {
        continue;
      }
      const resume = await this.resumeService.findByUserId(user.id);
      const d = {
        userId: user.id,
        rank: i + 1,
        score: ranked_resumes[i].match_score,
        resumeLink: resume?.resumeLink || '',
      };
      const r = this.resultService.create({
        ...d,
        jobId: job.id,
      });
      resultsToSave.push(r);
    }

    await this.resultService.bulkInsert(resultsToSave);

    return {
      success: true,
      message: 'Prediction complete',
    };
  }
}
