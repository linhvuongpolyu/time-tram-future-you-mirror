// Simple audio player
class AudioPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private isMuted = false;

  async playAudio(audioPath: string, options: { loop?: boolean; volume?: number } = {}) {
    if (this.isMuted) {
      console.log('[AudioPlayer] Skipping - muted');
      return;
    }

    // Stop current audio if playing
    this.stopAudio(0);

    try {
      const audio = new Audio(audioPath);
      const targetVolume = options.volume ?? 0.5;
      audio.loop = options.loop ?? false;
      audio.volume = targetVolume;
      
      console.log(`[AudioPlayer] Playing: ${audioPath}`);
      console.log(`  Loop: ${audio.loop}, Volume: ${targetVolume}`);
      
      // Event listeners for debugging
      audio.addEventListener('play', () => {
        console.log(`[AudioPlayer] ✓ Playing: ${audioPath}`);
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`[AudioPlayer] ✗ Error: ${audioPath}`, audio.error?.message);
      });

      audio.addEventListener('ended', () => {
        console.log(`[AudioPlayer] Ended: ${audioPath}`);
      });

      // Play audio
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`[AudioPlayer] ✓ Play succeeded`);
          })
          .catch((err: any) => {
            console.error(`[AudioPlayer] ✗ Play failed:`, err.name, err.message);
          });
      }

      this.currentAudio = audio;
    } catch (error) {
      console.error(`[AudioPlayer] ✗ Exception:`, error);
    }
  }

  stopAudio(fadeOutDuration = 1000) {
    if (!this.currentAudio) return;

    const audio = this.currentAudio;
    
    if (fadeOutDuration === 0) {
      audio.pause();
      audio.currentTime = 0;
      this.currentAudio = null;
      console.log(`[AudioPlayer] Stopped`);
      return;
    }

    const startVolume = audio.volume;
    const startTime = Date.now();

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
        console.log(`[AudioPlayer] Stopped`);
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
