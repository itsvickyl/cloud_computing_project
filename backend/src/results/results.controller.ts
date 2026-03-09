import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ResultsService } from './results.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  create(@Body() createResultDto: CreateResultDto) {
    return this.resultsService.create(createResultDto);
  }

  @Get(':jobId')
  findOne(@Param('jobId') jobId: string) {
    return this.resultsService.findResultsWhere({ jobId: +jobId });
  }

  @Get(':jobId/check')
  checkResult(@Param('jobId') jobId: string) {
    return this.resultsService.check({ jobId: +jobId });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateResultDto: UpdateResultDto) {
    return this.resultsService.update(+id, updateResultDto);
  }
}
