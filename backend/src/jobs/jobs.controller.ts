import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { In, MoreThanOrEqual } from 'typeorm';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CompaniesService } from 'src/companies/companies.service';
import { User } from 'src/users/entities/user.entity';
// import { Roles } from 'src/decorators/roles.decorator';
// import { UserType } from 'src/users/entities/user.enum';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly companyService: CompaniesService,
  ) {}

  @UseGuards(JWTAuthGuard)
  @Post()
  async create(@Req() req, @Body() createJobDto: CreateJobDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const company = await this.companyService.findWhere((req.user as User).id);
    if (!company) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'Company not found',
      };
    }
    return this.jobsService.create(createJobDto, company.id);
  }

  @Get()
  findAll(@Query() queries: Record<string, string>) {
    const { type, createdAt } = queries;
    const filters = {};
    if (type) {
      filters['type'] = In(type.split(','));
    }
    if (createdAt !== 'all') {
      const now = new Date();
      const dateMap: Record<string, number> = {
        '1h': 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
      };
      const durationMs = dateMap[createdAt];
      filters['createdAt'] = MoreThanOrEqual(
        new Date(now.getTime() - durationMs),
      );
    }
    return this.jobsService.findAll(filters);
  }

  @Get('mine')
  @UseGuards(JWTAuthGuard)
  // @Roles(UserType.ORG)
  async findMine(@Req() req) {
    const company = await this.companyService.findWhere((req.user as User).id);
    if (!company) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'Company not found',
      };
    }

    return this.jobsService.findWhere(company.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JWTAuthGuard)
  // @Roles(UserType.ORG)
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(+id, updateJobDto);
  }

  @Delete(':id')
  @UseGuards(JWTAuthGuard)
  // @Roles(UserType.ORG)
  remove(@Param('id') id: string) {
    return this.jobsService.remove(+id);
  }
}
