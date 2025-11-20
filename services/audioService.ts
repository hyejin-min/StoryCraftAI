// Utilities for decoding raw PCM data from Gemini TTS

/**
 * Decodes a base64 string into a Uint8Array.
 */
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM data into an AudioBuffer.
 * Gemini TTS returns raw PCM (16-bit, little-endian) at 24kHz mono (usually).
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert 16-bit integer to float range [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private isPlaying: boolean = false;
  private onEndedCallback: (() => void) | null = null;

  constructor() {
    // Initialize AudioContext lazily to avoid autoplay policy issues,
    // but usually needs to be created in response to a user action or resumed.
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return this.audioContext;
  }

  async playPCM(base64Audio: string, onEnded?: () => void) {
    this.stop(); // Stop any current playback
    this.onEndedCallback = onEnded || null;

    try {
      const ctx = this.getContext();
      
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const bytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(bytes, ctx, 24000, 1);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        this.isPlaying = false;
        if (this.onEndedCallback) this.onEndedCallback();
      };

      this.source = source;
      source.start(0);
      this.isPlaying = true;
    } catch (error) {
      console.error("Error playing audio:", error);
      this.isPlaying = false;
      if (this.onEndedCallback) this.onEndedCallback();
    }
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      this.source = null;
    }
    this.isPlaying = false;
  }
}

export const audioPlayer = new AudioPlayer();