import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App'
import './index.css'
import { setUrlRoot, getApiUrl } from './utils/url'

const rootElement = document.getElementById('dashboard-root');

if (rootElement) {
  const projectId = rootElement.getAttribute('data-project-id');
  const urlRoot = rootElement.getAttribute('data-url-root') || '';

  if (projectId) {
    setUrlRoot(urlRoot);
    axios.defaults.baseURL = getApiUrl('');

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App projectId={projectId} />
      </React.StrictMode>,
    )
  } else {
    console.error("Project ID not found in data attribute");
  }
}
