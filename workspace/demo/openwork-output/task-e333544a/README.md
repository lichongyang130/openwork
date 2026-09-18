# 深色数据驾驶舱

一个深色（dark）风格的运营数据驾驶舱页面，基于 React + TypeScript，
采用 Tailwind 类名实现样式，趋势图使用纯 SVG 绘制，无任何外部依赖。

## 页面结构
- 顶栏：标题、更新时间、系统状态徽章
- 核心指标（4 个 MetricCard）：活跃用户、营收、订单量、错误率，含环比涨跌
- 核心趋势（TrendChart）：双序列折线面积图（访问量 / 转化量）
- 告警列表（AlertList）：按严重 / 警告 / 信息分级，含实时刷新说明

## 文件清单
| 文件 | 说明 |
| --- | --- |
| `Dashboard.tsx` | 主页面，整合三大区块并定义指标数据 |
| `components/MetricCard.tsx` | 核心指标卡片组件 |
| `components/TrendChart.tsx` | SVG 折线趋势图组件（含图例） |
| `components/AlertList.tsx` | 分级告警列表组件 |

## 使用方式
1. 将 `Dashboard.tsx` 与 `components/` 目录放入任意 React + Vite 项目。
2. 项目需安装 Tailwind CSS；或将 `class` 替换为等效内联样式。
3. 在入口渲染 `<Dashboard />` 即可。
4. 数据为内置示例（metrics / alerts / series），可替换为接口数据。

## 设计要点
- 配色：slate-950 背景，slate-800 卡片，强调色天空蓝 / 紫 / 绿 / 玫红。
- 响应式：指标区 1/2/4 列自适应，趋势与告警在窄屏时堆叠。
- 无图表库依赖，趋势图可直接嵌入任意环境。
