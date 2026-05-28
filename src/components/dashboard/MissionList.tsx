'use client';

import type { MissionCard as MissionCardData } from '../../lib/dashboard-types';
import { MissionCard } from './MissionCard';

interface MissionListProps {
  missions: MissionCardData[];
}

export function MissionList({ missions }: MissionListProps) {
  if (missions.length === 0) {
    return (
      <div className="panel panel-padding empty-state" role="status" aria-label="No additional missions">
        <h3 className="panel-title">Recent missions</h3>
        <p className="mission-detail">No additional missions yet. The latest mission stays as the primary narrative.</p>
      </div>
    );
  }

  return (
    <section className="mission-list" aria-label="Recent missions">
      {missions.map((mission) => (
        <MissionCard key={mission.id} mission={mission} />
      ))}
    </section>
  );
}