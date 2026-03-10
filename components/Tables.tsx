import Link from 'next/link';
import type { ReactNode } from 'react';

export function SimpleTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NewButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href as any} className="button">
      {label}
    </Link>
  );
}