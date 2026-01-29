import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Pagination from '@cloudscape-design/components/pagination';

interface InferenceJob {
  id: string;
  name: string;
  modelId: string;
  status: 'Running' | 'Stopped' | 'Failed' | 'Deploying';
  createdOn: string;
  endpoint: string;
  latency: string;
}

const mockInferenceJobs: InferenceJob[] = [
  {
    id: '1',
    name: 'text-embedding-inference',
    modelId: 'amazon.titan-embed-text-v2',
    status: 'Running',
    createdOn: 'July 18, 2025, 02:30 pm',
    endpoint: 'ml-inference-endpoint-1752845370',
    latency: '45ms',
  },
  {
    id: '2',
    name: 'semantic-search-model',
    modelId: 'cohere.embed-english-v3',
    status: 'Running',
    createdOn: 'July 17, 2025, 09:15 am',
    endpoint: 'ml-inference-endpoint-1752765890',
    latency: '62ms',
  },
  {
    id: '3',
    name: 'multimodal-embedding',
    modelId: 'amazon.titan-embed-image-v1',
    status: 'Deploying',
    createdOn: 'July 18, 2025, 04:00 pm',
    endpoint: 'ml-inference-endpoint-1752850000',
    latency: '-',
  },
];

export default function MLInferenceTab() {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<InferenceJob[]>([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<{ label: string; value: string } | null>(null);

  const getStatusType = (status: InferenceJob['status']) => {
    switch (status) {
      case 'Running':
        return 'success';
      case 'Stopped':
        return 'stopped';
      case 'Failed':
        return 'error';
      case 'Deploying':
        return 'in-progress';
      default:
        return 'info';
    }
  };

  return (
    <SpaceBetween size="l">
      <Table
        selectionType="single"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems as InferenceJob[])}
        columnDefinitions={[
          {
            id: 'name',
            header: 'Inference job name',
            cell: (item) => <Link href="#">{item.name}</Link>,
            sortingField: 'name',
          },
          {
            id: 'status',
            header: 'Status',
            cell: (item) => (
              <StatusIndicator type={getStatusType(item.status)}>
                {item.status}
              </StatusIndicator>
            ),
          },
          {
            id: 'createdOn',
            header: 'Created on',
            cell: (item) => item.createdOn,
            sortingField: 'createdOn',
          },
          {
            id: 'endpoint',
            header: 'Inference endpoint',
            cell: (item) => <Link href="#">{item.endpoint}</Link>,
          },
          {
            id: 'latency',
            header: 'Avg latency',
            cell: (item) => item.latency,
          },
        ]}
        items={mockInferenceJobs}
        header={
          <Header
            variant="h2"
            counter={`(${mockInferenceJobs.length})`}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button iconName="refresh" variant="icon" ariaLabel="Refresh" />
                <Button disabled={selectedItems.length === 0}>Stop</Button>
                <Button disabled={selectedItems.length === 0}>Delete</Button>
                <Button variant="primary" onClick={() => navigate('/create-inference-job')}>Create inference job</Button>
              </SpaceBetween>
            }
            description={
              <>
                Configure ML inference jobs to generate vector embeddings during data ingestion. Models can be sourced from Amazon Bedrock, SageMaker, or custom endpoints.{' '}
                <Link external>Learn more about ML inference</Link>
              </>
            }
          >
            ML inference jobs
          </Header>
        }
        filter={
          <SpaceBetween direction="horizontal" size="xs">
            <Input
              placeholder="Find inference jobs by name, model, or endpoint"
              value={filterText}
              onChange={({ detail }) => setFilterText(detail.value)}
              type="search"
            />
            <Select
              placeholder="Any status"
              selectedOption={statusFilter}
              onChange={({ detail }) => setStatusFilter(detail.selectedOption as { label: string; value: string } | null)}
              options={[
                { label: 'Any status', value: 'any' },
                { label: 'Running', value: 'running' },
                { label: 'Stopped', value: 'stopped' },
                { label: 'Deploying', value: 'deploying' },
                { label: 'Failed', value: 'failed' },
              ]}
            />
          </SpaceBetween>
        }
        pagination={<Pagination currentPageIndex={1} pagesCount={1} />}
        empty={
          <Box textAlign="center" color="inherit">
            <SpaceBetween size="m">
              <b>No ML inference jobs</b>
              <Box variant="p" color="inherit">
                Create an ML inference job to generate vector embeddings during data ingestion.
              </Box>
              <Button variant="primary" onClick={() => navigate('/create-inference-job')}>Create inference job</Button>
            </SpaceBetween>
          </Box>
        }
      />
    </SpaceBetween>
  );
}
