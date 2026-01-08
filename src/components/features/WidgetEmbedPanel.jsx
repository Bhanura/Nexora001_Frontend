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
  window.NexoraWidget.init('${apiKey || 'YOUR_API_KEY_HERE'}');
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-lg">Embed Widget on Your Website</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Copy and paste this code into your website's HTML, just before the closing <code className="bg-gray-200 px-1 rounded">&lt;/body&gt;</code> tag:
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

        <div className="bg-white border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-green-600" />
            Installation Steps:
          </h4>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
            <li>Copy the embed code above</li>
            <li>Open your website's HTML file</li>
            <li>Paste the code before the closing <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag</li>
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
