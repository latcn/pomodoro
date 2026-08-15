# 番茄钟 Pomodoro — DSH 动态 Cordis 插件

一个悬浮在界面右下角的番茄钟（Pomodoro）专注计时器，作为 DeepSeek Harness（DSH）的**动态 Cordis 插件**运行。

## 功能

- 🍅 悬浮卡片，位于界面右下角（`shell.overlay` 槽位）
- 三种模式：**专注** 25 分钟 / **短休息** 5 分钟 / **长休息** 15 分钟
- 环形进度圈 + 中央 `MM:SS` 倒计时
- 控制：开始 / 暂停、跳过、重置
- 自动流转：专注结束 → 休息；每完成 4 个专注段 → 长休息（底部圆点显示周期进度）；休息结束 → 专注
- 可折叠为小胶囊（仅显示剩余时间），点击展开

## 文件

- `client.js` — 插件源码（`code.client` 函数体）

## 技术说明

这是一个 **Client-only** 动态插件：

- 依赖 `timer` 服务（`inject: ['timer']`，通过 `ctx.interval` 每秒递减）
- 使用 DSH Client 内建符号：`ctx`、`React`、`styles`、`host`、`console`
- UI 通过 `ctx.get('slots')` 注册到 `shell.overlay` 槽位（`id: 'pomodoro'`）
- 无 Host 半部分、无持久化；状态仅存在于插件运行期内

## 在 DSH 中重新创建

`client.js` 的内容是 `code.client` 的**函数体**（去掉文件头注释后），需要配合 `cordis_define` 使用：

1. `cordis_define`（`code.client` = 去掉头注释后的 `client.js` 内容）
2. `cordis_run` 激活

## 运行实例

- Plugin: `pomo-1`
- Package: `pkg-1`
