import { useState } from 'react';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import DateRangePicker from '@cloudscape-design/components/date-range-picker';
import Pagination from '@cloudscape-design/components/pagination';

interface ImportRecord {
  id: string;
  importInitiatedOn: string;
  status: 'Complete' | 'In progress' | 'Failed';
  s3VectorIndexArn: string;
  openSearchCollection: string;
}

const mockData: ImportRecord[] = [
  {
    id: '1',
    importInitiatedOn: 'July 16, 2025, 01:04 pm',
    status: 'Complete',
    s3VectorIndexArn: 'arn:aws:s3vectors:us-east-1:478031150931:bucket/...',
    openSearchCollection: 's3vectors-collection-1752685370',
  },
  {
    id: '2',
    importInitiatedOn: 'July 16, 2025, 11:37 am',
    status: 'Complete',
    s3VectorIndexArn: 'arn:aws:s3vectors:us-east-1:478031150931:bucket/...',
    openSearchCollection: 's3vectors-collection-1752675729',
  },
  {
    id: '3',
    importInitiatedOn: 'July 16, 2025, 10:28 am',
    status: 'Complete',
    s3VectorIndexArn: 'arn:aws:s3vectors:us-east-1:478031150931:bucket/...',
    openSearchCollection: 's3vectors-collection-1752676045',
  },
];

export default function S3VectorsImportTab() {
  const [selectedItems, setSelectedItems] = useState<ImportRecord[]>([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<{ label: string; value: string } | null>(null);

  return (
    <SpaceBetween size="l">
      <Table
        selectionType="single"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems as ImportRecord[])}
        columnDefinitions={[
          {
            id: 'importInitiatedOn',
            header: 'Import initiated on',
            cell: (item) => item.importInitiatedOn,
            sortingField: 'importInitiatedOn',
          },
          {
            id: 'status',
            header: 'Status',
            cell: (item) => (
              <StatusIndicator type={item.status === 'Complete' ? 'success' : item.status === 'In progress' ? 'in-progress' : 'error'}>
                {item.status}
              </StatusIndicator>
            ),
          },
          {
            id: 's3VectorIndexArn',
            header: 'S3 vector index ARN',
            cell: (item) => item.s3VectorIndexArn,
          },
          {
            id: 'openSearchCollection',
            header: 'OpenSearch vector collection',
            cell: (item) => <Link href="#">{item.openSearchCollection}</Link>,
          },
        ]}
        items={mockData}
        header={
          <Header
            variant="h2"
            counter={`(${mockData.length})`}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button iconName="refresh" variant="icon" ariaLabel="Refresh" />
                <Button disabled={selectedItems.length === 0}>Delete</Button>
                <Button variant="primary">Import S3 Vector</Button>
              </SpaceBetween>
            }
            description={
              <>
                Import history displays import events from the last 90 days. View OpenSearch vector collection details to search and interact with vector data through OpenSearch API operations.{' '}
                <Link external>View all collections</Link>
              </>
            }
          >
            S3 vectors import history
          </Header>
        }
        filter={
          <SpaceBetween direction="horizontal" size="xs">
            <Input
              placeholder="Find imports by index, pipeline name or collection name"
              value={filterText}
              onChange={({ detail }) => setFilterText(detail.value)}
              type="search"
            />
            <DateRangePicker
              placeholder="Filter by a date and time range"
              value={null}
              onChange={() => {}}
              relativeOptions={[]}
              i18nStrings={{
                todayAriaLabel: 'Today',
                nextMonthAriaLabel: 'Next month',
                previousMonthAriaLabel: 'Previous month',
                customRelativeRangeDurationLabel: 'Duration',
                customRelativeRangeDurationPlaceholder: 'Enter duration',
                customRelativeRangeOptionLabel: 'Custom range',
                customRelativeRangeOptionDescription: 'Set a custom range in the past',
                customRelativeRangeUnitLabel: 'Unit of time',
                formatRelativeRange: () => '',
                formatUnit: () => '',
                dateTimeConstraintText: '',
                relativeModeTitle: 'Relative range',
                absoluteModeTitle: 'Absolute range',
                relativeRangeSelectionHeading: 'Choose a range',
                startDateLabel: 'Start date',
                endDateLabel: 'End date',
                startTimeLabel: 'Start time',
                endTimeLabel: 'End time',
                clearButtonLabel: 'Clear',
                cancelButtonLabel: 'Cancel',
                applyButtonLabel: 'Apply',
              }}
            />
            <Select
              placeholder="Any status"
              selectedOption={statusFilter}
              onChange={({ detail }) => setStatusFilter(detail.selectedOption as { label: string; value: string })}
              options={[
                { label: 'Any status', value: 'any' },
                { label: 'Complete', value: 'complete' },
                { label: 'In progress', value: 'in-progress' },
                { label: 'Failed', value: 'failed' },
              ]}
            />
          </SpaceBetween>
        }
        pagination={<Pagination currentPageIndex={1} pagesCount={1} />}
        empty={
          <Box textAlign="center" color="inherit">
            <b>No imports</b>
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              No imports to display.
            </Box>
          </Box>
        }
      />
    </SpaceBetween>
  );
}
