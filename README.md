**简体中文** · [English](README.en.md)

# FFmpeg

**把已有音视频处理成需要的成品。**

DeepSeek Harness（`>=0.2.2-rc.3`）本机音视频处理插件：封装 FFmpeg / FFprobe 进行媒体探测、剪辑拼接、预设转码、字幕烧录、分镜总览图与 GIF 导出，兼容 Windows 滤镜路径转义。

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

网页版把 `desktop` 改为 `web`；安装后重启对应的 DSH。宿主要求以包声明 `>=0.2.2-rc.3` 为准。

## 开始使用

无需手写复杂的 FFmpeg 命令行参数，按直觉三步即可完成剪辑与转码：

1. **准备环境与素材**：确认本机已安装 `ffmpeg` / `ffprobe`（不确定时可直接问助手「检查一下 FFmpeg 环境能用吗」），将音视频或字幕文件放进当前工作区。
2. **先看画面再动刀（长视频推荐）**：如果不记得具体时间点，先让助手生成**带时间戳的分镜总览图**，看着画面挑出起止秒数，避免盲剪。
3. **一句话交办处理 & 播放验收**：直接说明目标用途（剪片段、多段拼接、压小体积发群、烧录双语字幕或导出动图 GIF）；插件默认**绝不覆盖原视频**，生成后直接点击返回路径播放核对画面与声音。

常用场景怎么对助手说（可直接复制）：

- **不知道剪哪段**：`先给 demo.mp4 生成一张带时间点的分镜总览图，方便我挑要保留的片段。`
- **裁切 + 压缩体积**：`把录屏 01:15 到 03:40 剪出来，转成适合发微信/网页播放的 H.264 MP4，保留原文件。`
- **烧录字幕 / 导出动图**：`把 subtitles.srt 烧录进 talk.mp4 生成成品，再把前 6 秒导出成清晰度适中的 GIF 预览图。`

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
