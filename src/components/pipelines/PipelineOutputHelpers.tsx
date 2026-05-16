import MaterialIcon from '../ui/MaterialIcon';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const riskColors = {
  low: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
  medium: { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308', border: 'rgba(234, 179, 8, 0.3)' },
  high: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
};

interface FinancialDataTableProps {
  data: unknown;
}

export function FinancialDataTable({ data }: FinancialDataTableProps) {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-400">Vendor</div>
        <div style={{ color: 'var(--on-surface)' }}>{String(d.vendor ?? '—')}</div>
        <div className="text-gray-400">Date</div>
        <div style={{ color: 'var(--on-surface)' }}>{String(d.date ?? '—')}</div>
        <div className="text-gray-400">Total</div>
        <div style={{ color: 'var(--primary-fixed-dim)' }}>{d.total ? `$${d.total}` : '—'}</div>
        <div className="text-gray-400">Currency</div>
        <div style={{ color: 'var(--on-surface)' }}>{String(d.currency ?? '—')}</div>
        <div className="text-gray-400">Tax</div>
        <div style={{ color: 'var(--on-surface)' }}>{d.tax ? `$${d.tax}` : '—'}</div>
      </div>
      {Array.isArray(d.line_items) && d.line_items.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Line Items</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-1 text-gray-400 font-normal">Description</th>
                <th className="text-right py-1 text-gray-400 font-normal">Qty</th>
                <th className="text-right py-1 text-gray-400 font-normal">Price</th>
                <th className="text-right py-1 text-gray-400 font-normal">Total</th>
              </tr>
            </thead>
            <tbody>
              {(d.line_items as Array<Record<string, unknown>>).map((item, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-1" style={{ color: 'var(--on-surface)' }}>{String(item.description ?? '')}</td>
                  <td className="py-1 text-right" style={{ color: 'var(--on-surface)' }}>{String(item.quantity ?? '—')}</td>
                  <td className="py-1 text-right" style={{ color: 'var(--on-surface)' }}>{item.unit_price ? `$${item.unit_price}` : '—'}</td>
                  <td className="py-1 text-right" style={{ color: 'var(--on-surface)' }}>{item.total ? `$${item.total}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface RiskLevelBadgeProps {
  level: 'low' | 'medium' | 'high';
}

export function RiskLevelBadge({ level }: RiskLevelBadgeProps) {
  const colors = riskColors[level];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
    >
      <MaterialIcon name={level === 'high' ? 'warning' : level === 'medium' ? 'info' : 'check_circle'} size={12} />
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

interface TranscriptPanelProps {
  text: string;
}

export function TranscriptPanel({ text }: TranscriptPanelProps) {
  return (
    <div
      className="max-h-[300px] overflow-y-auto p-3 rounded-lg text-sm whitespace-pre-wrap"
      style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--on-surface-variant)' }}
    >
      {text}
    </div>
  );
}

interface MeetingMinutesDisplayProps {
  data: unknown;
}

export function MeetingMinutesDisplay({ data }: MeetingMinutesDisplayProps) {
  if (!data || typeof data !== 'object') return <MarkdownRenderer content={typeof data === 'string' ? data : ''} />;
  const d = data as Record<string, unknown>;

  return (
    <div className="space-y-3 text-sm">
      {d.meeting_title && (
        <h4 className="font-semibold" style={{ color: 'var(--on-surface)' }}>{String(d.meeting_title)}</h4>
      )}
      {d.date && <p className="text-gray-400">Date: {String(d.date)}</p>}
      {Array.isArray(d.attendees) && d.attendees.length > 0 && (
        <div>
          <span className="text-gray-400">Attendees: </span>
          <span style={{ color: 'var(--on-surface)' }}>{(d.attendees as string[]).join(', ')}</span>
        </div>
      )}
      {Array.isArray(d.action_items) && d.action_items.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-400 mb-1">Action Items</h5>
          <div className="space-y-1">
            {(d.action_items as Array<Record<string, unknown>>).map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <input type="checkbox" className="mt-1 rounded" />
                <div>
                  <span style={{ color: 'var(--on-surface)' }}>{String(item.task ?? '')}</span>
                  {item.owner && <span className="text-gray-500 ml-2">— {String(item.owner)}</span>}
                  {item.due_date && <span className="text-gray-500 ml-1">({String(item.due_date)})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {Array.isArray(d.decisions) && d.decisions.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-400 mb-1">Decisions</h5>
          <ul className="list-disc list-inside space-y-0.5" style={{ color: 'var(--on-surface-variant)' }}>
            {(d.decisions as string[]).map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

interface EmailDraftDisplayProps {
  data: unknown;
  onCopy?: () => void;
}

export function EmailDraftDisplay({ data, onCopy }: EmailDraftDisplayProps) {
  if (!data || typeof data !== 'object') return <MarkdownRenderer content={typeof data === 'string' ? data : ''} />;
  const d = data as Record<string, unknown>;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-400">Email Draft</h4>
        {onCopy && (
          <button onClick={onCopy} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 min-h-[36px]" style={{ color: 'var(--primary-fixed-dim)' }}>
            Copy
          </button>
        )}
      </div>
      {d.subject && <p><span className="text-gray-400">Subject: </span><span style={{ color: 'var(--on-surface)' }}>{String(d.subject)}</span></p>}
      {d.to && <p><span className="text-gray-400">To: </span><span style={{ color: 'var(--on-surface)' }}>{String(d.to)}</span></p>}
      {d.tone && <p><span className="text-gray-400">Tone: </span><span style={{ color: 'var(--on-surface)' }}>{String(d.tone)}</span></p>}
      {d.body && (
        <div className="mt-2 p-3 rounded-lg whitespace-pre-wrap" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--on-surface-variant)' }}>
          {String(d.body)}
        </div>
      )}
    </div>
  );
}

interface CodeReviewIssuesProps {
  data: unknown;
}

export function CodeReviewIssues({ data }: CodeReviewIssuesProps) {
  if (!data || typeof data !== 'object') return <MarkdownRenderer content={typeof data === 'string' ? data : ''} />;
  const d = data as Record<string, unknown>;

  const severityColors = {
    critical: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
    warning: { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308', border: 'rgba(234, 179, 8, 0.3)' },
    suggestion: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
  };

  if (!Array.isArray(d.issues)) return null;

  const sorted = [...(d.issues as Array<Record<string, unknown>>)].sort((a, b) => {
    const order = { critical: 0, warning: 1, suggestion: 2 };
    return (order[a.severity as keyof typeof order] ?? 3) - (order[b.severity as keyof typeof order] ?? 3);
  });

  return (
    <div className="space-y-2">
      {d.overall_assessment && (
        <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>{String(d.overall_assessment)}</p>
      )}
      {sorted.map((issue, i) => {
        const colors = severityColors[issue.severity as keyof typeof severityColors] ?? severityColors.suggestion;
        return (
          <div key={i} className="p-2 rounded-lg border" style={{ background: colors.bg, borderColor: colors.border }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: colors.bg, color: colors.text }}>
                {String(issue.severity ?? '').toUpperCase()}
              </span>
              {issue.line_reference && <span className="text-xs text-gray-500">{String(issue.line_reference)}</span>}
            </div>
            <p className="text-sm" style={{ color: 'var(--on-surface)' }}>{String(issue.description ?? '')}</p>
            {issue.suggested_fix && (
              <p className="text-xs mt-1" style={{ color: 'var(--on-surface-variant)' }}>Fix: {String(issue.suggested_fix)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface SearchResultListProps {
  data: unknown;
}

export function SearchResultList({ data }: SearchResultListProps) {
  if (!Array.isArray(data)) return null;

  return (
    <div className="space-y-2">
      {(data as Array<Record<string, unknown>>).map((result, i) => (
        <div key={i} className="p-2 rounded-lg border border-white/10">
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-gray-500 mt-0.5">[{i + 1}]</span>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--primary-fixed-dim)' }}>{String(result.title ?? '')}</p>
              {result.url && (
                <p className="text-xs truncate" style={{ color: 'var(--outline)' }}>{String(result.url)}</p>
              )}
              {result.snippet && (
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--on-surface-variant)' }}>{String(result.snippet)}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface PainPointsListProps {
  text: string;
}

export function PainPointsList({ text }: PainPointsListProps) {
  const lines = text.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('*') || l.trim().match(/^\d+\./));

  if (lines.length === 0) {
    return <MarkdownRenderer content={text} />;
  }

  return (
    <ul className="space-y-1">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--on-surface-variant)' }}>
          <span className="text-red-400 mt-0.5">•</span>
          <span>{line.replace(/^[-*\d.]+\s*/, '')}</span>
        </li>
      ))}
    </ul>
  );
}
