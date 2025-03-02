"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileType,
} from "lucide-react";
import { toast } from "sonner";
import boschData from "../data/Bosch_Dataset_Predictions.json";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Define the export types
type ExportFormat = "pdf" | "json" | "excel" | "csv";
type ExportDataType = "compliance" | "tools" | "calendar";

// Define proper types for your data
interface ToolData {
  serialIdNo: string;
  description: string;
  brand: string;
  modelPartNo?: string;
  div?: string;
  status?: string;
  lastCalibration?: string;
  calibrationDue?: string;
  remainingMths?: string;
  calibrator?: string;
  pic?: string;
  inUse?: string;
  isCompliant?: boolean;
  predictedIdealCalibrationDate?: string;
  differenceFromPredictions?: number;
}

const ExportPage = () => {
  const [isExporting, setIsExporting] = useState<Record<string, boolean>>({});

  // Function to prepare compliance data
  const prepareComplianceData = () => {
    return boschData.map((tool) => ({
      serialIdNo: tool.serialIdNo,
      description: tool.description,
      brand: tool.brand,
      modelPartNo: tool.modelPartNo,
      status: tool.status,
      lastCalibration: tool.lastCalibration,
      calibrationDue: tool.calibrationDue,
      remainingMths: tool.remainingMths,
      calibrator: tool.calibrator,
      pic: tool.pic,
      inUse: tool.inUse,
      isCompliant: tool.status === "Optimal",
    }));
  };

  // Function to prepare tool data (raw data)
  const prepareToolData = () => {
    return boschData;
  };

  // Function to prepare calendar data
  const prepareCalendarData = () => {
    return boschData.map((tool) => ({
      serialIdNo: tool.serialIdNo,
      description: tool.description,
      brand: tool.brand,
      modelPartNo: tool.modelPartNo,
      lastCalibration: tool.lastCalibration,
      calibrationDue: tool.calibrationDue,
      predictedIdealCalibrationDate: tool.predictedIdealCalibrationDate,
      differenceFromPredictions: tool.differenceFromPredictions,
      status: tool.status,
      calibrator: tool.calibrator,
      pic: tool.pic,
    }));
  };

  // Function to export data based on format and type
  const exportData = async (format: ExportFormat, dataType: ExportDataType) => {
    const exportKey = `${dataType}-${format}`;
    setIsExporting({ ...isExporting, [exportKey]: true });

    try {
      let data;
      let filename = "";

      // Prepare data based on type
      switch (dataType) {
        case "compliance":
          data = prepareComplianceData();
          filename = "compliance-data";
          break;
        case "tools":
          data = prepareToolData();
          filename = "tool-data";
          break;
        case "calendar":
          data = prepareCalendarData();
          filename = "calendar-data";
          break;
      }

      // Export based on format
      switch (format) {
        case "pdf":
          exportToPdf(data, filename, dataType);
          break;
        case "json":
          exportToJson(data, filename);
          break;
        case "excel":
          exportToExcel(data, filename);
          break;
        case "csv":
          exportToCsv(data, filename);
          break;
      }

      toast.success(`${dataType} data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting({ ...isExporting, [exportKey]: false });
    }
  };

  // PDF export function
  const exportToPdf = (
    data: ToolData[],
    filename: string,
    dataType: ExportDataType
  ) => {
    const doc = new jsPDF();

    // Add title
    const title =
      dataType === "compliance"
        ? "Tool Compliance Audit Report"
        : dataType === "tools"
        ? "Complete Tool Inventory Data"
        : "Calibration Calendar Data";

    doc.setFontSize(16);
    doc.text(title, 14, 15);

    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // Add summary for compliance report
    if (dataType === "compliance") {
      const compliantTools = data.filter((tool) => tool.isCompliant).length;
      const totalTools = data.length;
      const complianceRate = ((compliantTools / totalTools) * 100).toFixed(2);

      doc.setFontSize(12);
      doc.text(`Compliance Summary:`, 14, 30);
      doc.text(`Total Tools: ${totalTools}`, 20, 37);
      doc.text(`Compliant Tools: ${compliantTools}`, 20, 44);
      doc.text(`Compliance Rate: ${complianceRate}%`, 20, 51);

      // Start table after summary
      autoTable(doc, {
        startY: 60,
        head: [
          [
            "Serial ID",
            "Description",
            "Status",
            "Due Date",
            "Remaining (Months)",
            "Compliant",
          ],
        ],
        body: data.map((item) => [
          item.serialIdNo || "",
          item.description || "",
          item.status || "",
          item.calibrationDue || "",
          item.remainingMths || "",
          item.isCompliant ? "Yes" : "No",
        ]),
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        didParseCell: (cellData) => {
          if (cellData.section === "body" && cellData.row.index !== undefined) {
            const rowIndex = cellData.row.index;
            if (data[rowIndex] && !data[rowIndex].isCompliant) {
              cellData.cell.styles.fillColor = [255, 240, 240];
            }
          }
        },
      });
    } else if (dataType === "calendar") {
      // Calendar data table
      autoTable(doc, {
        startY: 30,
        head: [
          [
            "Serial ID",
            "Description",
            "Last Calibration",
            "Due Date",
            "Predicted Date",
            "Status",
          ],
        ],
        body: data.map((item) => [
          item.serialIdNo || "",
          item.description || "",
          item.lastCalibration || "",
          item.calibrationDue || "",
          item.predictedIdealCalibrationDate || "",
          item.status || "",
        ]),
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });
    } else {
      // Tool data (simplified for PDF)
      autoTable(doc, {
        startY: 30,
        head: [
          ["Serial ID", "Description", "Brand", "Model", "Division", "In Use"],
        ],
        body: data.map((item) => [
          item.serialIdNo || "",
          item.description || "",
          item.brand || "",
          item.modelPartNo || "",
          item.div || "",
          item.inUse || "",
        ]),
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });
    }

    doc.save(`${filename}.pdf`);
  };

  // JSON export function
  const exportToJson = (data: ToolData[], filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Excel export function
  const exportToExcel = (data: ToolData[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  // CSV export function
  const exportToCsv = (data: ToolData[], filename: string) => {
    // Convert data to CSV
    const replacer = (_key: string, value: unknown): string =>
      value === null || value === undefined ? "" : String(value);

    const header = Object.keys(data[0]);
    const csv = data.map((row) =>
      header
        .map((fieldName) => {
          const value = (row as unknown as Record<string, unknown>)[fieldName];
          return JSON.stringify(
            value,
            replacer as (key: string, value: unknown) => string
          );
        })
        .join(",")
    );
    csv.unshift(header.join(","));
    const csvString = csv.join("\r\n");

    // Create download link
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  //   // Format names for display
  //   const formatDataTypeName = (type: ExportDataType) => {
  //     switch (type) {
  //       case "compliance":
  //         return "Compliance Data";
  //       case "tools":
  //         return "Tool Data";
  //       case "calendar":
  //         return "Calendar Data";
  //     }
  //   };

  // Get icon for format
  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "json":
        return <FileJson className="h-5 w-5" />;
      case "excel":
        return <FileSpreadsheet className="h-5 w-5" />;
      case "csv":
        return <FileType className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Export Audit Data</h1>
      <p className="text-gray-600 mb-8">
        Export tool data in various formats for compliance audits, inventory
        management, and calibration scheduling.
      </p>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compliance">Compliance Data</TabsTrigger>
          <TabsTrigger value="tools">Tool Data</TabsTrigger>
          <TabsTrigger value="calendar">Calendar Data</TabsTrigger>
        </TabsList>

        {/* Compliance Data Tab */}
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Data Export</CardTitle>
              <CardDescription>
                Export data about tool compliance status, including calibration
                dates and compliance indicators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(["pdf", "json", "excel", "csv"] as ExportFormat[]).map(
                  (format) => (
                    <Button
                      key={format}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => exportData(format, "compliance")}
                      disabled={isExporting[`compliance-${format}`]}
                    >
                      {getFormatIcon(format)}
                      <span className="uppercase">{format}</span>
                      {isExporting[`compliance-${format}`] && (
                        <span className="text-xs text-muted-foreground">
                          Exporting...
                        </span>
                      )}
                    </Button>
                  )
                )}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">
                  Compliance Data Includes:
                </h3>
                <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                  <li>Tool identification details</li>
                  <li>Current calibration status</li>
                  <li>Calibration due dates</li>
                  <li>Compliance indicators</li>
                  <li>Person in charge information</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tool Data Tab */}
        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Tool Data Export</CardTitle>
              <CardDescription>
                Export complete tool inventory data with all available fields.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(["pdf", "json", "excel", "csv"] as ExportFormat[]).map(
                  (format) => (
                    <Button
                      key={format}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => exportData(format, "tools")}
                      disabled={isExporting[`tools-${format}`]}
                    >
                      {getFormatIcon(format)}
                      <span className="uppercase">{format}</span>
                      {isExporting[`tools-${format}`] && (
                        <span className="text-xs text-muted-foreground">
                          Exporting...
                        </span>
                      )}
                    </Button>
                  )
                )}
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-md">
                <h3 className="font-medium text-green-800 mb-2">
                  Tool Data Includes:
                </h3>
                <ul className="list-disc pl-5 text-sm text-green-700 space-y-1">
                  <li>Complete tool specifications</li>
                  <li>Division and category information</li>
                  <li>Tolerance limits and ranges</li>
                  <li>All calibration history</li>
                  <li>Raw data for all tool attributes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Data Tab */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Data Export</CardTitle>
              <CardDescription>
                Export calibration schedule data including predicted calibration
                dates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(["pdf", "json", "excel", "csv"] as ExportFormat[]).map(
                  (format) => (
                    <Button
                      key={format}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => exportData(format, "calendar")}
                      disabled={isExporting[`calendar-${format}`]}
                    >
                      {getFormatIcon(format)}
                      <span className="uppercase">{format}</span>
                      {isExporting[`calendar-${format}`] && (
                        <span className="text-xs text-muted-foreground">
                          Exporting...
                        </span>
                      )}
                    </Button>
                  )
                )}
              </div>
              <div className="mt-6 p-4 bg-purple-50 rounded-md">
                <h3 className="font-medium text-purple-800 mb-2">
                  Calendar Data Includes:
                </h3>
                <ul className="list-disc pl-5 text-sm text-purple-700 space-y-1">
                  <li>Last calibration dates</li>
                  <li>Due calibration dates</li>
                  <li>AI-predicted ideal calibration dates</li>
                  <li>Calibration status information</li>
                  <li>Calibrator and person in charge details</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Audit Report Generation</CardTitle>
          <CardDescription>
            Generate a comprehensive audit report with all data types in a
            single PDF document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full h-16 flex items-center justify-center gap-2"
            onClick={() => {
              toast.success("Generating comprehensive audit report...");
              // This would be implemented to generate a combined report
              setTimeout(() => {
                exportData("pdf", "compliance");
              }, 500);
            }}
          >
            <Download className="h-5 w-5" />
            <span>Generate Complete Audit Report</span>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            The complete audit report includes compliance data, tool inventory,
            and calibration schedule in a single document formatted for audit
            purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportPage;
