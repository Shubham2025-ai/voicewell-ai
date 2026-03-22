import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import SkeletonLoader from './components/SkeletonLoader.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<SkeletonLoader />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
)