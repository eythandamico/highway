type PropsTableProps = { rows: readonly (readonly string[])[] };

export function PropsTable({ rows }: PropsTableProps) {
  return <div className="library-props-frame">
    <table className="library-props-table" aria-label="Component props">
      <colgroup><col/><col/><col/><col/></colgroup>
      <thead><tr>{["Prop", "Type", "Default", "Description"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={`${row[0]}-${index}`}>
        <th scope="row"><code>{row[0]}</code></th>
        {row.slice(1, 4).map((cell, column) => <td key={column}>{column < 2 && cell && !["–", "—", "-"].includes(cell) ? <code>{cell}</code> : cell || "–"}</td>)}
      </tr>)}</tbody>
    </table>
  </div>;
}
