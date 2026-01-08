import { useState, useEffect } from "react";
import { Code, Copy, Check, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";

export default function WidgetEmbedPanel() {
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch API key from the API Key panel's data
    const fetchApiKey = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/auth/api-key", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (res.ok) {
          const data = await res.json();
          setApiKey(data.api_key);
        }
      } catch (err) {
        console.error("Failed to fetch API key:", err);
      }
    };
    fetchApiKey();
  }, []);

  const embedCode = `<!-- Add this script to your website's HTML -->
<script src="${window.location.origin}/widget.iife.js"></script>
<script>
  // Initialize the Nexora chatbot widget
  window.NexoraWidget.init('${apiKey || 'YOUR_API_KEY_HERE'}', {
    apiUrl: '${window.location.origin}/api'
  });
</script>`;

  const embedCodeExternal = `<!-- For external websites, specify the full API URL -->
<script src="${window.location.origin}/widget.iife.js"></script>
<script>
  window.NexoraWidget.init('${apiKey || 'YOUR_API_KEY_HERE'}', {
    apiUrl: '${window.location.origin}/api'  // Your Nexora server URL
  });
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyExternal = () => {
    navigator.clipboard.writeText(embedCodeExternal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Embed Widget on Your Website</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Same Domain Integration */}
        <div>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
            <strong>Option 1: Same Domain</strong> - For pages on the same domain as your Nexora server:
          </p>
          
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={handleCopy}
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

        {/* External Domain Integration */}
        <div>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
            <strong>Option 2: External Website</strong> - For any external website (recommended):
          </p>
          
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
              <code>{embedCodeExternal}</code>
            </pre>
            <button
              onClick={handleCopyExternal}
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

        <div className="bg-white dark:bg-slate-800 border border-green-200 dark:border-green-700 rounded-lg p-4 transition-colors">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
            <ExternalLink className="w-4 h-4 text-green-600 dark:text-green-400" />
            Installation Steps:
          </h4>
          <ol className="text-sm text-gray-700 dark:text-slate-300 space-y-2 list-decimal list-inside">
            <li>Copy the appropriate embed code above</li>
            <li>Open your website's HTML file</li>
            <li>Paste the code before the closing <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">&lt;/body&gt;</code> tag</li>
            <li>Replace <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">YOUR_API_KEY_HERE</code> with your actual API key</li>
            <li>Save and deploy your website</li>
            <li>The chat widget will appear in the bottom-right corner</li>
          </ol>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> The widget will automatically use your customized chatbot name, greeting, and personality. Make changes in the "Chatbot Identity" panel above to update how your widget appears to visitors.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
