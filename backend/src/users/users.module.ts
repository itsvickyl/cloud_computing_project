import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AppliedModule } from 'src/applied/applied.module';
import { SavedModule } from 'src/saved/saved.module';

@Module({
  imports: [AppliedModule, SavedModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
