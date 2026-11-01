import { TokenIcon } from "../../../packages/highway-react/src/components/ui/token-icon";
import { useState } from "react";
import { useExampleState } from "./example-state";
import { Accordion } from '../../../packages/highway-react/src/invariant/components/accordion.jsx';
import { Table } from '../../../packages/highway-react/src/invariant/components/table.jsx';
import { ComponentStage } from "./preview-helpers.jsx";
export function AccordionExample() {
    const [multiple] = useExampleState("multiple", false);
    return (<ComponentStage>
          <div className="w-[340px]">
            <Accordion multiple={multiple} items={[
            { title: 'What is this?', content: 'A component library for building agent-powered interfaces with copy-paste components and CSS variable theming.' },
            { title: 'How do I install it?', content: 'Clone the repo, copy the components you need, install lucide-react, and import the theme CSS.' },
            { title: 'Can I customize it?', content: 'Override any --inv-* CSS variable to change colors, shadows, radii, and typography across all components.' },
        ]}/>
          </div>
        </ComponentStage>);
}
export function TableExample() {
    const [width, setWidth] = useState(640);
    return (<>
        <div className="table-responsive-demo">
          <div style={{ width, maxWidth: '100%', marginInline: 'auto' }}>
          <Table className="w-full" rowKey="symbol" columns={[
            { key: 'name', label: 'Asset', render: (value, row) => <span className="inline-flex items-center gap-2"><TokenIcon size="small" token={{ symbol: row.symbol, imageUrl: `/token-art/${row.symbol.toLowerCase()}.svg` }} network={{ label: row.network, imageUrl: `/network-art/${row.networkIcon}.svg` }} />{value}</span> },
            { key: 'symbol', label: 'Symbol', collapseBelow: 560 },
            { key: 'price', label: 'Price', align: 'right', collapseBelow: 440,
              render: (value, row, { width }) => {
                const full = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
                const compact = width < 560 && value >= 1000;
                const display = compact ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value) : full;
                return <span title={full}><span aria-hidden="true">{display}</span><span className="sr-only">{full}</span></span>;
              } },
            { key: 'change', label: '24h', align: 'right',
              render: value => <span style={{ color: value >= 0 ? 'var(--status-success)' : 'var(--destructive)', fontVariantNumeric: 'tabular-nums' }}>{value >= 0 ? '+' : '−'}{Math.abs(value).toFixed(2)}%</span> },
        ]} data={[
            { name: 'Bitcoin', symbol: 'BTC', network: 'Bitcoin', networkIcon: 'bitcoin', price: 67432.80, change: 2.34 },
            { name: 'Ethereum', symbol: 'ETH', network: 'Ethereum', networkIcon: 'ethereum-evm', price: 3521.45, change: 1.87 },
            { name: 'Solana', symbol: 'SOL', network: 'Solana', networkIcon: 'solana', price: 148.62, change: -0.92 },
            { name: 'Chainlink', symbol: 'LINK', network: 'Ethereum', networkIcon: 'ethereum-evm', price: 14.28, change: 3.16 },
            { name: 'Avalanche', symbol: 'AVAX', network: 'Avalanche', networkIcon: 'avalanche', price: 28.75, change: -1.24 },
            { name: 'Uniswap', symbol: 'UNI', network: 'Ethereum', networkIcon: 'ethereum-evm', price: 8.46, change: 0.68 },
        ]}/>
          </div>
          <label className="table-preview-width highway-type-body-sm"><span>Width</span><input style={{ '--range-fill': `${(width - 320) / 320 * 100}%` }} aria-label="Table preview width" type="range" min="320" max="640" step="10" value={width} onChange={event => setWidth(Number(event.target.value))}/><output>{width}px</output></label>
        </div>
        </>);
}
