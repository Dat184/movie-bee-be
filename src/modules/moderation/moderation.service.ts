import { Injectable } from '@nestjs/common';
import { Client } from '@gradio/client';

@Injectable()
export class ModerationService {
  private client: any;
  async onModuleInit() {
    console.log('Connecting to PhoBERT Space...');
    this.client = await Client.connect('Btad184/phobert-demo');
    console.log('Connected to AI Model!');
  }

  async checkComment(content: string) {
    try {
      const result = await this.client.predict('/predict', {
        text: content,
      });

      const prediction = result.data[0];

      const topLabel = prediction.label;

      const scores = prediction.confidences;

      return {
        isSafe: topLabel === 'Non-hate',
        label: topLabel,
        details: scores,
      };
    } catch (error) {
      console.error('AI Error:', error);
      // Fallback: Nếu AI lỗi thì cho qua hoặc chặn tùy policy
      return { isSafe: true, label: 'Error', details: [] };
    }
  }
}
