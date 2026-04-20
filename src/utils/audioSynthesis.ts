import * as Tone from 'tone';

// Audio context manager for ambient music synthesis
class AudioSynthesizer {
  private synth: Tone.Synth | null = null;
  private bassOsc: Tone.Oscillator | null = null;
  private isDomainInitialized = false;

  async initContext() {
    if (this.isDomainInitialized) return;
    try {
      if ((Tone.Transport.state as any) !== 'running') {
        await Tone.start();
      }
      this.isDomainInitialized = true;
    } catch (error) {
      console.warn('Could not initialize audio context:', error);
    }
  }

  // Ambient meeting music - ethereal and intimate
  async playDominantMeeting(archetype: string) {
    await this.initContext();

    // Create reverb for spaciousness
    const reverb = new Tone.Reverb({
      decay: 3.5,
      wet: 0.7,
    }).toDestination();

    // Create delay for ethereal effect
    const delay = new Tone.Delay(0.5);
    delay.connect(reverb);

    // Create low-pass filter for smooth sound
    const filter = new Tone.Filter({
      frequency: 1500,
      type: 'lowpass',
      rolloff: -24,
    }).connect(delay);

    // Archetype-specific base notes
    const notesByArchetype: Record<string, string[]> = {
      Career: ['C3', 'E3', 'G3', 'B3'],
      Relationship: ['G2', 'D3', 'B3', 'D4'],
      Rest: ['A2', 'E3', 'A3', 'C#4'],
      Joy: ['D3', 'F#3', 'A3', 'D4'],
    };

    const notes = notesByArchetype[archetype] || notesByArchetype['Joy'];

    // Create ambient pad synth
    const padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.8,
        release: 3,
      },
    }).connect(filter);

    // Play ambient pattern - slow evolving chords
    const pattern = new Tone.Loop(() => {
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      padSynth.triggerAttackRelease(randomNote, '4n');
    }, '2n');

    // Also add a bass drone
    const bassNote = notes[0];
    const bassSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 1,
        decay: 0.5,
        sustain: 0.7,
        release: 2,
      },
    }).connect(filter);

    Tone.Transport.start();
    pattern.start(0);
    bassSynth.triggerAttack(bassNote);

    return { padSynth, bassSynth, pattern, cleanup: () => {
      pattern.stop();
      bassSynth.triggerRelease('+0.5');
      padSynth.triggerRelease([]);
    }};
  }

  // Goodbye music - melancholic and bittersweet
  async playGoodbye(archetype: string) {
    await this.initContext();

    // Create reverb for melancholic space
    const reverb = new Tone.Reverb({
      decay: 2.5,
      wet: 0.6,
    }).toDestination();

    // Minor chords for sadness
    const minorNotesByArchetype: Record<string, string[]> = {
      Career: ['G2', 'Bb2', 'D3', 'G3'],
      Relationship: ['D2', 'F2', 'A2', 'D3'],
      Rest: ['E2', 'G2', 'B2', 'E3'],
      Joy: ['A1', 'C2', 'E2', 'A2'],
    };

    const minorNotes = minorNotesByArchetype[archetype] || minorNotesByArchetype['Career'];

    // Filter for softer sound
    const filter = new Tone.Filter({
      frequency: 800,
      type: 'lowpass',
      rolloff: -24,
    }).connect(reverb);

    // Melancholic synth
    const sadSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 3,
        decay: 1,
        sustain: 0.5,
        release: 2,
      },
    }).connect(filter);

    // Play haunting pattern
    const pattern = new Tone.Loop(() => {
      const note = minorNotes[Math.floor(Math.random() * minorNotes.length)];
      sadSynth.triggerAttackRelease(note, '8n');
    }, '4n');

    Tone.Transport.start();
    pattern.start(0);

    return { sadSynth, pattern, cleanup: () => {
      pattern.stop();
      sadSynth.triggerRelease([]);
    }};
  }

  // Summary music - reflective and peaceful
  async playFinalSummary() {
    await this.initContext();

    // Create ambient space
    const reverb = new Tone.Reverb({
      decay: 4,
      wet: 0.8,
    }).toDestination();

    const filter = new Tone.Filter({
      frequency: 2000,
      type: 'lowpass',
    }).connect(reverb);

    // Reflective (major) notes
    const reflectiveNotes = ['C3', 'E3', 'G3', 'B3', 'D4', 'F#4'];

    // Peaceful synth
    const peaceSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 2.5,
        decay: 1,
        sustain: 0.7,
        release: 3,
      },
    }).connect(filter);

    // Slow evolving pattern
    const pattern = new Tone.Loop(() => {
      const note = reflectiveNotes[Math.floor(Math.random() * reflectiveNotes.length)];
      peaceSynth.triggerAttackRelease(note, '2n');
    }, '1m');

    Tone.Transport.start();
    pattern.start(0);

    return { peaceSynth, pattern, cleanup: () => {
      pattern.stop();
      peaceSynth.triggerRelease([]);
    }};
  }

  // Stop all audio
  stopAll() {
    try {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    } catch (error) {
      console.warn('Error stopping audio:', error);
    }
  }
}

export const audioSynthesizer = new AudioSynthesizer();
