import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@gradio/client';

@Injectable()
export class ModerationService {
  private client: any;
  private readonly logger = new Logger(ModerationService.name);

  async onModuleInit() {
    this.logger.log('Connecting to PhoBERT Space...');
    this.client = await Client.connect('Btad184/phobert-demo');
    this.logger.log('Connected to AI Model!');
  }

  async checkComment(content: string) {
    try {
      const result = await this.client.predict('/predict', {
        text: content,
      });

      const prediction = result.data[0];

      const topLabel = prediction.label;

      return {
        isSafe: topLabel === 'Non-hate',
        label: topLabel,
      };
    } catch (error) {
      console.error('AI Error:', error);
      return { isSafe: true, label: 'Error', details: [] };
    }
  }
}
