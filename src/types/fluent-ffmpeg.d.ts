declare module 'fluent-ffmpeg' {
  export interface FfmpegCommand {
    input(source: string): FfmpegCommand;
    inputFPS(fps: number): FfmpegCommand;
    outputOptions(options: string[]): FfmpegCommand;
    on(event: 'end', cb: () => void): FfmpegCommand;
    on(event: 'error', cb: (err: unknown) => void): FfmpegCommand;
    save(output: string): FfmpegCommand;
  }

  export interface FfmpegFactory {
    (): FfmpegCommand;
    setFfmpegPath(path: string): void;
  }

  const ffmpeg: FfmpegFactory;
  export default ffmpeg;
}
