import { Module } from '@nestjs/common';
import { AppliedService } from './applied.service';
import { AppliedController } from './applied.controller';
import { ResumesModule } from 'src/resumes/resumes.module';

@Module({
  imports: [ResumesModule],
  controllers: [AppliedController],
  providers: [AppliedService],
  exports: [AppliedService],
})
export class AppliedModule { }
