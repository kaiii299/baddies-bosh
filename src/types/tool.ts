type ToolData = {
  serialIdNo: string;                    // Required (Primary Key)
  div?: string;                           // Optional
  description: string;                    // Required
  standard?: string;                      // Optional
  category?: string;                      // Optional
  brand: string;                          // Required
  tag?: string;                           // Optional
  modelPartNo?: string;                    // Optional
  range?: string;                         // Optional
  inUse: string;                          // Required
  calibrationInterval?: string;           // Optional
  lastCalibration?: string;               // Optional
  calibrationDue?: string;                 // Optional
  remainingMonths?: string;                // Optional
  externalCal?: string;                    // Optional
  calibrationReportNumber?: string;        // Optional
  calibrator?: string;                     // Optional
  pic?: string;                            // Optional
  externalToleranceLimit?: string;         // Optional
  internalToleranceLimit?: string;         // Optional
  actionForRenewalReminder?: string;       // Optional
};