import { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Tabs from '@cloudscape-design/components/tabs';
import VectorIngestionJobsTab from '../components/VectorIngestionJobsTab';
import S3VectorsImportTab from '../components/S3VectorsImportTab';
import MLInferenceTab from '../components/MLInferenceTab';

export default function VectorIngestionPage() {
  const [activeTabId, setActiveTabId] = useState('ml-inference');

  return (
    <SpaceBetween size="l">
      <Header variant="h1">Vector ingestion</Header>
      <Tabs
        activeTabId={activeTabId}
        onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
        tabs={[
          {
            id: 'vector-jobs',
            label: 'Vector ingestion jobs - new',
            content: <VectorIngestionJobsTab />,
          },
          {
            id: 's3-vectors',
            label: 'S3 vectors import',
            content: <S3VectorsImportTab />,
          },
          {
            id: 'ml-inference',
            label: 'ML Inference',
            content: <MLInferenceTab />,
          },
        ]}
      />
    </SpaceBetween>
  );
}
