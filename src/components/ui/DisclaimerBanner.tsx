interface DisclaimerBannerProps {
  text: string;
}

export default function DisclaimerBanner({ text }: DisclaimerBannerProps) {
  return (
    <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-400 text-sm" role="note">
      {text}
    </div>
  );
}
