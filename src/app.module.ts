import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { StaticUserModule } from './static-user/static-user.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        DatabaseModule,
        StaticUserModule,
        UserModule,
        ConfigModule.forRoot({
            isGlobal: true, // ✅ important
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
