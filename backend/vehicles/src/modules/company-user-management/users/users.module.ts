import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyUsersController } from './company-users.controller';
import { CompanyUser } from './entities/company-user.entity';
import { User } from './entities/user.entity';
import { UsersProfile } from './profiles/user.profile';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, CompanyUser])],
  controllers: [UsersController,CompanyUsersController],
  providers: [UsersService, UsersProfile],
  exports: [UsersService],
})
export class UsersModule {}
