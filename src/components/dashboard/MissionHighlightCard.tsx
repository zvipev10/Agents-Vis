'use client';

import type { MissionCard as MissionCardData } from '../../lib/dashboard-types';
import { MissionCard } from './MissionCard';

interface MissionHighlightCardProps {
  mission: MissionCardData;
}

export function MissionHighlightCard({ mission }: MissionHighlightCardProps) {
  return <MissionCard mission={mission} featured />;
}