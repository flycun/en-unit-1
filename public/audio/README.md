# 音频文件目录

此目录用于存放课文的听力音频文件（MP3 格式）。

## 命名规则

- `grade{年级}-u{单元}-{part}.mp3`
- 例如：`grade3-u1-a.mp3` 表示三年级第 1 单元 Part A

## 当前示例数据所需文件

- `grade3-u1-a.mp3` — 三年级 Unit 1 Part A "Let's talk"
- `grade3-u1-b.mp3` — 三年级 Unit 1 Part B "Let's learn"
- `grade3-u2-a.mp3` — 三年级 Unit 2 Part A "Let's learn"
- `grade4-u1-a.mp3` — 四年级 Unit 1 Part A "Let's talk"

## 说明

MVP 阶段如果暂无真实音频，可：
1. 放入任意短时长的 MP3 文件用于演示同步效果
2. 或使用 TTS（文字转语音）工具生成示例音频
3. 注意：数据库中的时间戳（startTime/endTime）需与实际音频时长匹配

真实部署时，应从版权方获取合法的教材配套音频。
