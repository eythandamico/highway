"use client";
import { Phone, MessageSquare } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Customer } from '@/lib/yardwork/yardwork';
import { cad } from '@/lib/yardwork/business-documents';
import { AccountAvatar } from './account-avatar';
import { Button } from './shared';

function SolidMail() {
  return <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
    <path d="M4 4h16a2 2 0 0 1 2 2v.4l-10 6.25L2 6.4V6a2 2 0 0 1 2-2Z" />
    <path d="M2 8.75l9.47 5.92a1 1 0 0 0 1.06 0L22 8.75V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" />
  </svg>;
}

export function CustomerProfileView({ customer, outstanding, collected, children }: {
  customer: Customer; outstanding: number; collected: number; children?: ReactNode;
}) {
  return <div className="yw-customer-profile">
    <div className="yw-profile-identity">
      <AccountAvatar identity={`yardwork:customer:${customer.id}`} />
      <h2>{customer.name}</h2>
    </div>
    <div className="yw-actions" role="group" aria-label="Contact customer">
      {customer.email ? <Button asChild variant="default" size="icon-lg"><a href={`mailto:${customer.email}`} aria-label="Email customer" title="Email"><SolidMail /></a></Button> : <Button variant="default" size="icon-lg" disabled aria-label="Email customer" title="Add an email address to email this customer"><SolidMail /></Button>}
      {customer.phone ? <Button asChild variant="default" size="icon-lg"><a href={`tel:${customer.phone}`} aria-label="Call customer" title="Call"><Phone size={24} className="size-6" fill="currentColor" strokeWidth={1.5} aria-hidden="true" /></a></Button> : <Button variant="default" size="icon-lg" disabled aria-label="Call customer" title="Add a phone number to call this customer"><Phone size={24} className="size-6" fill="currentColor" strokeWidth={1.5} aria-hidden="true" /></Button>}
      {customer.phone ? <Button asChild variant="default" size="icon-lg"><a href={`sms:${customer.phone}`} aria-label="Text customer" title="Text"><MessageSquare size={24} className="size-6" fill="currentColor" strokeWidth={1.5} aria-hidden="true" /></a></Button> : <Button variant="default" size="icon-lg" disabled aria-label="Text customer" title="Add a phone number to text this customer"><MessageSquare size={24} className="size-6" fill="currentColor" strokeWidth={1.5} aria-hidden="true" /></Button>}
    </div>
    <dl className="yw-profile-properties">
      <div><dt>Property</dt><dd>{customer.address || 'Not recorded'}</dd></div>
      <div><dt>Neighbourhood</dt><dd>{customer.area || 'Not recorded'}</dd></div>
      <div><dt>Frequency</dt><dd>{customer.recurring}</dd></div>
      <div><dt>Email</dt><dd>{customer.email ? <a href={`mailto:${customer.email}`}>{customer.email}</a> : 'Not recorded'}</dd></div>
      <div><dt>Phone</dt><dd>{customer.phone ? <a href={`tel:${customer.phone}`}>{customer.phone}</a> : 'Not recorded'}</dd></div>
    </dl>
    <section className="yw-profile-section"><h3>Account</h3><dl className="yw-profile-properties yw-profile-account">
      <div><dt>Outstanding · incl. tax</dt><dd>{cad(outstanding)}</dd></div>
      <div><dt>Recorded paid · incl. tax</dt><dd>{cad(collected)}</dd></div>
    </dl></section>
    <section className="yw-profile-section"><h3>Property notes</h3><p>{customer.notes || 'No property notes yet.'}</p></section>
    {children}
  </div>;
}
