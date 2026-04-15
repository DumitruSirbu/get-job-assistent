import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../service/AuthService';
import { LoginDto, RefreshDto, RegisterDto } from '../dto';
import { ITokenResponse } from '../interface';
import { Public } from '../decorator/Public';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() body: RegisterDto): Promise<ITokenResponse> {
        return this.authService.register(body.email, body.password);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: LoginDto): Promise<ITokenResponse> {
        return this.authService.login(body.email, body.password);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() body: RefreshDto): Promise<{ accessToken: string }> {
        return this.authService.refresh(body.refreshToken);
    }
}
