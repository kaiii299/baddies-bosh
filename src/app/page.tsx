import Dashboard from "@/components/Home/dashboard";
import React from "react";

const page = async () => {

  async function getToolsData() {
    try {
      const baseUrl = "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/tools`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch tools");
      }

      return res.json();
    } catch (error) {
      console.error("Error loading tools:", error);
      return [];
    }
  }
  
  const tools = await getToolsData();

  console.log(tools);
  
  
  return (
    <div>
      <Dashboard tools={tools} />
    </div>
  );
};

export default page;
