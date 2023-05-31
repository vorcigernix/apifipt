import { Controller, Get, Post, Body } from '@nestjs/common';
import { QuestionDto } from './dto/question.dto';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  create(@Body() askQuestion: QuestionDto) {
    //console.log(askQuestion);
    return this.appService.askGPT(askQuestion.question);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
