import { createRoot } from 'react-dom/client';
import '@/index.css';
import ReportPage from '@/pages/Report';

const container = document.getElementById('report-root');
if (container) {
  createRoot(container).render(<ReportPage />);
}
