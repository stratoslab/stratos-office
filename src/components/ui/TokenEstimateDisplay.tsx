interface TokenEstimateDisplayProps {
  tokenCount: number;
}

export default function TokenEstimateDisplay({ tokenCount }: TokenEstimateDisplayProps) {
  const color = tokenCount < 50000 ? 'text-green-400' : tokenCount < 100000 ? 'text-amber-400' : 'text-red-400';

  return (
    <p className={`text-sm ${color}`}>
      Estimated input: ~{tokenCount.toLocaleString()} tokens
    </p>
  );
}
