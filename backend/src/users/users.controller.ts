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
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppliedService } from 'src/applied/applied.service';
import { SavedService } from 'src/saved/saved.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly appliedService: AppliedService,
    private readonly savedService: SavedService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(JWTAuthGuard)
  async getProfile(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId: number = req.user.id;
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: userId,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic,
      type: user.type,
    };
  }

  @Get('applications')
  @UseGuards(JWTAuthGuard)
  async getApplications(@Req() req) {
    const userId: number = req.user.id;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    const applications = await this.appliedService.findWhere({
      userId: { id: userId },
    });
    return applications;
  }

  @Get('saved')
  @UseGuards(JWTAuthGuard)
  async getMySavedJobs(@Req() req) {
    const userId: number = req.user.id;
    const savedJobs = await this.savedService.findWhere({ userId }, [
      'job',
      'job.createdBy',
    ]);

    return savedJobs;
  }

  @Get('check/applied/:jobId')
  @UseGuards(JWTAuthGuard)
  async checkHasApplied(@Req() req, @Param('jobId') jobId: string) {
    const userId: number = req.user.id;
    const applied = await this.appliedService.findWhere({
      jobId: { id: jobId },
      userId: { id: userId },
    });

    return applied.length > 0 ? applied[0].id : null;
  }

  @Get('check/saved/:jobId')
  @UseGuards(JWTAuthGuard)
  async checkHasSaved(@Req() req, @Param('jobId') jobId: string) {
    const userId: number = req.user.id;
    const savedJobs = await this.savedService.findWhere(
      {
        jobId,
        userId,
      },
      [],
    );

    return savedJobs.length > 0 ? savedJobs[0].jobId : null;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
