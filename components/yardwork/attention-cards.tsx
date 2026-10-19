"use client";

import { useId, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, FileCheck2, ReceiptText, MessageCircle, CircleAlert } from 'lucide-react';
import { Button } from './shared';
import type { AttentionItem } from '@/lib/yardwork/attention';

export function AttentionCards({ items, onOpen }: { items: AttentionItem[]; onOpen: (item: AttentionItem) => void }) {
  const headingId = useId();
  const [selected, setSelected] = useState<string | null>(null);
  if (!items.length) return null;
  const index = Math.max(0, items.findIndex(item => item.id === selected));
  const item = items[index];
  const Icon = { quote: FileCheck2, invoice: ReceiptText, lead: MessageCircle, issue: CircleAlert }[item.kind];
  const tone = item.priority === 'urgent' ? 'bad' : item.kind === 'lead' ? 'info' : item.priority === 'today' || item.priority === 'overdue' ? 'warning' : 'neutral';
  const notice = item.kind === 'issue' ? `${item.label} needs your attention`
    : item.kind === 'invoice' ? item.title.replace('Follow up with ', 'Payment overdue from ')
    : item.kind === 'quote' ? item.title.replace('Review ', '').replace('’s quote', '’s quote needs approval')
    : item.title.replace('Respond to ', 'New request from ');
  const action = { quote: 'Review quote', invoice: 'View invoice', lead: 'View request', issue: 'Review issue' }[item.kind];
  const cycle = (direction: number) => setSelected(items[(index + direction + items.length) % items.length].id);
  return <section className="yw-attention" aria-labelledby={headingId}>
    <div className="yw-section-title">
      <h2 id={headingId}>Needs your attention</h2>
      <div className="yw-attention-controls">
        <span>{index + 1} of {items.length}</span>
        {items.length > 1 && <><Button variant="ghost" aria-label="Previous attention item" onClick={() => cycle(-1)}><ChevronLeft size={18}/></Button><Button variant="ghost" aria-label="Next attention item" onClick={() => cycle(1)}><ChevronRight size={18}/></Button></>}
      </div>
    </div>
    <div className="yw-attention-deck" data-stacked={items.length > 1}>
      <div data-surface="raised" className="yw-attention-task" key={item.id}>
        <span className="yw-attention-icon" data-tone={tone} aria-hidden="true"><Icon size={21} strokeWidth={1.75}/></span>
        <div aria-live="polite" aria-atomic="true" className="yw-attention-copy">
          <span className="yw-attention-type">{item.priority === 'urgent' ? 'Urgent' : item.label}</span>
          <h3>{notice}</h3>
        </div>
        <Button variant="secondary" onClick={() => onOpen(item)}>{action} <ArrowRight size={16} aria-hidden="true"/></Button>
      </div>
    </div>
  </section>;
}
