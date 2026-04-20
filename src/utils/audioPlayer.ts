// Audio player using Web Audio API
class AudioPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private isMuted = false;
  private hasUserInteraction = false;
  private pendingAudio: { path: string; options: { loop?: boolean; volume?: number } } | null = null;

  constructor() {
    // Enable audio playback on first user interaction
    const enableAudioOnInteraction = () => {
      this.hasUserInteraction = true;
      console.log('[AudioPlayer] User interaction detected - audio enabled');
      
      // Resume any pending audio
      if (this.pendingAudio) {
        const pending = this.pendingAudio;
        this.pendingAudio = null;
        this.playAudio(pending.path, pending.options);
      }
      
      // Remove listeners after first interaction
      document.removeEventListener('click', enableAudioOnInteraction);
      document.removeEventListener('touchstart', enableAudioOnInteraction);
      document.removeEventListener('keydown', enableAudioOnInteraction);
    };
    
    document.addEventListener('click', enableAudioOnInteraction);
    document.addEventListener('touchstart', enableAudioOnInteraction);
    document.addEventListener('keydown', enableAudioOnInteraction);
  }

  async playAudio(audioPath: string, options: { loop?: boolean; volume?: number } = {}) {
    if (this.isMuted) {
      console.log('[AudioPlayer] Skipping playback - muted');
      return;
    }

    // Stop current audio if playing
    this.stopAudio(0);

    try {
      const audio = new Audio(audioPath);
      const targetVolume = options.volume ?? 0.5;
      audio.loop = options.loop ?? false;
      audio.preload = 'auto';
      audio.volume = targetVolume;
      
      console.log(`[AudioPlayer] Playing: ${audioPath}, loop: ${audio.loop}, volume: ${targetVolume}, hasUserInteraction: ${this.hasUserInteraction}`);
      
      // Add event listeners for debugging
      audio.addEventListener('play', () => {
        console.log(`[AudioPlayer] ✓ Audio started playing: ${audioPath}`);
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`[AudioPlayer] ✗ Audio error for ${audioPath}:`, audio.error?.code, audio.error?.message);
      });

      audio.addEventListener('canplay', () => {
        console.log(`[AudioPlayer] Audio can play: ${audioPath}`);
      });

      audio.addEventListener('loadstart', () => {
        console.log(`[AudioPlayer] Audio loading: ${audioPath}`);
      });

      audio.addEventListener('ended', () => {
        console.log(`[AudioPlayer] Audio ended: ${audioPath}`);
      });

      // Try to play audio
      try {
        await audio.play();
        console.log(`[AudioPlayer] ✓ Play promise resolved: ${audioPath}`);
      } catch (err: any) {
        console.error(`[AudioPlayer] ✗ Play promise rejected:`, err.name, err.message);
        
        // If autoplay is blocked, try with muted
        if (err.name === 'NotAllowedError') {
          console.log('[AudioPlayer] Trying with muted attribute...');
          try {
            audio.muted = true;
            await audio.play();
            console.log(`[AudioPlayer] ✓ Playing muted: ${audioPath}`);
            // Unmute after a short delay to let audio start
            setTimeout(() => {
              audio.muted = false;
              console.log(`[AudioPlayer] ✓ Unmuted after autoplay restriction`);
            }, 100);
          } catch (mutedErr: any) {
            console.error(`[AudioPlayer] ✗ Muted play failed:`, mutedErr.name);
            if (!this.hasUserInteraction) {
              console.log('[AudioPlayer] Waiting for user interaction to play audio');
              this.pendingAudio = { path: audioPath, options };
            }
          }
        }
      }

      this.currentAudio = audio;
    } catch (error) {
      console.error(`[AudioPlayer] ✗ Error creating audio:`, error);
    }
  }

  stopAudio(fadeOutDuration = 1000) {
    if (!this.currentAudio) return;

    const audio = this.currentAudio;
    const startVolume = audio.volume;
    const startTime = Date.now();

    console.log(`[AudioPlayer] Stopping audio with fade out duration: ${fadeOutDuration}ms`);

    if (fadeOutDuration === 0) {
      audio.pause();
      audio.currentTime = 0;
      this.currentAudio = null;
      console.log(`[AudioPlayer] Audio stopped immediately`);
      return;
    }

    const fadeOut = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / fadeOutDuration, 1);
      audio.volume = startVolume * (1 - progress);

      if (progress < 1) {
        requestAnimationFrame(fadeOut);
      } else {
        audio.pause();
        audio.currentTime = 0;
        this.currentAudio = null;
        console.log(`[AudioPlayer] Audio stopped`);
      }
    };

    fadeOut();
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.currentAudio) {
      console.log(`[AudioPlayer] Muting`);
      this.stopAudio(200);
    } else if (!muted) {
      console.log(`[AudioPlayer] Unmuting`);
    }
  }

  isSomethingPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}

export const audioPlayer = new AudioPlayer();
