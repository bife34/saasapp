
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Pool, PoolRecord } from '@/lib/types';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useCurrentUser } from '@/components/app-layout';
import { mockRecords } from '@/lib/mock-data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PoolRecordsView = ({ pool }: { pool: Pool }) => {
  const [allRecords, setAllRecords] = useState<PoolRecord[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    // Filter and sort records for the current pool when the component mounts or pool changes
    const recordsForPool = mockRecords
      .filter(r => r.poolId === pool.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setAllRecords(recordsForPool);
  }, [pool.id]);

  const getFilteredRecords = () => {
    let poolRecords = allRecords;
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      poolRecords = poolRecords.filter(r => new Date(r.created_at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      poolRecords = poolRecords.filter(r => new Date(r.created_at) <= to);
    }
    return poolRecords;
  };

  const handleExportCSV = () => {
    const poolRecords = getFilteredRecords();
    if (poolRecords.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'There are no records in the selected date range to export.',
      });
      return;
    }

    const csvHeader = Object.keys(poolRecords[0]).join(',');
    const csvRows = poolRecords.map(row =>
      Object.values(row).map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `pool_records_${pool.id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'CSV Export Started',
      description: 'Your CSV file is downloading.',
    });
  };

  const handleExportPDF = () => {
    const poolRecords = getFilteredRecords();
    if (poolRecords.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'There are no records in the selected date range to export.',
      });
      return;
    }

    const doc = new jsPDF();

    // Add Title and Image
    if (pool.pool_picture) {
      try {
        // Add image - jspdf supports data URLs and some image formats
        doc.addImage(pool.pool_picture, 'PNG', 15, 15, 30, 30);
      } catch (e) {
        console.error("Could not add image to PDF:", e);
        // Continue without image if it fails
      }
    }
    doc.setFontSize(22);
    doc.text(pool.pool_name, 50, 25);
    doc.setFontSize(12);
    const dateRange = `Records from ${dateFrom ? format(dateFrom, 'PPP') : 'start'} to ${dateTo ? format(dateTo, 'PPP') : 'end'}`;
    doc.text(dateRange, 50, 35);
    
    // Create table
    autoTable(doc, {
      startY: 50,
      head: [['Date', 'pH', 'Chlorine', 'Overall State', 'Tasks Done', 'Weather']],
      body: poolRecords.map(record => [
        format(new Date(record.created_at), 'PPp'),
        record.ph,
        record.cl,
        record.overall_state,
        Object.entries({
          "Vacuumed": record.vacuumed,
          "Brushed": record.brushed,
          "Leaves Cleaned": record.leaves_cleaned
        }).filter(([, value]) => value).map(([key]) => key).join(', '),
        record.weather_status
      ]),
      headStyles: { fillColor: [3, 169, 244] }, // A nice blue for the header
    });
    
    // Save the PDF
    doc.save(`pool_records_${pool.id}_${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: 'PDF Export Started',
      description: 'Your PDF file is downloading.',
    });
  };

  const filteredRecords = getFilteredRecords();
  const displayedRecords = !dateFrom && !dateTo ? filteredRecords.slice(0, 5) : filteredRecords;

  return (
    <div className="space-y-4 p-2">
      <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-muted/50">
          <DatePicker date={dateFrom} setDate={setDateFrom} placeholder="From date" />
          <DatePicker date={dateTo} setDate={setDateTo} placeholder="To date" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>

      <Table>
          <TableHeader>
              <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>pH</TableHead>
                  <TableHead>Chlorine</TableHead>
                  <TableHead>Overall State</TableHead>
                  <TableHead>Tasks Done</TableHead>
                  <TableHead>Weather</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
              {displayedRecords.length > 0 ? displayedRecords.map(record => (
                  <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.created_at), 'PPp')}</TableCell>
                      <TableCell>{record.ph}</TableCell>
                      <TableCell>{record.cl}</TableCell>
                      <TableCell>{record.overall_state}</TableCell>
                      <TableCell>
                          {Object.entries({
                              "Vacuumed": record.vacuumed,
                              "Brushed": record.brushed,
                              "Leaves Cleaned": record.leaves_cleaned
                          }).filter(([, value]) => value).map(([key]) => key).join(', ')}
                      </TableCell>
                      <TableCell>{record.weather_status}</TableCell>
                  </TableRow>
              )) : (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                          No records found for the selected period.
                      </TableCell>
                  </TableRow>
              )}
          </TableBody>
      </Table>
       {!dateFrom && !dateTo && allRecords.length > 5 && (
        <div className="text-center text-sm text-muted-foreground p-2">
          Showing last 5 records. Use the date filters to see more.
        </div>
      )}
    </div>
  );
};

export default function RecordsPage() {
  const { currentUser, allPools } = useCurrentUser();
  const [pools, setPools] = useState<Pool[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setPools([]);
      return;
    }
    // Filter pools by company first
    const companyPools = currentUser.role === 'Superadmin'
      ? allPools
      : allPools.filter(p => p.companyId === currentUser.companyId);

    // Then, if user is client or tech, filter by their accessible pools
    if (currentUser.role === 'Client' || currentUser.role === 'Technician') {
      setPools(companyPools.filter(pool => currentUser.accessible_pool_ids?.includes(pool.id)));
    } else {
      setPools(companyPools);
    }
  }, [currentUser, allPools]);

  if (!currentUser) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pool Records</CardTitle>
        <CardDescription>View historical maintenance records for each pool.</CardDescription>
      </CardHeader>
      <CardContent>
        {pools.length > 0 ? (
          <Accordion type="single" collapsible className="w-full" defaultValue={`pool-${pools[0].id}`}>
            {pools.map(pool => (
              <AccordionItem key={pool.id} value={`pool-${pool.id}`}>
                <AccordionTrigger className="px-4 text-lg">
                  {pool.pool_name}
                </AccordionTrigger>
                <AccordionContent>
                  <PoolRecordsView pool={pool} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center text-muted-foreground p-8">
            <p>You do not have access to any pools with records.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
