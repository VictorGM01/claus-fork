import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import axios from 'axios';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  async sendAudioToWhisper(file: Express.Multer.File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);
    formData.append('model', 'whisper-1');

    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');

    try {
      const response: {data: {text: string}} = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${openaiApiKey}`,
          },
        },
      );

      // Retorna apenas o campo "text" da resposta
      console.log("response: " + response.data.text)
      return response.data.text;
    } catch (error) {
      console.error('Erro ao enviar o arquivo para a API:', error.response?.data || error.message);
      throw new Error('Erro ao processar o arquivo');
    }
  }
}
