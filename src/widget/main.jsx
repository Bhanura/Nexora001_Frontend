import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './ChatWidget';
// Import Tailwind styles. During build, these will be injected into the JS.
import '../index.css'; 

const MOUNT_POINT_ID = 'nexora-widget-root';

console.log('[Nexora Widget] Script loaded');

function init() {
  console.log('[Nexora Widget] Initializing...');
  
  // 1. Look for configuration on the window object
  const apiKey = window.NEXORA_CHATBOT_ID;

  console.log('[Nexora Widget] API Key found:', apiKey ? 'YES' : 'NO');

  if (!apiKey) {
    console.error("Nexora Widget: NEXORA_CHATBOT_ID not found in window.");
    return;
  }

  // 2. Create a container div if it doesn't exist
  let container = document.getElementById(MOUNT_POINT_ID);
  if (!container) {
    console.log('[Nexora Widget] Creating container div');
    container = document.createElement('div');
    container.id = MOUNT_POINT_ID;
    document.body.appendChild(container);
  }

  // 3. Mount React
  console.log('[Nexora Widget] Mounting React component');
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ChatWidget apiKey={apiKey} />
    </React.StrictMode>
  );
  console.log('[Nexora Widget] Widget rendered successfully');
}

// Ensure the DOM is loaded before running
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}