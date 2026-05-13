"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

type InvoiceItem = {
  name: string;
  variant: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type InvoiceData = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  placedAt: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shipping: number;
  total: number;
  currencyCode: string;
  currencySymbol: string;
  storeName: string;
  supportEmail: string;
  contactPhone: string | null;
  items: InvoiceItem[];
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;

export function InvoiceDownloadButton({ invoice }: { invoice: InvoiceData }) {
  function downloadInvoice() {
    const pdf = createInvoicePdf(invoice);
    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${safeFileName(invoice.orderNumber)}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" onClick={downloadInvoice} className="mt-4 bg-[#ff6c2f] hover:bg-[#ec5c20]">
      <Download className="h-4 w-4" />
      Download Invoice
    </Button>
  );
}

function createInvoicePdf(invoice: InvoiceData) {
  const pages: string[] = [];
  let content: string[] = [];
  let pageNumber = 0;

  function newPage() {
    if (content.length) pages.push(content.join("\n"));
    pageNumber += 1;
    content = [];
    drawPageShell(content, invoice, pageNumber);
  }

  newPage();

  let y = 172;
  y = drawDetails(content, invoice, y);
  y += 22;
  y = drawItemsHeader(content, y);

  invoice.items.forEach((item, index) => {
    const itemLines = wrapText(`${item.name} ${item.variant ? `- ${item.variant}` : ""}`, 42);
    const rowHeight = Math.max(46, 26 + itemLines.length * 12);
    if (y + rowHeight > 690) {
      newPage();
      y = drawItemsHeader(content, 142);
    }

    const fill = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
    fillRect(content, MARGIN, y, PAGE_WIDTH - MARGIN * 2, rowHeight, fill);
    text(content, MARGIN + 12, y + 19, itemLines[0] ?? item.name, 10, "bold", [20, 32, 68]);
    itemLines.slice(1).forEach((line, lineIndex) => text(content, MARGIN + 12, y + 33 + lineIndex * 12, line, 9, "regular", [82, 98, 125]));
    text(content, MARGIN + 12, y + rowHeight - 11, `SKU: ${item.sku || "N/A"}`, 8, "regular", [112, 124, 148]);
    text(content, 328, y + 24, String(item.quantity), 10, "regular", [20, 32, 68]);
    text(content, 386, y + 24, money(item.unitPrice, invoice), 10, "regular", [20, 32, 68]);
    text(content, 486, y + 24, money(item.lineTotal, invoice), 10, "bold", [20, 32, 68]);
    line(content, MARGIN, y + rowHeight, PAGE_WIDTH - MARGIN, y + rowHeight, [229, 237, 246]);
    y += rowHeight;
  });

  if (y > 590) {
    newPage();
    y = 150;
  } else {
    y += 26;
  }

  drawTotals(content, invoice, y);

  pages.push(content.join("\n"));
  return buildPdf(pages);
}

function drawPageShell(content: string[], invoice: InvoiceData, pageNumber: number) {
  fillRect(content, 0, 0, PAGE_WIDTH, 18, [255, 108, 47]);
  fillRect(content, 0, 18, PAGE_WIDTH, 88, [20, 32, 68]);
  text(content, MARGIN, 56, invoice.storeName || "Veloure", 24, "bold", [255, 255, 255]);
  text(content, MARGIN, 79, [invoice.supportEmail, invoice.contactPhone].filter(Boolean).join("  |  "), 9, "regular", [220, 226, 236]);

  text(content, 422, 50, "INVOICE", 24, "bold", [255, 255, 255]);
  text(content, 424, 76, invoice.orderNumber, 10, "regular", [220, 226, 236]);

  text(content, MARGIN, 804, "Thank you for shopping with Veloure.", 8, "regular", [112, 124, 148]);
  text(content, 500, 804, `Page ${pageNumber}`, 8, "regular", [112, 124, 148]);
}

function drawDetails(content: string[], invoice: InvoiceData, y: number) {
  const boxWidth = (PAGE_WIDTH - MARGIN * 2 - 18) / 2;
  fillRect(content, MARGIN, y, boxWidth, 114, [248, 250, 252]);
  fillRect(content, MARGIN + boxWidth + 18, y, boxWidth, 114, [248, 250, 252]);

  text(content, MARGIN + 14, y + 24, "Bill To", 12, "bold", [20, 32, 68]);
  text(content, MARGIN + 14, y + 45, invoice.customerName, 10, "bold", [20, 32, 68]);
  text(content, MARGIN + 14, y + 61, invoice.customerEmail, 9, "regular", [82, 98, 125]);
  text(content, MARGIN + 14, y + 77, invoice.customerPhone || "No phone number", 9, "regular", [82, 98, 125]);
  wrapText(invoice.shippingAddress || "No shipping address", 38).slice(0, 2).forEach((lineText, index) => {
    text(content, MARGIN + 14, y + 93 + index * 12, lineText, 8, "regular", [112, 124, 148]);
  });

  const rightX = MARGIN + boxWidth + 32;
  text(content, rightX, y + 24, "Invoice Details", 12, "bold", [20, 32, 68]);
  detailRow(content, rightX, y + 47, "Issued", formatDate(invoice.placedAt));
  detailRow(content, rightX, y + 65, "Payment", humanize(invoice.paymentStatus));
  detailRow(content, rightX, y + 83, "Method", humanize(invoice.paymentMethod));
  detailRow(content, rightX, y + 101, "Order", humanize(invoice.orderStatus));

  return y + 114;
}

function drawItemsHeader(content: string[], y: number) {
  fillRect(content, MARGIN, y, PAGE_WIDTH - MARGIN * 2, 32, [241, 245, 249]);
  text(content, MARGIN + 12, y + 21, "Item", 9, "bold", [82, 98, 125]);
  text(content, 328, y + 21, "Qty", 9, "bold", [82, 98, 125]);
  text(content, 386, y + 21, "Unit Price", 9, "bold", [82, 98, 125]);
  text(content, 486, y + 21, "Amount", 9, "bold", [82, 98, 125]);
  return y + 32;
}

function drawTotals(content: string[], invoice: InvoiceData, y: number) {
  const x = 338;
  const width = PAGE_WIDTH - MARGIN - x;
  fillRect(content, x, y, width, 132, [248, 250, 252]);
  totalsRow(content, x, y + 26, "Subtotal", money(invoice.subtotal, invoice), false);
  totalsRow(content, x, y + 52, "Shipping", money(invoice.shipping, invoice), false);
  line(content, x + 16, y + 70, x + width - 16, y + 70, [229, 237, 246]);
  totalsRow(content, x, y + 98, "Total", money(invoice.total, invoice), true);

  fillRect(content, MARGIN, y, 260, 86, [255, 246, 242]);
  text(content, MARGIN + 14, y + 24, "Notes", 11, "bold", [20, 32, 68]);
  wrapText("All accounts are payable within 7 days from receipt of invoice. Please reference the invoice number with your payment.", 47)
    .slice(0, 4)
    .forEach((lineText, index) => text(content, MARGIN + 14, y + 43 + index * 12, lineText, 8, "regular", [82, 98, 125]));
}

function detailRow(content: string[], x: number, y: number, label: string, value: string) {
  text(content, x, y, label, 8, "bold", [112, 124, 148]);
  text(content, x + 74, y, value, 9, "regular", [20, 32, 68]);
}

function totalsRow(content: string[], x: number, y: number, label: string, value: string, bold: boolean) {
  text(content, x + 16, y, label, bold ? 11 : 9, bold ? "bold" : "regular", [20, 32, 68]);
  text(content, x + 128, y, value, bold ? 12 : 9, bold ? "bold" : "regular", [20, 32, 68]);
}

function text(content: string[], x: number, yTop: number, value: string, size: number, font: "regular" | "bold", color: number[]) {
  content.push(`${rgb(color, "fill")} BT /${font === "bold" ? "F2" : "F1"} ${size} Tf ${x.toFixed(2)} ${(PAGE_HEIGHT - yTop).toFixed(2)} Td (${escapePdf(value)}) Tj ET`);
}

function line(content: string[], x1: number, y1Top: number, x2: number, y2Top: number, color: number[]) {
  content.push(`${rgb(color, "stroke")} 0.8 w ${x1.toFixed(2)} ${(PAGE_HEIGHT - y1Top).toFixed(2)} m ${x2.toFixed(2)} ${(PAGE_HEIGHT - y2Top).toFixed(2)} l S`);
}

function fillRect(content: string[], x: number, yTop: number, width: number, height: number, color: number[]) {
  content.push(`${rgb(color, "fill")} ${x.toFixed(2)} ${(PAGE_HEIGHT - yTop - height).toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`);
}

function rgb(color: number[], mode: "fill" | "stroke") {
  const values = color.map((value) => (value / 255).toFixed(3)).join(" ");
  return `${values} ${mode === "fill" ? "rg" : "RG"}`;
}

function buildPdf(pageStreams: string[]) {
  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("<< /Type /Pages /Kids [] /Count 0 >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  pageStreams.forEach((stream) => {
    const contentId = objects.length + 2;
    const pageId = objects.length + 1;
    pageObjectIds.push(pageId);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects.push(`<< /Length ${byteLength(stream)} >>\nstream\n${stream}\nendstream`);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function escapePdf(value: string) {
  return value
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(value: string, maxChars: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
      return;
    }
    current = next;
  });

  if (current) lines.push(current);
  return lines.length ? lines : [value];
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

function money(value: number, invoice: InvoiceData) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currencyCode || "USD",
      maximumFractionDigits: 2
    }).format(Number(value || 0));
  } catch {
    return `${invoice.currencySymbol || "$"}${Number(value || 0).toFixed(2)}`;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "invoice";
}
