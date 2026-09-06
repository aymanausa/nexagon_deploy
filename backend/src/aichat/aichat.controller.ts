import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AichatService } from './aichat.service';
import { ChatRequestDto } from './dto/chat.dto';
@ApiTags('AI Chat')
@Controller('ai-chat')
export class AichatController {
  constructor(private service: AichatService) {}
  @Post('ask') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Ask AI assistant' })
  async ask(@Body() dto: ChatRequestDto) { return this.service.ask(dto); }
  @Get('suggested-questions') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get suggested questions' })
  async suggestions() { return this.service.getSuggestions(); }
}
