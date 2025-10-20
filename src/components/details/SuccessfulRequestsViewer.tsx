'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaginatedJsonViewer } from './PaginatedJsonViewer';

export function SuccessfulRequestsViewer({ urls }: { urls: Record<string, string> }) {
    const tabs = [
        { key: 'successful_bodies', label: 'Bodies' },
        { key: 'successful_parameters', label: 'Parameters' },
        { key: 'successful_responses', label: 'Responses' },
        { key: 'successful_primitives', label: 'Primitives' },
    ];

    return (
        <Tabs defaultValue={tabs[0].key}>
            <TabsList>
                {tabs.map(tab => (
                    <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>
                ))}
            </TabsList>
            {tabs.map(tab => (
                <TabsContent key={tab.key} value={tab.key}>
                    <PaginatedJsonViewer url={urls?.[tab.key]} dataKey={tab.label} />
                </TabsContent>
            ))}
        </Tabs>
    );
}
