import { DataTableDemo } from '@/components/tableView';
import React from 'react'

async function getTools() {
  try {
    // Use absolute URL in development
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/tools`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch tools');
    }

    const data = await res.json();
    console.log('Fetched tools:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error loading tools:', error);
    return [];
  }
}

export default async function ToolsPage() {
  const tools = await getTools();
  
  // Debug log
  console.log('Tools passed to DataTableDemo:', tools);

  return (
    <div className="w-full">
      <DataTableDemo initialData={tools} />
    </div>
  );
}