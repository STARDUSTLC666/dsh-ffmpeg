# dsh-ffmpeg 验证记录

本页整理原 README 的历史验证说明，保留当时的版本、日期与范围。自动测试、启动检查、浏览器操作和真实服务验收分别记录，不能相互替代。更详细的版本验收文件仍保留在仓库中。

## 原中文记录

验证宿主：官方源码构建的 Harness `0.2.0-rc.1`（commit `407e65c8`）+ Node `24.16.0`（2026-09-28）。96 项插件测试在隔离环境全部通过；同一个宿主里 18 个插件共同加载，注册 10 个工具，工具 schema 与健康检查契约通过。本轮未启用真实端口与外部服务。

## Original English record

Validation host: Harness `0.2.0-rc.1` built from official sources (commit `407e65c8`) with Node `24.16.0` on 2026-09-28. All 96 plugin tests pass in an isolated environment; all 18 plugins mount together in one host registering 10 tools, with tool schemas and health-check contracts passing. No live ports or external services were exercised in this round.

2026-09-13 fix: retain the service receiver when calling `subprocess.spawn`, preventing failures caused by passing the method as an unbound callback. Verified against a real isolated host subprocess service. FFmpeg/ffprobe version checks and probing a real MP4 pass. This fixes the tool invocation failure reported in [#3](https://github.com/STARDUSTLC666/dsh-ffmpeg/issues/3).
