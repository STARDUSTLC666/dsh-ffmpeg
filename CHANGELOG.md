# 更新记录

[返回简介](README.md) · [使用说明](docs/USAGE.md) · [验证记录](docs/VALIDATION.md)

[历史英文记录](docs/CHANGELOG.en.md)

## 0.6.2 (2026-10-27)

- 更新控件移至原有工作台或原生插件详情页底部；更新记录与选项原地展开，移除独立更新菜单与页面。
- 保留原页面操作与草稿，自动安装默认关闭；安装前确认，遇到未保存修改或运行任务时暂停。

## 0.6.1 (2026-10-27)

- Keep this component's own update entry visible when installed transitively through Suite. Confirm whole-Suite update scope before opening its controls.
- Keep automatic installation off by default and preserve independent installation behavior.

## 0.6.0 (2026-10-26)

- Add this plugin’s own update controls and independent preferences. Automatic installation stays off until explicitly enabled.
- Confirm manual installs, preserve local sources and disabled state, pause for tasks or unsaved changes, and use native DSH recovery without forced restarts.
- Require the public DSH 0.2.1-rc.3 update APIs; Suite components remain managed through Suite.

## 0.5.1（2026-10-26）

- 抽帧默认使用每次独立的 run 目录；显式帧序列检查实际文件冲突。输出保护覆盖所有拼接输入、字幕源、符号链接及硬链接别名。
- Windows 回归 114 项通过、1 项跳过；宿主与未验收范围见[本次记录](docs/validation-0.5.1.md)。

## 0.5.0 (2026-10-15)

- 修复 GIF 的起点和时长选项作用到错误输入，调色板以单帧写入；非零起点也能按指定区间导出。
- 重编码拼接先统一画布、帧率、像素比例与时间戳，可指定目标宽高和帧率，等比补边。
- 混合有声/无声素材时只为无声片段补静音，保留其余片段的声音；全无声素材保持无音轨。

## 0.4.5 (2026-10-05)

- 输入、输出、字幕与抽帧路径按当前 DSH 会话工作区解析，避免宿主启动目录造成找错文件；非法时间参数立即报错。

## 0.4.4 (2026-09-28)

- 更新官方 Harness 0.2.0-rc.1 的兼容声明和共同加载验证；运行时代码未变。验证范围见[验证记录](docs/VALIDATION.md)。

## 0.4.3 (2026-09-19)

- 修复抽帧数到旧帧/清单截断、取消被当成功、取消文案丢原因、`+2dB` 被拒；音轨提取非 AAC 自动转 AAC、concat 混合音轨可用、ffprobe 截断明确报错。测试 102 项。

## 更早的改动

完整历史可查阅 [GitHub 提交记录](https://github.com/STARDUSTLC666/dsh-ffmpeg/commits/master)。
