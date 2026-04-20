import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle2, QrCode, Type, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { getCardById, isKnownCardId, normalizeCardId } from '../data/cards';

const QRScanner: React.FC = () => {
  const { selectedCardIds, addCardId } = useApp();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastDetectionRef = useRef<{ value: string; count: number }>({ value: '', count: 0 });
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [manualInput, setManualInput] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let isMounted = true;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || mode === 'manual') return;

    const context = canvas.getContext('2d', { willReadFrequently: true });

    const scan = () => {
      if (!isMounted) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            const normalizedId = normalizeCardId(code.data);
            if (!isKnownCardId(normalizedId)) {
              lastDetectionRef.current = { value: '', count: 0 };
            } else {
              if (lastDetectionRef.current.value === normalizedId) {
                lastDetectionRef.current.count += 1;
              } else {
                lastDetectionRef.current = { value: normalizedId, count: 1 };
              }

              // Require at least 2 consecutive detections for a stable QR read.
              if (lastDetectionRef.current.count >= 2) {
                addCardId(normalizedId);
                lastDetectionRef.current = { value: '', count: 0 };
              }
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(scan);
    };

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        // Handle play promise to avoid "interrupted by a new load request" error
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Video play interrupted or failed:", error);
          });
        }
        requestAnimationFrame(scan);
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          setError("Camera access denied or not available.");
        }
      });

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      if (video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
    };
  }, [addCardId, mode]);

  const handleManualSubmit = () => {
    setManualError(null);
    const trimmedInput = manualInput.trim().toUpperCase();
    
    if (!trimmedInput) {
      setManualError('Please enter a code');
      return;
    }

    const normalizedId = normalizeCardId(trimmedInput);
    if (!isKnownCardId(normalizedId)) {
      setManualError(`Code "${trimmedInput}" is not valid`);
      setManualInput('');
      return;
    }

    if (selectedCardIds.includes(normalizedId)) {
      setManualError('This code has already been selected');
      setManualInput('');
      return;
    }

    addCardId(normalizedId);
    setManualInput('');
    setManualError(null);
  };

  const handleManualKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 tracking-tighter">TIME TRAM</h1>
        <p className="text-gray-400">Scan 10 Postcards to Begin Your Journey</p>
      </header>

      {/* Mode Toggle */}
      <div className="mb-8 flex gap-4 bg-white/5 p-1 rounded-lg border border-white/10">
        <button
          onClick={() => setMode('scan')}
          className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold transition-all ${
            mode === 'scan'
              ? 'bg-white text-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Camera className="w-5 h-5" />
          Scan QR
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold transition-all ${
            mode === 'manual'
              ? 'bg-white text-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Type className="w-5 h-5" />
          Manual Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl">
        {/* Scanner Section */}
        <div className="flex flex-col items-center">
          {mode === 'scan' ? (
            <>
              <div className="relative w-full aspect-square max-w-md border-4 border-white/20 rounded-3xl overflow-hidden bg-gray-900">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanner Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-0.5 bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-xl font-mono">
                <QrCode className="w-6 h-6" />
                <span>SCANNED: {selectedCardIds.length} / 10</span>
              </div>
            </>
          ) : (
            <>
              <div className="relative w-full max-w-md">
                <div className="bg-white/5 border-4 border-white/20 rounded-3xl p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">Enter Code:</label>
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                      onKeyPress={handleManualKeyPress}
                      placeholder="e.g., C1, C2, ..."
                      className="w-full px-4 py-3 bg-black border-2 border-white/20 rounded-xl text-white text-center text-2xl font-mono focus:border-white focus:outline-none transition-colors"
                      autoFocus
                    />
                  </div>

                  {manualError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/30"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span className="text-sm">{manualError}</span>
                    </motion.div>
                  )}

                  <button
                    onClick={handleManualSubmit}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Add Code
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xl font-mono">
                <Type className="w-6 h-6" />
                <span>ADDED: {selectedCardIds.length} / 10</span>
              </div>
            </>
          )}
        </div>

        {/* List Section */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold mb-4 border-b border-white/10 pb-2">Selected Cards</h2>
          <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2 pr-2">
            {selectedCardIds.length === 0 ? (
              <p className="text-gray-500 italic">No cards scanned yet...</p>
            ) : (
              selectedCardIds.map((id, index) => {
                const card = getCardById(id);
                if (!card) return null;
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={`${id}-${index}`}
                    className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10"
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-sm text-gray-400">{id}</span>
                      <span className="font-semibold">{card.choiceName}</span>
                    </div>
                    <CheckCircle2 className="text-green-500 w-5 h-5 shrink-0" />
                  </motion.div>
                );
              })
            )}
          </div>

          {selectedCardIds.length >= 10 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate('/mirror')}
              className="mt-8 w-full py-6 bg-white text-black font-bold text-2xl rounded-2xl hover:bg-gray-200 transition-colors"
            >
              GO TO MAGIC MIRROR
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
