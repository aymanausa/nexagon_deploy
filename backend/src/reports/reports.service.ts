import { Injectable } from '@nestjs/common';
import { GenerateReportDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  generate(dto: GenerateReportDto) {
    const sections = [];
    if (dto.sections.includes('executive_summary')) sections.push({ title: 'Executive Summary', content: `EWS ${dto.reportType.toUpperCase()} Report\nPeriod: ${dto.dateFrom} to ${dto.dateTo}\nKey: 85+ sources, 17 modules, 12 domains monitored. Overall Risk: MODERATE.` });
    if (dto.sections.includes('price_analysis')) sections.push({ title: 'Price Analysis', content: 'Wheat: $285/MT (+1.2%)\nRice: $485/MT (stable)\nCorn: $195/MT (-0.5%)\nSugar: $445/MT (+2.1%)' });
    if (dto.sections.includes('risk_assessment')) sections.push({ title: 'Risk Assessment', content: '1. External Trade: GREEN (78)\n2. Maritime: AMBER (62)\n3. Reserves: GREEN (85)\n4. Production: AMBER (55)\n5. Prices: AMBER (58)\n6-12: GREEN' });
    const id = `RPT-${Date.now()}`;
    return { reportId: id, type: dto.reportType, format: dto.format, sectionsIncluded: dto.sections, pages: sections.length * 3 + 2, generatedAt: new Date().toISOString(), content: sections, downloadUrl: `/api/v1/reports/download/${id}.${dto.format}` };
  }
  getTemplates() {
    return { templates: [
      { id: 'daily', name: 'Daily Brief', desc: 'Last 24h overview', pages: '3-5' },
      { id: 'weekly', name: 'Weekly Analysis', desc: 'Week-over-week', pages: '8-12' },
      { id: 'monthly', name: 'Monthly Report', desc: 'Full monthly', pages: '15-20' },
      { id: 'quarterly', name: 'Quarterly Review', desc: 'Strategic quarterly', pages: '25-35' },
      { id: 'custom', name: 'Custom Report', desc: 'Build your own', pages: 'Variable' },
    ]};
  }
}
