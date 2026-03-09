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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from 'src/aws/aws.service';
// import { Roles } from 'src/decorators/roles.decorator';
// import { UserType } from 'src/users/entities/user.enum';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly awsService: AwsService,
  ) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  // @Roles(UserType.ORG)
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Req() req,
    @Body() createCompanyDto: CreateCompanyDto,
    @UploadedFile() file,
  ) {
    const userId: number = req.user.id;
    const logoUrl = await this.awsService.uploadFile(file, userId, 'logos');
    return this.companiesService.create({
      ...createCompanyDto,
      logo: logoUrl,
      createdBy: userId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JWTAuthGuard)
  // @Roles(UserType.ORG)
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(+id, updateCompanyDto);
  }

  @Delete(':id')
  @UseGuards(JWTAuthGuard)
  // @Roles(UserType.ORG)
  remove(@Param('id') id: string) {
    return this.companiesService.remove(+id);
  }
}
