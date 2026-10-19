"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { Button } from './shared';
import { useOffice } from './context';
import { recordQuery, type RecordKind } from '@/lib/yardwork/customer-account';

export function RecordLink({ kind, id, children }: { kind: RecordKind; id: string; children: ReactNode }) {
  const { demo } = useOffice();
  const current = useSearchParams();
  const params = recordQuery(kind, id);
  if (demo && current.get('devData') === 'off') params.set('devData', 'off');
  return <Button asChild variant="secondary"><Link href={`${demo ? '/demo' : '/workspace'}?${params}`} scroll={false}>{children}</Link></Button>;
}
