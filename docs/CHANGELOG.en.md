# Historical release notes

[Current changelog](../CHANGELOG.md) · [Overview](../README.en.md)

These English notes preserve the earlier translations. The main changelog contains the consolidated version history.

## 0.4.5 (2026-10-05)

- Resolve input, output, subtitles and frame directories against the current DSH session workspace. Reject invalid time arguments before execution.

## 0.4.3 (2026-09-19)

- 修复抽帧数到旧帧/清单截断、取消被当成功、取消文案丢原因、`+2dB` 被拒; 音轨提取非 AAC 自动转 AAC、concat 混合音轨可用、ffprobe 截断明确报错. 测试 102 项.
