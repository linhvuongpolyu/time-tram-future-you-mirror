import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { computeArchetypeScores } from '../data/cards';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2 } from 'lucide-react';
import ResultsDisplay from './ResultsDisplay';

const MagicMirror: React.FC = () => {
  const { selectedCardIds, setResults, results, clearCards } = useApp();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { percentages, dominantArchetype } = useMemo(() => {
    return computeArchetypeScores(selectedCardIds);
  }, [selectedCardIds]);

  useEffect(() => {
    if (selectedCardIds.length < 10 && !results) {
      navigate('/');
      return;
    }

    let isMounted = true;
    const video = videoRef.current;
    if (!video || results) return;

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        video.srcObject = stream;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Video play interrupted or failed:", error);
          });
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          setError("Webcam access denied.");
        }
      });

    return () => {
      isMounted = false;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
    };
  }, [selectedCardIds.length, navigate, results]);

  const captureAndGenerate = async () => {
    const video = videoRef.current;
    if (!video) return;

    setLoading(true);
    setError(null);
    setProgress(0);
    setCurrentStep('Preparing...');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL('image/png');

      // Start polling for progress
      const pollProgress = async () => {
        try {
          const progressResponse = await fetch('/api/progress');
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            setProgress(progressData.progress || 0);
            setCurrentStep(progressData.step || '');
          }
        } catch (err) {
          // Silent fail on progress polling
        }
      };

      // Poll every 500ms
      progressIntervalRef.current = setInterval(pollProgress, 500);

      // Step 1: Detect gender from the captured image
      setCurrentStep('Analyzing your appearance...');
      setProgress(5);
      
      const genderResponse = await fetch('/api/detect-gender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });

      let detectedGender = 'unknown';
      if (genderResponse.ok) {
        const genderData = await genderResponse.json();
        detectedGender = genderData.gender || 'unknown';
        console.log('[Frontend] Detected gender:', detectedGender);
      } else {
        console.warn('[Frontend] Gender detection failed, will use default');
      }

      setCurrentStep('Generating your future...');
      setProgress(10);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000);

      const response = await fetch('/api/generate-futures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          percentages,
          dominantArchetype,
          gender: detectedGender
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Stop polling
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        const message = errData?.error || "Failed to generate images";
        throw new Error(message);
      }

      const data = await response.json();
      console.log('[Frontend] Response received:', data);

      if (!data.images || !Array.isArray(data.images)) {
        console.error('[Frontend] Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      console.log('[Frontend] Setting results with', data.images.length, 'images');
      setProgress(100);
      setCurrentStep('Complete!');
      setResults(data.images);
    } catch (err: any) {
      console.error('[Frontend] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  };

  const handleBack = () => {
    setResults(null);
    clearCards();
  };

  if (results) {
    return (
      <ResultsDisplay
        results={results}
        percentages={percentages}
        dominantArchetype={dominantArchetype}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 tracking-tighter">MAGIC MIRROR</h1>
        <p className="text-gray-400">Meet your future self - See where your path leads</p>
      </header>

      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-white/20 bg-gray-900 mb-8">
          <video
            ref={videoRef}
            className="w-full h-full object-cover scale-x-[-1]"
            playsInline
          />

          {loading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="text-xl font-medium">Gazing Through Time...</p>
              <p className="text-sm text-gray-400 mt-2">Unveiling what awaits...</p>
              
              {/* Progress Bar */}
              <div className="mt-8 w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{currentStep}</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-white to-gray-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center p-8 text-center">
              <p className="text-xl">{error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
          {Object.entries(percentages).map(([name, value]) => (
            <div key={name} className={`p-4 rounded-2xl border ${name === dominantArchetype ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10'}`}>
              <div className="text-sm uppercase tracking-widest opacity-60">{name}</div>
              <div className="text-3xl font-bold">{value}%</div>
            </div>
          ))}
        </div>

        {!loading && (
          <>
            <p className="text-center text-gray-300 mb-6 max-w-2xl">
              Gaze into the mirror and discover what awaits.
            </p>
            <button
              onClick={captureAndGenerate}
              disabled={loading}
              className="group relative flex items-center gap-4 px-12 py-6 bg-white text-black font-bold text-2xl rounded-full hover:scale-105 transition-transform disabled:opacity-50"
            >
              <Camera className="w-8 h-8" />
              REVEAL YOUR DESTINY
              <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-20 pointer-events-none"></div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MagicMirror;
