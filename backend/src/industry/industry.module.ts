import { Module } from '@nestjs/common';
import { IndustryService } from './industry.service';
import { IndustryController } from './industry.controller';

@Module({
  imports: [],
  controllers: [IndustryController],
  providers: [IndustryService],
})
export class IndustryModule { }
