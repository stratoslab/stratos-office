interface ContextLimitWarningProps {
  tokenCount: number;
  pageCount?: number;
}

export default function ContextLimitWarning({ tokenCount, pageCount }: ContextLimitWarningProps) {
  if (tokenCount < 128000 * 0.9) return null;

  const pages = pageCount ? Math.floor((128000 * 4) / (tokenCount / pageCount)) : 'some';

  return (
    <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-400 text-sm" role="alert">
      Document exceeds context limit. Only the last {pages} pages will be processed.
    </div>
  );
}
