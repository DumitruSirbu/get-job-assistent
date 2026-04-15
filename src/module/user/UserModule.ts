import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entity/User';
import { UserRepository } from './repository/UserRepository';
import { UserService } from './service/UserService';
import { UserController } from './controller/UserController';

@Module({
    imports: [TypeOrmModule.forFeature([User]), JwtModule.register({})],
    controllers: [UserController],
    providers: [UserService, UserRepository],
})
export class UserModule {}
