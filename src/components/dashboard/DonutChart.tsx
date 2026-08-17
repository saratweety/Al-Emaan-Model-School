type Segment = { value: number; color: string };

export default function DonutChart({
  segments,
  size = 176,
  strokeWidth = 22,
  centerValue,
  centerLabel,
}: {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  centerValue: string;
  centerLabel: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  const arcs = segments.reduce<{ seg: Segment; dash: number; offset: number }[]>((acc, seg) => {
    const dash = (seg.value / total) * circumference;
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.dash : 0;
    acc.push({ seg, dash, offset });
    return acc;
  }, []);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#eef1f0" strokeWidth={strokeWidth} fill="none" />
        {arcs.map(({ seg, dash, offset }) => (
          <circle
            key={seg.color}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={seg.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-[#0f4d34]">{centerValue}</span>
        <span className="text-xs text-gray-500">{centerLabel}</span>
      </div>
    </div>
  );
}
