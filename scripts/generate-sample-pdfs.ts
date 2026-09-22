import fs from "fs";
import path from "path";

// Generate clean, standards-compliant text-based PDF 1.4 files
function createSimplePdf(title: string, text: string): string {
  const lines = text.split("\n");
  let streamContent = `BT\n/F1 14 Tf\n50 740 Td\n(${escapePdfText(title)}) Tj\nET\n`;
  streamContent += `BT\n/F1 9 Tf\n50 710 Td\n13 TL\n`;
  for (const line of lines) {
    streamContent += `(${escapePdfText(line)}) '\n`;
  }
  streamContent += `ET\n`;

  const streamLength = Buffer.byteLength(streamContent, "utf-8");

  const objects: string[] = [];
  // 1: Catalog
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  // 2: Pages
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  // 3: Page
  objects.push("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n");
  // 4: Contents stream
  objects.push(`4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}endstream\nendobj\n`);
  // 5: Font definition
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

const testContracts = [
  {
    filename: "Employment_Agreement_v1.pdf",
    title: "EMPLOYMENT AGREEMENT - APEX GLOBAL TECHNOLOGIES",
    body: `1. APPOINTMENT AND DUTIES
The Company employs Jane Doe as Senior Engineering Director.

2. TERM AND PROBATION
Employment commences February 1, 2025. The initial ninety (90) days constitutes a probationary period.
During probation, termination requires fourteen (14) days prior written notice.

3. COMPENSATION AND BENEFITS
Base salary: $185,000 per annum paid monthly. Health and dental benefits eligible.
Reimbursement for reasonable business expenses within 30 days of submission.

4. CONFIDENTIALITY AND RETURN OF PROPERTY
Employee shall not disclose proprietary information.
Return all Company property within seven (7) days of termination.

5. INTELLECTUAL PROPERTY
All inventions and software code created during employment constitute work for hire owned by Company.

6. RESTRICTIVE COVENANTS
Non-solicitation of employees: 6 months. Non-solicitation of active customers: 6 months.

7. TERMINATION FOR CAUSE
Immediate termination without notice upon felony conviction, willful misconduct, or breach of confidentiality.

8. TERMINATION WITHOUT CAUSE
8.2 Advance Notice. The Company or Employee may terminate without Cause by providing sixty (60) days advance written notice.

9. SEVERANCE
Employees terminated without Cause after probation shall receive severance in accordance with Schedule B (Missing Schedule).

10. GOVERNING LAW AND DISPUTE RESOLUTION
Governed by California law. Mandatory binding AAA arbitration in San Francisco.

17. GENERAL PROVISIONS
17.1 Notice Requirements. Any formal notice under this Agreement must be delivered in writing with thirty (30) days notice.`,
  },
  {
    filename: "Commercial_Lease_Agreement.pdf",
    title: "COMMERCIAL PROPERTY LEASE AGREEMENT",
    body: `1. PARTIES AND PREMISES
Landlord: Metro Commercial Properties LLC. Tenant: Nexus Retail Innovations Inc.
Premises: Suite 300, 450 Market Street, San Francisco, CA.

2. LEASE TERM
Term: Three (3) years starting April 1, 2025 and expiring March 31, 2028.

3. RENT AND SECURITY DEPOSIT
Base Rent: $8,500 per month due on the 1st of each month. Late fee of 5% applied after the 5th day.
Security Deposit: $17,000 held in escrow.

4. USE AND MAINTENANCE
Tenant shall use premises strictly for retail technology showcase and professional offices.
Tenant is responsible for internal maintenance; Landlord maintains structural roof and exterior walls.

5. UTILITIES AND EXPENSES
Tenant pays electric and fiber internet directly. Water and trash included in base rent.

6. ALTERATIONS
Tenant may not make structural alterations without Landlord prior written consent exceeding $5,000.

7. DEFAULT AND TERMINATION
Default occurs upon 10 days failure to pay rent or 30 days failure to cure non-monetary violations.

8. GOVERNING LAW
Governed by the laws of the State of California.`,
  },
  {
    filename: "Mutual_NDA_Agreement.pdf",
    title: "MUTUAL NON-DISCLOSURE AGREEMENT",
    body: `1. PURPOSE
The parties wish to explore a potential business partnership regarding AI contract analytics.

2. DEFINITION OF CONFIDENTIAL INFORMATION
Includes technical specifications, financial forecasts, customer records, and product roadmaps marked Confidential.

3. OBLIGATIONS OF RECEIVING PARTY
Receiving Party agrees to protect disclosed information with reasonable care.

4. EXCLUSIONS FROM CONFIDENTIALITY
Information is excluded if: (a) publicly known through no breach; or (b) independently developed.

5. DURATION
Confidentiality obligations remain in effect for three (3) years following disclosure.

6. RETURN OR DESTRUCTION
Within ten (10) days of written request, Receiving Party must return or certify destruction of all confidential materials.

7. JURISDICTION
Governed by the laws of the State of New York.`,
  },
];

for (const c of testContracts) {
  const pdfString = createSimplePdf(c.title, c.body);
  const filePath = path.join(targetDir, c.filename);
  fs.writeFileSync(filePath, Buffer.from(pdfString, "binary"));
  console.log(`Successfully generated ${filePath} (${fs.statSync(filePath).size} bytes)`);
}
