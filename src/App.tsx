import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import AppLayout from '@cloudscape-design/components/app-layout';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import VectorIngestionPage from './pages/VectorIngestionPage';
import CreateInferenceJobPage from './pages/CreateInferenceJobPage';

function AppContent() {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const baseBreadcrumbs = [
      { text: 'Amazon OpenSearch Service - Ingestion', href: '/' },
      { text: 'Vector ingestion', href: '/vector-ingestion' },
    ];

    if (location.pathname === '/create-inference-job') {
      return [...baseBreadcrumbs, { text: 'Create ML inference', href: '/create-inference-job' }];
    }

    return baseBreadcrumbs;
  };

  return (
    <AppLayout
      breadcrumbs={<BreadcrumbGroup items={getBreadcrumbs()} />}
      navigation={
        <SideNavigation
          header={{ text: 'OpenSearch Ingestion', href: '/' }}
          items={[
            { type: 'link', text: 'Pipelines', href: '/pipelines' },
            { type: 'link', text: 'Vector ingestion', href: '/vector-ingestion' },
            { type: 'divider' },
            { type: 'link', text: 'Settings', href: '/settings' },
          ]}
        />
      }
      content={
        <Routes>
          <Route path="/" element={<VectorIngestionPage />} />
          <Route path="/vector-ingestion" element={<VectorIngestionPage />} />
          <Route path="/create-inference-job" element={<CreateInferenceJobPage />} />
        </Routes>
      }
      toolsHide
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <TopNavigation
        identity={{
          href: '/',
          title: 'Amazon OpenSearch Ingestion Service',
        }}
        utilities={[
          { type: 'button', iconName: 'settings', ariaLabel: 'Settings' },
          { type: 'button', iconName: 'notification', ariaLabel: 'Notifications' },
        ]}
      />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
