import { DataTable } from '@/components/tableView';
import React from 'react'

async function getTools() {
  try {
    // Use absolute URL in development
    const res = await fetch(`/api/tools`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch tools');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error loading tools:', error);
    return [];
  }
}

export default async function ToolsPage() {
  const tools = await getTools();

  return (
    <div className="w-full">
      <DataTable initialData={tools} />
    </div>
  );
}