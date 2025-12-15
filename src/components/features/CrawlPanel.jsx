import { useState } from "react";
import { Globe, Play, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { authenticatedFetch } from "../../config";
import { Card, CardHeader, CardContent } from "../ui/Card";

export default function CrawlPanel() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', msg: '' }

  const handleCrawl = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await authenticatedFetch("/ingest/url", {
        method: "POST",
        body: JSON.stringify({ url, max_depth: 2, follow_links: true })
      });
      setStatus({ type: "success", msg: `Crawling started! Job ID: ${res.job_id}` });
      setUrl("");
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Knowledge Base" description="Add websites for your bot to learn from." icon={Globe} />
      <CardContent>
        <form onSubmit={handleCrawl} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Website URL</label>
            <div className="flex gap-2">
              <input
                type="url" required placeholder="https://example.com"
                value={url} onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <button
                disabled={loading}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                Start
              </button>
            </div>
          </div>

          {status && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
              status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {status.msg}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}