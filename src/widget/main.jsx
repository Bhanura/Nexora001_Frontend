import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './ChatWidget';
// Import Tailwind styles. During build, these will be injected into the JS.
import '../index.css'; 

const MOUNT_POINT_ID = 'nexora-widget-root';

console.log('[Nexora Widget] Script loaded');

function init(apiKey) {
  console.log('[Nexora Widget] Initializing with API key:', apiKey ? 'YES' : 'NO');
  
  if (!apiKey) {
    console.error("Nexora Widget: API key is required");
    return;
  }

  // Create a container div if it doesn't exist
  let container = document.getElementById(MOUNT_POINT_ID);
  if (!container) {
    console.log('[Nexora Widget] Creating container div');
    container = document.createElement('div');
    container.id = MOUNT_POINT_ID;
    document.body.appendChild(container);
  }

  // Mount React
  console.log('[Nexora Widget] Mounting React component');
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ChatWidget apiKey={apiKey} />
    </React.StrictMode>
  );
  console.log('[Nexora Widget] Widget rendered successfully');
}

// Auto-initialize if window.NEXORA_CHATBOT_ID is set (legacy mode)
function autoInit() {
  const apiKey = window.NEXORA_CHATBOT_ID;
  if (apiKey) {
    console.log('[Nexora Widget] Auto-initializing from window.NEXORA_CHATBOT_ID');
    init(apiKey);
  }
}

// Check for auto-init after DOM loads
if (document.readyState === 'complete') {
  autoInit();
} else {
  window.addEventListener('load', autoInit);
}

// Export the init function
export { init };