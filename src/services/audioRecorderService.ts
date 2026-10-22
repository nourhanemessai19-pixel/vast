// Audio recording & playback service for clinical imitation & speech practice

export interface RecordingResult {
  audioBlob: Blob;
  audioUrl: string;
  durationMs: number;
}

export type AudioRecorderErrorCode = 
  | 'PERMISSION_DENIED'
  | 'NO_DEVICE_FOUND'
  | 'NOT_SUPPORTED'
  | 'RECORDER_ERROR'
  | 'UNKNOWN';

export class AudioRecorderError extends Error {
  code: AudioRecorderErrorCode;
  constructor(message: string, code: AudioRecorderErrorCode = 'UNKNOWN') {
    super(message);
    this.name = 'AudioRecorderError';
    this.code = code;
  }
}

class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime = 0;
  private stream: MediaStream | null = null;

  public isSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined'
    );
  }

  public async startRecording(): Promise<void> {
    this.audioChunks = [];
    if (!this.isSupported()) {
      throw new AudioRecorderError(
        'المتصفح أو البيئة الحالية لا تدعم تسجيل الصوت المباشر.',
        'NOT_SUPPORTED'
      );
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.startTime = Date.now();
      this.mediaRecorder.start(100);
    } catch (err: unknown) {
      const errorObj = err as { name?: string; message?: string };
      if (
        errorObj?.name === 'NotAllowedError' ||
        errorObj?.name === 'PermissionDeniedError' ||
        errorObj?.message?.includes('Permission denied') ||
        errorObj?.message?.includes('Permission dismissed')
      ) {
        throw new AudioRecorderError(
          'تم رفض إذن الوصول إلى الميكروفون. يرجى تفعيل إذن الميكروفون من إعدادات المتصفح أو شريط العنوان.',
          'PERMISSION_DENIED'
        );
      } else if (
        errorObj?.name === 'NotFoundError' ||
        errorObj?.name === 'DevicesNotFoundError'
      ) {
        throw new AudioRecorderError(
          'لم يتم العثور على ميكروفون متصل بجهازك.',
          'NO_DEVICE_FOUND'
        );
      } else {
        throw new AudioRecorderError(
          'تعذر بدء التسجيل الصوتي. يرجى التأكد من توصيل الميكروفون ومنح الإذن.',
          'RECORDER_ERROR'
        );
      }
    }
  }

  public stopRecording(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new AudioRecorderError('لا يوجد تسجيل نشط حالياً.', 'RECORDER_ERROR'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const durationMs = Date.now() - this.startTime;

        // Cleanup tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        resolve({ audioBlob, audioUrl, durationMs });
      };

      try {
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        } else {
          resolve({
            audioBlob: new Blob(this.audioChunks, { type: 'audio/webm' }),
            audioUrl: '',
            durationMs: 0,
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  public cancelRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.audioChunks = [];
  }
}

export const audioRecorderService = new AudioRecorderService();
