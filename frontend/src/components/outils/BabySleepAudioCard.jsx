import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { sectionReadingCardClasses, sectionInteractiveCardClasses, sectionAccentTextClass } from '../../utils/accentTokens';

const NOISE_TYPES = [
  { id: 'white', labelKey: 'outils.sleep.whiteNoise' },
  { id: 'pink', labelKey: 'outils.sleep.pinkNoise' },
  { id: 'brown', labelKey: 'outils.sleep.brownNoise' },
];

const STORAGE_KEY = 'mamandouce_baby_sleep_recording';

function createNoiseNode(ctx, type) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;

  for (let i = 0; i < bufferSize; i += 1) {
    const white = Math.random() * 2 - 1;
    if (type === 'white') {
      data[i] = white * 0.35;
    } else if (type === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    } else {
      b0 = (b0 + 0.02 * white) / 1.02;
      data[i] = b0 * 3.5;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

export function BabySleepAudioCard({ embedded = false }) {
  const { t } = useTranslation();
  const audioCtxRef = useRef(null);
  const noiseSourceRef = useRef(null);
  const gainRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const voiceAudioRef = useRef(null);

  const [noiseType, setNoiseType] = useState('white');
  const [noisePlaying, setNoisePlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [voicePlaying, setVoicePlaying] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setVoiceUrl(saved);
    return () => {
      stopNoise();
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
      }
    };
  }, []);

  const stopNoise = useCallback(() => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
      } catch {
        /* already stopped */
      }
      noiseSourceRef.current.disconnect();
      noiseSourceRef.current = null;
    }
    setNoisePlaying(false);
  }, []);

  const startNoise = useCallback(
    (type) => {
      stopNoise();
      const ctx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = ctx;
      let gain = gainRef.current;
      if (!gain || gain.context !== ctx) {
        gain = ctx.createGain();
        gainRef.current = gain;
        gain.connect(ctx.destination);
      }
      gain.gain.value = 0.45;

      const source = createNoiseNode(ctx, type);
      source.connect(gain);
      source.start();
      noiseSourceRef.current = source;
      setNoiseType(type);
      setNoisePlaying(true);
    },
    [stopNoise],
  );

  const toggleNoise = (type) => {
    if (noisePlaying && noiseType === type) {
      stopNoise();
    } else {
      startNoise(type);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result;
          setVoiceUrl(dataUrl);
          localStorage.setItem(STORAGE_KEY, dataUrl);
          toast.success(t('outils.sleep.recordingSaved', 'Murmure enregistré !'));
        };
        reader.readAsDataURL(blob);
      };
      recorder.start();
      setRecording(true);
    } catch {
      toast.error(t('outils.sleep.micError', 'Micro inaccessible. Vérifiez les permissions.'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const toggleVoice = () => {
    if (!voiceUrl) return;
    if (voicePlaying && voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      setVoicePlaying(false);
      return;
    }
    const audio = new Audio(voiceUrl);
    audio.loop = true;
    voiceAudioRef.current = audio;
    audio.play();
    setVoicePlaying(true);
    audio.onended = () => setVoicePlaying(false);
  };

  const clearVoice = () => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current = null;
    }
    setVoicePlaying(false);
    setVoiceUrl(null);
    localStorage.removeItem(STORAGE_KEY);
    toast.success(t('outils.sleep.recordingDeleted', 'Enregistrement supprimé'));
  };

  const wrapperClass = embedded ? '' : 'min-h-screen gradient-bg p-6';

  return (
    <div className={wrapperClass} data-testid="baby-sleep-audio-card">
      <Card className={`${sectionReadingCardClasses('outils', { rounded: 'rounded-3xl', extra: 'p-6 shadow-sm space-y-5' })}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
            <Moon className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${sectionAccentTextClass('outils')}`}>
              {t('outils.sleep.title', 'Bonne nuit bébé')}
            </h2>
            <p className="text-sm text-slate-500">
              {t('outils.sleep.subtitle', 'Bruits blancs et murmure maternel en boucle')}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-600 mb-2">
            {t('outils.sleep.noiseSection', 'Bruits apaisants')}
          </p>
          <div className="flex flex-wrap gap-2">
            {NOISE_TYPES.map((item) => (
              <Button
                key={item.id}
                onClick={() => toggleNoise(item.id)}
                data-testid={`noise-${item.id}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  noisePlaying && noiseType === item.id
                    ? sectionInteractiveCardClasses('outils', { rounded: 'rounded-full', extra: 'px-4 py-2 text-sm font-semibold shadow-md' })
                    : sectionReadingCardClasses('outils', { rounded: 'rounded-full', extra: 'px-4 py-2 text-sm font-semibold bg-white' })
                }`}
              >
                {noisePlaying && noiseType === item.id ? (
                  <Pause className="w-4 h-4 mr-1 inline" />
                ) : (
                  <Play className="w-4 h-4 mr-1 inline" />
                )}
                {t(item.labelKey)}
              </Button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-600 mb-2">
            {t('outils.sleep.voiceSection', 'Votre murmure / voix')}
          </p>
          <div className="flex flex-wrap gap-2">
            {!recording ? (
              <Button
                onClick={startRecording}
                data-testid="start-voice-record"
                className="rounded-full bg-pink-500 text-white px-4"
              >
                <Mic className="w-4 h-4 mr-2" />
                {t('outils.sleep.record', 'Enregistrer')}
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                data-testid="stop-voice-record"
                className="rounded-full bg-red-500 text-white px-4"
              >
                <Square className="w-4 h-4 mr-2" />
                {t('outils.sleep.stopRecord', 'Terminer')}
              </Button>
            )}
            {voiceUrl && (
              <>
                <Button
                  onClick={toggleVoice}
                  data-testid="play-voice-loop"
                  className="rounded-full bg-violet-500 text-white px-4"
                >
                  {voicePlaying ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {t('outils.sleep.loopVoice', 'Boucle voix')}
                </Button>
                <Button
                  onClick={clearVoice}
                  variant="ghost"
                  data-testid="clear-voice"
                  className="rounded-full text-slate-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {t('outils.sleep.hint', 'Enregistrez un murmure doux — il sera rejoué en boucle pour apaiser bébé.')}
          </p>
        </div>
      </Card>
    </div>
  );
}

export default BabySleepAudioCard;
