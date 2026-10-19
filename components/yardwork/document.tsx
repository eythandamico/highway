import { cad, type BusinessDocument } from "@/lib/yardwork/business-documents";
export function DocumentPaper({ document: d }: { document: BusinessDocument }) {
  return (
    <article data-surface="raised" className="yw-paper" aria-label={`${d.kind} ${d.number}`}>
      <div className="yw-paper-head">
        <div>
          <h2>{d.business.name}</h2>
          <small>{d.business.address}</small>
          <small>
            {d.business.email} {d.business.phone}
          </small>
        </div>
        <div>
          <strong>{d.kind === "quote" ? "Quote" : "Invoice"}</strong>
          <small>{d.number}</small>
          {d.sample && <small>Sample document</small>}
        </div>
      </div>
      <div className="yw-paper-head">
        <div>
          <small>Prepared for</small>
          <strong>{d.customer.name}</strong>
          <small>{d.customer.address}</small>
          <small>{d.customer.email}</small>
        </div>
        <div>
          <small>Issued {d.issued}</small>
          <small>
            {d.kind === "quote" ? "Valid until" : "Due"} {d.due}
          </small>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Work</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {d.items.map((item, i) => (
            <tr key={i}>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{cad(item.unitPrice)}</td>
              <td>
                {cad(Math.round(item.quantity * item.unitPrice * 100) / 100)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="yw-align-end">
        <p>Subtotal {cad(d.subtotal)}</p>
        <p className="muted">Tax {cad(d.tax)}</p>
        <p className="yw-total">{cad(d.total)} CAD</p>
      </div>
      {d.notes && <p className="yw-wrap">{d.notes}</p>}
      <small>{d.business.footer}</small>
    </article>
  );
}
