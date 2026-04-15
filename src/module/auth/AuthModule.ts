import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthUser } from './entity/AuthUser';
import { AuthUserRepository } from './repository/AuthUserRepository';
import { AuthService } from './service/AuthService';
import { AuthController } from './controller/AuthController';
import { JwtStrategy } from './strategy/JwtStrategy';
import { JwtAuthGuard } from './guard/JwtAuthGuard';

@Module({
    imports: [TypeOrmModule.forFeature([AuthUser]), PassportModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [AuthService, AuthUserRepository, JwtStrategy, JwtAuthGuard],
    exports: [JwtAuthGuard],
})
export class AuthModule {}
