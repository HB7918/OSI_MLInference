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
import Tiles from '@cloudscape-design/components/tiles';
import Box from '@cloudscape-design/components/box';
import Link from '@cloudscape-design/components/link';
import Icon from '@cloudscape-design/components/icon';
import Checkbox from '@cloudscape-design/components/checkbox';
import DateRangePicker from '@cloudscape-design/components/date-range-picker';
import Badge from '@cloudscape-design/components/badge';
import CommentsPanel from '../components/CommentsPanel';

interface S3BucketConfig {
  bucketName: string;
  dateRange: null;
  sameAsDefault: boolean;
  customizeFiltering: boolean;
}

interface CopyValuesEntry {
  fromKey: string;
  toKey: string;
  overwriteIfExists: boolean;
  copyWhen: string;
}

interface CopyValuesProcessor {
  id: string;
  type: 'copy-values';
  entries: CopyValuesEntry[];
}

interface MLInferenceProcessor {
  id: string;
  type: 'ml-inference';
}

type Processor = CopyValuesProcessor | MLInferenceProcessor;

export default function CreateInferenceJobPage() {
  const navigate = useNavigate();
  const [modelPreference, setModelPreference] = useState('sagemaker');
  const [serviceRoleOption, setServiceRoleOption] = useState('create-new');
  const [serviceRoleName, setServiceRoleName] = useState('MLInferenceOSIRole-1769711899');
  const [existingRole, setExistingRole] = useState<{ label: string; value: string } | null>(null);
  const [draggedProcessor, setDraggedProcessor] = useState<string | null>(null);
  const [ingestionFrequency, setIngestionFrequency] = useState('periodic');
  const [s3Buckets, setS3Buckets] = useState<S3BucketConfig[]>([
    { bucketName: '', dateRange: null, sameAsDefault: true, customizeFiltering: false }
  ]);
  const [processors, setProcessors] = useState<Processor[]>([
    { id: 'ml-inference-default', type: 'ml-inference' }
  ]);

  const handleSubmit = () => {
    navigate('/vector-ingestion');
  };

  const handleCancel = () => {
    navigate('/vector-ingestion');
  };

  const addS3Bucket = () => {
    if (s3Buckets.length < 10) {
      setS3Buckets([...s3Buckets, { bucketName: '', dateRange: null, sameAsDefault: true, customizeFiltering: false }]);
    }
  };

  const removeS3Bucket = (index: number) => {
    setS3Buckets(s3Buckets.filter((_, i) => i !== index));
  };

  const updateS3Bucket = (index: number, field: keyof S3BucketConfig, value: string | boolean | null) => {
    const updated = [...s3Buckets];
    updated[index] = { ...updated[index], [field]: value };
    setS3Buckets(updated);
  };

  const addCopyValuesProcessor = () => {
    const newProcessor: CopyValuesProcessor = {
      id: `copy-${Date.now()}`,
      type: 'copy-values',
      entries: [{ fromKey: '', toKey: '', overwriteIfExists: false, copyWhen: '' }]
    };
    setProcessors([...processors, newProcessor]);
  };

  const removeProcessor = (id: string) => {
    setProcessors(processors.filter(p => p.id !== id));
  };

  const addEntry = (processorId: string) => {
    setProcessors(processors.map(p => 
      p.id === processorId && p.type === 'copy-values'
        ? { ...p, entries: [...p.entries, { fromKey: '', toKey: '', overwriteIfExists: false, copyWhen: '' }] }
        : p
    ));
  };

  const removeEntry = (processorId: string, entryIndex: number) => {
    setProcessors(processors.map(p => 
      p.id === processorId && p.type === 'copy-values'
        ? { ...p, entries: p.entries.filter((_, i) => i !== entryIndex) }
        : p
    ));
  };

  const updateEntry = (processorId: string, entryIndex: number, field: keyof CopyValuesEntry, value: string | boolean) => {
    setProcessors(processors.map(p => 
      p.id === processorId && p.type === 'copy-values'
        ? { ...p, entries: p.entries.map((e, i) => i === entryIndex ? { ...e, [field]: value } : e) }
        : p
    ));
  };

  const handleDragStart = (e: React.DragEvent, processorId: string) => {
    setDraggedProcessor(processorId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedProcessor || draggedProcessor === targetId) {
      setDraggedProcessor(null);
      return;
    }

    const draggedIndex = processors.findIndex(p => p.id === draggedProcessor);
    const targetIndex = processors.findIndex(p => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedProcessor(null);
      return;
    }

    const newProcessors = [...processors];
    const [removed] = newProcessors.splice(draggedIndex, 1);
    newProcessors.splice(targetIndex, 0, removed);
    setProcessors(newProcessors);
    setDraggedProcessor(null);
  };

  const handleDragEnd = () => {
    setDraggedProcessor(null);
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

        <Container header={<Header variant="h2">Model preference</Header>}>
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
        </Container>

        <Container header={<Header variant="h2">Configure source</Header>}>
          <SpaceBetween size="l">
            <FormField label="Ingestion frequency">
              <RadioGroup
                value={ingestionFrequency}
                onChange={({ detail }) => setIngestionFrequency(detail.value)}
                items={[
                  { value: 'periodic', label: 'Periodic', description: 'Periodic ingestion refers to the regular, scheduled loading of data at fixed intervals.' },
                  { value: 'one-time', label: 'One time', description: 'One time ingestion refers to a single, non-recurring data loading process.' },
                ]}
              />
            </FormField>

            {ingestionFrequency === 'periodic' && (
              <>
                <FormField
                  label="Interval"
                  description="The time from which to start and end scanning objects. Applies to all S3 buckets by default."
                >
                  <DateRangePicker
                    value={null}
                    onChange={() => {}}
                    placeholder="Select date and time range"
                    relativeOptions={[]}
                    isValidRange={() => ({ valid: true })}
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
                </FormField>

                <FormField
                  label="Default range"
                  description="The time from which to start and end scanning objects. Applies to all S3 buckets by default."
                >
                  <DateRangePicker
                    value={null}
                    onChange={() => {}}
                    placeholder="Select date and time range"
                    relativeOptions={[]}
                    isValidRange={() => ({ valid: true })}
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
                </FormField>
              </>
            )}

            {ingestionFrequency === 'one-time' && (
              <FormField
                label="Default start and end time"
                description="The time from which to start and end scanning objects. Applies to all S3 buckets by default."
              >
                <DateRangePicker
                  value={null}
                  onChange={() => {}}
                  placeholder="Select date and time range"
                  relativeOptions={[]}
                  isValidRange={() => ({ valid: true })}
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
              </FormField>
            )}

            <Box>
              <Header variant="h3">S3 buckets</Header>
              <hr style={{ border: 'none', borderTop: '1px solid #eaeded', margin: '8px 0' }} />
              <SpaceBetween size="l">
                {s3Buckets.map((bucket, index) => (
                  <Box key={index}>
                    <SpaceBetween size="m">
                      <FormField label="S3 bucket">
                        <SpaceBetween direction="horizontal" size="xs">
                          <Input
                            value={bucket.bucketName}
                            onChange={({ detail }) => updateS3Bucket(index, 'bucketName', detail.value)}
                            placeholder="Browse or input bucket name"
                          />
                          <Button iconName="external" variant="normal">View</Button>
                          <Button>Browse S3</Button>
                          <Button iconName="remove" variant="icon" onClick={() => removeS3Bucket(index)} disabled={s3Buckets.length === 1} />
                        </SpaceBetween>
                      </FormField>

                      <FormField
                        label="Start and end time"
                        description="The time from which to start and end scanning objects. Applies only to this bucket."
                      >
                        <SpaceBetween size="xs">
                          <DateRangePicker
                            value={null}
                            onChange={() => {}}
                            placeholder="Select date and time range"
                            relativeOptions={[]}
                            isValidRange={() => ({ valid: true })}
                            disabled={bucket.sameAsDefault}
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
                          <Checkbox
                            checked={bucket.sameAsDefault}
                            onChange={({ detail }) => updateS3Bucket(index, 'sameAsDefault', detail.checked)}
                          >
                            Same as default start and end time
                          </Checkbox>
                        </SpaceBetween>
                      </FormField>

                      <FormField
                        label="Object filtering options - optional"
                        description="Filter which objects should be ingested. All objects will be processed by default."
                      >
                        <Checkbox
                          checked={bucket.customizeFiltering}
                          onChange={({ detail }) => updateS3Bucket(index, 'customizeFiltering', detail.checked)}
                        >
                          Customize object filtering
                        </Checkbox>
                      </FormField>
                      <hr style={{ border: 'none', borderTop: '1px solid #eaeded', margin: '8px 0' }} />
                    </SpaceBetween>
                  </Box>
                ))}

                <SpaceBetween size="xxs">
                  <Button variant="normal" onClick={addS3Bucket} disabled={s3Buckets.length >= 10}>Add S3 bucket</Button>
                  <Box variant="small" color="text-body-secondary">{10 - s3Buckets.length} more buckets can be added</Box>
                </SpaceBetween>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Container>

        <Container header={<Header variant="h2">Configure processor</Header>}>
          <SpaceBetween size="l">
            {processors.map((processor) => (
              <Box 
                key={processor.id}
                data-processor-id={processor.id}
              >
                <div 
                  draggable
                  onDragStart={(e) => handleDragStart(e, processor.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, processor.id)}
                  onDragEnd={handleDragEnd}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '8px',
                    opacity: draggedProcessor === processor.id ? 0.5 : 1,
                    backgroundColor: draggedProcessor && draggedProcessor !== processor.id ? '#f7f7f7' : 'transparent',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{ paddingTop: '8px', cursor: 'grab' }}>
                    <Icon name="drag-indicator" />
                  </div>
                  <div style={{ flex: 1 }}>
                    {processor.type === 'ml-inference' ? (
                      <ExpandableSection
                        variant="footer"
                        defaultExpanded
                        headerText={
                          <SpaceBetween direction="horizontal" size="xs">
                            <span>ML Inference</span>
                            <Badge color="blue">Enrich</Badge>
                          </SpaceBetween>
                        }
                      >
                        <SpaceBetween size="l">
                          <Box>
                            The ML <code>inference</code> processor enables invocation of the ml-commons plugin in OpenSearch service within your pipeline in order to process events. It supports both synchronous and asynchronous invocations based on your use case.{' '}
                            <Link external>Learn more</Link>
                          </Box>

                          <FormField 
                            label="Model ID"
                            description="ML model ID registered in ml-commons"
                          >
                            <Input value="9t4AbpYBQb1BoSOe8x8N" onChange={() => {}} />
                          </FormField>

                          <FormField 
                            label="Output path"
                            description="S3 URL for batch inference results"
                          >
                            <Input value="s3://xunzh-offlinebatch/sagemaker/output" onChange={() => {}} />
                          </FormField>

                          <ExpandableSection variant="footer" defaultExpanded headerText="Optional configurations">
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

                              <FormField 
                                label="Ml when"
                                description="Defines a condition for event to use this processor."
                              >
                                <Input value="/some_key == null" onChange={() => {}} />
                              </FormField>
                            </SpaceBetween>
                          </ExpandableSection>
                        </SpaceBetween>
                      </ExpandableSection>
                    ) : (
                      <ExpandableSection
                        variant="footer"
                        defaultExpanded
                        headerText={
                          <SpaceBetween direction="horizontal" size="xs">
                            <span>Copy values</span>
                            <Badge color="grey">Mutate events</Badge>
                          </SpaceBetween>
                        }
                      >
                        <SpaceBetween size="l">
                          <Box>
                            The <code>copy_values</code> processor copies values from an event to another key in an event.{' '}
                            <Link external>Learn more</Link>
                          </Box>

                          {processor.entries.map((entry, entryIndex) => (
                            <Box key={entryIndex}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <div style={{ flex: 1 }}>
                                  <ExpandableSection variant="footer" defaultExpanded headerText={`Entry ${entryIndex + 1}`}>
                                    <SpaceBetween size="m">
                                      <FormField
                                        label="From key"
                                        description="The key of the entry to be copied. This must be configured."
                                      >
                                        <Input
                                          value={entry.fromKey}
                                          onChange={({ detail }) => updateEntry(processor.id, entryIndex, 'fromKey', detail.value)}
                                        />
                                      </FormField>

                                      <FormField
                                        label="To key"
                                        description="The key of the new entry to be added. This must be configured."
                                      >
                                        <Input
                                          value={entry.toKey}
                                          onChange={({ detail }) => updateEntry(processor.id, entryIndex, 'toKey', detail.value)}
                                        />
                                      </FormField>

                                      <FormField
                                        label="Overwrite if to key exists - optional"
                                        description="When set to true, the existing value is overwritten if key already exists in the event. The default value is false."
                                      >
                                        <Checkbox
                                          checked={entry.overwriteIfExists}
                                          onChange={({ detail }) => updateEntry(processor.id, entryIndex, 'overwriteIfExists', detail.checked)}
                                        >
                                          Overwrite if to key exists
                                        </Checkbox>
                                      </FormField>

                                      <FormField
                                        label="Copy when - optional"
                                        description={
                                          <>
                                            A <Link external>conditional expression</Link>, such as <code>/some-key == "test"</code>, that will be evaluated to determine whether the processor will be run on the event.
                                          </>
                                        }
                                      >
                                        <Input
                                          value={entry.copyWhen}
                                          onChange={({ detail }) => updateEntry(processor.id, entryIndex, 'copyWhen', detail.value)}
                                        />
                                      </FormField>
                                    </SpaceBetween>
                                  </ExpandableSection>
                                </div>
                                <div style={{ paddingTop: '4px' }}>
                                  <Button 
                                    iconName="remove" 
                                    variant="icon" 
                                    ariaLabel="Remove entry"
                                    onClick={() => removeEntry(processor.id, entryIndex)}
                                    disabled={processor.entries.length === 1}
                                  />
                                </div>
                              </div>
                              <hr style={{ border: 'none', borderTop: '1px solid #eaeded', margin: '8px 0' }} />
                            </Box>
                          ))}

                          <Button onClick={() => addEntry(processor.id)}>Add entry</Button>

                          <ExpandableSection variant="footer" headerText="Optional configurations">
                            <Box padding="s">
                              Additional optional configurations will appear here.
                            </Box>
                          </ExpandableSection>
                        </SpaceBetween>
                      </ExpandableSection>
                    )}
                  </div>
                  <div style={{ paddingTop: '4px' }}>
                    <Button 
                      iconName="remove" 
                      variant="icon" 
                      ariaLabel="Remove processor" 
                      onClick={() => removeProcessor(processor.id)}
                      disabled={processors.length === 1 && processor.type === 'ml-inference'}
                    />
                  </div>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #eaeded', margin: '8px 0' }} />
              </Box>
            ))}

            <FormField
              label="Processor - optional"
              description={
                <>
                  Processors perform an action on your data, such as filtering, transforming, or enriching.{' '}
                  <Link external>Learn more</Link>
                </>
              }
            >
              <SpaceBetween direction="horizontal" size="xs">
                <Input placeholder="Enter value" value="" onChange={() => {}} />
                <Button onClick={addCopyValuesProcessor}>Add</Button>
              </SpaceBetween>
            </FormField>
          </SpaceBetween>
        </Container>

        <Container header={<Header variant="h2">Configure sink</Header>}>
          <SpaceBetween size="l">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <SpaceBetween size="l">
                  <Header variant="h3" info={<Link variant="info">Info</Link>}>OpenSearch sink details</Header>
                  
                  <FormField label="OpenSearch resource type">
                    <Select
                      selectedOption={{ label: 'Managed cluster', value: 'managed' }}
                      onChange={() => {}}
                      options={[
                        { label: 'Managed cluster', value: 'managed' },
                        { label: 'Serverless collection', value: 'serverless' },
                      ]}
                    />
                  </FormField>

                  <FormField label="Choose a domain">
                    <SpaceBetween direction="horizontal" size="xs">
                      <Input 
                        value="https://search-uvdomain-jv6w7pciky7jsxfh3ibwijy4iu.us-east-1.es.amazonaws.com" 
                        onChange={() => {}}
                        placeholder="Search or select a domain"
                      />
                      <Button iconName="refresh" variant="icon" ariaLabel="Refresh" />
                      <Button iconName="external">Create domain</Button>
                    </SpaceBetween>
                  </FormField>

                  <FormField 
                    label="Index name"
                    description="The name of the export index"
                  >
                    <Input value="testmlindex" onChange={() => {}} />
                  </FormField>

                  <FormField label="Index mapping options">
                    <Tiles
                      value="dynamic"
                      onChange={() => {}}
                      items={[
                        { 
                          value: 'dynamic', 
                          label: 'Dynamic mapping', 
                          description: 'Intelligently detects the data types of incoming data and applies appropriate mappings.' 
                        },
                        { 
                          value: 'customize', 
                          label: 'Customize mapping', 
                          description: 'Manually define the schema, data types, and field mappings for the destination index.' 
                        },
                      ]}
                    />
                  </FormField>

                  <FormField
                    label="Enable DLQ - recommended"
                    description="Dead-letter queues (DLQs) for offloading failed events and making them accessible for analysis."
                  >
                    <Checkbox checked={false} onChange={() => {}}>
                      Enable DLQ
                    </Checkbox>
                  </FormField>
                </SpaceBetween>
              </div>
              <div style={{ paddingTop: '4px' }}>
                <Button iconName="remove" variant="icon" ariaLabel="Remove sink" />
              </div>
            </div>

            <ExpandableSection variant="footer" headerText="Additional settings - optional">
              <Box padding="s">
                Additional sink configuration options will appear here.
              </Box>
            </ExpandableSection>
          </SpaceBetween>
        </Container>

        <Container
          header={
            <Header variant="h2" info={<Link variant="info">Info</Link>}>
              Service access
            </Header>
          }
        >
          <SpaceBetween size="l">
            <Box>
              An Amazon OpenSearch pipeline requires permission to invoke the ML model and write to OpenSearch collection on your behalf.
            </Box>
            
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
