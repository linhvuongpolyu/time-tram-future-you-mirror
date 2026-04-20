import React, { useEffect, useRef, useState } from 'react';
import { Camera, Download, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';
import QRCode from 'qrcode';
import { audioPlayer } from '../utils/audioPlayer';

interface ResultsDisplayProps {
  results: any[];
  percentages: Record<string, number>;
  dominantArchetype: string;
  onBack: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  percentages,
  dominantArchetype,
  onBack,
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [visibleOtherIndex, setVisibleOtherIndex] = useState(-1);
  const [showingDominant, setShowingDominant] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(60);
  const [altCountdownSeconds, setAltCountdownSeconds] = useState(8);

  const dominantImage = results.find((img: any) => img.isDominant);
  const otherImages = results.filter((img: any) => !img.isDominant);

  const handleBack = () => {
    audioPlayer.stopAudio();
    onBack();
  };

  // Auto-advance to alternatives after 60 seconds (longer for intimate meeting)
  useEffect(() => {
    if (!showingDominant) return;

    const dominantTimer = setTimeout(() => {
      setShowingDominant(false);
      setVisibleOtherIndex(0);
    }, 60000);

    return () => clearTimeout(dominantTimer);
  }, [showingDominant]);

  // Countdown for dominant view
  useEffect(() => {
    if (!showingDominant) return;

    setCountdownSeconds(60);
    const countdownInterval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [showingDominant]);

  // Auto-advance between alternatives every 8 seconds (slower for farewell)
  useEffect(() => {
    if (showingDominant || visibleOtherIndex < 0) return;

    const showTimer = setTimeout(() => {
      if (visibleOtherIndex < otherImages.length - 1) {
        setVisibleOtherIndex(visibleOtherIndex + 1);
      } else {
        setVisibleOtherIndex(-2);
      }
    }, 8000);

    return () => clearTimeout(showTimer);
  }, [visibleOtherIndex, showingDominant, otherImages.length]);

  // Countdown for alternative view
  useEffect(() => {
    if (showingDominant || visibleOtherIndex < 0 || visibleOtherIndex >= otherImages.length) return;

    setAltCountdownSeconds(8);
    const countdownInterval = setInterval(() => {
      setAltCountdownSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [visibleOtherIndex, showingDominant, otherImages.length]);

  // Generate QR code
  useEffect(() => {
    if (qrCanvasRef.current && dominantImage?.image) {
      QRCode.toCanvas(qrCanvasRef.current, dominantImage.image, {
        width: 256,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      }).catch(err => console.error('Error generating QR code:', err));
    }
  }, [dominantImage?.image]);

  // Audio disabled - skipping dominant/meeting music

  // Audio disabled - skipping goodbye music

  // Audio disabled - skipping summary music

  // Audio cleanup disabled


  const downloadQRCode = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `qr-future-${dominantImage.archetype.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPolaroid = () => {
    const canvas = document.createElement('canvas');
    const imageUrl = dominantImage.image;
    
    // Polaroid dimensions: 320x410 (4:5 ratio with white border)
    canvas.width = 320;
    canvas.height = 410;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw image (240x240) in the photo area
      const photoSize = 240;
      const photoX = (canvas.width - photoSize) / 2; // centered horizontally
      const photoY = 20; // top padding
      
      ctx.drawImage(img, photoX, photoY, photoSize, photoSize);

      // Draw archetype name
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      const nameY = photoY + photoSize + 30;
      ctx.fillText(dominantImage.archetype.toUpperCase(), canvas.width / 2, nameY);

      // Draw intro quote
      ctx.font = '12px Arial';
      ctx.fillStyle = '#333333';
      const quoteStartY = nameY + 25;
      const lineHeight = 14;
      const maxWidth = 280;
      
      if (dominantImage.quote?.intro) {
        const introLines = wrapText(ctx, `"${dominantImage.quote.intro}"`, maxWidth);
        introLines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, quoteStartY + (index * lineHeight));
        });
      }

      // Download the polaroid
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `polaroid-${dominantImage.archetype.toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    img.src = imageUrl;
  };

  // Helper function to wrap text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  // Dominant version display
  if (showingDominant && dominantImage) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center justify-center">
        {/* Mute button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="fixed top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all z-50"
          title={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>

        <div className="text-center mb-8">
          <p className="text-gray-400 text-base md:text-lg">You chose me</p>
          <p className="text-gray-500 text-sm md:text-base">Here's who you became</p>
        </div>

        <div className="w-full max-w-7xl flex flex-col items-center">
          <div className="flex flex-col md:flex-row items-stretch gap-8 md:gap-12 w-full h-full">
            {/* Image section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="w-full md:w-2/5 flex items-center justify-center"
            >
              <div className="w-full aspect-square rounded-3xl overflow-hidden border-4 border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                <img src={dominantImage.image} alt={dominantImage.archetype} className="w-full h-full object-cover" />
              </div>
            </motion.div>

            {/* Content section */}
            <div className="md:w-3/5 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tighter">{dominantImage.archetype.toUpperCase()}</h1>

              {dominantImage.quote && (
                <>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="text-xl md:text-2xl lg:text-3xl italic text-white mb-5 leading-snug"
                  >
                    "{dominantImage.quote.intro}"
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 2.5 }}
                    className="text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed mb-6"
                  >
                    "{dominantImage.quote.tradeoff}"
                  </motion.p>
                </>
              )}

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-sm uppercase tracking-widest text-gray-500 mb-4">
                  Distribution
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(percentages).map(([name, value]) => (
                    <div key={name} className={`p-3 rounded-lg border text-center ${name === dominantImage.archetype ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10'}`}>
                      <div className="text-sm uppercase opacity-60">{name}</div>
                      <div className="text-2xl font-bold">{value}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicator for alternative versions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 3.5 }}
                className="mt-8 pt-6 border-t border-white/10"
              >
                <p className="text-base text-gray-400 mb-3">But you contain other selves...</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold animate-pulse">
                    3
                  </div>
                  <span className="text-base text-gray-400">paths bid farewell</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">Transitioning in {countdownSeconds}s</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Alternative versions - Say Goodbye
  if (visibleOtherIndex >= 0 && visibleOtherIndex < otherImages.length) {
    const currentAlt = otherImages[visibleOtherIndex];
    return (
      <div className="min-h-screen bg-black text-white p-8 md:p-12 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl flex flex-col items-center"
        >
          <div className="mb-6 text-center">
            <p className="text-gray-500 text-sm mb-1">The Path Not Taken</p>
            <p className="text-gray-600 text-xs mb-3">Alternative {visibleOtherIndex + 1} of 3</p>
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full transition-all ${
                    i === visibleOtherIndex ? 'bg-white' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden border-3 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-6">
            <img src={currentAlt.image} alt={currentAlt.archetype} className="w-full h-full object-cover" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{currentAlt.archetype}</h2>
          
          {currentAlt.goodbye && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-base md:text-lg text-gray-300 italic text-center leading-relaxed mb-4 max-w-xl"
            >
              "{currentAlt.goodbye}"
            </motion.p>
          )}
          
          <p className="text-xs text-gray-600 mt-4">Next in {altCountdownSeconds}s...</p>
        </motion.div>
      </div>
    );
  }

  // Final summary screen
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 flex flex-col items-center justify-center overflow-y-auto">
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl"
      >
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Your Choice is Made</h1>
          <p className="text-sm md:text-lg text-gray-300 mb-3 md:mb-4 leading-snug">
            You met all your selves today.<br/>
            The ambitious one, the connected one, the restful one, the joyful one.
          </p>
          <p className="text-xs md:text-base text-gray-400 mb-1 md:mb-2">
            And from all of them, you chose—
          </p>
          <p className="text-xl md:text-3xl font-bold text-white">
            {dominantImage?.archetype.toUpperCase()}
          </p>
          <p className="text-gray-500 text-xs md:text-sm mt-2 md:mt-4">
            The others understand. They bid you well.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8 items-start">
          {/* Polaroid Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white p-4 rounded-sm shadow-xl" style={{ maxWidth: '280px', width: '100%' }}>
              <div className="bg-gray-900 rounded-sm overflow-hidden mb-3 aspect-square">
                <img src={dominantImage?.image} alt={dominantImage?.archetype} className="w-full h-full object-cover" />
              </div>

              <div className="bg-white px-2 py-4 text-center">
                <h3 className="text-black font-bold text-base mb-2">{dominantImage?.archetype}</h3>
                <p className="text-black text-xs leading-relaxed italic">
                  {dominantImage?.quote?.intro}
                </p>
                <p className="text-black text-xs mt-2 leading-relaxed">
                  {dominantImage?.quote?.tradeoff}
                </p>
              </div>
            </div>

            <button
              onClick={downloadPolaroid}
              className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-white text-black font-semibold text-sm rounded hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </motion.div>

          {/* QR Code and Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <p className="text-black font-bold text-xs mb-3 uppercase tracking-wider">Scan to Download</p>
              <div className="bg-white p-2">
                <canvas ref={qrCanvasRef} />
              </div>
              <p className="text-black text-xs mt-2 text-center max-w-xs">
                Share your future self
              </p>
            </div>

            <button
              onClick={downloadQRCode}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold text-sm rounded hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              QR Code
            </button>

            {/* Stats */}
            <div className="w-full bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Distribution</p>
              <div className="space-y-2">
                {Object.entries(percentages).map(([name, value]) => (
                  <div key={name} className="flex justify-between items-center text-xs gap-2">
                    <span className={name === dominantArchetype ? 'font-bold' : ''}>{name}</span>
                    <div className="w-20 bg-white/10 rounded-full h-1.5">
                      <div
                        className={`h-full rounded-full ${name === dominantArchetype ? 'bg-white' : 'bg-gray-500'}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-right w-10 font-bold">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-2 bg-white/10 text-white font-semibold text-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Capture Again
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsDisplay;
