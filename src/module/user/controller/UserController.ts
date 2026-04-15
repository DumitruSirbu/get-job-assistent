import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserService } from '../service/UserService';
import { LoginDto, RefreshDto, RegisterDto } from '../dto';
import { ITokenResponse } from '../../auth/interface';
import { Public } from 'src/module/auth/decorator/Public';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() body: RegisterDto): Promise<ITokenResponse> {
        return this.userService.register(body.email, body.firstName, body.lastName, body.password);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: LoginDto): Promise<ITokenResponse> {
        return this.userService.login(body.email, body.password);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() body: RefreshDto): Promise<{ accessToken: string }> {
        return this.userService.refresh(body.refreshToken);
    }
}
