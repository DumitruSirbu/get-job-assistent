import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entity/Company';
import { CompanyRepository } from './repository/CompanyRepository';
import { CompanyController } from './controller/CompanyController';

@Module({
    imports: [TypeOrmModule.forFeature([Company])],
    controllers: [CompanyController],
    providers: [CompanyRepository],
    exports: [CompanyRepository],
})
export class CompanyModule {}
