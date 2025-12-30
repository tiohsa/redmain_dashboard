import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById('dashboard-root');

if (rootElement) {
  const projectId = rootElement.getAttribute('data-project-id');
  if (projectId) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App projectId={projectId} />
      </React.StrictMode>,
    )
  } else {
    console.error("Project ID not found in data attribute");
  }
}
