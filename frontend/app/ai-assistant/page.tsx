'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BotMessageSquare, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const suggestedQuestions = [
  'What is the current risk level for wheat imports?',
  'Show me top 5 supplier countries for rice',
  'Analyze the impact of Red Sea disruption',
  'What are the current stock levels for strategic reserves?',
  'Generate a summary of this week\'s alerts',
  'Compare Brazil vs Argentina soybean supply risk',
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am the EWS AI Assistant. I can help you analyze food security data, interpret risk alerts, generate reports, and answer questions about commodity markets, suppliers, and strategic reserves. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        wheat: 'Current wheat risk level is **HIGH (76/100)**. CBOT wheat futures are at $395.50/MT, up 8.3% in 48 hours. Key factors: (1) Ukraine supply uncertainty, (2) Strong El Nino forecast, (3) Increased GCC demand. Recommendation: Monitor daily and consider accelerating procurement from Australia.',
        rice: '**Top 5 Rice Supplier Countries:**\n\n1. **India** - 32% share (RISK: Export ban active)\n2. **Thailand** - 18% share (RISK: Low)\n3. **Vietnam** - 14% share (RISK: Medium)\n4. **Pakistan** - 9% share (RISK: High - climate)\n5. **USA** - 7% share (RISK: Low)\n\nCurrent Thai 5% rice price: $645/MT, stable trend.',
        'red sea': '**Red Sea Disruption Analysis:**\n\n- **Status**: Active since Nov 2023\n- **Impact**: +12-15 days transit time, +$800-1,200/TEU freight cost\n- **Affected routes**: Asia-Europe via Suez\n- **Alternative**: Cape of Good Hope (+15-20 days)\n- **Saudi impact**: 35% of imports use this route\n- **Mitigation**: SALIC has diverted 60% to alternative routes\n- **Estimated cost**: SAR 890M additional logistics expense',
        stock: '**Current Strategic Reserve Stock Levels:**\n\n| Commodity | Current | Target | Status | Days Left |\n|-----------|---------|--------|--------|-----------|\n| Wheat | 2.85M MT | 3.5M MT | Adequate | 89 days |\n| Rice | 920K MT | 1.2M MT | Adequate | 62 days |\n| Barley | 1.45M MT | 1.8M MT | Adequate | 78 days |\n| Sugar | 385K MT | 600K MT | Watch | 45 days |\n| Palm Oil | 128K MT | 250K MT | Watch | 38 days |\n\n**Overall Status**: 5 Adequate, 2 Watch, 2 Low (Chicken & Red Meat)',
        alert: '**This Week\'s Alert Summary (Jun 25 - Jul 1, 2026):**\n\n- **Total Alerts**: 34 generated\n- **Critical**: 5 (wheat price spike x2, avian flu, port congestion, currency)\n- **High**: 11 (supply delays, geopolitical, climate)\n- **Medium**: 12 (policy changes, market shifts)\n- **Low**: 6 (informational updates)\n- **Acknowledged**: 28 (82%)\n- **Avg response time**: 4.2 hours',
        brazil: '**Brazil vs Argentina Soybean Risk Comparison:**\n\n| Factor | Brazil | Argentina |\n|--------|--------|-----------|\n| Market Share | 15% | 6.5% |\n| Transit Time | 45-60 days | 40-55 days |\n| Current Risk | Medium | Medium-High |\n| Price (FOB) | $528/MT | $512/MT |\n| Currency Trend | BRL stable | ARS volatile |\n| Climate Risk | Low | Medium (drought) |\n| Port Efficiency | Medium | Low (strikes) |\n\n**Recommendation**: Diversify 20% from Argentina to Brazil/USA.',
      };

      const lower = text.toLowerCase();
      let response = 'I understand your question about "' + text + '". Based on the current EWS data, I can tell you that our monitoring systems are tracking this actively. For more detailed analysis, please check the relevant dashboard section or I can generate a full report for you.\n\nWould you like me to:\n1. Generate a detailed report on this topic\n2. Show you the related real-time data\n3. Escalate this to the analytics team';

      for (const [key, val] of Object.entries(responses)) {
        if (lower.includes(key)) { response = val; break; }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] bg-[#0f1d2f] border border-[#1a2d45] rounded-xl overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'assistant' ? 'bg-[#c8a45c]/20' : 'bg-blue-500/20'
              }`}>
                {msg.role === 'assistant' ? (
                  <BotMessageSquare className="w-4 h-4 text-[#c8a45c]" />
                ) : (
                  <User className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <div className={`max-w-[70%] rounded-xl px-4 py-3 ${
                msg.role === 'assistant'
                  ? 'bg-[#080e1a] border border-[#1a2d45] text-[#e2e8f0]'
                  : 'bg-[#c8a45c] text-[#0B1628]'
              }`}>
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
                <p className={`text-[10px] mt-2 ${msg.role === 'assistant' ? 'text-[#94a3b8]' : 'text-[#0B1628]/60'}`}>
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#c8a45c]/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#c8a45c] animate-pulse" />
              </div>
              <div className="bg-[#080e1a] border border-[#1a2d45] rounded-xl px-4 py-3">
                <Loader2 className="w-4 h-4 text-[#c8a45c] animate-spin" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length < 3 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-[#94a3b8] mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 bg-[#080e1a] border border-[#1a2d45] rounded-lg text-xs text-[#94a3b8] hover:text-white hover:border-[#c8a45c]/50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-[#1a2d45]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Ask about commodities, risks, suppliers, stock levels..."
              className="flex-1 bg-[#080e1a] border border-[#1a2d45] rounded-lg px-4 py-3 text-sm text-white placeholder-[#94a3b8] outline-none focus:border-[#c8a45c]"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-[#c8a45c] text-[#0B1628] rounded-lg hover:bg-[#d4b76a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
