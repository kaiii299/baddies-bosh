import { DataTable } from '@/components/tableView';
import React from 'react';
import fs from 'fs';
import path from 'path';

export default function ToolsPage() {
  // Get tools data directly from JSON
  const toolsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'data', 'Bosch_Dataset_Predictions.json'), 'utf8'));

  return (
    <div className="w-full">
      <DataTable initialData={toolsData} />
    </div>
  );
}