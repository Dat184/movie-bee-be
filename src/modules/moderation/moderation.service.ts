import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@gradio/client';

@Injectable()
export class ModerationService {
  private client: any;
  private readonly logger = new Logger(ModerationService.name);
  private isConnected: boolean = false;

  async onModuleInit() {
    try {
      this.logger.log('Connecting to PhoBERT Space...');
      this.client = await Client.connect('Btad184/final', {
        token: `hf_${process.env.HUGGING_FACE_API_KEY}`,
      });
      this.isConnected = true;
      this.logger.log('Connected to AI Model!');
    } catch (error) {
      this.logger.warn(
        'Failed to connect to AI Model. Moderation will default to safe mode.',
      );
      this.logger.error(error.message);
      this.isConnected = false;
    }
  }

  async checkComment(content: string) {
    try {
      const result = await this.client.predict('/predict_sentiment', {
        text: content,
      });

      const prediction = result.data[0];

      const topLabel = prediction.label;

      return {
        isSafe: topLabel === 'Non-hate',
        label: topLabel,
      };
    } catch (error) {
      this.logger.error('AI Error:', error);
      return { isSafe: true, label: 'Error', details: [] };
    }
  }
}
