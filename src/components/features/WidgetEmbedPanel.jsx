import { useState, useEffect } from "react";
import { Code, Copy, Check, ExternalLink, Download, Globe } from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";

export default function WidgetEmbedPanel() {
  const [apiKeys, setApiKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedExternal, setCopiedExternal] = useState(false);

  useEffect(() => {
    // Fetch all API keys
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/api-keys", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const activeKeys = data.filter(k => k.status === "active");
        setApiKeys(activeKeys);
        if (activeKeys.length > 0) {
          setSelectedKey(activeKeys[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch API keys:", err);
    }
  };

  const getSelectedKeyValue = async () => {
    if (!selectedKey) return "YOUR_API_KEY_HERE";
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/auth/api-keys/${selectedKey}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        return data.key;
      }
    } catch (err) {
      console.error("Failed to fetch key details:", err);
    }
    return "YOUR_API_KEY_HERE";
  };

  const embedCodeCDN = async () => {
    const apiKey = await getSelectedKeyValue();
    return `<!-- Option 2: Load widget from Nexora server (Recommended) -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/widget.iife.js';
    script.onload = function() {
      window.NexoraWidget.init('${apiKey}', {
        apiUrl: '${window.location.origin}/api'
      });
    };
    document.body.appendChild(script);
  })();
</script>`;
  };

  const embedCodeSelfHosted = async () => {
    const apiKey = await getSelectedKeyValue();
    return `<!-- Option 1: Self-hosted widget -->
<!-- 1. Download widget.iife.js from your dashboard -->
<!-- 2. Upload it to your website's directory -->
<!-- 3. Add this code: -->
<script src="/path/to/widget.iife.js"></script>
<script>
  window.NexoraWidget.init('${apiKey}', {
    apiUrl: '${window.location.origin}/api'  // Your Nexora server URL
  });
</script>`;
  };

  const handleCopySelfHosted = async () => {
    const code = await embedCodeSelfHosted();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCDN = async () => {
    const code = await embedCodeCDN();
    navigator.clipboard.writeText(code);
    setCopiedExternal(true);
    setTimeout(() => setCopiedExternal(false), 2000);
  };

  const handleDownloadWidget = () => {
    window.open('/widget.iife.js', '_blank');
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Embed Widget on Website</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key Selector */}
        {apiKeys.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select API Key to use:
            </label>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
            >
              {apiKeys.map(key => (
                <option key={key._id} value={key._id}>
                  {key.name} - {key.key_prefix}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-300 font-medium mb-2">
            📌 Choose Your Integration Method:
          </p>
          <p className="text-xs text-blue-800 dark:text-blue-400">
            You can either host the widget file yourself (Option 1) or load it directly from this server (Option 2 - Recommended for easier updates).
          </p>
        </div>

        {/* Option 2: CDN-Hosted (Recommended) */}
        <div className="border-2 border-green-300 dark:border-green-700 rounded-lg p-4 bg-green-50/50 dark:bg-green-950/30">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg shrink-0">
              <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Option 2: Load from Server (Recommended)
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Widget loads directly from your Nexora server. Best for external websites - always gets automatic updates.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-60">
              <code>{`<!-- Option 2: Load widget from Nexora server (Recommended) -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/widget.iife.js';
    script.onload = function() {
      window.NexoraWidget.init('${selectedKey ? "..." : "YOUR_API_KEY_HERE"}', {
        apiUrl: '${window.location.origin}/api'
      });
    };
    document.body.appendChild(script);
  })();
</script>`}</code>
            </pre>
            <button
              onClick={handleCopyCDN}
              className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              title="Copy to clipboard"
            >
              {copiedExternal ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>

          <div className="mt-3 bg-white dark:bg-slate-800 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">✨ Benefits:</p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              <li>Always loads the latest widget version</li>
              <li>No manual updates needed</li>
              <li>Perfect for external websites</li>
            </ul>
          </div>
        </div>

        {/* Option 1: Self-Hosted */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0">
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Option 1: Download & Self-Host
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download the widget file and host it on your own server. Requires manual updates.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadWidget}
            className="w-full mb-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={16} />
            Download widget.iife.js
          </button>
          
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-60">
              <code>{`<!-- Option 1: Self-hosted widget -->
<!-- 1. Download widget.iife.js from your dashboard -->
<!-- 2. Upload it to your website's directory -->
<!-- 3. Add this code: -->
<script src="/path/to/widget.iife.js"></script>
<script>
  window.NexoraWidget.init('${selectedKey ? "..." : "YOUR_API_KEY_HERE"}', {
    apiUrl: '${window.location.origin}/api'  // Your Nexora server URL
  });
</script>`}</code>
            </pre>
            <button
              onClick={handleCopySelfHosted}
              className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
            <ExternalLink className="w-4 h-4 text-green-600 dark:text-green-400" />
            Installation Steps:
          </h4>
          <ol className="text-sm text-gray-700 dark:text-slate-300 space-y-2 list-decimal list-inside">
            <li>Copy your preferred embed code above</li>
            <li>Open your website's HTML file</li>
            <li>Paste the code before the closing <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded text-xs">&lt;/body&gt;</code> tag</li>
            <li>If you see "YOUR_API_KEY_HERE", replace it with your actual API key</li>
            <li>Save and deploy your website</li>
            <li>The chat widget will appear in the bottom-right corner!</li>
          </ol>
        </div>

        {/* Testing Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2 text-yellow-900 dark:text-yellow-300">
            🧪 Test Your Widget Locally:
          </h4>
          <ol className="text-xs text-yellow-800 dark:text-yellow-400 space-y-2 list-decimal list-inside">
            <li>Create a file named <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">test.html</code></li>
            <li>Paste the embed code inside the HTML file</li>
            <li>Open <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">test.html</code> in your browser</li>
            <li>The widget should appear and respond to your queries!</li>
          </ol>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-800 dark:text-blue-400">
            💡 <strong>Tip:</strong> The widget will automatically use your customized chatbot name, greeting, and personality. Update these in the "Chatbot Identity" panel above to change how your widget appears to visitors.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
