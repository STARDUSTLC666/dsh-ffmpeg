# dsh-ffmpeg

[中文](README.md)

![dsh-ffmpeg whale girl plugin cover](https://raw.githubusercontent.com/STARDUSTLC666/dsh-ffmpeg/master/assets/cover-whale-girl.png)

Use FFmpeg to process existing audio and video files through natural-language requests.

[![npm](https://img.shields.io/npm/v/dsh-ffmpeg)](https://www.npmjs.com/package/dsh-ffmpeg) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-ffmpeg-downloads.svg)](https://www.npmjs.com/package/dsh-ffmpeg)

## What it does

- Inspect media and trim, join or transcode video.
- Add subtitles, create GIFs and extract frames.
- Execute commands through the host subprocess service.

## Install

In DSH Desktop, install `dsh-ffmpeg` from the Plugins panel. If the bundled dsh command is available:

```bash
dsh plugin --profile desktop add dsh-ffmpeg
```

For the web version, replace `desktop` with `web`. Restart DSH after installation.

## Start using it

Provide an input file and ask: “Trim this video to 30 seconds and export a shareable MP4.”

## Requirements and configuration

Requires FFmpeg and ffprobe. Executable paths can be configured.

Detailed configuration, tool arguments and troubleshooting are in the [usage guide](docs/USAGE.en.md). For standalone development, follow the Node requirement in [package.json](package.json).

## Documentation

- [Usage and troubleshooting](docs/USAGE.en.md)
- [Changelog](CHANGELOG.md)
- [Validation scope and history](docs/VALIDATION.md)
- [Report a problem or suggest a feature](https://github.com/STARDUSTLC666/dsh-ffmpeg/issues)

## License

[MIT](LICENSE)
