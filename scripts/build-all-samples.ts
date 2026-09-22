import fs from "fs";
import path from "path";

function createPdf(title: string, lines: string[]): string {
  let streamContent = `BT\n/F1 13 Tf\n45 745 Td\n(${escapePdfText(title)}) Tj\nET\n`;
  streamContent += `BT\n/F1 8.5 Tf\n45 715 Td\n12.5 TL\n`;
  for (const line of lines) {
    streamContent += `(${escapePdfText(line)}) '\n`;
  }
  streamContent += `ET\n`;

  const streamLength = Buffer.byteLength(streamContent, "utf-8");

  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objects.push("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n");
  objects.push(`4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}endstream\nendobj\n`);
  objects.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

  let pdf = "%PDF-1.4\n";
  const xref: number[] = [0];
  let offset = Buffer.byteLength(pdf, "utf-8");

  for (const obj of objects) {
    xref.push(offset);
    pdf += obj;
    offset = Buffer.byteLength(pdf, "utf-8");
  }

  const startxref = offset;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(xref[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  return pdf;
}

function escapePdfText(str: string): string {
  return str.replace(/[()\\]/g, "\\$&");
}

const targetDir = path.join(process.cwd(), "public", "sample-contracts");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Employment Agreement
const empPdf = createPdf("EMPLOYMENT AGREEMENT (APEX GLOBAL & JANE DOE)", [
  "1. APPOINTMENT AND SCOPE OF WORK",
  "The Company hereby engages Jane Doe as Senior Engineering Director effective February 1, 2025.",
  "",
  "2. PROBATIONARY PERIOD & NOTICE",
  "The initial ninety (90) days shall be a probationary period. Termination during probation requires 14 days notice.",
  "",
  "3. COMPENSATION & EXPENSES",
  "Base compensation: $185,000 per annum paid monthly. Medical and dental coverage provided.",
  "Reimbursement of authorized business expenditures payable within 30 days of invoice receipt.",
  "",
  "4. INTELLECTUAL PROPERTY & CONFIDENTIALITY",
  "All inventions, software code, and documentation developed during employment are exclusive Company property.",
  "Employee shall hold all proprietary trade secrets in strict confidence indefinitely.",
  "",
  "5. RESTRICTIVE COVENANTS",
  "Non-solicitation: Employee agrees not to solicit employees or clients for a duration of six (6) months.",
  "",
  "6. TERMINATION FOR CAUSE",
  "The Company may terminate employment immediately without notice in the event of gross negligence or felony conviction.",
  "",
  "7. TERMINATION WITHOUT CAUSE (CONTRADICTION FLAG)",
  "Section 7.2: Either party may terminate this agreement without cause by providing sixty (60) days advance written notice.",
  "",
  "8. SEVERANCE ENTITLEMENT (MISSING SCHEDULE FLAG)",
  "Upon termination without cause, Employee is entitled to severance pay computed under Schedule B (Schedule B is omitted).",
  "",
  "9. DISPUTE RESOLUTION & NOTICE REQUIREMENTS",
  "Section 9.1: Governing law: State of California. Mandatory binding arbitration under AAA rules in San Francisco.",
  "Section 9.4: Any official notice under this Agreement shall require thirty (30) days prior written notice."
]);
fs.writeFileSync(path.join(targetDir, "Employment_Agreement_Sample.pdf"), Buffer.from(empPdf, "binary"));

// 2. Commercial Lease Agreement
const leasePdf = createPdf("STANDARD COMMERCIAL REAL ESTATE LEASE AGREEMENT", [
  "1. PARTIES AND PREMISES",
  "Landlord: Pacific Coast Properties LLC. Tenant: Hyperion Software Systems Inc.",
  "Premises: Suite 400, 500 Howard Street, San Francisco, California 94105.",
  "",
  "2. TERM OF LEASE",
  "Lease Term: Three (3) years commencing on June 1, 2025 and expiring May 31, 2028.",
  "",
  "3. RENT & SECURITY DEPOSIT",
  "Monthly Base Rent: $9,200.00 USD payable on the first day of each calendar month.",
  "Late Fee: A charge of 5% is assessed on payments received after the fifth (5th) business day.",
  "Security Deposit: $18,400.00 USD deposited into escrow upon execution of this lease.",
  "",
  "4. USE OF PREMISES & RESTRICTIONS",
  "The premises shall be used exclusively for general executive offices and software development.",
  "No hazardous materials or excessive acoustic disturbance shall be permitted.",
  "",
  "5. MAINTENANCE AND ALTERATIONS",
  "Tenant maintains interior fixtures, cabling, and HVAC servicing. Landlord maintains exterior walls and roof.",
  "Alterations exceeding $5,000 require prior written authorization from Landlord.",
  "",
  "6. DEFAULT & CURE PERIODS",
  "Monetary Default: 10 days written notice to cure overdue rent before initiation of eviction proceedings.",
  "Non-Monetary Default: 30 days written notice to cure breach of covenants.",
  "",
  "7. GOVERNING LAW & JURISDICTION",
  "This Agreement is governed by the laws of California. Venue is proper exclusively in San Francisco County."
]);
fs.writeFileSync(path.join(targetDir, "Commercial_Lease_Sample.pdf"), Buffer.from(leasePdf, "binary"));

// 3. Mutual NDA
const ndaPdf = createPdf("MUTUAL NON-DISCLOSURE AGREEMENT (CONFIDENTIALITY)", [
  "1. PURPOSE OF DISCLOSURE",
  "The Parties intend to evaluate a potential strategic technology collaboration in machine learning legal analytics.",
  "",
  "2. DEFINITION OF CONFIDENTIAL INFORMATION",
  "Includes source code, algorithms, customer datasets, financial models, and patent disclosures marked Confidential.",
  "",
  "3. DUTY OF PROTECTION & NON-DISCLOSURE",
  "Each party agrees to safeguard disclosed information with at least reasonable care.",
  "Confidential information shall be disclosed solely to personnel with a bona fide need to know.",
  "",
  "4. EXCLUSIONS FROM CONFIDENTIALITY",
  "Obligations do not apply to information that: (a) becomes public through no wrongful act; (b) is already known; or",
  "(c) is independently developed without reference to the disclosed information.",
  "",
  "5. TERM & SURVIVAL OBLIGATION",
  "This Agreement remains in effect for two (2) years. Confidentiality covenants survive for five (5) years post-termination.",
  "",
  "6. MANDATORY RETURN OR CERTIFIED DESTRUCTION",
  "Within fourteen (14) days of receiving written notice, Receiving Party must destroy or return all materials.",
  "",
  "7. REMEDIES & GOVERNING LAW",
  "Breach justifies immediate injunctive relief without proof of actual monetary damages. Governed by Delaware law."
]);
fs.writeFileSync(path.join(targetDir, "Mutual_NDA_Sample.pdf"), Buffer.from(ndaPdf, "binary"));

// 4. Vendor Services Agreement
const vendorPdf = createPdf("MASTER PROFESSIONAL SERVICES AGREEMENT (SaaS / VENDOR)", [
  "1. STATEMENT OF WORK & DELIVERABLES",
  "Vendor: CloudSphere Solutions LLC. Client: Horizon Financial Technologies Corp.",
  "Vendor shall deliver cloud security auditing, SOC2 readiness assessment, and infrastructure hardening.",
  "",
  "2. PAYMENT TERMS & AUDIT RIGHTS",
  "Contract Value: $75,000 USD payable across three milestones (30% upfront, 40% draft delivery, 30% signoff).",
  "Invoices are payable Net 30 days. Client reserves the right to audit vendor logs once annually with 15 days notice.",
  "",
  "3. SERVICE LEVEL AGREEMENT (SLA) & PENALTIES",
  "Vendor guarantees 99.9% uptime for audit portal. Downtime exceeding 4 hours triggers a 10% credit penalty.",
  "",
  "4. LIMITATION OF LIABILITY & INDEMNIFICATION",
  "Total aggregate liability of either party shall be capped at 2x the total fees paid under this Agreement.",
  "Exceptions: Gross negligence, willful misconduct, and breach of data security obligations are uncapped.",
  "",
  "5. TERMINATION RIGHTS",
  "Either party may terminate for convenience with forty-five (45) days prior written notice.",
  "Immediate termination upon insolvency, bankruptcy petition, or material uncured breach after 15 days notice."
]);
fs.writeFileSync(path.join(targetDir, "Vendor_Services_Sample.pdf"), Buffer.from(vendorPdf, "binary"));

console.log("All 4 sample PDFs created successfully!");
