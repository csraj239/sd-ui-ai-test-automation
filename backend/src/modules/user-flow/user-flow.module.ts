import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFlow, UserFlowStep } from '../../database/entities';
import { UserFlowService } from './user-flow.service';
import { UserFlowController } from './user-flow.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserFlow, UserFlowStep])],
  providers: [UserFlowService],
  controllers: [UserFlowController],
  exports: [UserFlowService],
})
export class UserFlowModule {}
