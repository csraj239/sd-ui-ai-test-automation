import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScriptScenario } from '../../database/entities';
import { ScriptScenarioService } from './script-scenario.service';
import { ScriptScenarioController } from './script-scenario.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ScriptScenario])],
  controllers: [ScriptScenarioController],
  providers: [ScriptScenarioService],
  exports: [ScriptScenarioService],
})
export class ScriptScenarioModule {}
