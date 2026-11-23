[简体中文](README.md) · **English**

# FFmpeg

> **Turn existing audio and video into the deliverable you need — no raw FFmpeg flags required.**

Local FFmpeg / FFprobe media plugin for DeepSeek Harness (`>=0.2.2-rc.3`) with Windows-safe filter path escaping and non-destructive output defaults.

[![npm](https://img.shields.io/npm/v/dsh-ffmpeg)](https://www.npmjs.com/package/dsh-ffmpeg) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-ffmpeg-downloads.svg)](https://www.npmjs.com/package/dsh-ffmpeg) [![total downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-ffmpeg-total-downloads.svg)](https://www.npmjs.com/package/dsh-ffmpeg)

**[Features](#features) · [Install](#install) · [Workflow](#start-using-it) · [Full guide](https://github.com/STARDUSTLC666/dsh-ffmpeg/blob/master/docs/REFERENCE.en.md)**

<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 640px)" srcset="https://raw.githubusercontent.com/STARDUSTLC666/dsh-ffmpeg/master/docs/assets/intro/workflow-en-mobile-dark.svg">
  <source media="(max-width: 640px)" srcset="https://raw.githubusercontent.com/STARDUSTLC666/dsh-ffmpeg/master/docs/assets/intro/workflow-en-mobile-light.svg">
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/STARDUSTLC666/dsh-ffmpeg/master/docs/assets/intro/workflow-en-dark.svg">
  <img src="https://raw.githubusercontent.com/STARDUSTLC666/dsh-ffmpeg/master/docs/assets/intro/workflow-en-light.svg" alt="Turn existing media into the output you need. · workflow illustration" width="100%">
</picture>

## Features

| Capability | Details |
| :--- | :--- |
| **Probe & Contact Sheets** | Inspect codecs, resolution, bitrate, and tracks; generate timestamped **contact sheets** to spot exact cut points visually |
| **Trim, Join & Transcode** | Accurate clipping, multi-segment concatenation, and preset H.264/compact encoding for sharing |
| **Subtitles, Frames & GIF** | Burn in `.srt`/`.ass` subtitles (Windows-safe filter escaping), extract stills, and export smooth GIFs |
| **Speed, Audio & Rotate** | Adjust playback speed, gain/volume, mute tracks, and rotate 90°/180°/270° — never overwriting source files by default |

## Install

Open **Plugins** in the DSH desktop app and install `dsh-ffmpeg`, or use the CLI:

```bash
dsh plugin --profile desktop add dsh-ffmpeg
```

For the web profile, replace `desktop` with `web` and restart DSH. Requires DSH `>=0.2.2-rc.3`.

## Start using it

1. **Check setup & place media**: Ensure local `ffmpeg` / `ffprobe` are installed (ask *"Check whether FFmpeg is ready"*) and place files inside your workspace.
2. **Preview cut points first**: For long recordings, ask for a timestamped contact sheet to pick start/end timestamps visually.
3. **Describe the output & verify**: Ask in plain language to trim, join, compress, burn subtitles, or export GIFs; original files stay untouched for safe playback verification.

### Ready-to-copy prompts

- **Find cut points**: `Generate a timestamped contact sheet for demo.mp4 first so I can pick which segment to keep.`
- **Trim & compress**: `Trim 01:15 to 03:40 from recording.mp4 and encode a compact 1080p MP4 for sharing, keeping the original file.`
- **Subtitles & GIF**: `Burn subtitles.srt into talk.mp4, and export the first 6 seconds as a smooth preview GIF.`

## Before you start

- Requires local `ffmpeg` and `ffprobe` with access to workspace input/output paths.
- Full configuration, tools, and troubleshooting: [full reference](https://github.com/STARDUSTLC666/dsh-ffmpeg/blob/master/docs/REFERENCE.en.md).

## Plugin updates

Check updates at the bottom of native plugin details. Automatic checks are on by default; **automatic installation is off**. Suite-managed components update with their bundle.

## Documentation & feedback

- [Full usage, configuration and limits](https://github.com/STARDUSTLC666/dsh-ffmpeg/blob/master/docs/REFERENCE.en.md) · [Release notes](https://github.com/STARDUSTLC666/dsh-ffmpeg/blob/master/CHANGELOG.md) · [Validation history](https://github.com/STARDUSTLC666/dsh-ffmpeg/blob/master/docs/VALIDATION.md)
- Stars, [Issues](https://github.com/STARDUSTLC666/dsh-ffmpeg/issues), and [PRs](https://github.com/STARDUSTLC666/dsh-ffmpeg/pulls) are welcome (strip credentials first).

## License

[MIT](https://github.com/STARDUSTLC666/dsh-ffmpeg/blob/master/LICENSE)

<a id="what-it-does"></a>
<a id="requirements-and-configuration"></a>
