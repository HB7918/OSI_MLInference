import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Button from '@cloudscape-design/components/button';
import RadioGroup from '@cloudscape-design/components/radio-group';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Box from '@cloudscape-design/components/box';
import Link from '@cloudscape-design/components/link';
import Autosuggest from '@cloudscape-design/components/autosuggest';
import CommentsPanel from '../components/CommentsPanel';

export default function CreateInferenceJobPage() {
  const navigate = useNavigate();
  const [modelPreference, setModelPreference] = useState('sagemaker');
  const [serviceRoleOption, setServiceRoleOption] = useState('create-new');
  const [serviceRoleName, setServiceRoleName] = useState('MLInferenceOSIRole-1769711899');
  const [existingRole, setExistingRole] = useState<{ label: string; value: string } | null>(null);
  const [selectedDomain, setSelectedDomain] = useState('');

  const domainOptions = [
    { value: 'test25161', url: 'https://vpc-test25161-abc123xyz.us-east-1.es.amazonaws.com' },
    { value: 'dashboard', url: 'https://vpc-dashboard-6n5lgvzyh3qloik4kmm75gljv4.us-east-1.es.amazonaws.com' },
    { value: 'hari-d2', url: 'https://vpc-hari-d2-9k2mhwpqr5.us-west-2.es.amazonaws.com' },
  ];

  const handleDomainSelect = (value: string) => {
    const domain = domainOptions.find(d => d.value === value);
    setSelectedDomain(domain ? domain.url : value);
  };

  const handleSubmit = () => {
    navigate('/vector-ingestion');
  };

  const handleCancel = () => {
    navigate('/vector-ingestion');
  };

  return (
    <>
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="link" onClick={handleCancel}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Create</Button>
        </SpaceBetween>
      }
      header={
        <Header variant="h1" description="Configure ML inference to generate vector embeddings during data ingestion. Requires a one-time OpenSearch collection and IAM permission setup.">
          Create ML inference job
        </Header>
      }
    >
      <SpaceBetween size="l">
        <ExpandableSection headerText="How it works" variant="container">
          <Box padding="s">
            <SpaceBetween size="s">
              <Box>ML inference jobs transform your data into vector embeddings using machine learning models during the ingestion process.</Box>
              <Box>
                <strong>1.</strong> Select a model from Amazon Bedrock, SageMaker, or provide a custom endpoint
              </Box>
              <Box>
                <strong>2.</strong> Configure the input field containing text or data to embed
              </Box>
              <Box>
                <strong>3.</strong> Embeddings are automatically stored in your OpenSearch vector index
              </Box>
            </SpaceBetween>
          </Box>
        </ExpandableSection>

        <Container header={<Header variant="h2">OpenSearch Domain details</Header>}>
          <SpaceBetween size="l">
            <FormField label="Amazon OpenSearch domain">
              <SpaceBetween direction="horizontal" size="xs">
                <div style={{ width: '450px' }}>
                  <Autosuggest
                    value={selectedDomain}
                    onChange={({ detail }) => setSelectedDomain(detail.value)}
                    onSelect={({ detail }) => handleDomainSelect(detail.value)}
                    options={domainOptions.map(d => ({ value: d.value }))}
                    placeholder="Choose a domain by name, or input domain endpoint"
                    enteredTextLabel={(value) => `Use: "${value}"`}
                  />
                </div>
                <Button 
                  iconName="refresh" 
                  variant="normal" 
                  ariaLabel="Refresh"
                />
                <Button iconName="external" iconAlign="right">Create domain</Button>
              </SpaceBetween>
            </FormField>

            <FormField 
              label="Index name"
              description="The name of the export index"
            >
              <div style={{ width: '450px' }}>
                <Input value="testmlindex" onChange={() => {}} />
              </div>
            </FormField>
          </SpaceBetween>
        </Container>

        <Container header={<Header variant="h2">ML model details</Header>}>
          <SpaceBetween size="l">
            <FormField label="Select the ML model provider for generating embeddings">
              <RadioGroup
                value={modelPreference}
                onChange={({ detail }) => setModelPreference(detail.value)}
                items={[
                  { value: 'sagemaker', label: 'Amazon SageMaker', description: 'Use a deployed SageMaker endpoint for custom model inference' },
                  { value: 'bedrock', label: 'Amazon Bedrock', description: 'Use foundation models from Amazon Bedrock for embedding generation' },
                ]}
              />
            </FormField>

            <FormField 
              label="Model ID"
              description="ML model ID registered in ml-commons"
            >
              <div style={{ width: '450px' }}>
                <Input value="9t4AbpYBQb1BoSOe8x8N" onChange={() => {}} />
              </div>
            </FormField>

            <FormField 
              label="Model input key"
              description="The input field containing text or data to embed"
            >
              <div style={{ width: '450px' }}>
                <Input value="chapter" onChange={() => {}} />
              </div>
            </FormField>

            <FormField 
              label="Model output key"
              description="The output field where embeddings will be stored"
            >
              <div style={{ width: '450px' }}>
                <Input value="chapter_embedding" onChange={() => {}} />
              </div>
            </FormField>

            <FormField 
              label="Output prefix"
              description="S3 URL prefix for batch inference results (auto-generated, can be customized)"
            >
              <div style={{ width: '450px' }}>
                <Input value="s3://my-bucket/ml-output/" onChange={() => {}} />
              </div>
            </FormField>

            <ExpandableSection variant="footer" headerText="Optional configurations">
              <SpaceBetween size="l">
                <FormField 
                  label="Action type"
                  description="Defines the way to invoke ml-commons in the predict API"
                >
                  <RadioGroup
                    value="batch_predict"
                    onChange={() => {}}
                    items={[
                      { value: 'batch_predict', label: 'Batch predict' },
                      { value: 'predict', label: 'Predict' },
                    ]}
                  />
                </FormField>
              </SpaceBetween>
            </ExpandableSection>
          </SpaceBetween>
        </Container>

        <Container header={<Header variant="h2">S3 details</Header>}>
          <SpaceBetween size="l">
            <FormField label="S3 bucket">
              <SpaceBetween direction="horizontal" size="xs">
                <div style={{ width: '350px' }}>
                  <Input
                    value=""
                    onChange={() => {}}
                    placeholder="Browse or input bucket name"
                  />
                </div>
                <Button iconName="external" iconAlign="right" variant="normal">View</Button>
                <Button>Browse S3</Button>
              </SpaceBetween>
            </FormField>

            <FormField
              label={<>Metadata prefix <i>- optional</i></>}
              description="Prefix path for metadata files if stored separately from data files."
            >
              <div style={{ width: '450px' }}>
                <Input
                  value=""
                  onChange={() => {}}
                  placeholder="e.g., metadata/"
                />
              </div>
            </FormField>
          </SpaceBetween>
        </Container>

        <Container
          header={
            <Header 
              variant="h2" 
              info={<Link variant="info">Info</Link>}
              description="An Amazon OpenSearch pipeline requires permission to invoke the ML model and write to OpenSearch collection on your behalf."
            >
              Service access
            </Header>
          }
        >
          <SpaceBetween size="l">
            <FormField label="Choose a method to authorize OpenSearch">
              <RadioGroup
                value={serviceRoleOption}
                onChange={({ detail }) => setServiceRoleOption(detail.value)}
                items={[
                  { value: 'create-new', label: 'Create and use a new service role' },
                  { value: 'use-existing', label: 'Use an existing service role' },
                ]}
              />
            </FormField>

            {serviceRoleOption === 'create-new' && (
              <FormField
                label="Service role name"
                constraintText="The role name can have a maximum of 64 characters. Valid characters are alphanumeric, and the following special characters: +, =, , (comma), . (period), @, - (hyphen), _ (underscore)."
              >
                <Input
                  value={serviceRoleName}
                  onChange={({ detail }) => setServiceRoleName(detail.value)}
                />
              </FormField>
            )}

            {serviceRoleOption === 'use-existing' && (
              <FormField label="Existing service role">
                <Select
                  selectedOption={existingRole}
                  onChange={({ detail }) => setExistingRole(detail.selectedOption as { label: string; value: string })}
                  options={[
                    { label: 'MLInferenceRole-Production', value: 'role-1' },
                    { label: 'MLInferenceRole-Development', value: 'role-2' },
                    { label: 'OpenSearchPipelineRole', value: 'role-3' },
                  ]}
                  placeholder="Select a service role"
                />
              </FormField>
            )}
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Form>
      <CommentsPanel screenName="OSI-ML-Inference-Create-Job" />
    </>
  );
}
