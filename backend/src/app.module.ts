import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature Modules (all DB-free now)
import { ResumesModule } from './resumes/resumes.module';
import { AppliedModule } from './applied/applied.module';
import { ResultsModule } from './results/results.module';
import { IndustryModule } from './industry/industry.module';
import { AuthModule } from './auth/auth.module';
import { AwsModule } from './aws/aws.module';
import { AiModule } from './ai/ai.module';
import { SavedModule } from './saved/saved.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { CompaniesModule } from './companies/companies.module';

import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // ✅ All modules are now DB-free with in-memory stubs
    UsersModule,
    JobsModule,
    CompaniesModule,
    ResumesModule,
    AppliedModule,
    ResultsModule,
    IndustryModule,
    AuthModule,
    AwsModule,
    AiModule,
    SavedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
