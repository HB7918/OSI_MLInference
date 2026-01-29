import { useState } from 'react';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Tabs from '@cloudscape-design/components/tabs';
import VectorIngestionJobsTab from '../components/VectorIngestionJobsTab';
import S3VectorsImportTab from '../components/S3VectorsImportTab';
import MLInferenceTab from '../components/MLInferenceTab';
import CommentsPanel from '../components/CommentsPanel';

export default function VectorIngestionPage() {
  const [activeTabId, setActiveTabId] = useState('ml-inference');

  const getScreenName = () => {
    switch (activeTabId) {
      case 'vector-jobs':
        return 'OSI-ML-Inference-Vector-Jobs';
      case 's3-vectors':
        return 'OSI-ML-Inference-S3-Vectors';
      case 'ml-inference':
        return 'OSI-ML-Inference-Tab';
      default:
        return 'OSI-ML-Inference-Tab';
    }
  };

  return (
    <>
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
      <CommentsPanel screenName={getScreenName()} />
    </>
  );
}
