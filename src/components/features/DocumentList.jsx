import { useState, useEffect } from "react";
import { FileText, Trash2, ExternalLink, RefreshCw, AlertCircle, FileDigit } from "lucide-react";
import { authenticatedFetch } from "../../config";
import { Card, CardContent } from "../ui/Card";

export default function DocumentList() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDocs = async () => {
    setLoading(true);
    try {
      // FIX: Changed endpoint from /system/documents to /documents
      const data = await authenticatedFetch("/documents?page_size=50");
      setDocs(data.documents);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setDocs(prev => prev.filter(d => d.id !== docId));
    try {
      await authenticatedFetch(`/documents?doc_id=${docId}`, { method: "DELETE" });
    } catch (err) {
      alert("Failed to delete item.");
      fetchDocs();
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  return (
    <Card className="h-full flex flex-col border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-brand-600 rounded-lg"><FileText size={18} /></div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Knowledge Base</h3>
            <p className="text-xs text-gray-500">{docs.length} documents indexed</p>
          </div>
        </div>
        <button 
          onClick={fetchDocs} 
          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-brand-600 transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col bg-white">
        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {docs.length === 0 && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <FileDigit size={40} className="mb-3 opacity-10" />
              <p className="text-sm">No documents found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 text-gray-500 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/30 group transition-colors">
                    <td className="px-6 py-3 max-w-[250px]">
                      <div className="text-sm font-medium text-gray-900 truncate" title={doc.title}>
                        {doc.title || "Untitled"}
                      </div>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-gray-400 flex items-center gap-1 hover:text-brand-600 truncate mt-0.5"
                      >
                        <ExternalLink size={10} /> {doc.url}
                      </a>
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-gray-500 font-mono">
                      {(doc.total_characters / 1000).toFixed(1)}k
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}