import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

export const SOUND_ASSETS = {
  click: require('@/assets/sounds/click.wav'),
  next: require('@/assets/sounds/next.wav'),
  correct: require('@/assets/sounds/correct.wav'),
  wrong: require('@/assets/sounds/wrong.wav'),
  celebrate: require('@/assets/sounds/celebrate.wav'),
};

export type SoundType = keyof typeof SOUND_ASSETS;

class SoundManagerClass {
  private sounds: Partial<Record<SoundType, AudioPlayer>> = {};
  private isInitialized = false;

  async initAudioMode() {
    if (this.isInitialized) return;
    try {
      // expo-audio ka simplified audio mode setup
      await setAudioModeAsync({
        playsInSilentMode: true,
      });
      this.isInitialized = true;
    } catch (e) {
      console.warn('Audio mode setup failed:', e);
    }
  }

  async play(soundName: SoundType) {
    try {
      await this.initAudioMode();

      // Agar sound memory me nahi hai, toh createAudioPlayer se initialize karein
      if (!this.sounds[soundName]) {
        this.sounds[soundName] = createAudioPlayer(SOUND_ASSETS[soundName]);
      }

      const player = this.sounds[soundName];

      if (player) {
        // Repeated play ke liye sound ko zero timestamp par reset karke chalaayein
        await player.seekTo(0);
        player.play();
      }
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  }

  /**
   * Sound ko Pause karke starting position par reset karne ke liye
   */
  async stop(soundName: SoundType) {
    try {
      const player = this.sounds[soundName];
      if (player) {
        player.pause();
        await player.seekTo(0);
      }
    } catch (error) {
      console.error(`Error stopping sound ${soundName}:`, error);
    }
  }

  /**
   * Native memory free karne ke liye (App close ya cleanup ke time)
   */
  async unloadAll() {
    try {
      const keys = Object.keys(this.sounds) as SoundType[];
      for (const key of keys) {
        const player = this.sounds[key];
        if (player) {
          player.release(); // expo-audio me unloadAsync ki jagah release() use hota hai
        }
      }
      this.sounds = {}; // Cache clear
    } catch (error) {
      console.error('Error unloading all sounds:', error);
    }
  }
}

// Global Singleton Instance
export const SoundManager = new SoundManagerClass();