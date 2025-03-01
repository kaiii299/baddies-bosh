import Dashboard from "@/components/Home/dashboard";
import React from "react";

type Props = {};

const page = async (props: Props) => {

  async function getToolsData() {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
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
  
  return (
    <div>
      <Dashboard tools={tools} />
    </div>
  );
};

export default page;
