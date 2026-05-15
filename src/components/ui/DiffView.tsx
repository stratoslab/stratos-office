import { RedlineResult } from '../../types';

interface DiffViewProps {
  result: RedlineResult;
}

export default function DiffView({ result }: DiffViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0A2540]/50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-2">Summary</h3>
        <p className="text-gray-300">{result.summary}</p>
      </div>

      {result.additions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-green-400 mb-2">Additions</h3>
          {result.additions.map((addition, i) => (
            <div key={i} className="bg-green-900/20 border-l-2 border-green-500 rounded-r-lg px-4 py-3 mb-2">
              <p className="text-green-300 text-sm">{addition}</p>
            </div>
          ))}
        </div>
      )}

      {result.deletions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-red-400 mb-2">Deletions</h3>
          {result.deletions.map((deletion, i) => (
            <div key={i} className="bg-red-900/20 border-l-2 border-red-500 rounded-r-lg px-4 py-3 mb-2">
              <p className="text-red-300 text-sm line-through">{deletion}</p>
            </div>
          ))}
        </div>
      )}

      {result.modifications.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-amber-400 mb-2">Modifications</h3>
          {result.modifications.map((mod, i) => (
            <div key={i} className="mb-4 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-900/10 rounded-lg p-3">
                  <p className="text-xs text-amber-400 mb-1">Original</p>
                  <p className="text-sm text-gray-300">{mod.original}</p>
                </div>
                <div className="bg-cyan-900/10 rounded-lg p-3">
                  <p className="text-xs text-cyan-400 mb-1">Revised</p>
                  <p className="text-sm text-gray-300">{mod.revised}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 italic">{mod.commentary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
