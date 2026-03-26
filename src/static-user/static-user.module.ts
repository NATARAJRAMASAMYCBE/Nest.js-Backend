import { Module } from '@nestjs/common';
import { StaticUserService } from './static-user.service';
import { StaticUserController } from './static-user.controller';

@Module({
  controllers: [StaticUserController],
  providers: [StaticUserService],
})
export class StaticUserModule {}
