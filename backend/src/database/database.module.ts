import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  Project,
  TestPlan,
  TestScenario,
  ScriptScenario,
  TestSuite,
  TestExecution,
  ExecutionReport,
  UserFlow,
  UserFlowStep,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = {
          type: 'postgres' as const,
          host: configService.get('DB_HOST'),
          port: parseInt(configService.get('DB_PORT') || '5432'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [
            Project,
            TestPlan,
            TestScenario,
            ScriptScenario,
            TestSuite,
            TestExecution,
            ExecutionReport,
            UserFlow,
            UserFlowStep,
          ],
          synchronize: process.env.NODE_ENV !== 'production',
          logging: process.env.NODE_ENV === 'development',
          ssl: false,
          extra: {
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 10000,
          },
        };
        
        console.log('Database configuration:', {
          host: config.host,
          port: config.port,
          username: config.username,
          database: config.database,
        });
        
        return config;
      },
    }),
  ],
})
export class DatabaseModule {}
