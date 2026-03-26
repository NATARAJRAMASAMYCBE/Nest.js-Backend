import { Test, TestingModule } from '@nestjs/testing';
import { StaticUserController } from './static-user.controller';
import { StaticUserService } from './static-user.service';

describe('StaticUserController', () => {
  let controller: StaticUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaticUserController],
      providers: [StaticUserService],
    }).compile();

    controller = module.get<StaticUserController>(StaticUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
