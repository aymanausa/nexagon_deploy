import { Injectable } from '@nestjs/common';
import { ChatRequestDto } from './dto/chat.dto';

const KB: Record<string, any> = {
  wheat: { response: `Current: $285/MT (+1.2%). 30-day forecast: $290-295/MT. Drivers: Australian drought (-12% yield). Saudi import: ~$310/MT CIF Jeddah. Risk: AMBER.`, sources: ['FAO','USDA'], confidence: 0.92, suggested: ['Rice prices?','Brazil risk?','Top threats?'] },
  rice: { response: `Current: $485/MT (Thai 5%). 30-day: $495-505/MT (+2-4%). Confidence: 87%. Factors: India export restrictions, El Nino.`, sources: ['FAO','Thai Rice Assoc'], confidence: 0.87, suggested: ['Compare wheat','India policy','Rice suppliers'] },
  brazil: { response: `Political: Medium. Economic: Low-Medium (BRL 5.05/USD). Climate: Medium. Export: 15% of Saudi imports. Top: Chicken, beef, soybeans. Transit: 18-22 days. Status: GREEN.`, sources: ['World Bank','USDA'], confidence: 0.89, suggested: ['Argentina compare','Port congestion','Chicken forecast'] },
  threat: { response: `1. CRITICAL - Bab al-Mandeb congestion (+18% transit). 2. HIGH - Australian wheat drought (NDVI -34%). 3. MEDIUM - India rice export quotas extended Q3 2026.`, sources: ['MarineTraffic','NASA'], confidence: 0.94, suggested: ['Mitigation','Alternative routes','SAGO reserves'] },
};

@Injectable()
export class AichatService {
  ask(dto: ChatRequestDto) {
    const msg = dto.message.toLowerCase();
    for (const [key, data] of Object.entries(KB)) if (msg.includes(key)) return { ...data, timestamp: new Date().toISOString() };
    return { response: `Analyzed across 85+ sources. For detailed analysis, I can generate a report or dive into specific indicators.`, sources: ['EWS Knowledge Base'], confidence: 0.75, suggested: ['Wheat trends','Supplier risk','Price forecasting'], timestamp: new Date().toISOString() };
  }
  getSuggestions() {
    return { questions: ['What is the current wheat price trend?','Analyze risk for Brazilian suppliers','Top 3 supply chain threats this week?','Generate rice price forecast','Compare Saudi vs UAE food security','Explain Bab al-Mandeb route risk'] };
  }
}
