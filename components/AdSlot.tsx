'use client';

import React from 'react';
import { AdBanner } from '@/components/AdBanner';

export interface AdSlotProps {
  id?: string;
  scriptSrc?: string;
  className?: string;
}

export function AdSlot({
  id = 'container-4ff02455261b1454e019ced3534847d2',
  scriptSrc = 'https://bicea.org/21/4ff02455261b1454e019ced3534847d2',
  className = '',
}: AdSlotProps) {
  return <AdBanner containerId={id} scriptSrc={scriptSrc} className={className} />;
}
