import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../database/entities';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create(createProjectDto);
    return this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ['testPlans'],
    });
  }

  async findOne(id: string): Promise<Project | null> {
    return this.projectRepository.findOne({
      where: { id },
      relations: ['testPlans'],
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project | null> {
    await this.projectRepository.update(id, updateProjectDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }

  async getStats(id: string) {
    const project = await this.findOne(id);
    if (!project) throw new Error('Project not found');
    return {
      totalProjects: 1,
      totalTestPlans: project.testPlans?.length || 0,
      totalTestScenarios: 0, // Will aggregate from related scenarios
    };
  }
}
