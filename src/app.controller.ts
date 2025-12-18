import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('get-weather')
  async getWeather(
    @Query('query') query?: string,
    @Query('debug') debug?: string,
  ) {
    if (!query) throw new BadRequestException('query is required');
    return this.appService.getWeather(query, debug === '1' || debug === 'true');
  }
}
