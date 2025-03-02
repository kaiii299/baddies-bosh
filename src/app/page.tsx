import Dashboard from "@/components/Home/dashboard";
import React from "react";
import fs from 'fs';
import path from 'path';

const page = () => {
  const toolsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'data', 'Bosch_Dataset_Predictions.json'), 'utf8'));

  return (
    <div>
      <Dashboard tools={toolsData} />
    </div>
  );
};

export default page;
