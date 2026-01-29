import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';

export default function VectorIngestionJobsTab() {
  return (
    <Container header={<Header variant="h2">Vector ingestion jobs</Header>}>
      <Box textAlign="center" color="text-body-secondary" padding="xxl">
        No vector ingestion jobs found. Create a new job to get started.
      </Box>
    </Container>
  );
}
