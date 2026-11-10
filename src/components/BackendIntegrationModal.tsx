import React, { useState } from 'react';
import {
  X,
  Code2,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Server,
  RefreshCw,
  AlertCircle,
  Database,
  ArrowRight,
} from 'lucide-react';

interface BackendIntegrationModalProps {
  onClose: () => void;
  customApiUrl: string;
  onSaveCustomApiUrl: (url: string) => void;
  isUsingCustomApi: boolean;
  onToggleUseCustomApi: (enabled: boolean) => void;
}

export const BackendIntegrationModal: React.FC<BackendIntegrationModalProps> = ({
  onClose,
  customApiUrl,
  onSaveCustomApiUrl,
  isUsingCustomApi,
  onToggleUseCustomApi,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [testUrl, setTestUrl] = useState<string>(
    customApiUrl || '/api/carparkavailability'
  );
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResponse, setTestResponse] = useState<string>('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleTestApi = async () => {
    setTestStatus('testing');
    setTestResponse('');
    try {
      const res = await fetch(testUrl);
      const data = await res.json();
      setTestStatus('success');
      setTestResponse(JSON.stringify(data, null, 2).slice(0, 1000) + '...\n(truncated for preview)');
    } catch (err: any) {
      setTestStatus('error');
      setTestResponse(
        `Failed to fetch from ${testUrl}.\nError: ${err.message || 'CORS restriction or network error'}.\nTip: When running locally, proxy the API through Express to avoid browser CORS headers.`
      );
    }
  };

  const handleSaveAndApply = () => {
    onSaveCustomApiUrl(testUrl);
    onToggleUseCustomApi(true);
  };

  const expressSnippet = `// server.ts (Express backend proxy for Singapore Carpark API)
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy data.gov.sg Carpark Availability
app.get('/api/carparks/availability', async (req, res) => {
  try {
    const response = await fetch('https://api.data.gov.sg/v1/transport/carpark-availability');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Singapore carpark availability' });
  }
});

// Proxy LTA DataMall v2 Carpark Availability
app.get('/api/carparks/lta', async (req, res) => {
  try {
    const response = await fetch(
      'http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      {
        headers: {
          AccountKey: process.env.LTA_DATAMALL_KEY || '',
          accept: 'application/json',
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch LTA DataMall carparks' });
  }
});

app.listen(PORT, () => {
  console.log(\`Backend proxy listening on port \${PORT}\`);
});`;

  const curlSnippet = `# 1. Singapore Government Open Data API (No API key required)
curl -X GET "https://api.data.gov.sg/v1/transport/carpark-availability"

# 2. LTA DataMall API (Requires AccountKey header from mytransport.sg)
curl -H "AccountKey: YOUR_LTA_KEY" \\
  "http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2"`;

  const sampleJsonSnippet = `{
  "items": [
    {
      "timestamp": "2026-11-10T11:35:00+08:00",
      "carpark_data": [
        {
          "carpark_number": "ACB",
          "update_datetime": "2026-11-10T11:34:12",
          "carpark_info": [
            {
              "total_lots": "420",
              "lot_type": "C",
              "lots_available": "19"
            }
          ]
        }
      ]
    }
  ]
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#e0e3eb] overflow-hidden flex flex-col max-h-[92vh] z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e0e3eb] flex items-center justify-between bg-[#181b24] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0049db] flex items-center justify-center text-[#84f7db]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Backend Connection & API Setup
                <span className="text-[10px] font-mono-num font-semibold text-[#84f7db] bg-[#006554] px-1.5 py-0.5 rounded">
                  v1.0
                </span>
              </h2>
              <p className="text-xs text-[#c3c5d8]">
                Ready for plugging in your live Singapore backend or data.gov.sg / LTA APIs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#c3c5d8] hover:bg-[#2d303a] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-[#181b24]">
          {/* Architecture Status Banner */}
          <div className="p-3.5 bg-[#f8f9fd] border border-[#e0e3eb] rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#ebedfa] text-[#0049db] mt-0.5 shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-[#181b24]">Frontend Architecture Note</h4>
              <p className="text-xs text-[#5a5e6b] mt-0.5 leading-relaxed">
                This app is currently operating in <strong>High-Fidelity Frontend Simulation Mode</strong> with realistic real-time lot fluctuations matching Singapore’s EPS gantry formats. When you are ready to connect your backend, you can plug your endpoint below or connect directly to Singapore government open data.
              </p>
            </div>
          </div>

          {/* Test Custom Endpoint Section */}
          <div className="p-4 bg-white border border-[#e0e3eb] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#181b24] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#0049db]" /> Test Custom / Remote Endpoint
              </h4>
              <span className="text-[11px] text-[#737687]">
                Status: {isUsingCustomApi ? (
                  <span className="text-[#089981] font-semibold">Live Remote</span>
                ) : (
                  <span className="text-[#5a5e6b]">Simulated Mock</span>
                )}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://api.data.gov.sg/v1/transport/carpark-availability"
                className="flex-1 px-3 py-2 bg-[#f8f9fd] border border-[#c3c5d8] rounded-lg text-xs font-mono-num text-[#181b24] focus:outline-none focus:border-[#0049db]"
              />
              <button
                onClick={handleTestApi}
                disabled={testStatus === 'testing'}
                className="cursor-pointer px-3 py-2 bg-[#181b24] hover:bg-[#2d303a] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>Test</span>
              </button>
            </div>

            {testStatus === 'success' && (
              <div className="space-y-2">
                <div className="p-2.5 bg-[#e6f5f2] border border-[#84f7db] rounded-lg text-[#006554] text-[11px] font-medium flex items-center justify-between">
                  <span>✓ Successfully connected & received JSON response!</span>
                  <button
                    onClick={handleSaveAndApply}
                    className="cursor-pointer text-xs font-bold bg-[#089981] text-white px-2.5 py-1 rounded hover:bg-[#006554] transition-colors"
                  >
                    Apply Endpoint
                  </button>
                </div>
                <pre className="p-2.5 bg-[#181b24] text-[#84f7db] rounded-lg font-mono-num text-[11px] overflow-x-auto max-h-36">
                  {testResponse}
                </pre>
              </div>
            )}

            {testStatus === 'error' && (
              <div className="p-2.5 bg-[#fdebed] border border-[#ffdad6] rounded-lg text-[#ba1a1a] text-[11px]">
                <pre className="whitespace-pre-wrap font-sans">{testResponse}</pre>
              </div>
            )}
          </div>

          {/* cURL commands */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#181b24] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#0049db]" /> Singapore Government APIs
              </h4>
              <button
                onClick={() => copyToClipboard(curlSnippet, 'curl')}
                className="cursor-pointer flex items-center gap-1 text-[11px] text-[#0049db] font-semibold hover:underline"
              >
                {copiedSection === 'curl' ? <Check className="w-3.5 h-3.5 text-[#089981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'curl' ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>

            <pre className="p-3 bg-[#181b24] text-[#e0e2ee] rounded-xl font-mono-num text-[11px] overflow-x-auto">
              {curlSnippet}
            </pre>
          </div>

          {/* Express Proxy Template */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#181b24] flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#0049db]" /> Express Proxy Route (server.ts)
              </h4>
              <button
                onClick={() => copyToClipboard(expressSnippet, 'express')}
                className="cursor-pointer flex items-center gap-1 text-[11px] text-[#0049db] font-semibold hover:underline"
              >
                {copiedSection === 'express' ? <Check className="w-3.5 h-3.5 text-[#089981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'express' ? 'Copied' : 'Copy Express Code'}</span>
              </button>
            </div>

            <pre className="p-3 bg-[#faf9ff] border border-[#e0e3eb] text-[#181b24] rounded-xl font-mono-num text-[11px] overflow-x-auto max-h-48">
              {expressSnippet}
            </pre>
          </div>

          {/* Response Payload Schema Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#181b24]">
                Official data.gov.sg JSON Schema
              </h4>
              <button
                onClick={() => copyToClipboard(sampleJsonSnippet, 'schema')}
                className="cursor-pointer flex items-center gap-1 text-[11px] text-[#0049db] font-semibold hover:underline"
              >
                {copiedSection === 'schema' ? <Check className="w-3.5 h-3.5 text-[#089981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'schema' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="p-3 bg-[#faf9ff] border border-[#e0e3eb] text-[#181b24] rounded-xl font-mono-num text-[11px] overflow-x-auto">
              {sampleJsonSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e0e3eb] bg-[#faf9ff] flex items-center justify-between">
          <a
            href="https://beta.data.gov.sg/collections/122/datasets/d_23f063b55594833c86b4b559412323bc/view"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#0049db] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Visit Data.gov.sg Documentation</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2 bg-[#181b24] hover:bg-[#2d303a] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
