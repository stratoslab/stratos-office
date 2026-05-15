import { useState } from 'react';

interface JsonTreeViewProps {
  data: unknown;
  className?: string;
}

function JsonNode({ name, value, depth = 0 }: { name?: string; value: unknown; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isObject = typeof value === 'object' && value !== null;
  const isArray = Array.isArray(value);

  if (!isObject) {
    const color = typeof value === 'string' ? 'text-green-400' : typeof value === 'number' ? 'text-cyan-400' : typeof value === 'boolean' ? 'text-amber-400' : value === null ? 'text-red-400' : 'text-gray-300';
    return (
      <div className="flex gap-1 font-mono text-sm" style={{ paddingLeft: depth * 16 }}>
        {name && <span className="text-white">{name}: </span>}
        <span className={color}>{JSON.stringify(value)}</span>
      </div>
    );
  }

  const entries = isArray ? value.map((v, i) => [i, v] as [number, unknown]) : Object.entries(value as Record<string, unknown>);
  const bracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  return (
    <div className="font-mono text-sm" style={{ paddingLeft: depth * 16 }}>
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
        <span className="material-symbols-outlined text-sm">{expanded ? 'expand_more' : 'chevron_right'}</span>
        {name && <span className="text-white">{name}: </span>}
        <span>{bracket}</span>
        {!expanded && <span>...{closeBracket}</span>}
      </button>
      {expanded && (
        <div>
          {entries.map(([key, val]) => (
            <JsonNode key={key} name={isArray ? undefined : String(key)} value={val} depth={depth + 1} />
          ))}
          <div style={{ paddingLeft: (depth + 1) * 16 }}>{closeBracket}</div>
        </div>
      )}
    </div>
  );
}

export default function JsonTreeView({ data, className = '' }: JsonTreeViewProps) {
  return (
    <div className={`bg-[#0A2540]/50 rounded-lg p-4 overflow-auto ${className}`}>
      <JsonNode value={data} />
    </div>
  );
}
