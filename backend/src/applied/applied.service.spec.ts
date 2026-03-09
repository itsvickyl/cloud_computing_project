import { Test, TestingModule } from '@nestjs/testing';
import { AppliedService } from './applied.service';

describe('AppliedService', () => {
  let service: AppliedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppliedService],
    }).compile();

    service = module.get<AppliedService>(AppliedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
