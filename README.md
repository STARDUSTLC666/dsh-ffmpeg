**简体中文** · [English](README.en.md)

# FFmpeg

**把已有音视频处理成需要的成品。**

[![npm](https://img.shields.io/npm/v/dsh-ffmpeg)](https://www.npmjs.com/package/dsh-ffmpeg) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-ffmpeg-downloads.svg)](https://www.npmjs.com/package/dsh-ffmpeg) [![total downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-ffmpeg-total-downloads.svg)](https://www.npmjs.com/package/dsh-ffmpeg)

**[安装使用](#安装) · [使用流程](#开始使用) · [完整说明](https://github.com/STARDUSTLC666/dsh-ffmpeg/blob/master/docs/REFERENCE.zh.md)**

<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 640px)" srcset="https://raw.githubusercontent.com/STARDUSTLC666/dsh-ffmpeg/master/docs/assets/intro/workflow-zh-mobile-dark.svg">
  <source media="(max-width: 640px)" srcset="https://raw.githubusercontent.com/STARDUSTLC666/dsh-ffmpeg/master/docs/assets/intro/workflow-zh-mobile-light.svg">
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/STARDUSTLC666/dsh-ffmpeg/master/docs/assets/intro/workflow-zh-dark.svg">
  <img src="https://raw.githubusercontent.com/STARDUSTLC666/dsh-ffmpeg/master/docs/assets/intro/workflow-zh-light.svg" alt="把已有音视频处理成需要的成品。 · 流程示意" width="100%">
</picture>

## 功能

- 查看媒体参数，按采样时间浏览视频总览图。
- 裁切、拼接、转码、加字幕或提取画面。
- 保留源文件，实际播放输出后再交付。

## 安装

在 DSH 桌面版「插件」面板安装 `dsh-ffmpeg`。已配置命令行时也可使用：

```bash
dsh plugin --profile desktop add dsh-ffmpeg
```

网页版把 `desktop` 改为 `web`；安装后重启对应的 DSH。宿主要求以包声明 `>=0.2.1-rc.3` 为准。

## 开始使用

1. 安装 FFmpeg/ffprobe，并在 DSH 中运行 ffmpeg_health 检查可执行文件。
2. 把输入文件放在当前工作区或提供准确的本地路径，说明想要的片段和输出规格。
3. 想先看内容时，让助手用 ffmpeg_storyboard 生成总览图，按每格采样时间定位片段。
4. 选择裁切、拼接、转码或抽帧等操作；默认保留源文件，重名成品另取文件名。
5. 按返回路径打开成品，用 ffmpeg_probe 检查参数，并实际播放核对画面和声音。

可以这样说：

> 先为这个视频生成带采样时间的总览图，保留原文件，再让我选择要剪的片段。

## 开始前要知道

需要本机 FFmpeg / ffprobe；输入与输出应位于允许访问的位置。

配置、完整工具与排错见[详细使用说明](https://github.com/STARDUSTLC666/dsh-ffmpeg/blob/master/docs/REFERENCE.zh.md)。

## 插件更新

在工作台或原生插件详情页底部检查更新。默认自动检查，**默认不自动安装**；是否安装、何时重启由你决定。Suite 管理的组件随整包更新。[查看更新规则](https://github.com/STARDUSTLC666/dsh-ffmpeg/blob/master/docs/REFERENCE.zh.md)。

## 文档

- [详细使用、配置与边界](https://github.com/STARDUSTLC666/dsh-ffmpeg/blob/master/docs/REFERENCE.zh.md)
- [更新记录](https://github.com/STARDUSTLC666/dsh-ffmpeg/blob/master/CHANGELOG.md)
- [验证范围与历史](https://github.com/STARDUSTLC666/dsh-ffmpeg/blob/master/docs/VALIDATION.md)

## 反馈与贡献

如果插件帮到了你，欢迎 Star，让更多人发现它。问题和建议请提交 [Issues](https://github.com/STARDUSTLC666/dsh-ffmpeg/issues)，也欢迎代码与文档 [PR](https://github.com/STARDUSTLC666/dsh-ffmpeg/pulls)。反馈时附上版本与复现步骤，并移除凭据。

## License

[MIT](https://github.com/STARDUSTLC666/dsh-ffmpeg/blob/master/LICENSE)

<a id="依赖与配置"></a>
