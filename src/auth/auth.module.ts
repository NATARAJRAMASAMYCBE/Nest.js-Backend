import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/app-core/guards/jwt.guard';
import { RefreshGuard } from 'src/app-core/guards/refresh.guard';
import { DatabaseModule } from 'src/database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [JwtModule.register({}), DatabaseModule],
    controllers: [AuthController],
    providers: [AuthService, JwtAuthGuard, RefreshGuard],
    exports: [AuthService, JwtAuthGuard, RefreshGuard],
})
export class AuthModule {}
