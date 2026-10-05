# 更新记录

[返回简介](README.md) · [使用说明](docs/USAGE.md) · [验证记录](docs/VALIDATION.md)

[历史英文记录](docs/CHANGELOG.en.md)

## 0.4.5 (2026-10-05)

- 输入、输出、字幕与抽帧路径按当前 DSH 会话工作区解析，避免宿主启动目录造成找错文件；非法时间参数立即报错。

## 0.4.4 (2026-09-28)

- 更新官方 Harness 0.2.0-rc.1 的兼容声明和共同加载验证；运行时代码未变。验证范围见[验证记录](docs/VALIDATION.md)。

## 0.4.3 (2026-09-19)

- 修复抽帧数到旧帧/清单截断、取消被当成功、取消文案丢原因、`+2dB` 被拒；音轨提取非 AAC 自动转 AAC、concat 混合音轨可用、ffprobe 截断明确报错。测试 102 项。

## 更早的改动

完整历史可查阅 [GitHub 提交记录](https://github.com/STARDUSTLC666/dsh-ffmpeg/commits/master)。
