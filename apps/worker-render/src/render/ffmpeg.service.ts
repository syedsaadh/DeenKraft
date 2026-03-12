import ffmpeg, { type FfmpegCommand } from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { existsSync } from 'fs';

interface ConcatClipInput {
  filePath: string;
  duration?: number;
}

interface OverlayInput {
  filePath: string;
  start: number;
  duration: number;
}

interface RenderPreset {
  width: number;
  height: number;
  fps: number;
}

export class FfmpegService {
  constructor() {
    const ffmpegPath = this.resolveFfmpegPath();
    ffmpeg.setFfmpegPath(ffmpegPath);
  }

  private resolveFfmpegPath(): string {
    const envPath = process.env.FFMPEG_PATH?.trim();

    if (envPath) {
      if (this.isCommandName(envPath) || existsSync(envPath)) {
        return envPath;
      }

      throw new Error(`FFMPEG_PATH is set but not found: ${envPath}`);
    }

    if (ffmpegStatic && existsSync(ffmpegStatic)) {
      return ffmpegStatic;
    }

    return 'ffmpeg';
  }

  private isCommandName(pathOrCommand: string): boolean {
    return !pathOrCommand.includes('/') && !pathOrCommand.includes('\\');
  }

  async concatenateClips(
    clips: ConcatClipInput[],
    outputPath: string,
    preset: RenderPreset,
  ): Promise<void> {
    if (clips.length === 0) {
      throw new Error('At least one clip is required');
    }

    const command = ffmpeg();

    for (const clip of clips) {
      command.input(clip.filePath);
    }

    const filters: string[] = [];

    clips.forEach((clip, index) => {
      const durationFilter =
        typeof clip.duration === 'number' && clip.duration > 0
          ? `trim=duration=${clip.duration},`
          : '';

      filters.push(
        `[${index}:v]${durationFilter}setpts=PTS-STARTPTS,scale=${preset.width}:${preset.height}:force_original_aspect_ratio=increase,crop=${preset.width}:${preset.height},fps=${preset.fps},format=yuv420p,setsar=1[v${index}]`,
      );
    });

    const concatInputs = clips.map((_, index) => `[v${index}]`).join('');
    filters.push(`${concatInputs}concat=n=${clips.length}:v=1:a=0[vout]`);

    await this.runCommand(
      command
        .complexFilter(filters)
        .outputOptions(['-map', '[vout]', '-an', '-movflags', '+faststart'])
        .videoCodec('libx264')
        .fps(preset.fps)
        .output(outputPath),
    );
  }

  async applyOverlays(
    baseVideoPath: string,
    overlays: OverlayInput[],
    outputPath: string,
    preset: RenderPreset,
  ): Promise<void> {
    if (overlays.length === 0) {
      await this.transcodeVideo(baseVideoPath, outputPath, preset);
      return;
    }

    const command = ffmpeg().input(baseVideoPath);
    const filters: string[] = [];

    overlays.forEach((overlay) => {
      command.input(overlay.filePath).inputOptions(['-loop', '1']);
    });

    let previousOutput = '[0:v]';

    overlays.forEach((overlay, index) => {
      const overlayInputLabel = `[${index + 1}:v]`;
      const preparedOverlayLabel = `[ov${index}]`;
      const nextOutputLabel = `[v${index + 1}]`;

      filters.push(
        `${overlayInputLabel}scale=${preset.width}:${preset.height}:force_original_aspect_ratio=decrease,setsar=1${preparedOverlayLabel}`,
      );

      const endTime = overlay.start + overlay.duration;
      filters.push(
        `${previousOutput}${preparedOverlayLabel}overlay=(W-w)/2:(H-h)/2:enable='between(t,${overlay.start},${endTime})'${nextOutputLabel}`,
      );
      previousOutput = nextOutputLabel;
    });

    await this.runCommand(
      command
        .complexFilter(filters)
        .outputOptions(['-map', previousOutput, '-an', '-movflags', '+faststart'])
        .videoCodec('libx264')
        .fps(preset.fps)
        .output(outputPath),
    );
  }

  async addBackgroundAudio(
    videoPath: string,
    audioPath: string,
    outputPath: string,
    videoDuration: number,
    audioStart: number,
    preset: RenderPreset,
  ): Promise<void> {
    const command = ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .inputOptions(['-stream_loop', '-1']);

    const audioDelayMs = Math.max(0, Math.floor(audioStart * 1000));

    const filters = [
      `[1:a]atrim=duration=${videoDuration},adelay=${audioDelayMs}|${audioDelayMs}[bg]`,
      `anullsrc=r=48000:cl=stereo,atrim=duration=${videoDuration}[silence]`,
      `[silence][bg]amix=inputs=2:duration=first:dropout_transition=0[aout]`,
    ];

    await this.runCommand(
      command
        .complexFilter(filters)
        .outputOptions([
          '-map',
          '0:v:0',
          '-map',
          '[aout]',
          '-shortest',
          '-movflags',
          '+faststart',
        ])
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioFrequency(48000)
        .fps(preset.fps)
        .output(outputPath),
    );
  }

  async addSilentAudioTrack(
    videoPath: string,
    outputPath: string,
    videoDuration: number,
    preset: RenderPreset,
  ): Promise<void> {
    const command = ffmpeg().input(videoPath);

    await this.runCommand(
      command
        .complexFilter([
          `anullsrc=r=48000:cl=stereo,atrim=duration=${videoDuration}[aout]`,
        ])
        .outputOptions(['-map', '0:v:0', '-map', '[aout]', '-shortest'])
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioFrequency(48000)
        .fps(preset.fps)
        .output(outputPath),
    );
  }

  private async transcodeVideo(
    inputPath: string,
    outputPath: string,
    preset: RenderPreset,
  ): Promise<void> {
    await this.runCommand(
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .fps(preset.fps)
        .size(`${preset.width}x${preset.height}`)
        .outputOptions(['-an', '-movflags', '+faststart'])
        .output(outputPath),
    );
  }

  private async runCommand(command: FfmpegCommand): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      command
        .on('end', () => resolve())
        .on('error', (error: NodeJS.ErrnoException) => {
          if (error.code === 'ENOENT') {
            reject(
              new Error(
                'FFmpeg executable not found. Set FFMPEG_PATH or install ffmpeg in PATH.',
              ),
            );
            return;
          }

          reject(error);
        })
        .run();
    });
  }
}
