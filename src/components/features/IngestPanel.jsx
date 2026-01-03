import { useState, useEffect, useRef } from "react";
import { Globe, FileUp, Play, Loader2, CheckCircle, AlertCircle, Sparkles, X } from "lucide-react";
import { authenticatedFetch, API_BASE_URL } from "../../config";
import { Card, CardContent } from "../ui/Card";
import { cn } from "../../lib/utils";

// Polling helper function with timeout
const pollCrawlStatus = async (jobId, timeout = 300000, onProgress = null) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const interval = setInterval(async () => {
      // Check timeout (5 minutes default)
      if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error("Polling timeout:  Job took too long"));
        return;
      }
      
      try {
        const res = await authenticatedFetch(`/ingest/url/${jobId}`);
        
        // Call progress callback if provided
        if (onProgress && res.status === "running") {
          onProgress(res);
        }
        
        // If completed or failed, stop polling
        if (res.status === "completed" || res.status === "failed") {
          clearInterval(interval);
          resolve(res);
        }
        // If still "queued" or "running", keep polling... 
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 2000); // Check every 2 seconds
  });
};

// Helper function to validate URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export default function IngestPanel() {
  const [activeTab, setActiveTab] = useState("web"); 
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const [url, setUrl] = useState("");
  const [depth, setDepth] = useState("1");
  const [useJs, setUseJs] = useState(false);
  const [file, setFile] = useState(null);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-clear success messages after 8 seconds
  useEffect(() => {
    if (status?. type === 'success' && ! loading) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setStatus(null);
        }
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [status, loading]);

  const handleWebIngest = async (e) => {
    e.preventDefault();
    
    // Validate URL
    if (!isValidUrl(url)) {
      setStatus({ type: "error", msg: "Please enter a valid URL" });
      return;
    }

    setLoading(true);
    setStatus(null);

    const depthInt = parseInt(depth, 10);

    console.log("Sending Crawl Request:", { 
      url, 
      max_depth: depthInt, 
      follow_links: depthInt > 0, 
      use_playwright: useJs 
    });

    try {
      // 1. Start the job
      const res = await authenticatedFetch("/ingest/url", {
        method: "POST",
        body: JSON. stringify({ 
          url: url, 
          max_depth:  depthInt, 
          follow_links: depthInt > 0,
          use_playwright:  Boolean(useJs)
        })
      });
      
      if (! isMountedRef.current) return;

      // 2. Show "Processing" state
      setStatus({ 
        type: "success", 
        msg: `Crawling started... (Job: ${res. job_id.slice(0,8)})` 
      });
      
      // Clear form
      setUrl("");
      setDepth("1");
      setUseJs(false);

      // 3. Wait for completion (Poll)
      const finalResult = await pollCrawlStatus(
        res.job_id,
        300000, // 5 minute timeout
        (progressData) => {
          // Update status during polling if API provides progress
          if (isMountedRef.current && progressData.progress) {
            setStatus({ 
              type: "success", 
              msg: `Crawling in progress... ${progressData.progress}` 
            });
          }
        }
      );

      if (!isMountedRef.current) return;

      // 4. Update final status
      if (finalResult.status === "completed") {
        setStatus({ 
          type: "success", 
          msg: `✅ Crawling Complete!  Processed ${finalResult.result?.pages_crawled || '?'} pages.` 
        });
      } else {
        setStatus({ 
          type: "error", 
          msg: `Crawling Failed: ${finalResult. error || 'Unknown error'}` 
        });
      }

    } catch (err) {
      if (isMountedRef.current) {
        setStatus({ 
          type: "error", 
          msg: err.message || "An unexpected error occurred.  Please try again." 
        });
        console.error("Ingest error:", err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleFileIngest = async (e) => {
    e.preventDefault();
    if (!file) return;

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setStatus({ type: "error", msg: "File size exceeds 10MB limit" });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      setStatus({ type: "error", msg: "Only PDF and DOCX files are allowed" });
      return;
    }
    
    setLoading(true);
    setStatus(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_BASE_URL}/ingest/file`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      if (! isMountedRef.current) return;

      setStatus({ type: "success", msg: `✅ Uploaded: ${data. filename}` });
      setFile(null);
    } catch (err) {
      if (isMountedRef. current) {
        setStatus({ 
          type: "error", 
          msg: err.message || "An unexpected error occurred. Please try again." 
        });
        console.error("File upload error:", err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setStatus(null);
  };

  return (
    <Card className="h-full border-gray-200 shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        {['web', 'file'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setStatus(null);
            }}
            disabled={loading}
            className={cn(
              "flex-1 py-3 text-xs font-semibold uppercase tracking-wide flex items-center justify-center gap-2 transition-all",
              activeTab === tab 
                ? "bg-white text-brand-600 border-b-2 border-brand-600 shadow-sm" 
                :  "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50",
              loading && "cursor-not-allowed opacity-50"
            )}
          >
            {tab === 'web' ? <Globe size={14} /> : <FileUp size={14} />}
            {tab === 'web' ? 'Website' : 'Document'}
          </button>
        ))}
      </div>

      <CardContent className="p-5 space-y-5 bg-white">
        {activeTab === "web" && (
          <form onSubmit={handleWebIngest} className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 ml-1">Target URL</label>
              <input
                type="url" 
                required 
                placeholder="https://docs.docker.com"
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 ml-1">Depth</label>
                <select 
                  value={depth} 
                  onChange={(e) => setDepth(e.target. value)}
                  disabled={loading}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="0">Current Page Only</option>
                  <option value="1">1 Level Deep</option>
                  <option value="2">2 Levels Deep</option>
                </select>
              </div>
              
              <div className="flex items-center pt-6">
                <label className={cn(
                  "flex items-center gap-2 cursor-pointer group select-none",
                  loading && "cursor-not-allowed opacity-50"
                )}>
                  <div className={cn(
                    "w-4 h-4 border rounded transition-colors flex items-center justify-center",
                    useJs ? 'bg-brand-600 border-brand-600' : 'border-gray-300 bg-white'
                  )}>
                    {useJs && <CheckCircle size={10} className="text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={useJs} 
                    onChange={(e) => setUseJs(e.target.checked)}
                    disabled={loading}
                    aria-label="Enable JavaScript rendering"
                  />
                  <span className="text-xs text-gray-600 group-hover:text-brand-700 font-medium">
                    Use JavaScript
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ?  <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
              {loading ? 'Processing...' : 'Start Processing'}
            </button>
          </form>
        )}

        {activeTab === "file" && (
          <form onSubmit={handleFileIngest} className="space-y-4 animate-fade-in py-2">
            <div className={cn(
              "border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 transition-all relative group",
              ! loading && "hover:bg-brand-50/30 hover:border-brand-200 cursor-pointer",
              loading && "opacity-50 cursor-not-allowed"
            )}>
              <input 
                type="file" 
                accept=".pdf,. docx"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={loading}
                className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
              />
              <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <FileUp className="text-brand-500" size={24} />
              </div>
              {file ? (
                <div className="text-center animate-fade-in">
                  <p className="text-sm font-semibold text-brand-700">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-sm font-medium">Drop PDF or DOCX here</p>
                  <p className="text-xs mt-1 opacity-70">Max 10MB</p>
                </div>
              )}
            </div>

            <button
              disabled={!file || loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              Analyze Document
            </button>
          </form>
        )}

        {status && (
          <div className={cn(
            "p-3 rounded-lg text-xs flex items-start gap-2 animate-fade-in",
            status.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          )}>
            {status.type === 'success' ? <CheckCircle size={14} className="mt-0.5" /> : <AlertCircle size={14} className="mt-0.5" />}
            <span className="leading-tight">{status.msg}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}