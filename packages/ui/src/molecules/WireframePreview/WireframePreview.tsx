import { cn } from '../../lib/utils';

export const WIREFRAME_TYPES = ['board', 'calendar', 'table', 'timeline', 'catalog', 'document', 'charts', 'form'] as const;
export type WireframeType = (typeof WIREFRAME_TYPES)[number];

export interface WireframePreviewProps {
  /** Which wireframe layout to render */
  type: WireframeType;
  /** Additional class names applied to the SVG */
  className?: string;
}

const STROKE = 'var(--color-border, #333)';
const FILL = 'var(--color-muted, #1a1a1a)';
const TEXT_FILL = 'var(--color-muted-foreground, #888)';

/** Shared SVG wrapper */
function Wrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 240"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full', className)}
      role="img"
      aria-label="Wireframe preview"
    >
      {children}
    </svg>
  );
}

function BoardWireframe() {
  return (
    <>
      {/* Three columns */}
      <rect x="10" y="30" width="120" height="200" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      <text x="70" y="20" textAnchor="middle" fill={TEXT_FILL} fontSize="10">To Do</text>
      <rect x="20" y="45" width="100" height="24" rx="2" fill="none" stroke={STROKE} strokeWidth="0.5" strokeDasharray="3 2" />
      <rect x="20" y="75" width="100" height="24" rx="2" fill="none" stroke={STROKE} strokeWidth="0.5" strokeDasharray="3 2" />
      <rect x="20" y="105" width="100" height="24" rx="2" fill="none" stroke={STROKE} strokeWidth="0.5" strokeDasharray="3 2" />

      <rect x="140" y="30" width="120" height="200" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      <text x="200" y="20" textAnchor="middle" fill={TEXT_FILL} fontSize="10">In Progress</text>
      <rect x="150" y="45" width="100" height="24" rx="2" fill="none" stroke={STROKE} strokeWidth="0.5" strokeDasharray="3 2" />
      <rect x="150" y="75" width="100" height="24" rx="2" fill="none" stroke={STROKE} strokeWidth="0.5" strokeDasharray="3 2" />

      <rect x="270" y="30" width="120" height="200" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      <text x="330" y="20" textAnchor="middle" fill={TEXT_FILL} fontSize="10">Done</text>
      <rect x="280" y="45" width="100" height="24" rx="2" fill="none" stroke={STROKE} strokeWidth="0.5" strokeDasharray="3 2" />
    </>
  );
}

function CalendarWireframe() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return (
    <>
      {/* Header row */}
      {days.map((d, i) => (
        <text key={d} x={40 + i * 72} y="20" textAnchor="middle" fill={TEXT_FILL} fontSize="10">{d}</text>
      ))}
      {/* Grid cells */}
      {Array.from({ length: 20 }, (_, idx) => {
        const col = idx % 5;
        const row = Math.floor(idx / 5);
        return (
          <rect
            key={idx}
            x={4 + col * 72 + col * 6}
            y={30 + row * 50}
            width="72"
            height="46"
            rx="2"
            fill={FILL}
            stroke={STROKE}
            strokeWidth="0.5"
          />
        );
      })}
      {/* Event blocks */}
      <rect x="10" y="38" width="60" height="10" rx="1" fill={STROKE} opacity="0.3" />
      <rect x="160" y="88" width="60" height="10" rx="1" fill={STROKE} opacity="0.3" />
      <rect x="88" y="138" width="60" height="10" rx="1" fill={STROKE} opacity="0.3" />
    </>
  );
}

function TableWireframe() {
  const cols = ['Name', 'Status', 'Date', 'Owner'];
  return (
    <>
      {/* Header */}
      <rect x="10" y="10" width="380" height="24" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      {cols.map((c, i) => (
        <text key={c} x={30 + i * 95} y="26" fill={TEXT_FILL} fontSize="10">{c}</text>
      ))}
      {/* Rows */}
      {Array.from({ length: 7 }, (_, r) => (
        <g key={r}>
          <line x1="10" y1={40 + r * 28} x2="390" y2={40 + r * 28} stroke={STROKE} strokeWidth="0.5" />
          {cols.map((_, c) => (
            <rect key={c} x={20 + c * 95} y={46 + r * 28} width={c === 0 ? 70 : 50} height="8" rx="1" fill={STROKE} opacity="0.2" />
          ))}
        </g>
      ))}
    </>
  );
}

function TimelineWireframe() {
  return (
    <>
      {/* Timeline header months */}
      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => (
        <text key={m} x={20 + i * 65} y="16" fill={TEXT_FILL} fontSize="9">{m}</text>
      ))}
      {/* Vertical month dividers */}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={10 + i * 65} y1="22" x2={10 + i * 65} y2="230" stroke={STROKE} strokeWidth="0.5" strokeDasharray="2 2" />
      ))}
      {/* Task bars */}
      <rect x="20" y="35" width="120" height="16" rx="2" fill={STROKE} opacity="0.25" />
      <text x="25" y="47" fill={TEXT_FILL} fontSize="8">Task A</text>
      <rect x="85" y="60" width="180" height="16" rx="2" fill={STROKE} opacity="0.25" />
      <text x="90" y="72" fill={TEXT_FILL} fontSize="8">Task B</text>
      <rect x="150" y="85" width="100" height="16" rx="2" fill={STROKE} opacity="0.25" />
      <text x="155" y="97" fill={TEXT_FILL} fontSize="8">Task C</text>
      <rect x="20" y="110" width="60" height="16" rx="2" fill={STROKE} opacity="0.25" />
      <text x="25" y="122" fill={TEXT_FILL} fontSize="8">Task D</text>
      <rect x="220" y="135" width="150" height="16" rx="2" fill={STROKE} opacity="0.25" />
      <text x="225" y="147" fill={TEXT_FILL} fontSize="8">Task E</text>
    </>
  );
}

function CatalogWireframe() {
  return (
    <>
      {/* Grid of catalog items */}
      {Array.from({ length: 6 }, (_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 10 + col * 130;
        const y = 10 + row * 115;
        return (
          <g key={i}>
            <rect x={x} y={y} width="120" height="100" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
            {/* Thumbnail area */}
            <rect x={x + 8} y={y + 8} width="104" height="50" rx="1" fill={STROKE} opacity="0.15" />
            {/* Title placeholder */}
            <rect x={x + 8} y={y + 66} width="80" height="8" rx="1" fill={STROKE} opacity="0.2" />
            {/* Subtitle placeholder */}
            <rect x={x + 8} y={y + 80} width="60" height="6" rx="1" fill={STROKE} opacity="0.15" />
          </g>
        );
      })}
    </>
  );
}

function DocumentWireframe() {
  return (
    <>
      {/* Document page */}
      <rect x="60" y="10" width="280" height="220" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      {/* Title */}
      <rect x="80" y="30" width="180" height="12" rx="1" fill={STROKE} opacity="0.3" />
      {/* Subtitle */}
      <rect x="80" y="50" width="120" height="8" rx="1" fill={STROKE} opacity="0.2" />
      {/* Text lines */}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x="80" y={72 + i * 16} width={200 - (i % 3) * 30} height="6" rx="1" fill={STROKE} opacity="0.15" />
      ))}
      <text x="200" y="218" textAnchor="middle" fill={TEXT_FILL} fontSize="9">Document</text>
    </>
  );
}

function ChartsWireframe() {
  return (
    <>
      {/* Bar chart area */}
      <rect x="10" y="10" width="185" height="110" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      <text x="102" y="26" textAnchor="middle" fill={TEXT_FILL} fontSize="9">Bar Chart</text>
      {/* Bars */}
      {[40, 65, 50, 80, 55].map((h, i) => (
        <rect key={i} x={28 + i * 32} y={110 - h} width="20" height={h} rx="1" fill={STROKE} opacity="0.25" />
      ))}
      {/* Line chart area */}
      <rect x="205" y="10" width="185" height="110" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      <text x="297" y="26" textAnchor="middle" fill={TEXT_FILL} fontSize="9">Line Chart</text>
      <polyline points="220,90 250,60 280,75 310,40 340,55 370,30" fill="none" stroke={STROKE} strokeWidth="1" opacity="0.4" />
      {/* Pie chart area */}
      <rect x="10" y="130" width="185" height="100" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      <text x="102" y="146" textAnchor="middle" fill={TEXT_FILL} fontSize="9">Pie Chart</text>
      <circle cx="102" cy="190" r="30" fill="none" stroke={STROKE} strokeWidth="1" opacity="0.3" />
      <line x1="102" y1="160" x2="102" y2="190" stroke={STROKE} strokeWidth="1" opacity="0.3" />
      <line x1="102" y1="190" x2="128" y2="205" stroke={STROKE} strokeWidth="1" opacity="0.3" />
      {/* Metrics area */}
      <rect x="205" y="130" width="185" height="100" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      <text x="297" y="146" textAnchor="middle" fill={TEXT_FILL} fontSize="9">Metrics</text>
      <rect x="220" y="160" width="70" height="24" rx="2" fill={STROKE} opacity="0.15" />
      <rect x="305" y="160" width="70" height="24" rx="2" fill={STROKE} opacity="0.15" />
      <rect x="220" y="194" width="70" height="24" rx="2" fill={STROKE} opacity="0.15" />
      <rect x="305" y="194" width="70" height="24" rx="2" fill={STROKE} opacity="0.15" />
    </>
  );
}

function FormWireframe() {
  const fields = ['Name', 'Email', 'Category', 'Description'];
  return (
    <>
      <rect x="40" y="10" width="320" height="220" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      {fields.map((f, i) => (
        <g key={f}>
          <text x="60" y={46 + i * 48} fill={TEXT_FILL} fontSize="9">{f}</text>
          <rect
            x="60"
            y={50 + i * 48}
            width={260}
            height={f === 'Description' ? 40 : 22}
            rx="2"
            fill="none"
            stroke={STROKE}
            strokeWidth="0.5"
            strokeDasharray="3 2"
          />
        </g>
      ))}
      {/* Submit button */}
      <rect x="240" y="208" width="80" height="16" rx="2" fill={STROKE} opacity="0.25" />
      <text x="280" y="219" textAnchor="middle" fill={TEXT_FILL} fontSize="8">Submit</text>
    </>
  );
}

function FallbackWireframe() {
  return (
    <>
      <rect x="10" y="10" width="380" height="220" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      <text x="200" y="125" textAnchor="middle" fill={TEXT_FILL} fontSize="12">Preview</text>
    </>
  );
}

const WIREFRAME_MAP: Record<string, () => React.JSX.Element> = {
  board: BoardWireframe,
  calendar: CalendarWireframe,
  table: TableWireframe,
  timeline: TimelineWireframe,
  catalog: CatalogWireframe,
  document: DocumentWireframe,
  charts: ChartsWireframe,
  form: FormWireframe,
};

/**
 * WireframePreview molecule — SVG-based wireframe layout mockups.
 *
 * 8 variants matching canvas types: board, calendar, table, timeline,
 * catalog, document, charts, form. Each shows labelled zones indicating
 * what will appear where. Uses viewBox for responsive scaling.
 */
export function WireframePreview({ type, className }: WireframePreviewProps) {
  const Component = WIREFRAME_MAP[type] ?? FallbackWireframe;
  return (
    <Wrapper className={className}>
      <Component />
    </Wrapper>
  );
}
