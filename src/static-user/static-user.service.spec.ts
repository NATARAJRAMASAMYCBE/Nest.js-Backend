import { Test, TestingModule } from '@nestjs/testing';
import { StaticUserService } from './static-user.service';

describe('StaticUserService', () => {
    let service: StaticUserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StaticUserService],
        }).compile();

        service = module.get<StaticUserService>(StaticUserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
