import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './app-core/guards/jwt.guard';
import { TokenRefreshInterceptor } from './app-core/interceptors/token-refresh.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { StaticUserModule } from './static-user/static-user.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // ✅ important
        }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('JWT_ACCESS_SECRET'),
                signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRES') ?? '15m' },
            }),
        }),
        AuthModule,
        DatabaseModule,
        StaticUserModule,
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService, JwtService, { provide: APP_GUARD, useClass: JwtAuthGuard }, { provide: APP_INTERCEPTOR, useClass: TokenRefreshInterceptor }],
})
export class AppModule {}
