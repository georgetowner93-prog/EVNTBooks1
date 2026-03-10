import type { ReactNode } from 'react';

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card statCard">
      <div className="muted">{label}</div>
      <div className="statValue">{value}</div>
    </div>
  );
}

export function SectionCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="card">
      <div className="sectionHeader">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function NoteBox({ children }: { children: ReactNode }) {
  return <div className="snippet">{children}</div>;
}
