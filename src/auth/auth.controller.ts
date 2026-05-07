import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, Response, UseGuards } from '@nestjs/common';
import type { Response as Res } from 'express';
import { Public } from 'src/app-core/decorators/public.decorator';
import { SkipTokenRefresh } from 'src/app-core/decorators/skip-refresh.decorator';
import { RefreshGuard } from 'src/app-core/guards/refresh.guard';
import { AuthService } from './auth.service';
import { clearAuthCookies, setAuthCookies } from './cookie.helper';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) {}

    @Public()
    @SkipTokenRefresh()
    @Post('register')
    @HttpCode(HttpStatus.OK)
    async register(@Body() dto: RegisterDto, @Response({ passthrough: true }) res: Res) {
        const result = await this.auth.register(dto);
        setAuthCookies(res, result.data.accessToken, result.data.refreshToken);
        return {
            isSuccess: result.isSuccess,
            message: result.message,
        };
    }

    @Public()
    @SkipTokenRefresh()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto, @Response({ passthrough: true }) res: Res) {
        const result = await this.auth.login(dto);
        setAuthCookies(res, result.data.accessToken, result.data.refreshToken);
        return {
            isSuccess: result.isSuccess,
            message: result.message,
            data: result.data,
        };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Request() req, @Response({ passthrough: true }) res: Res) {
        await this.auth.logout(req.user?.sub);
        clearAuthCookies(res);
        return { message: 'Logged out successfully' };
    }

    @Public()
    @SkipTokenRefresh()
    @UseGuards(RefreshGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Request() req, @Response({ passthrough: true }) res: Res) {
        const tokens = await this.auth.refresh(req.user.sub, req.refreshToken);
        setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        return { message: 'Tokens refreshed successfully' };
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    getMe(@Request() req) {
        return this.auth.getMe(req.user.sub);
    }
}
