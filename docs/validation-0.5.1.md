# 0.5.1 验证记录

日期：2026-10-26。官方 Windows 宿主：DSH 0.2.1-rc.3。

## 行为变化

抽帧默认使用每次独立的 run 目录；显式帧序列检查实际文件冲突。输出保护覆盖所有拼接输入、字幕源、符号链接及硬链接别名。

## 验证与限制

- Windows 本地：115 项，114 通过、1 跳过；没有把跳过计为通过。
- 官方 RC.3 调用真实 FFmpeg 连续抽帧两次，目录互不覆盖，原有帧哨兵保持不变。Windows 跳过 1 项 POSIX 大小写检查，Linux 结果以 CI 为准。
- GitHub 的跨平台 CI 和 npm 发布完整性以该版本工作流及 registry 为准；本记录不把本地测试等同于已发布。

## English

Frame extraction uses a separate run directory by default. Explicit frame sequences check existing output names. Output protection covers every concat input, subtitle sources and symlink/hard-link aliases.

Runtime/account limits are listed above. Synthetic peers and model adapters do not establish live account delivery or model quality.
