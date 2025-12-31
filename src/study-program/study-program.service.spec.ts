import { Test, TestingModule } from '@nestjs/testing';
import { StudyProgramService } from './study-program.service';

describe('StudyProgramService', () => {
  let service: StudyProgramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudyProgramService],
    }).compile();

    service = module.get<StudyProgramService>(StudyProgramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
