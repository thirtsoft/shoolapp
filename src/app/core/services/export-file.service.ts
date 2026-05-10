import { Injectable } from '@angular/core';

import * as FileSaver from 'file-saver';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportFileService {

  constructor() { }

  exportToPDF(
    columns: { key: string; header: string }[],
    data: any[],
    title: string,
    fileName: string,
    logoUrl: string = 'assets/img/logo.png',
    subtitle: string = "ECOLE LES DAUPHINS NGOR A DAKAR",
    addresstitle: string = "Derrière le casino du cap vert",
    telephonetitle: string = "Tél: 33 820 10 92 - BP 6268 Dakar étoile",
    slogantitle: string = "l'Ecole pour grandir",
  ) {
    const doc = new jsPDF();

    if (logoUrl) {
      const logoWidth = 30;
      const logoHeight = 20;
      const pageWidth = doc.internal.pageSize.width;
      const logoX = (pageWidth - logoWidth) / 2;
      const logoY = 10;
      doc.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
    }
    const subtitleY = 35;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(subtitle, doc.internal.pageSize.width / 2, 35, { align: 'center' });

    const lineSpacing = 6;
    const otherLines = [
      addresstitle,
      telephonetitle,
      "Web: www.ecolelesdauphins.org",
      "Email: ecolelesdauphin@gmail.com",
      `« ${slogantitle} »`
    ];
    doc.setFontSize(10);

    otherLines.forEach((line, index) => {
      doc.text(line, doc.internal.pageSize.width / 2, subtitleY + lineSpacing * (index + 1), {
        align: 'center',
      });
    });

    const lastLineY = subtitleY + lineSpacing * (otherLines.length + 1);
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text(title, doc.internal.pageSize.width / 2, lastLineY + 10, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(10, lastLineY + 15, doc.internal.pageSize.width - 10, lastLineY + 15);


    const nonEmptyColumns = columns.filter(col => {
      return data.some(row => {
        const value = row[col.key];
        return value !== null && value !== undefined && String(value).trim() !== '';
      });
    });

    const headers = nonEmptyColumns.map(col => col.header);
    const body = data.map(row => nonEmptyColumns.map(col => row[col.key]));

    (doc as any).autoTable({
      startY: lastLineY + 20,
      head: [headers],
      body: body,
      theme: 'grid',
      tableWidth: 'auto',
      styles: {
        //  halign: 'center',
        fontSize: 10,
        halign: 'left',
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [0, 0, 255],
        textColor: [255, 255, 255]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 10 }
    });
    doc.save(`${fileName}.pdf`);
  }

  exportToExcel(columns: { key: string; header: string }[], data: any[], fileName: string) {
    const formattedData = data.map(row => {
      const obj: any = {};
      columns.forEach(col => {
        obj[col.header] = row[col.key];
      });
      return obj;
    });
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[headerCell]) continue;
      worksheet[headerCell].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4CAF50" } },
        alignment: { horizontal: "center" }
      };
    }
    const workbook = { Sheets: { 'Données': worksheet }, SheetNames: ['Données'] };

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, fileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }

}
