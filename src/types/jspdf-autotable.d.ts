import { jsPDF } from "jspdf";

declare module "jspdf-autotable" {
  interface CellStyles {
    fillColor?: number[];
    textColor?: number;
    [key: string]: unknown;
  }

  interface CellHookData {
    cell: {
      styles: CellStyles;
    };
    row: {
      index: number;
    };
    section: string;
    column: {
      index: number;
    };
    [key: string]: unknown;
  }

  interface UserOptions {
    startY?: number;
    head?: Array<Array<string>>;
    body?: Array<Array<string | number | boolean>>;
    theme?: string;
    headStyles?: Record<string, unknown>;
    alternateRowStyles?: Record<string, unknown>;
    styles?: Record<string, unknown>;
    didParseCell?: (data: CellHookData) => void;
  }

  function autoTable(doc: jsPDF, options: UserOptions): jsPDF;
  export default autoTable;
}
