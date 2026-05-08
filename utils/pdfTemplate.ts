import { formatCurrencyFull, formatDate } from '../utils/formatters';
import { Transaction, Project } from '../constants/types';

// ─── PDF Report HTML Template ─────────────────────────────────────────────────
export const generatePDFHTML = (params: {
  title: string;
  subtitle?: string;
  transactions: Transaction[];
  projectName?: string;
  startDate?: Date;
  endDate?: Date;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}): string => {
  const { title, subtitle, transactions, totalIncome, totalExpense, balance } = params;
  const now = new Date();

  const rows = transactions
    .map(
      (tx, i) => `
    <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
      <td>${formatDate(tx.date)}</td>
      <td><span class="badge badge-${tx.type}">${tx.type === 'income' ? 'Income' : 'Expense'}</span></td>
      <td>${tx.projectName}</td>
      <td>${tx.clientOrVendor}</td>
      <td>${tx.category ?? tx.paymentMode}</td>
      <td class="amount ${tx.type}">${formatCurrencyFull(tx.amount)}</td>
      <td>${tx.addedByName}</td>
      <td>${tx.notes ?? '—'}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #1a1a1a; background: #fff; padding: 20px; }
    
    /* Header */
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #E65100; padding-bottom: 12px; margin-bottom: 16px; }
    .company-name { font-size: 20px; font-weight: 700; color: #E65100; letter-spacing: 0.5px; }
    .company-tagline { font-size: 10px; color: #546E7A; margin-top: 2px; }
    .report-date { font-size: 10px; color: #546E7A; text-align: right; }
    
    /* Title */
    .report-title { font-size: 16px; font-weight: 700; color: #0D1B2A; margin-bottom: 4px; }
    .report-subtitle { font-size: 11px; color: #546E7A; margin-bottom: 16px; }
    
    /* Summary Cards */
    .summary { display: flex; gap: 12px; margin-bottom: 20px; }
    .card { flex: 1; padding: 12px; border-radius: 8px; }
    .card-income { background: #E8F5E9; border-left: 4px solid #2E7D32; }
    .card-expense { background: #FFEBEE; border-left: 4px solid #C62828; }
    .card-balance { background: #E3F2FD; border-left: 4px solid #1565C0; }
    .card-label { font-size: 10px; color: #546E7A; text-transform: uppercase; letter-spacing: 0.5px; }
    .card-value { font-size: 16px; font-weight: 700; margin-top: 4px; }
    .card-income .card-value { color: #2E7D32; }
    .card-expense .card-value { color: #C62828; }
    .card-balance .card-value { color: #1565C0; }
    
    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #0D1B2A; color: #fff; padding: 8px 6px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; }
    td { padding: 7px 6px; border-bottom: 1px solid #ECEFF1; vertical-align: top; }
    tr.even td { background: #F9FAFB; }
    tr.odd td { background: #fff; }
    tr:hover td { background: #FFF3E0; }
    
    .badge { padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; text-transform: uppercase; }
    .badge-income { background: #E8F5E9; color: #2E7D32; }
    .badge-expense { background: #FFEBEE; color: #C62828; }
    
    .amount { font-weight: 600; text-align: right; }
    .amount.income { color: #2E7D32; }
    .amount.expense { color: #C62828; }
    
    /* Footer */
    .footer { border-top: 1px solid #CFD8DC; padding-top: 10px; text-align: center; color: #90A4AE; font-size: 9px; margin-top: 20px; }
    
    /* Print */
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
      @page { margin: 15mm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">🏗️ Vinyak Infratrack</div>
      <div class="company-tagline">Road • Bridge • Building Construction</div>
    </div>
    <div class="report-date">
      Generated: ${formatDate(now)}<br/>
      ${now.toLocaleTimeString('en-IN')}
    </div>
  </div>

  <div class="report-title">${title}</div>
  ${subtitle ? `<div class="report-subtitle">${subtitle}</div>` : ''}

  <div class="summary">
    <div class="card card-income">
      <div class="card-label">Total Income</div>
      <div class="card-value">${formatCurrencyFull(totalIncome)}</div>
    </div>
    <div class="card card-expense">
      <div class="card-label">Total Expense</div>
      <div class="card-value">${formatCurrencyFull(totalExpense)}</div>
    </div>
    <div class="card card-balance">
      <div class="card-label">Net Balance</div>
      <div class="card-value">${formatCurrencyFull(balance)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Project</th>
        <th>Party</th>
        <th>Category</th>
        <th style="text-align:right">Amount</th>
        <th>Added By</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${rows.length > 0 ? rows : '<tr><td colspan="8" style="text-align:center;padding:20px;color:#90A4AE;">No transactions found</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    Vinyak Infratrack — Financial Records System | Total ${transactions.length} transaction(s) | This is a system-generated report.
  </div>
</body>
</html>
`;
};
