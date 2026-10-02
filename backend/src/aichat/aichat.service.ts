import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ChatRequestDto } from './dto/chat.dto';
import { DashboardService } from '../dashboard/dashboard.service';
import { ProcurementService } from '../procurement/procurement.service';
import { FoodIndexService } from '../food-index/food-index.service';
import { ImpactService } from '../impact/impact.service';
import { NewsService } from '../news/news.service';

// Tool-using copilot: Claude reasons over the LIVE modules (prices, procurement
// recommendations, food-security index, quantified impact, news signals) instead of
// canned text — so "why is wheat BUY?" is answered from the same data the app shows.
@Injectable()
export class AichatService {
  private readonly logger = new Logger(AichatService.name);
  private anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ defaultHeaders: process.env.ANTHROPIC_WORKSPACE_ID ? { 'anthropic-workspace-id': process.env.ANTHROPIC_WORKSPACE_ID } : undefined })
    : null;

  constructor(
    private dashboard: DashboardService,
    private procurement: ProcurementService,
    private foodIndex: FoodIndexService,
    private impact: ImpactService,
    private news: NewsService,
  ) {}

  // name -> { spec for Claude, runner returning JSON-serializable live data }
  private tools: Record<string, { description: string; run: () => Promise<any> }> = {
    get_latest_prices: { description: 'Latest tracked commodity prices and recent change.', run: () => this.dashboard.getLatestPrices() },
    get_kpis: { description: 'Headline food-security KPIs shown on the dashboard.', run: () => this.dashboard.getKpis() },
    get_procurement_recommendations: { description: 'Per-commodity BUY/HOLD procurement recommendations with the reasoning behind each.', run: () => this.procurement.list() },
    get_food_security_index: { description: 'Composite food-security index and its component indicators.', run: () => this.foodIndex.list() },
    get_impact_summary: { description: 'Quantified economic impact — estimated SAR/spend retained and import value at risk.', run: () => this.impact.summary() },
    get_recent_news: { description: 'Recent classified news/threat signals affecting food supply chains.', run: () => this.news.list() },
  };

  async ask(dto: ChatRequestDto) {
    const now = () => new Date().toISOString();
    if (!this.anthropic) {
      return { response: 'AI copilot is not configured (ANTHROPIC_API_KEY missing).', sources: [], confidence: 0, suggested: this.getSuggestions().questions.slice(0, 3), timestamp: now() };
    }

    const arabic = (dto.language || '').toLowerCase().startsWith('ar');
    const toolDefs = Object.entries(this.tools).map(([name, t]) => ({
      name, description: t.description, input_schema: { type: 'object' as const, properties: {} },
    }));
    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: dto.message }];
    const used = new Set<string>();

    // ponytail: cap at 6 tool rounds — enough to chain a few reads, bounded so a
    // misbehaving loop can't run forever. Raise if real questions need deeper chains.
    let final = '';
    for (let round = 0; round < 6; round++) {
      const res = await this.anthropic.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 1024,
        system:
          'You are Nexagon, the AI copilot for a Saudi food-security early-warning system. ' +
          'Answer operational questions (prices, procurement BUY/HOLD rationale, threats, impact) using the tools to read LIVE data — never invent numbers. ' +
          'Be concise and decision-oriented; cite the concrete figures you retrieved. ' +
          (arabic ? 'Reply in Arabic.' : 'Reply in English.'),
        tools: toolDefs,
        messages,
      });
      messages.push({ role: 'assistant', content: res.content });
      final = res.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n').trim();

      if (res.stop_reason !== 'tool_use') break;

      const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        used.add(tu.name);
        let out: any;
        try { out = await this.tools[tu.name]?.run(); } catch (e: any) { out = { error: e?.message || 'tool failed' }; }
        results.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(out ?? { error: 'unknown tool' }) });
      }
      messages.push({ role: 'user', content: results });
    }

    return {
      response: final || 'No answer produced.',
      sources: [...used],
      confidence: used.size ? 0.9 : 0.6,
      suggested: this.getSuggestions().questions.slice(0, 3),
      timestamp: now(),
    };
  }

  getSuggestions() {
    return { questions: ['Why is wheat BUY right now?', 'What are the top supply-chain threats this week?', 'What is our current food-security index?', 'How much spend have we retained this quarter?', 'Which commodities are most at risk?', 'Show the latest commodity prices'] };
  }
}
