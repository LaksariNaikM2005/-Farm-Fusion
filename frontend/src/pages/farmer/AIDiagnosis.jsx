import { useState, useRef } from 'react';
import axios from 'axios';
import { FaUpload, FaLeaf, FaArrowRight, FaSyncAlt, FaExclamationTriangle, FaCheckCircle, FaRobot } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AIDiagnosis() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Assuming FastAPI is running on port 8000
      const { data } = await axios.post('http://localhost:8000/predict/disease', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        setResult(data);
        toast.success('Analysis complete!');
      } else {
        toast.error(data.error || 'Failed to analyze image');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not connect to AI Service. Make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="fade-in max-w-4xl mx-auto">
      <div className="page-header text-center mb-10">
        <h1 className="page-title text-4xl mb-2">Smart AI Diagnosis</h1>
        <p className="page-subtitle text-lg">Upload a photo of your crop to detect diseases instantly using YOLOv8 AI.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Upload Section */}
        <div className="card p-8 border-dashed border-2 border-primary/30 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden bg-bg-card/50">
          {preview ? (
            <div className="w-full h-full flex flex-col items-center">
              <img src={preview} alt="Preview" className="max-h-[300px] rounded-lg shadow-xl mb-4 object-cover w-full" />
              {!result && (
                <div className="flex gap-4">
                  <button onClick={reset} className="btn btn-secondary btn-sm" disabled={loading}>Change</button>
                  <button onClick={handleUpload} className="btn btn-primary btn-sm px-6" disabled={loading}>
                    {loading ? <><FaSyncAlt className="animate-spin mr-2" /> Analyzing...</> : <><FaLeaf className="mr-2" /> Start Analysis</>}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="w-full h-full cursor-pointer flex flex-col items-center justify-center p-10 hover:bg-primary/5 transition-colors group"
              onClick={() => fileInputRef.current.click()}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaUpload className="text-3xl text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Drop your image here</h3>
              <p className="text-text-secondary text-center">Support for JPG, PNG. Max size 5MB.</p>
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*"
              />
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-bg-base/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <div className="scanner-line"></div>
              <div className="spinner mb-4"></div>
              <p className="font-bold animate-pulse">Deep Scanning Leaf Patterns...</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {!result && !loading && (
            <div className="card p-8 bg-bg-card/30 border-none h-full flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaRobot className="text-primary" /> How it works
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <p className="text-text-secondary">Capture a clear, well-lit photo of the affected area of the plant.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <p className="text-text-secondary">Our YOLOv8 model analyzes the visual patterns for known diseases.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <p className="text-text-secondary">Receive a detailed diagnosis and recommended organic/chemical treatments.</p>
                </li>
              </ul>
            </div>
          )}

          {result && (
            <div className="card p-8 border-t-4 border-primary fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Analysis Results</h3>
                <span className="badge badge-gold">AI Verification</span>
              </div>

              <div className="flex items-center gap-4 mb-8 p-4 bg-primary/10 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <FaCheckCircle className="text-3xl text-primary" />
                </div>
                <div>
                  <p className="text-sm text-primary font-bold uppercase tracking-widest">Detected Issue</p>
                  <h4 className="text-2xl font-black capitalize">{result.label.replace(/_/g, ' ')}</h4>
                  <p className="text-text-secondary">Confidence Score: {(result.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-bold flex items-center gap-2"><FaExclamationTriangle className="text-gold" /> Recommended Actions</h5>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Based on the detection of <strong>{result.label}</strong>, we recommend isolating the affected plants immediately. 
                  Consider using an organic fungicide or consulting one of our experts for a detailed treatment plan.
                </p>
                <div className="pt-4 flex gap-4">
                  <button onClick={reset} className="btn btn-secondary flex-1">Try Another</button>
                  <button className="btn btn-primary flex-1">Consult Expert <FaArrowRight className="ml-2" /></button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scanner-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: var(--primary);
          box-shadow: 0 0 15px var(--primary);
          top: 0;
          animation: scan 2s linear infinite;
          z-index: 20;
        }
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
