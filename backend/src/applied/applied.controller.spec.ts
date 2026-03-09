import { Test, TestingModule } from '@nestjs/testing';
import { AppliedController } from './applied.controller';
import { AppliedService } from './applied.service';

describe('AppliedController', () => {
  let controller: AppliedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppliedController],
      providers: [AppliedService],
    }).compile();

    controller = module.get<AppliedController>(AppliedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
