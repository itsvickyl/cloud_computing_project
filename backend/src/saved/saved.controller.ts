import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SavedService } from './saved.service';
import { CreateSavedDto } from './dto/create-saved.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { Roles } from 'src/decorators/roles.decorator';
// import { UserType } from 'src/users/entities/user.enum';

@Controller('saved')
export class SavedController {
  constructor(private readonly savedService: SavedService) { }

  @Post()
  @UseGuards(JWTAuthGuard)
  // @Roles(UserType.USER)
  create(@Req() req, @Body() createSavedDto: CreateSavedDto) {
    const userId: number = req.user.id;
    return this.savedService.create(createSavedDto, userId);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.savedService.findOne(+id);
  // }

  @Delete(':jobId')
  @UseGuards(JWTAuthGuard)
  // @Roles(UserType.USER)
  remove(@Req() req, @Param('jobId') jobId: string) {
    const userId: number = req.user.id;
    return this.savedService.remove(+jobId, userId);
  }
}
