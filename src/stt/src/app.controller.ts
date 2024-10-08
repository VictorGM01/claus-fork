import { Controller, Get, HttpException, HttpStatus, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('transcript')
  @UseInterceptors(FileInterceptor('audio'))
  async sendAudio(@UploadedFile() file: Express.Multer.File): Promise<any> {

    return await this.appService.sendAudioToWhisper(file);
  }
}
