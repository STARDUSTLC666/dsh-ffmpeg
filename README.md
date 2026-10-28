# dsh-ffmpeg

[English](README.en.md)

![dsh-ffmpeg 鲸鱼娘插件封面](https://raw.githubusercontent.com/STARDUSTLC666/dsh-ffmpeg/master/assets/cover-whale-girl.png)

通过 DSH 调用本机 FFmpeg，处理已有音视频文件：裁切、拼接、转码、字幕、音轨、GIF 与帧提取。适合媒体后期处理；创作新的视频工程可选 HyperFrames 或 Remotion 插件。

[![npm](https://img.shields.io/npm/v/dsh-ffmpeg)](https://www.npmjs.com/package/dsh-ffmpeg) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-ffmpeg-downloads.svg)](https://www.npmjs.com/package/dsh-ffmpeg)

欢迎使用，遇到问题或有改进建议，请提交 [issues](https://github.com/STARDUSTLC666/dsh-ffmpeg/issues) 和 [PR](https://github.com/STARDUSTLC666/dsh-ffmpeg/pulls)。

## 功能

- 探测媒体信息，裁剪、拼接和压制视频。
- 拼接不同尺寸和帧率的素材时可统一画布并等比补边；无声片段补静音，保留其余原声。
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

## 插件更新

需要 DSH 0.2.1-rc.3 或更新版本。更新控件直接位于原有工作台内容末尾；没有工作台的插件，位于原生插件详情页底部。检查、更新记录和偏好在原地展开，不增加独立更新页面或设置菜单。自动检查默认开启；**自动安装默认关闭**，明确授权后才会在空闲且没有未保存修改时安装兼容的稳定补丁。开关按插件独立保存，可关闭、推迟或忽略提醒；不会强制重启 DSH、升级 DSH 本体或替换本地源码安装。Suite 组件在当前页面底部明确说明并操作 Suite 整包更新。

旧版用户先在官方插件管理中手动更新一次，之后才会获得此入口。发布到 npm 不会直接替换用户已经安装的版本。

## License

[MIT](LICENSE)
