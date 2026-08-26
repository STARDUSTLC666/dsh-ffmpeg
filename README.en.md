[中文](README.md)

# dsh-ffmpeg

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

DSH (DeepSeek Harness) video-processing plugin: seven tools covering probing, cutting, concatenation, transcoding, subtitles, extraction and GIF creation — all powered by ffmpeg/ffprobe.

## Compatibility

Verified against `@deepseek-ai/dsh@0.1.1-rc.2` on 2026-08-26. Built for the cordis patch-bundle plugin model (`cordis.patch.yml` + `dsh.bundle.patch`). No runtime imports of `@deepseek-ai/*` internals.

## Installation

```bash
dsh plugin --profile web add dsh-ffmpeg
```

ffmpeg must be installed locally (`ffmpeg -version` should work); use `ffmpegPath` / `ffprobePath`, or the `DSH_FFMPEG_PATH` / `DSH_FFPROBE_PATH` environment variables, when it is not on PATH.

## Uninstall

```bash
dsh plugin --profile web remove dsh-ffmpeg
```

Then restart the web service. To clean up fully, also remove the plugin entry from your profile `cordis.patch.yml` if you overrode it.


## Configuration

Override the plugin row in your profile's `cordis.patch.yml` (defaults apply when absent):

```yaml
- id: ffmpeg
  name: 'dsh-ffmpeg'
  config:
    # ffmpegPath: C:\tools\ffmpeg\bin\ffmpeg.exe   # explicit path (or DSH_FFMPEG_PATH)
    # ffprobePath: C:\tools\ffmpeg\bin\ffprobe.exe # or DSH_FFPROBE_PATH
    timeoutMs: 300000                                # per-operation timeout (default 5 min, 10s - 2h)
    # overwrite: true                                 # allow overwriting outputs (default auto-suffix _1/_2)
```

## Tools

| Tool | Purpose | Key parameters |
| :-- | :-- | :-- |
| `ffmpeg_probe` | Probe media info (format/duration/resolution/fps/bitrate/audio/subtitle streams; multi-video files return a full videos list) | `input` required |
| `ffmpeg_cut` | Cut a clip (stream copy by default, accurate re-encode optional) | `input` required; `start`/`end`/`duration` |
| `ffmpeg_concat` | Concatenate 2-20 clips (stream copy for identical codecs / re-encode for mixed) | `inputs` array required |
| `ffmpeg_encode` | Transcode with presets (bilibili 1080p/4K, vertical 1080p, web-720p) plus crf/fps/scale overrides | `input` required; `preset` optional |
| `ffmpeg_subtitle` | Burn subtitles (SRT/ASS hard subs) | `input` + `subtitle` required |
| `ffmpeg_extract` | Extract audio (m4a) / frame sequences / single frame / subtitle stream | `input` + `what` required |
| `ffmpeg_gif` | Video to high-quality GIF (two-pass palette) | `input` required; `fps`/`width`/`duration` optional |

### Examples

```text
ffmpeg_probe { input: E:\videos\raw.mp4 }
ffmpeg_cut { input: E:\videos\raw.mp4, start: 10, end: 30 }
ffmpeg_encode { input: E:\videos\raw.mp4, preset: bilibili-1080p }
ffmpeg_subtitle { input: E:\videos\raw.mp4, subtitle: E:\videos\subs.srt }
ffmpeg_gif { input: E:\videos\raw.mp4, duration: 3, width: 480 }
```

## Safety

- **No shell**: every argument is passed as its own argv element — user input cannot inject commands
- **Runs on the official DSH subprocess service**: the timeout AbortSignal now really drives tree-scoped termination (SIGTERM → kill; taskkill /T on Windows), zero runtime dependencies
- **No accidental overwrites**: existing outputs get auto-suffixed; output == input is rejected
- **Timeout clamps**: per-operation 10s - 2h; probes additionally capped at 60s
- **Input validation**: time formats, preset enums, crf/fps/scale ranges are validated up front; directory inputs are rejected and extension-less frame-sequence outputs are auto-fixed

## Development

```bash
pnpm install
pnpm test       # build + 57 tests, including a real-ffmpeg end-to-end suite (auto-skipped without ffmpeg)
```

## License

MIT