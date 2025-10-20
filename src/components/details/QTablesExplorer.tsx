'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Terminal } from 'lucide-react';
import ReactJson from 'react-json-view';

async function fetchQTables(url: string): Promise<any> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    return res.json();
}

export function QTablesExplorer({ url }: { url: string }) {
    const { data, isLoading, isError, error } = useQuery<any>({
        queryKey: ['qTables', url],
        queryFn: () => fetchQTables(url),
        enabled: !!url,
    });

    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
    const [selectedOperation, setSelectedOperation] = useState<string | null>(null);

    const agents = useMemo(() => data ? Object.keys(data) : [], [data]);
    const operations = useMemo(() => (data && selectedAgent) ? Object.keys(data[selectedAgent]) : [], [data, selectedAgent]);

    const selectedData = useMemo(() => {
        if (!data || !selectedAgent) return null;
        if (!selectedOperation) return data[selectedAgent];
        return data[selectedAgent][selectedOperation];
    }, [data, selectedAgent, selectedOperation]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load Q-Tables: {error.message}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            <Button asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">Download Raw Q-Tables Data</a>
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select onValueChange={setSelectedAgent} value={selectedAgent || ''}>
                    <SelectTrigger><SelectValue placeholder="Select an Agent" /></SelectTrigger>
                    <SelectContent>
                        {agents.map(agent => <SelectItem key={agent} value={agent}>{agent}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select onValueChange={setSelectedOperation} value={selectedOperation || ''} disabled={!selectedAgent}>
                    <SelectTrigger><SelectValue placeholder="Select an Operation (Optional)" /></SelectTrigger>
                    <SelectContent>
                        {operations.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            {selectedData && (
                <div className="p-4 bg-muted rounded-lg">
                    <ReactJson src={selectedData} theme="monokai" collapsed={2} />
                </div>
            )}
        </div>
    );
}
