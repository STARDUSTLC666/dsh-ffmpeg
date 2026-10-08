# dsh-ffmpeg

[English](README.en.md)

![dsh-ffmpeg 鲸鱼娘插件封面](https://raw.githubusercontent.com/STARDUSTLC666/dsh-ffmpeg/master/assets/cover-whale-girl.png)

用自然语言调用 FFmpeg，处理已有音视频文件。

[![npm](https://img.shields.io/npm/v/dsh-ffmpeg)](https://www.npmjs.com/package/dsh-ffmpeg) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-ffmpeg-downloads.svg)](https://www.npmjs.com/package/dsh-ffmpeg)

欢迎使用，遇到问题或有改进建议，请提交 [issues](https://github.com/STARDUSTLC666/dsh-ffmpeg/issues) 和 [PR](https://github.com/STARDUSTLC666/dsh-ffmpeg/pulls)。

## 功能

- 探测媒体信息，裁剪、拼接和压制视频。
- 添加字幕、生成 GIF、抽取画面。
- 通过宿主 subprocess 执行命令。

## 安装

桌面版可在「插件」面板按包名 `dsh-ffmpeg` 安装。已配置 dsh 命令时也可使用：

```bash
dsh plugin --profile desktop add dsh-ffmpeg
```

网页版把命令中的 `desktop` 改为 `web`。安装后重启 DSH。

## 开始使用

准备输入文件后可说：“把这段视频裁成 30 秒，并导出适合分享的 MP4。”

## 依赖与配置

需要 FFmpeg / ffprobe；可在配置中指定可执行文件路径。

详细配置、工具参数与排错见[使用说明](docs/USAGE.md)。从源码独立开发时，Node 要求以 [package.json](package.json) 为准。

## 文档

- [使用与排错](docs/USAGE.md)
- [更新记录](CHANGELOG.md)
- [验证范围与历史记录](docs/VALIDATION.md)
- [问题反馈与功能建议](https://github.com/STARDUSTLC666/dsh-ffmpeg/issues)

## License

[MIT](LICENSE)
