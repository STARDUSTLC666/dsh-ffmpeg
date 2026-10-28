# dsh-ffmpeg

[中文](README.md)

![dsh-ffmpeg whale girl plugin cover](https://raw.githubusercontent.com/STARDUSTLC666/dsh-ffmpeg/master/assets/cover-whale-girl.png)

Use local FFmpeg from DSH to trim, join, encode and process existing media, including subtitles, audio, GIFs and frame extraction. For authoring new video projects, use the HyperFrames or Remotion plugin.

[![npm](https://img.shields.io/npm/v/dsh-ffmpeg)](https://www.npmjs.com/package/dsh-ffmpeg) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-ffmpeg-downloads.svg)](https://www.npmjs.com/package/dsh-ffmpeg)

Feedback and contributions are welcome: report [issues](https://github.com/STARDUSTLC666/dsh-ffmpeg/issues) or submit [pull requests](https://github.com/STARDUSTLC666/dsh-ffmpeg/pulls).

## What it does

- Inspect media and trim, join or transcode video.
- Fit clips with different sizes and frame rates to one canvas; silent clips receive silence without muting the other clips.
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

## Plugin updates

Requires DSH 0.2.1-rc.3 or newer. Update controls sit at the bottom of the existing workbench, or native plugin details for plugins without a workbench. Checks, release notes and preferences expand in place, with no separate update page or settings menu. Automatic checks are on by default; **automatic installation is off by default**. Only explicit opt-in permits compatible stable patches while idle with no unsaved changes. Preferences are independent, with per-plugin disable, deferral and ignore controls. No forced DSH restart or upgrade, and local-source installations stay unchanged. Suite components explain and operate on the whole Suite in the same footer.

Older releases need one manual update in native plugin management to acquire these controls. Publishing to npm does not replace an existing user installation.

## License

[MIT](LICENSE)
