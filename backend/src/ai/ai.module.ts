import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { JobsModule } from 'src/jobs/jobs.module';
import { AwsModule } from 'src/aws/aws.module';
import { ResultsModule } from 'src/results/results.module';
import { UsersModule } from 'src/users/users.module';
import { ResumesModule } from 'src/resumes/resumes.module';

@Module({
  imports: [JobsModule, AwsModule, ResultsModule, UsersModule, ResumesModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
