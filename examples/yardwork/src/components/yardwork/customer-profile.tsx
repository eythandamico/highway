"use client";
import type { ReactNode } from 'react';
import { useOffice } from './context';
import { RecordLink } from './record-link';
import { customerAccount } from '../../lib/yardwork/customer-account';
import { CustomerProfileView } from './customer-profile-view';

export function CustomerProfile({ customerId, current = false, children }: { customerId: string; current?: boolean; children?: ReactNode }) {
  const { state } = useOffice();
  const customer = state.customers.find(c => c.id === customerId);
  const account = customerAccount(state, customerId);
  if (!customer || !account) return <p className="muted">Customer details unavailable.</p>;
  return <CustomerProfileView customer={customer} outstanding={account.outstanding} collected={account.collected}>
    {!current && <RecordLink kind="customer" id={customer.id}>Full customer history</RecordLink>}
    {children}
  </CustomerProfileView>;
}
