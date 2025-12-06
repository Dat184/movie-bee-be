import { Body, Controller, Post } from '@nestjs/common';
import { ModerationService } from './moderation.service';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}
  @Post('check-comment')
  async checkComment(@Body('content') content: string) {
    return this.moderationService.checkComment(content);
  }
}
