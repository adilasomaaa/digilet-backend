import { Test, TestingModule } from '@nestjs/testing';
import { StudyProgramController } from './institution.controller';
import { StudyProgramService } from './institution.service';

describe('StudyProgramController', () => {
  let controller: StudyProgramController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudyProgramController],
      providers: [StudyProgramService],
    }).compile();

    controller = module.get<StudyProgramController>(StudyProgramController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
