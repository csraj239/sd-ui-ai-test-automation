import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserFlowService } from './user-flow.service';
import {
  CreateUserFlowDto,
  UpdateUserFlowDto,
  CreateUserFlowStepDto,
  UpdateUserFlowStepDto,
  ExecuteUserFlowDto,
} from './user-flow.dto';

@Controller('api/user-flows')
export class UserFlowController {
  constructor(private userFlowService: UserFlowService) {}

  @Post()
  async create(@Body() createUserFlowDto: CreateUserFlowDto) {
    return this.userFlowService.create(createUserFlowDto);
  }

  @Get()
  async findAll(@Query('projectId') projectId?: string) {
    return this.userFlowService.findAll(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userFlowService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserFlowDto: UpdateUserFlowDto,
  ) {
    return this.userFlowService.update(id, updateUserFlowDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.userFlowService.remove(id);
  }

  @Get(':id/steps')
  async getSteps(@Param('id') id: string) {
    return this.userFlowService.getStepsByUserFlowId(id);
  }

  @Post(':id/steps')
  async addStep(
    @Param('id') userFlowId: string,
    @Body() createStepDto: CreateUserFlowStepDto,
  ) {
    return this.userFlowService.addStep(userFlowId, createStepDto);
  }

  @Post(':id/steps/insert-after/:stepNumber')
  async insertStepAfter(
    @Param('id') userFlowId: string,
    @Param('stepNumber') stepNumber: string,
    @Body() createStepDto: CreateUserFlowStepDto,
  ) {
    const afterStepNumber = parseInt(stepNumber, 10);
    return this.userFlowService.insertStepAfter(userFlowId, createStepDto, afterStepNumber);
  }

  @Patch('steps/:stepId')
  async updateStep(
    @Param('stepId') stepId: string,
    @Body() updateStepDto: UpdateUserFlowStepDto,
  ) {
    return this.userFlowService.updateStep(stepId, updateStepDto);
  }

  @Delete('steps/:stepId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeStep(@Param('stepId') stepId: string) {
    return this.userFlowService.removeStep(stepId);
  }

  @Post(':id/execute')
  async executeUserFlow(
    @Param('id') userFlowId: string,
    @Body() executeDto: ExecuteUserFlowDto,
    @Query('appUrl') appUrl?: string,
  ) {
    try {
      const finalAppUrl = executeDto.appUrl || appUrl || 'http://localhost:3000';
      const result = await this.userFlowService.executeUserFlow(
        userFlowId,
        finalAppUrl,
        executeDto,
      );
      return {
        success: true,
        ...result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post(':id/stop-execution')
  async stopUserFlowExecution(@Param('id') userFlowId: string) {
    try {
      await this.userFlowService.stopExecution(userFlowId);
      return {
        success: true,
        message: 'Execution stopped successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post(':id/generate-test-cases')
  async generateTestCasesFromUserFlow(@Param('id') userFlowId: string) {
    try {
      const testCases = await this.userFlowService.generateTestCasesFromUserFlow(userFlowId);
      return {
        success: true,
        testCases,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
