[English](README.en.md)

# dsh-ffmpeg

> **你的 agent 会剪视频了**：探测/剪辑/拼接/转码/字幕/抽帧/GIF，七个工具一条命令。

![npm version](https://img.shields.io/npm/v/dsh-ffmpeg?label=npm&color=blue) ![npm downloads](https://img.shields.io/npm/dm/dsh-ffmpeg) ![license](https://img.shields.io/npm/l/dsh-ffmpeg) ![stars](https://img.shields.io/github/stars/STARDUSTLC666/dsh-ffmpeg?style=social)

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)


DSH（DeepSeek Harness）视频处理工具插件：七个工具覆盖探测、剪辑、拼接、转码、字幕、提取与 GIF 制作，全部由 ffmpeg/ffprobe 完成。

## 兼容性

在 `@deepseek-ai/dsh@0.1.1-rc.2` 上验证（2026-08-26）。遵循 cordis 组合包补丁模型（`cordis.patch.yml` + `dsh.bundle.patch`），运行时不 import 任何 `@deepseek-ai/*` 内部模块。

## 安装

```bash
dsh plugin --profile web add dsh-ffmpeg
```

需要本机已安装 ffmpeg（`ffmpeg -version` 能出结果即可）；不在 PATH 上时可用 `ffmpegPath`/`ffprobePath` 显式指定，或设置环境变量 `DSH_FFMPEG_PATH` / `DSH_FFPROBE_PATH`。

## 卸载

```bash
dsh plugin --profile web remove dsh-ffmpeg
```

卸载后重启 Web 服务。如需彻底清理，可再手动删除自己 profile `cordis.patch.yml` 中覆盖的插件行。


## 配置

在你自己的 profile 的 `cordis.patch.yml` 里覆盖本插件行（缺省时全部用默认值）：

```yaml
- id: ffmpeg
  name: 'dsh-ffmpeg'
  config:
    # ffmpegPath: C:\tools\ffmpeg\bin\ffmpeg.exe   # 非 PATH 时显式指定（也可用 DSH_FFMPEG_PATH）
    # ffprobePath: C:\tools\ffmpeg\bin\ffprobe.exe # 也可用 DSH_FFPROBE_PATH
    timeoutMs: 300000                                # 单次操作超时（默认 5 分钟，10 秒 - 2 小时）
    # overwrite: true                                 # 允许覆盖同名输出（默认自动加 _1/_2 序号）
```

## 工具一览

| 工具 | 作用 | 关键参数 |
| :-- | :-- | :-- |
| `ffmpeg_probe` | 探测媒体信息（格式/时长/分辨率/帧率/码率/音轨/字幕轨；多视频流时返回完整 videos 列表） | `input` 必填 |
| `ffmpeg_cut` | 剪辑片段（默认流拷贝秒级，可精确重编码） | `input` 必填；`start`/`end`/`duration` |
| `ffmpeg_concat` | 拼接 2-20 个片段（同编码流拷贝 / 混合编码重编码） | `inputs` 数组必填 |
| `ffmpeg_encode` | 转码（B 站 1080p/4K、竖屏 1080p、web-720p 预设 + crf/fps/scale 覆盖） | `input` 必填；`preset` 可选 |
| `ffmpeg_subtitle` | 字幕烧录（SRT/ASS 硬字幕） | `input`+`subtitle` 必填 |
| `ffmpeg_extract` | 提取音轨（m4a）/ 抽帧序列 / 单帧 / 字幕流 | `input`+`what` 必填 |
| `ffmpeg_gif` | 视频转高质量 GIF（两遍调色板） | `input` 必填；`fps`/`width`/`duration` 可选 |

### 示例

```text
ffmpeg_probe { input: E:\videos\raw.mp4 }
ffmpeg_cut { input: E:\videos\raw.mp4, start: 10, end: 30 }
ffmpeg_encode { input: E:\videos\raw.mp4, preset: bilibili-1080p }
ffmpeg_subtitle { input: E:\videos\raw.mp4, subtitle: E:\videos\subs.srt }
ffmpeg_gif { input: E:\videos\raw.mp4, duration: 3, width: 480 }
```

## 安全设计

- **无 shell**：所有参数以独立 argv 数组传递，用户输入不可能注入命令
- **进程走 DSH 官方 subprocess 服务**：超时 AbortSignal 会真正触发树级终止（SIGTERM → 强杀，Windows taskkill /T），本插件零运行时依赖
- **防覆写**：默认不覆盖同名文件（自动加序号），输出与输入相同直接拒绝
- **超时钳制**：单次操作 10 秒 - 2 小时；探测额外限制 60 秒
- **参数校验**：时间格式、预设枚举、crf/fps/scale 范围全部前置校验，输入目录、抽帧无扩展名输出等边界也有中文错误/自动修复

## 开发

```bash
pnpm install
pnpm test       # 构建 + 57 个测试（含真实 ffmpeg 端到端集成，缺 ffmpeg 自动跳过）
```

## License

MIT