"use client";
import { useEffect, useRef, useState } from 'react';
import { useOffice } from './context';
import { Button } from './shared';
import { RecordLink } from './record-link';
import { requestReview } from '../../../../../lib/integrations/request-review';

export function RequestReview({ leadId, customerId }: { leadId: string; customerId: string }) {
  const { demo, request } = useOffice();
  const [ready, setReady] = useState(false), [checking, setChecking] = useState(!demo), [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ category: string; confidence: number } | null>(null), [error, setError] = useState('');
  const locked = useRef(false);
  useEffect(() => {
    let active = true;
    if (!demo) request<{ services: { id: string; actionable: boolean }[] }>('/api/integrations').then(r => {
      if (active) setReady(!!r.services.find(s => s.id === 'jev')?.actionable);
    }).catch(() => { if (active) setError('Could not check Jev’s connection. Reopen this request to try again.'); }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [demo, request]);
  async function review() {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError('');
    try { setResult(await request('/api/integrations/ai', { action: 'classify', leadId })); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not review this request. Try again.'); }
    finally { locked.current = false; setBusy(false); }
  }
  const guidance = result && requestReview(result.category, result.confidence);
  return <div className="yw-note">
    <strong>Jev · request review</strong>
    <p>{checking ? 'Checking connection…' : ready ? 'Identify the request and suggest what to review next.' : demo ? 'Jev is available when connected in your saved workspace. Demo requests are not sent for classification.' : 'Connect request classification in Settings to use Jev here.'}</p>
    {ready && <Button variant="secondary" disabled={busy} onClick={() => void review()}>{busy ? 'Reviewing…' : 'Review with Jev'}</Button>}
    <div aria-live="polite">{guidance && result && <><p><strong>{guidance.label}</strong> · {Math.round(result.confidence * 100)}% confidence</p><p>{guidance.next}</p><p className="muted">Suggestion only. No work or payments have changed.</p><RecordLink kind="customer" id={customerId}>Review customer’s work & money</RecordLink></>}</div>
    {error && <p role="alert">{error}</p>}
  </div>;
}
