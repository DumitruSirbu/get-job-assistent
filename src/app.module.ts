import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApifyModule } from './module/apify/apify.module';

@Module({
  imports: [ApifyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
