import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from 'src/aws/aws.service';
// import { Roles } from 'src/decorators/roles.decorator';
// import { UserType } from 'src/users/entities/user.enum';

@Controller('resumes')
export class ResumesController {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly awsService: AwsService,
  ) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  // @Roles(UserType.USER)
  @UseInterceptors(FileInterceptor('resume'))
  async create(
    @Req() req,
    @Body() createResumeDto: CreateResumeDto,
    @UploadedFile() file,
  ) {
    const userId: number = req.user.id;
    const resumeUrl = await this.awsService.uploadFile(file, userId, 'resumes');
    // const cleanedTextData = await this.awsService.processPdf(resumeUrl);
    return this.resumesService.create({
      ...createResumeDto,
      resumeLink: resumeUrl,
      // cleanedResumeText: cleanedTextData.cleaned_text,
    });
  }

  @Delete(':id')
  @UseGuards(JWTAuthGuard)
  // @Roles(UserType.USER)
  remove(@Param('id') id: string) {
    return this.resumesService.remove(+id);
  }
}
