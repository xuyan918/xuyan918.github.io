"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type View = "home" | "calendar" | "growth" | "health" | "finance" | "jobs" | "travel" | "memos";
type Category = { id: string; name: string; color: string };
type EventItem = { id: string; date: string; start: string; end: string; title: string; categoryId: string; updatedAt: number };
type Todo = { id: string; date: string; text: string; done: boolean; order: number; updatedAt: number };
type Memo = { id: string; text: string; order: number; createdAt: number; updatedAt: number };
type ProgressState = "未开始" | "进行中" | "已掌握";
type Skill = { id: string; name: string; icon: string; progress: ProgressState; beginner: string[]; advanced: string[]; points: string[]; resources: string[]; notes: string; lastCheckin?: string; updatedAt: number };
type LearningTrack = { id: string; name: string; icon: string; subtitle: string; plan: string[]; today: string[]; material: string; updatedAt: number };
type Checkin = { id: string; trackId: string; date: string; note: string; updatedAt: number };
type Goal = { id: string; kind: "证书" | "副业" | "技能"; text: string; done: boolean; updatedAt: number };
type PeriodRecord = { id: string; start: string; end: string; updatedAt: number };
type WorkoutPlan = { id: string; weekday: number; title: string; intensity: "轻柔" | "适中" | "较高"; updatedAt: number };
type HealthLog = { id: string; date: string; weight?: number; trained: boolean; workout?: string; foodNote: string; calories?: number; updatedAt: number };
type Recipe = { id: string; meal: "早餐" | "午餐" | "晚餐"; name: string; ingredients: string; calories: number; custom?: boolean; updatedAt: number };
type HealthSettings = { privacy: boolean; cycleLength: number; periodLength: number; updatedAt: number };
type FinanceCategory = { id:string; type:"income"|"expense"; name:string; color:string; updatedAt:number };
type FinanceEntry = { id:string; type:"income"|"expense"; categoryId:string; amount:number; note:string; date:string; time:string; updatedAt:number };
type ShoppingItem = { id:string; name:string; price:number; purchased:boolean; updatedAt:number };
type SavingsGoal = { id:string; name:string; target:number; saved:number; updatedAt:number };
type FinanceSettings = { monthlyIncome?:number; updatedAt:number };
type JobStatus = "感兴趣" | "已投递" | "已面试" | "已拒绝";
type JobListing = { id:string; company:string; title:string; salary:string; companySize:number; location:string; jd:string; url:string; source:string; publishedAt:string; status:JobStatus; statusUpdatedAt:number; updatedAt:number };
type Destination = { id:string; place:string; country:string; visited:boolean; updatedAt:number };
type ItineraryItem = { id:string; day:number; time:string; content:string };
type PackingItem = { id:string; category:string; name:string; checked:boolean };
type TravelPlan = { id:string; name:string; startDate:string; endDate:string; itinerary:ItineraryItem[]; packing:PackingItem[]; updatedAt:number };
type SpecialDay = { id:string; title:string; date:string; kind:"节日"|"折扣"|"演唱会"|"生日"; calendar:"公历"|"农历"; lunarDate?:string; reminderDays:number; updatedAt:number };
type WorkbenchData = {
  version: 1;
  exportedAt?: number;
  categories: Category[];
  events: EventItem[];
  todos: Todo[];
  memos: Memo[];
  skills: Skill[];
  learningTracks: LearningTrack[];
  checkins: Checkin[];
  goals: Goal[];
  periods: PeriodRecord[];
  workoutPlans: WorkoutPlan[];
  healthLogs: HealthLog[];
  recipes: Recipe[];
  healthSettings: HealthSettings;
  financeCategories: FinanceCategory[];
  financeEntries: FinanceEntry[];
  shoppingItems: ShoppingItem[];
  savingsGoals: SavingsGoal[];
  financeSettings: FinanceSettings;
  jobs: JobListing[];
  destinations: Destination[];
  travelPlans: TravelPlan[];
  packingTemplate: PackingItem[];
  specialDays: SpecialDay[];
};

const STORAGE_KEY = "bear-workbench-v1";
const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayKey = () => dayKey(new Date());
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const weekday = (date: string) => ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][new Date(`${date}T12:00:00`).getDay()];
const displayDate = (date: string) => {
  const d = new Date(`${date}T12:00:00`);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};
const dateDiff = (from:string,to:string) => Math.floor((new Date(`${to}T12:00:00`).getTime()-new Date(`${from}T12:00:00`).getTime())/86400000);
const addDays = (date:string,days:number) => { const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()+days);return dayKey(d); };
const cycleInfo = (data:WorkbenchData,date=todayKey()) => {
  const sorted=[...data.periods].sort((a,b)=>b.start.localeCompare(a.start));
  const latest=sorted[0];
  const cycle=data.healthSettings.cycleLength||28;
  const duration=data.healthSettings.periodLength||5;
  if(!latest)return {phase:"未记录",day:0,nextStart:"",nextEnd:"",cycle,duration};
  let day=dateDiff(latest.start,date)+1;
  while(day>cycle)day-=cycle;
  while(day<1)day+=cycle;
  const phase=day<=duration?"月经期":day<=Math.max(duration+1,13)?"卵泡期":day<=16?"排卵期":"黄体期";
  const nextStart=addDays(latest.start,cycle);
  return {phase,day,nextStart,nextEnd:addDays(nextStart,duration-1),cycle,duration};
};

const categories: Category[] = [
  { id: "work", name: "工作", color: "#79A8E8" },
  { id: "life", name: "生活", color: "#81C7A6" },
  { id: "sport", name: "运动", color: "#F2A96B" },
  { id: "fun", name: "娱乐", color: "#A997D8" },
  { id: "other", name: "其他", color: "#A9A5A3" },
];

const phaseTwoDefaults = (now = Date.now()) => ({
  skills: [
    { id:"agent",name:"AI Agent",icon:"✦",progress:"进行中" as ProgressState,beginner:["理解 Agent、工具调用与记忆","搭建一个单 Agent 小项目"],advanced:["多 Agent 协作","评估、观测与安全边界"],points:["LLM 推理","工具调用","RAG","工作流编排"],resources:["OpenAI 官方开发文档","B 站：AI Agent 入门课程"],notes:"把 Agent 能力逐步接入 RPA 场景。",lastCheckin:todayKey(),updatedAt:now },
    { id:"html",name:"HTML",icon:"〈〉",progress:"进行中" as ProgressState,beginner:["语义化标签","表单与基础可访问性"],advanced:["Web Components 概念","性能与 SEO"],points:["DOM 结构","表单","语义化","无障碍"],resources:["MDN Web Docs","B 站：HTML 零基础教程"],notes:"",updatedAt:now },
    { id:"xpath",name:"XPath",icon:"⌘",progress:"未开始" as ProgressState,beginner:["节点、属性与路径","常用定位表达式"],advanced:["轴与复杂条件","稳定定位策略"],points:["相对路径","谓词","轴","文本匹配"],resources:["MDN XPath 指南","影刀 XPath 实战资料"],notes:"",updatedAt:now },
    { id:"python",name:"Python",icon:"Py",progress:"进行中" as ProgressState,beginner:["语法、数据结构、函数","文件与异常处理"],advanced:["自动化脚本","接口与数据处理"],points:["函数","类","requests","pandas"],resources:["Python 官方教程","B 站：Python 自动化办公"],notes:"重点练习可复用的 RPA 辅助脚本。",updatedAt:now },
    { id:"mysql",name:"MySQL",icon:"DB",progress:"未开始" as ProgressState,beginner:["增删改查","表设计与关联"],advanced:["索引与查询优化","事务与权限"],points:["SQL","JOIN","索引","事务"],resources:["MySQL 官方文档","SQLBolt 交互教程"],notes:"",updatedAt:now },
    { id:"api",name:"API",icon:"↔",progress:"进行中" as ProgressState,beginner:["HTTP 与 REST","用工具调试请求"],advanced:["鉴权、分页与重试","接口设计与安全"],points:["HTTP","JSON","REST","OAuth"],resources:["MDN HTTP 指南","Postman Learning Center"],notes:"",updatedAt:now },
    { id:"prompt",name:"Prompt Engineering",icon:"Aa",progress:"进行中" as ProgressState,beginner:["清晰指令与上下文","结构化输出"],advanced:["评测与迭代","工具使用提示"],points:["角色","约束","示例","评估"],resources:["OpenAI 提示工程指南","Prompt Engineering Guide"],notes:"",updatedAt:now },
    { id:"workflow",name:"工作流",icon:"⌁",progress:"进行中" as ProgressState,beginner:["拆解输入、处理、输出","异常与分支"],advanced:["可观测性","人机协同与恢复"],points:["状态机","幂等","重试","日志"],resources:["影刀学院","n8n 官方文档"],notes:"",updatedAt:now },
    { id:"bi",name:"BI（基础）",icon:"▥",progress:"未开始" as ProgressState,beginner:["指标与维度","基础图表"],advanced:["看板设计","数据建模"],points:["指标","维度","可视化","Power BI"],resources:["Microsoft Learn Power BI"],notes:"",updatedAt:now },
    { id:"warehouse",name:"数据仓库（基础）",icon:"▤",progress:"未开始" as ProgressState,beginner:["事实表与维度表","ETL 基础"],advanced:["分层建模","质量与血缘"],points:["ETL","星型模型","分层"],resources:["阿里云数据仓库基础文章"],notes:"",updatedAt:now },
    { id:"linux",name:"Linux（基础）",icon:"$_",progress:"未开始" as ProgressState,beginner:["目录与常用命令","文件权限"],advanced:["进程、网络与脚本","部署排障"],points:["Shell","权限","进程","网络"],resources:["Linux Journey","鸟哥的 Linux 私房菜"],notes:"",updatedAt:now },
  ],
  learningTracks: [
    { id:"ielts",name:"雅思备考",icon:"EN",subtitle:"英语 · 每日 10 个高频词",plan:["第 1 阶段：语音与核心词汇","第 2 阶段：听读输入","第 3 阶段：写作与口语输出"],today:["resilient /rɪˈzɪliənt/ 有韧性的","allocate /ˈæləkeɪt/ 分配","口语：描述一次解决工作难题的经历"],material:"跟读例句：She remained resilient through every change.",updatedAt:now },
    { id:"topik",name:"韩语 TOPIK",icon:"한",subtitle:"轻量培养 · 每日 5 词 + 1 语法",plan:["掌握韩文字母与发音","积累生活场景词汇","TOPIK I 语法与题型"],today:["안녕하세요 你好","오늘 今天","공부하다 学习","좋아하다 喜欢","천천히 慢慢地","语法：-고 싶어요（想要……）"],material:"오늘 한국어를 공부하고 싶어요.",updatedAt:now },
    { id:"cpa",name:"注册会计师",icon:"CPA",subtitle:"轻量入门 · 每日 1 概念 + 1 例题",plan:["会计要素与记账基础","审计与税法概览","按章节建立知识树"],today:["概念：资产是由过去事项形成、由企业控制并预期带来经济利益的资源","例题：用银行存款购入设备，会同时影响哪些会计科目？"],material:"建议每天 15 分钟，不追求速度，先建立框架。",updatedAt:now },
    { id:"photoshop",name:"Photoshop",icon:"Ps",subtitle:"工具 + 小练习",plan:["认识图层与选区","基础修图与文字排版","完成 3 个小设计案例"],today:["工具：污点修复画笔（J）","练习：为一张生活照移除一个小杂物"],material:"快捷键：⌘J 复制图层；⌘T 自由变换。",updatedAt:now },
    { id:"law",name:"法律常识",icon:"§",subtitle:"每日 1 个案例知识点",plan:["劳动法与社保公积金","婚姻家庭与民法","刑法基础常识"],today:["案例：公司解除劳动合同，需要符合什么条件？","要点：注意保存劳动合同、工资记录与沟通证据。"],material:"内容仅作常识学习，具体问题仍需咨询专业人士。",updatedAt:now },
    { id:"finance-study",name:"理财入门",icon:"¥",subtitle:"每日 1 条可执行建议",plan:["记录现金流","建立应急资金","了解低风险配置与长期投资"],today:["今天的小行动：检查是否已预留 3–6 个月必要支出的应急资金。"],material:"建议基于“你的收入”计算比例，界面不会展示收入数字。",updatedAt:now },
  ],
  checkins: [] as Checkin[],
  goals: [
    { id:uid(),kind:"证书" as const,text:"取得雅思目标成绩",done:false,updatedAt:now },
    { id:uid(),kind:"证书" as const,text:"通过 TOPIK 初级",done:false,updatedAt:now },
    { id:uid(),kind:"副业" as const,text:"探索 RPA 自动化咨询",done:false,updatedAt:now },
    { id:uid(),kind:"技能" as const,text:"完成第一个 RPA + AI 作品",done:false,updatedAt:now },
  ],
});

const phaseThreeDefaults = (now = Date.now()) => {
  const lastStart = new Date();
  lastStart.setDate(lastStart.getDate() - 18);
  const lastEnd = new Date(lastStart);
  lastEnd.setDate(lastEnd.getDate() + 5);
  return {
    periods: [{ id:uid(), start:dayKey(lastStart), end:dayKey(lastEnd), updatedAt:now }],
    workoutPlans: [
      {id:"w1",weekday:1,title:"普拉提 · 核心稳定",intensity:"适中" as const,updatedAt:now},
      {id:"w2",weekday:2,title:"快走 30 分钟",intensity:"适中" as const,updatedAt:now},
      {id:"w3",weekday:3,title:"普拉提 · 全身塑形",intensity:"适中" as const,updatedAt:now},
      {id:"w4",weekday:4,title:"拉伸与肩颈放松",intensity:"轻柔" as const,updatedAt:now},
      {id:"w5",weekday:5,title:"普拉提 · 下肢力量",intensity:"适中" as const,updatedAt:now},
      {id:"w6",weekday:6,title:"户外散步或轻徒步",intensity:"适中" as const,updatedAt:now},
      {id:"w0",weekday:0,title:"休息 · 睡个好觉",intensity:"轻柔" as const,updatedAt:now},
    ],
    healthLogs: [] as HealthLog[],
    recipes: [
      {id:"r1",meal:"早餐" as const,name:"燕麦酸奶碗",ingredients:"燕麦、无糖酸奶、蓝莓、坚果",calories:360,updatedAt:now},
      {id:"r2",meal:"早餐" as const,name:"鸡蛋牛油果吐司",ingredients:"全麦吐司、鸡蛋、牛油果",calories:420,updatedAt:now},
      {id:"r3",meal:"午餐" as const,name:"鸡胸肉彩蔬沙拉",ingredients:"鸡胸肉、生菜、番茄、玉米",calories:480,updatedAt:now},
      {id:"r4",meal:"午餐" as const,name:"杂粮饭时蔬碗",ingredients:"杂粮饭、西兰花、菌菇、豆腐",calories:520,updatedAt:now},
      {id:"r5",meal:"晚餐" as const,name:"番茄虾仁豆腐汤",ingredients:"番茄、虾仁、豆腐、青菜",calories:390,updatedAt:now},
      {id:"r6",meal:"晚餐" as const,name:"南瓜鸡肉暖胃粥",ingredients:"南瓜、鸡肉、大米、小米",calories:430,updatedAt:now},
    ],
    healthSettings:{privacy:false,cycleLength:28,periodLength:5,updatedAt:now},
  };
};

const phaseFourDefaults = (now=Date.now()) => ({
  financeCategories:[
    ...["工资","生活费","红包","年终奖","理财","卖闲置","礼金","借入"].map((name,i)=>({id:`in-${i}`,type:"income" as const,name,color:["#D48A98","#E6B07A","#E59A9A","#B994CF","#7FAF92","#83A9D2","#D7A47B","#9E9A96"][i],updatedAt:now})),
    ...["餐饮","购物","日用","交通","蔬菜","饮品","水果","零食","运动","娱乐","游戏","电影票","养花","好朋友","饰品","通讯","服饰","美容","房租","家庭","社交","旅行","喝酒","数码","快递","医疗","书籍","学习","宠物","水费","电费","燃气费","礼金","礼物","办公","维修","彩票","红包","还款","借出"].map((name,i)=>({id:`out-${i}`,type:"expense" as const,name,color:["#D77F8C","#E6AA78","#D5B38D","#80A9CC","#86B696","#D6A36F","#C99BAD","#C7A47A","#82A8A0","#A78CC2"][i%10],updatedAt:now})),
  ] as FinanceCategory[],
  financeEntries:[] as FinanceEntry[],
  shoppingItems:[
    {id:uid(),name:"降噪耳机",price:1299,purchased:false,updatedAt:now},
    {id:uid(),name:"普拉提运动服",price:399,purchased:false,updatedAt:now},
  ],
  savingsGoals:[{id:uid(),name:"安心储备金",target:30000,saved:8000,updatedAt:now}],
  financeSettings:{monthlyIncome:undefined,updatedAt:now},
});

const phaseFiveDefaults = (now=Date.now()) => ({
  jobs:[
    {id:"job-jiansheng",company:"浙江健盛集团",title:"RPA 工程师",salary:"8–12K · 13薪",companySize:1000,location:"杭州 · 萧山区",jd:"参与业务流程梳理与自动化开发，岗位关键词包含 RPA；适合继续积累企业级流程交付经验。",url:"https://mwenku.51job.com/hangzhou_jobs/202601/Python/",source:"前程无忧公开招聘页",publishedAt:"2026-07-29",status:"感兴趣" as JobStatus,statusUpdatedAt:now,updatedAt:now},
  ] as JobListing[],
});

const packingGroups:Record<string,string[]>={
  "证件类":["身份证","护照","港澳通行证"],
  "电子设备类":["电脑","手机","iPad","Switch"],
  "充电配件类":["充电器","充电宝","耳机"],
  "摄影设备类":["相机","Pocket3","胶片相机","拍立得"],
  "出行舒适类":["护颈枕","耳塞","餐巾纸"],
  "衣物类":["衣服","鞋子","包包"],
  "贴身衣物类":["内衣","内裤","袜子"],
  "洗漱用品类":["电动牙刷","洗面奶","洗脸巾","洗发露","沐浴露","护发素","身体乳","梳子","吹风机","护发精油","卷发棒"],
  "护肤化妆类":["护肤品","面膜","护手霜","化妆品","眼唇卸","卸妆膏","化妆棉"],
  "首饰配件类":["首饰","美瞳"],
  "其他杂物类":["拖鞋","浴巾","雨伞","墨镜","阳伞","口罩","折叠衣架"],
};
const makePacking=(checked=false)=>Object.entries(packingGroups).flatMap(([category,names])=>names.map((name,i)=>({id:`${category}-${i}-${uid()}`,category,name,checked})));
const phaseSixDefaults = (now=Date.now()) => {
  const start=addDays(todayKey(),45),end=addDays(start,3);
  return {
    destinations:[
      {id:"dest-seoul",place:"首尔",country:"韩国",visited:false,updatedAt:now},
      {id:"dest-kyoto",place:"京都",country:"日本",visited:false,updatedAt:now},
      {id:"dest-iceland",place:"雷克雅未克",country:"冰岛",visited:false,updatedAt:now},
      {id:"dest-hk",place:"香港",country:"中国",visited:true,updatedAt:now},
    ] as Destination[],
    packingTemplate:makePacking(),
    travelPlans:[{id:"trip-jeju",name:"济州岛四日慢旅行",startDate:start,endDate:end,itinerary:[
      {id:uid(),day:1,time:"14:00",content:"抵达后入住，去海边散步"},
      {id:uid(),day:2,time:"09:30",content:"城山日出峰与海女村"},
      {id:uid(),day:3,time:"11:00",content:"咖啡馆、橘子园与小店巡游"},
    ],packing:makePacking(),updatedAt:now}] as TravelPlan[],
    specialDays:[{id:"special-sale",title:"会员超市折扣日",date:addDays(todayKey(),3),kind:"折扣",calendar:"公历",reminderDays:3,updatedAt:now}] as SpecialDay[],
  };
};

const seedData = (): WorkbenchData => {
  const today = todayKey();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const now = Date.now();
  return {
    version: 1,
    categories,
    ...phaseTwoDefaults(now),
    ...phaseThreeDefaults(now),
    ...phaseFourDefaults(now),
    ...phaseFiveDefaults(now),
    ...phaseSixDefaults(now),
    events: [
      { id: uid(), date: today, start: "09:30", end: "10:30", title: "整理本周 RPA 任务", categoryId: "work", updatedAt: now },
      { id: uid(), date: today, start: "18:30", end: "19:30", title: "普拉提课程", categoryId: "sport", updatedAt: now },
      { id: uid(), date: dayKey(tomorrow), start: "20:00", end: "20:30", title: "英语口语练习", categoryId: "life", updatedAt: now },
    ],
    todos: [
      { id: uid(), date: today, text: "复盘一个自动化流程", done: true, order: 0, updatedAt: now },
      { id: uid(), date: today, text: "学习 20 分钟 Python", done: false, order: 1, updatedAt: now },
      { id: uid(), date: dayKey(tomorrow), text: "更新求职简历", done: false, order: 0, updatedAt: now },
    ],
    memos: [
      { id: uid(), text: "周末去逛一家安静的书店", order: 0, createdAt: now - 2000, updatedAt: now - 2000 },
      { id: uid(), text: "记得补充日常用品", order: 1, createdAt: now - 1000, updatedAt: now - 1000 },
    ],
  };
};

const nav: { id: View; label: string; icon: string }[] = [
  { id: "home", label: "首页", icon: "⌂" },
  { id: "calendar", label: "日历", icon: "▦" },
  { id: "growth", label: "成长", icon: "✦" },
  { id: "health", label: "健康", icon: "♡" },
  { id: "finance", label: "财务", icon: "◒" },
  { id: "jobs", label: "招聘", icon: "♢" },
  { id: "travel", label: "旅行", icon: "✈" },
  { id: "memos", label: "备忘", icon: "☷" },
];

const greetings = [
  "你处理复杂流程的样子，真的在发光。",
  "你正在走向 RPA + AI 的赛道，眼光超棒。",
  "你值得更高的薪资，也在为更好的未来踏实努力。",
  "把日子过成喜欢的样子，本身就是一种了不起。",
  "小熊今天也很喜欢你认真生活的样子。",
  "杭州的风吹过梧桐，而你比夏天更明亮。",
];

function useWorkbench() {
  const [data, setData] = useState<WorkbenchData | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const defaults = phaseTwoDefaults();
        const healthDefaults = phaseThreeDefaults();
        const financeDefaults = phaseFourDefaults();
        const jobDefaults = phaseFiveDefaults();
        const travelDefaults = phaseSixDefaults();
        setData({
          ...parsed,
          skills: Array.isArray(parsed.skills) ? parsed.skills : defaults.skills,
          learningTracks: Array.isArray(parsed.learningTracks) ? parsed.learningTracks : defaults.learningTracks,
          checkins: Array.isArray(parsed.checkins) ? parsed.checkins : defaults.checkins,
          goals: Array.isArray(parsed.goals) ? parsed.goals : defaults.goals,
          periods: Array.isArray(parsed.periods) ? parsed.periods : healthDefaults.periods,
          workoutPlans: Array.isArray(parsed.workoutPlans) ? parsed.workoutPlans : healthDefaults.workoutPlans,
          healthLogs: Array.isArray(parsed.healthLogs) ? parsed.healthLogs : healthDefaults.healthLogs,
          recipes: Array.isArray(parsed.recipes) ? parsed.recipes : healthDefaults.recipes,
          healthSettings: parsed.healthSettings || healthDefaults.healthSettings,
          financeCategories: Array.isArray(parsed.financeCategories) ? parsed.financeCategories : financeDefaults.financeCategories,
          financeEntries: Array.isArray(parsed.financeEntries) ? parsed.financeEntries : financeDefaults.financeEntries,
          shoppingItems: Array.isArray(parsed.shoppingItems) ? parsed.shoppingItems : financeDefaults.shoppingItems,
          savingsGoals: Array.isArray(parsed.savingsGoals) ? parsed.savingsGoals : financeDefaults.savingsGoals,
          financeSettings: parsed.financeSettings || financeDefaults.financeSettings,
          jobs: Array.isArray(parsed.jobs) ? parsed.jobs : jobDefaults.jobs,
          destinations: Array.isArray(parsed.destinations) ? parsed.destinations : travelDefaults.destinations,
          travelPlans: Array.isArray(parsed.travelPlans) ? parsed.travelPlans : travelDefaults.travelPlans,
          packingTemplate: Array.isArray(parsed.packingTemplate) ? parsed.packingTemplate : travelDefaults.packingTemplate,
          specialDays: Array.isArray(parsed.specialDays) ? parsed.specialDays : travelDefaults.specialDays,
        });
      } else setData(seedData());
    } catch {
      setData(seedData());
    }
  }, []);
  useEffect(() => {
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);
  return [data, setData] as const;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="关闭">×</button></div>
        {children}
      </section>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="empty"><img src="/bears/bear-ribbon.jpg" alt="" /><p>{text}</p></div>;
}

export default function Home() {
  const [data, setData] = useWorkbench();
  const [view, setView] = useState<View>("home");
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [eventModal, setEventModal] = useState<EventItem | "new" | null>(null);
  const [memoModal, setMemoModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "event" | "todo" | "memo"; id: string } | null>(null);
  const [importMode, setImportMode] = useState<"replace" | "merge" | null>(null);
  const [pendingImport, setPendingImport] = useState<WorkbenchData | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }, []);

  const dates = useMemo(() => {
    const result: string[] = [];
    for (let i = -2; i < 12; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      result.push(dayKey(d));
    }
    return result;
  }, []);

  if (!data) return <main className="loading">小熊正在整理工作台…</main>;

  const patch = (fn: (draft: WorkbenchData) => WorkbenchData) => setData((old) => old ? fn(old) : old);
  const go = (next: View, date?: string) => { if (date) setSelectedDate(date); setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const category = (id: string) => data.categories.find((c) => c.id === id) || data.categories[0];

  const toggleTodo = (id: string) => patch((d) => ({ ...d, todos: d.todos.map((t) => t.id === id ? { ...t, done: !t.done, updatedAt: Date.now() } : t) }));
  const move = (kind: "todo" | "memo", id: string, direction: -1 | 1) => patch((d) => {
    const list = kind === "todo" ? d.todos : d.memos;
    const item = list.find((x) => x.id === id);
    if (!item) return d;
    const group = kind === "todo" ? (list as Todo[]).filter((x) => x.date === (item as Todo).date) : list;
    const sorted = [...group].sort((a, b) => a.order - b.order);
    const i = sorted.findIndex((x) => x.id === id);
    const other = sorted[i + direction];
    if (!other) return d;
    const updated = list.map((x) => x.id === item.id ? { ...x, order: other.order, updatedAt: Date.now() } : x.id === other.id ? { ...x, order: item.order, updatedAt: Date.now() } : x);
    return { ...d, [kind === "todo" ? "todos" : "memos"]: updated };
  });

  const performDelete = () => {
    if (!deleteTarget) return;
    patch((d) => ({ ...d, [`${deleteTarget.kind}s`]: (d[`${deleteTarget.kind}s` as keyof WorkbenchData] as { id: string }[]).filter((x) => x.id !== deleteTarget.id) } as WorkbenchData));
    setDeleteTarget(null);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ ...data, exportedAt: Date.now() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `小熊工作台-${todayKey()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const readImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.version !== 1 || !Array.isArray(parsed.events) || !Array.isArray(parsed.todos) || !Array.isArray(parsed.memos)) throw new Error();
        const defaults = phaseTwoDefaults();
        const healthDefaults = phaseThreeDefaults();
        const financeDefaults = phaseFourDefaults();
        const jobDefaults = phaseFiveDefaults();
        const travelDefaults = phaseSixDefaults();
        setPendingImport({
          ...parsed,
          skills: Array.isArray(parsed.skills) ? parsed.skills : defaults.skills,
          learningTracks: Array.isArray(parsed.learningTracks) ? parsed.learningTracks : defaults.learningTracks,
          checkins: Array.isArray(parsed.checkins) ? parsed.checkins : defaults.checkins,
          goals: Array.isArray(parsed.goals) ? parsed.goals : defaults.goals,
          periods: Array.isArray(parsed.periods) ? parsed.periods : healthDefaults.periods,
          workoutPlans: Array.isArray(parsed.workoutPlans) ? parsed.workoutPlans : healthDefaults.workoutPlans,
          healthLogs: Array.isArray(parsed.healthLogs) ? parsed.healthLogs : healthDefaults.healthLogs,
          recipes: Array.isArray(parsed.recipes) ? parsed.recipes : healthDefaults.recipes,
          healthSettings: parsed.healthSettings || healthDefaults.healthSettings,
          financeCategories: Array.isArray(parsed.financeCategories) ? parsed.financeCategories : financeDefaults.financeCategories,
          financeEntries: Array.isArray(parsed.financeEntries) ? parsed.financeEntries : financeDefaults.financeEntries,
          shoppingItems: Array.isArray(parsed.shoppingItems) ? parsed.shoppingItems : financeDefaults.shoppingItems,
          savingsGoals: Array.isArray(parsed.savingsGoals) ? parsed.savingsGoals : financeDefaults.savingsGoals,
          financeSettings: parsed.financeSettings || financeDefaults.financeSettings,
          jobs: Array.isArray(parsed.jobs) ? parsed.jobs : jobDefaults.jobs,
          destinations: Array.isArray(parsed.destinations) ? parsed.destinations : travelDefaults.destinations,
          travelPlans: Array.isArray(parsed.travelPlans) ? parsed.travelPlans : travelDefaults.travelPlans,
          packingTemplate: Array.isArray(parsed.packingTemplate) ? parsed.packingTemplate : travelDefaults.packingTemplate,
          specialDays: Array.isArray(parsed.specialDays) ? parsed.specialDays : travelDefaults.specialDays,
        });
        setImportMode("merge");
      } catch { alert("这个文件不是有效的小熊工作台数据。"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const performImport = () => {
    if (!pendingImport || !importMode) return;
    if (importMode === "replace") setData(pendingImport);
    else patch((current) => {
      const merge = <T extends { id: string; updatedAt: number }>(a: T[], b: T[]) => {
        const map = new Map(a.map((x) => [x.id, x]));
        b.forEach((x) => { const old = map.get(x.id); if (!old || x.updatedAt > old.updatedAt) map.set(x.id, x); });
        return [...map.values()];
      };
      const cats = new Map(current.categories.map((x) => [x.id, x]));
      pendingImport.categories.forEach((x) => cats.set(x.id, x));
      return {
        ...current,
        categories: [...cats.values()],
        events: merge(current.events, pendingImport.events),
        todos: merge(current.todos, pendingImport.todos),
        memos: merge(current.memos, pendingImport.memos),
        skills: merge(current.skills, pendingImport.skills),
        learningTracks: merge(current.learningTracks, pendingImport.learningTracks),
        checkins: merge(current.checkins, pendingImport.checkins),
        goals: merge(current.goals, pendingImport.goals),
        periods: merge(current.periods, pendingImport.periods),
        workoutPlans: merge(current.workoutPlans, pendingImport.workoutPlans),
        healthLogs: merge(current.healthLogs, pendingImport.healthLogs),
        recipes: merge(current.recipes, pendingImport.recipes),
        healthSettings: pendingImport.healthSettings.updatedAt > current.healthSettings.updatedAt ? pendingImport.healthSettings : current.healthSettings,
        financeCategories: merge(current.financeCategories, pendingImport.financeCategories),
        financeEntries: merge(current.financeEntries, pendingImport.financeEntries),
        shoppingItems: merge(current.shoppingItems, pendingImport.shoppingItems),
        savingsGoals: merge(current.savingsGoals, pendingImport.savingsGoals),
        financeSettings: pendingImport.financeSettings.updatedAt > current.financeSettings.updatedAt ? pendingImport.financeSettings : current.financeSettings,
        jobs: merge(current.jobs, pendingImport.jobs),
        destinations: merge(current.destinations, pendingImport.destinations),
        travelPlans: merge(current.travelPlans, pendingImport.travelPlans),
        packingTemplate: pendingImport.packingTemplate.length ? pendingImport.packingTemplate : current.packingTemplate,
        specialDays: merge(current.specialDays, pendingImport.specialDays),
      };
    });
    setPendingImport(null); setImportMode(null);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><img src="/bears/app-bear.jpg" alt="" /><div><strong>小熊工作台</strong><span>认真生活，也要拥抱自己</span></div></div>
        <nav>{nav.map((n) => <button key={n.id} className={view === n.id ? "active" : ""} onClick={() => go(n.id)}><i>{n.icon}</i><span>{n.label}</span></button>)}</nav>
        <div className="sync-box"><span>✦ 数据只在本机保存</span><button onClick={exportJSON}>导出 JSON</button><button className="secondary" onClick={() => fileRef.current?.click()}>导入 JSON</button></div>
      </aside>

      <main className="content">
        {view === "home" && <Dashboard data={data} go={go} toggleTodo={toggleTodo} patch={patch} />}
        {view === "calendar" && <Calendar data={data} dates={dates} selectedDate={selectedDate} setSelectedDate={setSelectedDate} category={category} toggleTodo={toggleTodo} move={move} onAdd={() => setEventModal("new")} onEdit={setEventModal} onDelete={setDeleteTarget} patch={patch} />}
        {view === "growth" && <Growth data={data} patch={patch} />}
        {view === "health" && <Health data={data} patch={patch} />}
        {view === "finance" && <Finance data={data} patch={patch} />}
        {view === "jobs" && <Jobs data={data} patch={patch} />}
        {view === "travel" && <Travel data={data} patch={patch} />}
        {view === "memos" && <Memos data={data} go={go} toggleTodo={toggleTodo} move={move} onAdd={() => setMemoModal(true)} onDelete={setDeleteTarget} patch={patch} />}
        {!["home","calendar","growth","health","finance","jobs","travel","memos"].includes(view) && <ComingSoon view={view} />}
      </main>

      <nav className="mobile-nav">{nav.map((n) => <button key={n.id} className={view === n.id ? "active" : ""} onClick={() => go(n.id)}><i>{n.icon}</i><span>{n.label}</span></button>)}</nav>
      {view !== "memos" && <button className="bear-fab" onClick={() => setMemoModal(true)} aria-label="快速备忘"><img src="/bears/app-bear.jpg" alt="" /><span>记一下</span></button>}

      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={readImport} />
      {eventModal && <EventEditor item={eventModal === "new" ? null : eventModal} date={selectedDate} data={data} patch={patch} close={() => setEventModal(null)} />}
      {memoModal && <MemoEditor patch={patch} close={() => setMemoModal(false)} />}
      {deleteTarget && <Modal title="要删除这条内容吗？" onClose={() => setDeleteTarget(null)}><p className="modal-copy">删除后无法从当前设备恢复，小熊再帮你确认一次。</p><div className="modal-actions"><button className="secondary" onClick={() => setDeleteTarget(null)}>先保留</button><button className="danger" onClick={performDelete}>确认删除</button></div></Modal>}
      {pendingImport && <Modal title="导入工作台数据" onClose={() => { setPendingImport(null); setImportMode(null); }}><p className="modal-copy">文件中有 {pendingImport.events.length} 条日程、{pendingImport.todos.length} 个待办和 {pendingImport.memos.length} 条备忘。</p><div className="mode-choices"><label><input type="radio" checked={importMode === "merge"} onChange={() => setImportMode("merge")} /> 智能合并 <small>保留两端内容，同一条以最新修改为准</small></label><label><input type="radio" checked={importMode === "replace"} onChange={() => setImportMode("replace")} /> 完全覆盖 <small>当前设备数据将被文件内容替换</small></label></div><div className="modal-actions"><button className="secondary" onClick={() => setPendingImport(null)}>取消</button><button onClick={performImport}>确认导入</button></div></Modal>}
    </div>
  );
}

function Dashboard({ data, go, toggleTodo, patch }: { data: WorkbenchData; go: (v: View, d?: string) => void; toggleTodo: (id: string) => void; patch:(fn:(d:WorkbenchData)=>WorkbenchData)=>void }) {
  const today = todayKey();
  const d = new Date();
  const [todoText,setTodoText]=useState("");
  const [editingTodo,setEditingTodo]=useState<string|null>(null);
  const [deleteTodo,setDeleteTodo]=useState<string|null>(null);
  const [homeWeather,setHomeWeather]=useState<{temperature:number;apparent:number;code:number}|null>(null);
  const todays = data.todos.filter((t) => t.date === today);
  const todayStudy = data.checkins.filter((c) => c.date === today);
  const careerCount = data.skills.filter((s) => s.lastCheckin === today).length;
  const fitnessCount = data.healthLogs.some((l) => l.date === today && l.trained)?1:0;
  const todaysEvents=[...data.events].filter(e=>e.date===today).sort((a,b)=>a.start.localeCompare(b.start));
  const nowTime=`${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const nextEvent=todaysEvents.find(e=>e.start>=nowTime)||todaysEvents[0];
  const latest = [...data.memos].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  const reminders=data.specialDays.filter(x=>{const days=dateDiff(today,x.date);return days>=0&&days<=Math.max(3,x.reminderDays)}).sort((a,b)=>a.date.localeCompare(b.date));
  const greeting = greetings[Math.floor((d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % greetings.length)];
  const checkinMetrics=[
    {label:"学习",done:new Set(todayStudy.map(x=>x.trackId)).size,total:data.learningTracks.length,target:"growth" as View,detail:`${todayStudy.length} / ${data.learningTracks.length} 项`},
    {label:"健身",done:fitnessCount,total:1,target:"health" as View,detail:fitnessCount?"训练已完成":"等待打卡"},
    {label:"职业",done:careerCount,total:data.skills.length,target:"growth" as View,detail:`${careerCount} / ${data.skills.length} 项`},
  ];
  useEffect(()=>{fetch("https://api.open-meteo.com/v1/forecast?latitude=30.2741&longitude=120.1551&current=temperature_2m,apparent_temperature,weather_code&timezone=Asia%2FShanghai").then(r=>{if(!r.ok)throw new Error();return r.json()}).then(j=>setHomeWeather({temperature:j.current.temperature_2m,apparent:j.current.apparent_temperature,code:j.current.weather_code})).catch(()=>{})},[]);
  const monthPrefix=today.slice(0,7);
  const workoutCount=data.healthLogs.filter(x=>x.date.startsWith(monthPrefix)&&x.trained).length;
  const learningDays=new Set([...data.checkins.filter(x=>x.date.startsWith(monthPrefix)).map(x=>x.date),...data.skills.map(x=>x.lastCheckin).filter((x):x is string=>Boolean(x?.startsWith(monthPrefix)))]).size;
  const savingTarget=data.savingsGoals.reduce((sum,x)=>sum+x.target,0);
  const savingDone=data.savingsGoals.reduce((sum,x)=>sum+Math.min(x.saved,x.target),0);
  const savingProgress=savingTarget?Math.min(100,Math.round(savingDone/savingTarget*100)):0;
  const phase=data.healthSettings.privacy?"隐私模式":cycleInfo(data).phase;
  const weatherLead=homeWeather?homeWeather.code>=50?`杭州今天有雨、体感约 ${Math.round(homeWeather.apparent)}°C，记得带伞；`:`杭州今天体感约 ${Math.round(homeWeather.apparent)}°C，适合适度活动；`:"今天按自己的体感安排节奏；";
  const phaseTip=phase==="月经期"?"以保暖、补水和轻柔活动为主。":phase==="卵泡期"?"能量通常在回升，可以循序增加活动量。":phase==="排卵期"?"状态活跃时也要充分热身、注意关节稳定。":phase==="黄体期"?"给睡眠和稳定饮食多一点优先级。":"规律吃饭、适量活动，也记得留一点休息时间。";
  const healthTip=`${weatherLead}${phaseTip}`;
  const addTodo=(e:FormEvent)=>{e.preventDefault();if(!todoText.trim())return;patch(x=>({...x,todos:[...x.todos,{id:uid(),date:today,text:todoText.trim(),done:false,order:todays.length,updatedAt:Date.now()}]}));setTodoText("")};
  return <div className="page dashboard">
    <header className="topbar"><div><p>{d.getFullYear()}年{d.getMonth()+1}月{d.getDate()}日 · {weekday(today)}</p><h1>早上好，今天也慢慢来 <span>♡</span></h1></div><button className="avatar" aria-label="个人设置"><img src="/bears/bear-grid.jpg" alt="" /></button></header>
    <section className="hero"><div className="hero-copy"><span className="eyebrow">TODAY&apos;S LITTLE NOTE</span><blockquote>“{greeting}”</blockquote><p>— 来自今天的小熊</p></div><img src="/bears/app-bear.jpg" alt="戴着蓝色蝴蝶结的水彩小熊" /></section>
    <div className="section-title"><div><span>今日概览</span><h2>把重要的事，轻轻接住</h2></div><button className="text-btn" onClick={() => go("calendar", today)}>查看今日日程 →</button></div>
    <section className="overview-grid">
      <button className="overview-card pink next-event-card" onClick={() => go("calendar", today)}><div className="card-title"><span>下一项日程</span><i>◷</i></div>{nextEvent?<><strong>{nextEvent.start}</strong><h3>{nextEvent.title}</h3><p>{nextEvent.start}—{nextEvent.end} · 点击查看今天的完整安排</p></>:<><strong>—</strong><h3>今天没有日程</h3><p>留一点空白，也是一种认真生活。</p></>}</button>
      <button className="overview-card cream" onClick={() => go("memos")}><div className="card-title"><span>临时备忘</span><i>✎</i></div>{latest.length ? <ul>{latest.map(m=><li key={m.id}>• {m.text}</li>)}</ul> : <p>还没有小纸条</p>}<span className="card-link">打开备忘 →</span></button>
      <div className="overview-card lilac"><div className="card-title"><span>今日打卡</span><i>✦</i></div><div className="checkin-row">{checkinMetrics.map(x=>{const progress=x.total?x.done/x.total:0;const state=progress===0?"":progress>=1?"done":"partial";return <button key={x.label} className={state} onClick={()=>go(x.target)}><i style={{"--check-progress":`${progress*360}deg`} as React.CSSProperties}>{progress>=1?"✓":progress>0?<b>{Math.round(progress*100)}</b>:""}</i><span><b>{x.label}</b><small>{x.detail}</small></span></button>})}</div></div>
    </section>
    {reminders.length>0&&<button className="dashboard-reminder" onClick={()=>go("travel")}><span>♡ 未来三天提醒</span><div>{reminders.map(x=><b key={x.id}>{x.kind==="生日"?"🎂":"✦"} {x.title}<small>{x.date===today?"今天":`${dateDiff(today,x.date)} 天后`}</small></b>)}</div><i>去看看 →</i></button>}
    <section className="dashboard-insights">
      <button className="month-status" onClick={()=>go("finance")}><div className="insight-head"><div><span className="eyebrow">THIS MONTH</span><h2>本月状态</h2></div><small>不展示收入及储蓄金额</small></div><div className="month-metrics"><article><i className="saving-ring" style={{"--saving-progress":`${savingProgress*3.6}deg`} as React.CSSProperties}><b>{savingProgress}%</b></i><span>储蓄进度</span></article><article><b>{workoutCount}<small> 次</small></b><span>运动完成</span></article><article><b>{learningDays}<small> 天</small></b><span>学习记录</span></article></div></button>
      <button className="health-glance" onClick={()=>go("health")}><div className="insight-head"><div><span className="eyebrow">TODAY&apos;S WELLNESS</span><h2>今日健康提示</h2></div><i>{homeWeather?.code&&homeWeather.code>=50?"☂":"♡"}</i></div><p>{healthTip}</p><span>查看完整健康建议 →</span></button>
    </section>
    <section className="today-panel"><div className="panel-head"><div><span className="eyebrow">TODAY&apos;S TO-DO</span><h2>今日待办</h2><p>可以直接添加、勾选或修改文字。</p></div><span className="todo-count">{todays.filter(x=>x.done).length} / {todays.length} 完成</span></div><form className="dashboard-add-todo" onSubmit={addTodo}><input value={todoText} onChange={e=>setTodoText(e.target.value)} placeholder="添加一个临时待办…"/><button>＋ 添加</button></form>{todays.length?<div className="dashboard-todos">{todays.sort((a,b)=>a.order-b.order).map(t=><div className="dashboard-todo-row" key={t.id}><label aria-label={`切换${t.text}完成状态`}><input type="checkbox" checked={t.done} onChange={()=>toggleTodo(t.id)}/><i></i></label><input className={t.done?"strike":""} value={t.text} onFocus={()=>setEditingTodo(t.id)} onChange={e=>patch(x=>({...x,todos:x.todos.map(y=>y.id===t.id?{...y,text:e.target.value,updatedAt:Date.now()}:y)}))} onBlur={()=>setEditingTodo(null)} aria-label="修改待办内容"/><button className={editingTodo===t.id?"editing":""} onClick={()=>setDeleteTodo(t.id)} aria-label="删除待办">×</button></div>)}</div>:<Empty text="今天还没有待办，先写下一件最想完成的小事吧。"/>}</section>
    {deleteTodo&&<Modal title="删除这个临时待办吗？" onClose={()=>setDeleteTodo(null)}><p className="modal-copy">它也会同时从日历和备忘中的 To-do 汇总里移除。</p><div className="modal-actions"><button className="secondary" onClick={()=>setDeleteTodo(null)}>先保留</button><button className="danger" onClick={()=>{patch(x=>({...x,todos:x.todos.filter(y=>y.id!==deleteTodo)}));setDeleteTodo(null)}}>确认删除</button></div></Modal>}
  </div>;
}

function Calendar({ data, dates, selectedDate, setSelectedDate, category, toggleTodo, move, onAdd, onEdit, onDelete, patch }: any) {
  const [todoText, setTodoText] = useState("");
  const [quickText, setQuickText] = useState("");
  const periodMark=(date:string)=>{
    if(data.healthSettings.privacy)return "";
    if(data.periods.some((p:PeriodRecord)=>date>=p.start&&date<=p.end))return "actual";
    const info=cycleInfo(data,date);
    return date>=info.nextStart&&date<=info.nextEnd?"forecast":"";
  };
  const addTodo = (e: FormEvent) => { e.preventDefault(); if (!todoText.trim()) return; patch((d: WorkbenchData)=>({...d,todos:[...d.todos,{id:uid(),date:selectedDate,text:todoText.trim(),done:false,order:d.todos.filter(t=>t.date===selectedDate).length,updatedAt:Date.now()}]})); setTodoText(""); };
  const parseQuick = () => {
    const text = quickText.trim(); if (!text) return;
    let date = selectedDate, start = "09:00";
    const base = new Date(); if (/明天/.test(text)) { base.setDate(base.getDate()+1); date=dayKey(base); } else if (/后天/.test(text)) { base.setDate(base.getDate()+2); date=dayKey(base); }
    const tm = text.match(/(?:上午|早上|下午|晚上)?\s*(\d{1,2})(?::|点半?|：)(\d{2})?/);
    if (tm) { let h=Number(tm[1]); if (/下午|晚上/.test(tm[0]) && h<12) h+=12; start=`${pad(h)}:${tm[2]||(/半/.test(tm[0])?"30":"00")}`; }
    const title = text.replace(/今天|明天|后天|上午|早上|下午|晚上/g,"").replace(/\d{1,2}(?:[:：点]\d{0,2}|点半?)/g,"").trim() || text;
    const endD = new Date(`2000-01-01T${start}:00`); endD.setHours(endD.getHours()+1);
    patch((d:WorkbenchData)=>({...d,events:[...d.events,{id:uid(),date,start,end:`${pad(endD.getHours())}:${pad(endD.getMinutes())}`,title,categoryId:"work",updatedAt:Date.now()}]})); setQuickText(""); setSelectedDate(date);
  };
  return <div className="page calendar-page">
    <header className="page-head"><div><span className="eyebrow">MY CALENDAR</span><h1>日历与日程</h1><p>按自己的节奏，把每一天过得有条不紊。</p></div><button onClick={onAdd}>＋ 新建日程</button></header>
    <div className="quick-parse"><span>✦</span><input value={quickText} onChange={e=>setQuickText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&parseQuick()} placeholder="试试说：明天下午 3 点准备面试资料" /><button onClick={parseQuick}>帮我记下</button></div>
    <div className="calendar-layout"><aside className="date-rail">{dates.map((date:string)=><button key={date} onClick={()=>setSelectedDate(date)} className={`${selectedDate===date?"selected":""} ${date===todayKey()?"today":""}`}><small>{weekday(date)}</small><strong>{new Date(`${date}T12:00:00`).getDate()}</strong><span>{date===todayKey()?"今天":`${new Date(`${date}T12:00:00`).getMonth()+1}月`}</span>{periodMark(date)&&<em className={periodMark(date)}>✿</em>}{data.healthLogs.some((l:HealthLog)=>l.date===date&&l.trained)&&<em className="trained">✓</em>}{data.specialDays.some((x:SpecialDay)=>x.kind==="生日"&&x.date===date)&&<em className="birthday">🎂</em>}</button>)}</aside>
    <section className="day-detail"><div className="day-heading"><div><span>{displayDate(selectedDate)} · {weekday(selectedDate)}</span><h2>{selectedDate===todayKey()?"今天，温柔地完成这些事":"这一天的安排"}</h2><div className="calendar-checkins">{data.checkins.filter((c:Checkin)=>c.date===selectedDate).map((c:Checkin)=><b key={c.id}>✦ {data.learningTracks.find((t:LearningTrack)=>t.id===c.trackId)?.name}</b>)}{data.skills.some((s:Skill)=>s.lastCheckin===selectedDate)&&<b>⌁ 职业学习</b>}</div></div><button className="secondary" onClick={onAdd}>＋ 添加日程</button></div>
      <div className="event-list">{data.events.filter((e:EventItem)=>e.date===selectedDate).sort((a:EventItem,b:EventItem)=>a.start.localeCompare(b.start)).map((e:EventItem)=><article className="event-card" key={e.id} style={{"--event":category(e.categoryId).color} as React.CSSProperties}><time>{e.start}<small>{e.end}</small></time><i></i><div><span>{category(e.categoryId).name}</span><button onClick={()=>onEdit(e)}>{e.title}</button></div><button className="more" onClick={()=>onDelete({kind:"event",id:e.id})} aria-label="删除日程">×</button></article>)}{!data.events.some((e:EventItem)=>e.date===selectedDate)&&<Empty text="这一天还空空的，留给期待也很好。" />}</div>
      {(periodMark(selectedDate)||data.healthLogs.some((l:HealthLog)=>l.date===selectedDate&&l.trained)||data.specialDays.some((x:SpecialDay)=>x.date===selectedDate))&&<div className="health-day-strip">{periodMark(selectedDate)&&<span>✿ {periodMark(selectedDate)==="actual"?"经期记录":"预测经期"}</span>}{data.healthLogs.some((l:HealthLog)=>l.date===selectedDate&&l.trained)&&<span>✓ 今日训练已打卡</span>}{data.specialDays.filter((x:SpecialDay)=>x.date===selectedDate).map((x:SpecialDay)=><span key={x.id}>{x.kind==="生日"?"🎂":"✦"} {x.title}</span>)}</div>}
      <section className="todo-section"><div className="todo-head"><h3>当天 To-do</h3><span>{data.todos.filter((t:Todo)=>t.date===selectedDate&&t.done).length} / {data.todos.filter((t:Todo)=>t.date===selectedDate).length} 完成</span></div>
      <div className="todo-list">{data.todos.filter((t:Todo)=>t.date===selectedDate).sort((a:Todo,b:Todo)=>a.order-b.order).map((t:Todo)=><div className="todo-row" key={t.id}><label><input type="checkbox" checked={t.done} onChange={()=>toggleTodo(t.id)} /><i></i><span className={t.done?"strike":""}>{t.text}</span></label><div><button onClick={()=>move("todo",t.id,-1)} aria-label="上移">↑</button><button onClick={()=>move("todo",t.id,1)} aria-label="下移">↓</button><button onClick={()=>onDelete({kind:"todo",id:t.id})} aria-label="删除">×</button></div></div>)}</div>
      <form className="add-todo" onSubmit={addTodo}><input value={todoText} onChange={e=>setTodoText(e.target.value)} placeholder="添加一件想完成的小事…" /><button>添加</button></form></section>
    </section></div>
  </div>;
}

function Memos({ data, go, toggleTodo, move, onAdd, onDelete, patch }: any) {
  const [editing, setEditing] = useState<string|null>(null); const [text,setText]=useState("");
  const save=(id:string)=>{if(text.trim())patch((d:WorkbenchData)=>({...d,memos:d.memos.map(m=>m.id===id?{...m,text:text.trim(),updatedAt:Date.now()}:m)}));setEditing(null);};
  const undone=data.todos.filter((t:Todo)=>!t.done).sort((a:Todo,b:Todo)=>a.date.localeCompare(b.date)||a.order-b.order);
  return <div className="page memo-page"><header className="page-head"><div><span className="eyebrow">LITTLE NOTES</span><h1>备忘与 To-do</h1><p>灵感先放在这里，想起来时再慢慢完成。</p></div><button onClick={onAdd}>＋ 快速备忘</button></header>
  <div className="memo-grid"><section className="paper-panel"><div className="panel-head"><div><h2>快速备忘</h2><p>最新的小纸条排在最上面</p></div><span>共 {data.memos.length} 条</span></div>
  <div className="memo-list">{[...data.memos].sort((a,b)=>a.order-b.order).map((m:Memo)=><article key={m.id}>{editing===m.id?<input autoFocus value={text} onChange={e=>setText(e.target.value)} onBlur={()=>save(m.id)} onKeyDown={e=>e.key==="Enter"&&save(m.id)}/>:<button className="memo-text" onClick={()=>{setEditing(m.id);setText(m.text)}}>{m.text}</button>}<footer><time>{new Date(m.createdAt).toLocaleString("zh-CN",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})}</time><div><button onClick={()=>move("memo",m.id,-1)}>↑</button><button onClick={()=>move("memo",m.id,1)}>↓</button><button onClick={()=>onDelete({kind:"memo",id:m.id})}>删除</button></div></footer></article>)}{!data.memos.length&&<Empty text="灵感还没落下来，小熊在这里等你。" />}</div></section>
  <section className="paper-panel todo-summary"><div className="panel-head"><div><h2>未完成 To-do</h2><p>来自日历的同一份任务清单</p></div><span>{undone.length} 项</span></div>{undone.length?<div className="summary-list">{undone.map((t:Todo)=><label key={t.id}><input type="checkbox" checked={t.done} onChange={()=>toggleTodo(t.id)}/><i></i><button onClick={()=>go("calendar",t.date)}><span>{t.text}</span><small>{displayDate(t.date)} · {weekday(t.date)}</small></button></label>)}</div>:<Empty text="待办都完成啦，给今天的你一朵花。" />}</section></div>
  <button className="bear-fab inner" onClick={onAdd}><img src="/bears/app-bear.jpg" alt="" /><span>记一下</span></button></div>;
}

function Health({ data, patch }: { data:WorkbenchData; patch:(fn:(d:WorkbenchData)=>WorkbenchData)=>void }) {
  const [tab,setTab]=useState<"cycle"|"fitness"|"food"|"care">("cycle");
  const [periodForm,setPeriodForm]=useState({start:todayKey(),end:todayKey()});
  const [showPeriod,setShowPeriod]=useState(false);
  const [deletePeriod,setDeletePeriod]=useState<string|null>(null);
  const [meal,setMeal]=useState<Recipe["meal"]>("早餐");
  const [recipeForm,setRecipeForm]=useState({name:"",ingredients:"",calories:""});
  const [showRecipe,setShowRecipe]=useState(false);
  const [deleteRecipe,setDeleteRecipe]=useState<string|null>(null);
  const [logForm,setLogForm]=useState({weight:"",foodNote:"",workout:""});
  const [weather,setWeather]=useState<{temperature:number;humidity:number;apparent:number;code:number}|null>(null);
  const [weatherError,setWeatherError]=useState(false);
  const today=todayKey();
  const info=cycleInfo(data);
  const todayLog=data.healthLogs.find(l=>l.date===today);
  const sortedPeriods=[...data.periods].sort((a,b)=>b.start.localeCompare(a.start));
  const cycleGaps=sortedPeriods.slice(0,-1).map((p,i)=>dateDiff(sortedPeriods[i+1].start,p.start)).filter(x=>x>15&&x<60);
  const avgCycle=cycleGaps.length?Math.round(cycleGaps.reduce((a,b)=>a+b,0)/cycleGaps.length):data.healthSettings.cycleLength;
  const durations=sortedPeriods.map(p=>dateDiff(p.start,p.end)+1).filter(x=>x>0&&x<15);
  const avgDuration=durations.length?Math.round(durations.reduce((a,b)=>a+b,0)/durations.length):data.healthSettings.periodLength;
  const weekdays=["周日","周一","周二","周三","周四","周五","周六"];
  const phaseAdvice:Record<string,{title:string;body:string;drink:string;meal:string;sport:string;wear:string}>={
    "月经期":{title:"放慢一点，温柔照顾身体",body:"以舒缓、保暖和充分休息为主，如明显不适请停止训练。",drink:"温热姜枣茶或桂圆红枣水，少量饮用并留意个人体质。",meal:"选择温热易消化的主食、优质蛋白与深色蔬菜。",sport:"散步、呼吸练习或轻柔瑜伽，避免追求强度。",wear:"柔软宽松下装，加一件可随时穿脱的薄外套。"},
    "卵泡期":{title:"能量回升，适合尝试新挑战",body:"身体状态通常逐渐回升，可循序增加力量与心肺训练。",drink:"清爽柠檬水或淡绿茶，注意日常补水。",meal:"增加优质蛋白、全谷物和彩色蔬果。",sport:"普拉提、力量训练或间歇快走，可适度提高强度。",wear:"轻盈运动休闲风，选择透气面料和明快配色。"},
    "排卵期":{title:"保持节奏，也留意身体反馈",body:"状态可能较活跃，但训练时仍要充分热身并关注关节稳定。",drink:"无糖花果茶或温水，户外活动及时补水。",meal:"清淡均衡，搭配鱼虾、豆制品和新鲜蔬菜。",sport:"中等强度力量或普拉提，动作质量优先。",wear:"利落轻运动风，准备一件防晒薄衫。"},
    "黄体期":{title:"稳住状态，减少内耗",body:"可能出现疲倦或食欲变化，规律睡眠和稳定饮食更重要。",drink:"茯苓陈皮茶或温热大麦茶，避免过甜。",meal:"增加复合碳水、富镁食物与高纤维蔬菜。",sport:"中低强度普拉提、快走与拉伸，按感受降强度。",wear:"柔和分层穿搭，腰腹选择不紧绷的版型。"},
    "未记录":{title:"先记录一次周期，建议会更贴合",body:"添加最近一次经期开始和结束日期，即可获得阶段提示。",drink:"日常温水，少量多次。",meal:"规律三餐，保证蛋白质与蔬菜。",sport:"从散步和基础拉伸开始。",wear:"根据体感选择舒适、透气的衣物。"},
  };
  const advice=phaseAdvice[info.phase];
  const estimateCalories=(text:string)=>{
    const table:[RegExp,number][]=[[/米饭|饭/,230],[/面|粉/,350],[/鸡胸|鸡肉/,220],[/牛肉/,280],[/猪肉|水煮肉片/,420],[/奶茶/,450],[/咖啡/,120],[/酸奶/,150],[/鸡蛋/,80],[/水果|苹果|香蕉/,120],[/沙拉/,300],[/火锅/,800]];
    return table.reduce((sum,[key,value])=>sum+(key.test(text)?value:0),0);
  };
  useEffect(()=>{
    if(tab!=="care"||weather)return;
    fetch("https://api.open-meteo.com/v1/forecast?latitude=30.2741&longitude=120.1551&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&timezone=Asia%2FShanghai")
      .then(r=>{if(!r.ok)throw new Error();return r.json()})
      .then(j=>setWeather({temperature:j.current.temperature_2m,humidity:j.current.relative_humidity_2m,apparent:j.current.apparent_temperature,code:j.current.weather_code}))
      .catch(()=>setWeatherError(true));
  },[tab,weather]);
  const savePeriod=(e:FormEvent)=>{
    e.preventDefault();if(periodForm.end<periodForm.start)return;
    const record={id:uid(),...periodForm,updatedAt:Date.now()};
    const nextPeriods=[...data.periods,record].sort((a,b)=>b.start.localeCompare(a.start));
    const gaps=nextPeriods.slice(0,-1).map((p,i)=>dateDiff(nextPeriods[i+1].start,p.start)).filter(x=>x>15&&x<60);
    const lens=nextPeriods.map(p=>dateDiff(p.start,p.end)+1).filter(x=>x>0&&x<15);
    patch(d=>({...d,periods:nextPeriods,healthSettings:{...d.healthSettings,cycleLength:gaps.length?Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length):d.healthSettings.cycleLength,periodLength:lens.length?Math.round(lens.reduce((a,b)=>a+b,0)/lens.length):d.healthSettings.periodLength,updatedAt:Date.now()}}));setShowPeriod(false);
  };
  const saveLog=()=>{
    const calories=estimateCalories(logForm.foodNote);
    patch(d=>({...d,healthLogs:d.healthLogs.some(l=>l.date===today)?d.healthLogs.map(l=>l.date===today?{...l,weight:logForm.weight?Number(logForm.weight):l.weight,foodNote:logForm.foodNote||l.foodNote,workout:logForm.workout||l.workout,calories:calories||l.calories,updatedAt:Date.now()}:l):[...d.healthLogs,{id:uid(),date:today,weight:logForm.weight?Number(logForm.weight):undefined,trained:false,workout:logForm.workout,foodNote:logForm.foodNote,calories:calories||undefined,updatedAt:Date.now()}]}));setLogForm({weight:"",foodNote:"",workout:""});
  };
  const addRecipe=(e:FormEvent)=>{e.preventDefault();if(!recipeForm.name.trim())return;patch(d=>({...d,recipes:[...d.recipes,{id:uid(),meal,name:recipeForm.name.trim(),ingredients:recipeForm.ingredients.trim(),calories:Number(recipeForm.calories)||0,custom:true,updatedAt:Date.now()}]}));setRecipeForm({name:"",ingredients:"",calories:""});setShowRecipe(false)};
  const solarTerms=["小寒","立春","惊蛰","清明","立夏","芒种","小暑","立秋","白露","寒露","立冬","大雪"];
  const currentTerm=solarTerms[new Date().getMonth()];
  const weatherText=(code:number)=>code<2?"晴朗":code<4?"多云":code<60?"阴天":code<80?"有雨":"强对流";
  return <div className="page health-page">
    <header className="health-hero"><div><span className="eyebrow">MY WELLNESS</span><h1>听见身体的小小声音</h1><p>记录周期、运动与饮食，让照顾自己成为轻松的日常。</p><div className="phase-pill"><i>✿</i><span>{data.healthSettings.privacy?"隐私模式已开启":`周期第 ${info.day||"–"} 天 · ${info.phase}`}</span></div></div><img src="/bears/bear-ribbon.jpg" alt="戴蝴蝶结的水彩小熊" /></header>
    <nav className="growth-tabs health-tabs"><button className={tab==="cycle"?"active":""} onClick={()=>setTab("cycle")}>周期记录</button><button className={tab==="fitness"?"active":""} onClick={()=>setTab("fitness")}>健身计划</button><button className={tab==="food"?"active":""} onClick={()=>setTab("food")}>饮食与监测</button><button className={tab==="care"?"active":""} onClick={()=>setTab("care")}>杭州保养建议</button></nav>
    {tab==="cycle"&&<section className="health-grid">
      <article className="cycle-card feature"><div className="health-card-head"><div><span className="eyebrow">CYCLE OVERVIEW</span><h2>{data.healthSettings.privacy?"周期信息已隐藏":info.phase}</h2></div><button className={data.healthSettings.privacy?"private active":"private"} onClick={()=>patch(d=>({...d,healthSettings:{...d.healthSettings,privacy:!d.healthSettings.privacy,updatedAt:Date.now()}}))}>{data.healthSettings.privacy?"◉ 显示周期":"○ 隐藏周期"}</button></div>{data.healthSettings.privacy?<div className="privacy-cover"><span>♡</span><h3>小秘密被好好收起来了</h3><p>日历标注和预测也已同时隐藏。</p></div>:<><div className="cycle-ring"><div><b>{info.day}</b><span>周期天数</span></div></div><div className="cycle-metrics"><span><b>{avgCycle} 天</b>平均周期</span><span><b>{avgDuration} 天</b>平均经期</span><span><b>{displayDate(info.nextStart)}</b>预计下次</span></div></>}</article>
      <article className="cycle-card advice"><span className="eyebrow">TODAY&apos;S BODY NOTE</span><h2>{advice.title}</h2><p>{advice.body}</p><div className="phase-track">{["月经期","卵泡期","排卵期","黄体期"].map(x=><span className={x===info.phase?"active":""} key={x}>{x}</span>)}</div><small>周期预测仅用于日常记录，不替代医疗诊断。</small></article>
      <article className="cycle-card records"><div className="health-card-head"><div><h2>经期记录</h2><p>记录越完整，预测越贴合你的节奏</p></div><button onClick={()=>setShowPeriod(true)}>＋ 添加记录</button></div><div className="period-list">{sortedPeriods.map(p=><div key={p.id}><i>✿</i><span><b>{displayDate(p.start)} — {displayDate(p.end)}</b><small>持续 {dateDiff(p.start,p.end)+1} 天</small></span><button onClick={()=>setDeletePeriod(p.id)}>×</button></div>)}</div></article>
      {showPeriod&&<Modal title="添加经期记录" onClose={()=>setShowPeriod(false)}><form className="editor-form" onSubmit={savePeriod}><div className="two-col"><label>开始日期<input type="date" value={periodForm.start} onChange={e=>setPeriodForm({...periodForm,start:e.target.value})}/></label><label>结束日期<input type="date" min={periodForm.start} value={periodForm.end} onChange={e=>setPeriodForm({...periodForm,end:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowPeriod(false)}>取消</button><button>保存记录</button></div></form></Modal>}
      {deletePeriod&&<Modal title="删除这次经期记录吗？" onClose={()=>setDeletePeriod(null)}><p className="modal-copy">删除后周期平均值和预测日期会重新计算。</p><div className="modal-actions"><button className="secondary" onClick={()=>setDeletePeriod(null)}>先保留</button><button className="danger" onClick={()=>{patch(d=>({...d,periods:d.periods.filter(p=>p.id!==deletePeriod)}));setDeletePeriod(null)}}>确认删除</button></div></Modal>}
    </section>}
    {tab==="fitness"&&<section>
      <div className="growth-section-head"><div><span className="eyebrow">WEEKLY MOVEMENT</span><h2>本周健身计划</h2></div><p>当前阶段：{info.phase} · 建议以{info.phase==="卵泡期"?"中高":info.phase==="月经期"?"轻柔":"中低"}强度为主</p></div>
      <div className="fitness-layout"><section className="week-plan">{[1,2,3,4,5,6,0].map(day=>{const plan=data.workoutPlans.find(p=>p.weekday===day)!;return <article key={day} className={day===new Date().getDay()?"today":""}><header><span>{weekdays[day]}</span>{day===new Date().getDay()&&<b>今天</b>}</header><input value={plan.title} onChange={e=>patch(d=>({...d,workoutPlans:d.workoutPlans.map(p=>p.id===plan.id?{...p,title:e.target.value,updatedAt:Date.now()}:p)}))}/><select value={plan.intensity} onChange={e=>patch(d=>({...d,workoutPlans:d.workoutPlans.map(p=>p.id===plan.id?{...p,intensity:e.target.value as WorkoutPlan["intensity"],updatedAt:Date.now()}:p)}))}><option>轻柔</option><option>适中</option><option>较高</option></select></article>})}</section>
      <aside className="today-workout"><span className="eyebrow">TODAY</span><h2>{data.workoutPlans.find(p=>p.weekday===new Date().getDay())?.title}</h2><p>{advice.sport}</p><textarea value={logForm.workout} onChange={e=>setLogForm({...logForm,workout:e.target.value})} placeholder="补充今天实际训练内容…"/><button className={todayLog?.trained?"done":""} onClick={()=>patch(d=>({...d,healthLogs:todayLog?d.healthLogs.map(l=>l.id===todayLog.id?{...l,trained:!l.trained,workout:logForm.workout||l.workout,updatedAt:Date.now()}:l):[...d.healthLogs,{id:uid(),date:today,trained:true,workout:logForm.workout,foodNote:"",updatedAt:Date.now()}]}))}>{todayLog?.trained?"✓ 今日训练已完成":"完成今日训练"}</button></aside></div>
    </section>}
    {tab==="food"&&<section>
      <div className="meal-tabs"><div>{(["早餐","午餐","晚餐"] as Recipe["meal"][]).map(x=><button className={meal===x?"active":""} key={x} onClick={()=>setMeal(x)}>{x}</button>)}</div><button onClick={()=>setShowRecipe(true)}>＋ 添加我的菜谱</button></div>
      <div className="recipe-grid">{data.recipes.filter(r=>r.meal===meal).map(recipe=><article key={recipe.id}><span>{recipe.custom?"我的菜谱":meal}</span><h3>{recipe.name}</h3><p>{recipe.ingredients}</p><footer><b>约 {recipe.calories} kcal</b>{recipe.custom&&<button onClick={()=>setDeleteRecipe(recipe.id)}>删除</button>}</footer></article>)}</div>
      <section className="daily-health-log"><div><span className="eyebrow">DAILY CHECK</span><h2>今日健康记录</h2><p>食物热量仅按关键词做粗略估算。</p></div><label>体重（kg）<input type="number" step=".1" value={logForm.weight} onChange={e=>setLogForm({...logForm,weight:e.target.value})} placeholder={todayLog?.weight?String(todayLog.weight):"选填"}/></label><label>饮食备注<input value={logForm.foodNote} onChange={e=>setLogForm({...logForm,foodNote:e.target.value})} placeholder={todayLog?.foodNote||"例如：米饭、鸡胸肉、酸奶"}/></label><div className="calorie-result"><b>{estimateCalories(logForm.foodNote)||todayLog?.calories||"–"}</b><span>估算 kcal</span></div><button onClick={saveLog}>保存今日记录</button></section>
      {showRecipe&&<Modal title="添加我的菜谱" onClose={()=>setShowRecipe(false)}><form className="editor-form" onSubmit={addRecipe}><label>菜谱名称<input value={recipeForm.name} onChange={e=>setRecipeForm({...recipeForm,name:e.target.value})} required/></label><label>主要食材<input value={recipeForm.ingredients} onChange={e=>setRecipeForm({...recipeForm,ingredients:e.target.value})}/></label><label>粗略热量（kcal）<input type="number" value={recipeForm.calories} onChange={e=>setRecipeForm({...recipeForm,calories:e.target.value})}/></label><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowRecipe(false)}>取消</button><button>保存菜谱</button></div></form></Modal>}
      {deleteRecipe&&<Modal title="删除这份自定义菜谱吗？" onClose={()=>setDeleteRecipe(null)}><p className="modal-copy">删除后会从你的菜谱清单中移除。</p><div className="modal-actions"><button className="secondary" onClick={()=>setDeleteRecipe(null)}>先保留</button><button className="danger" onClick={()=>{patch(d=>({...d,recipes:d.recipes.filter(r=>r.id!==deleteRecipe)}));setDeleteRecipe(null)}}>确认删除</button></div></Modal>}
    </section>}
    {tab==="care"&&<section>
      <div className="weather-banner"><div><span className="eyebrow">HANGZHOU · {currentTerm}</span><h2>{weather?`${weatherText(weather.code)} · ${weather.temperature}°C`:"正在读取杭州天气…"}</h2><p>{weather?`体感 ${weather.apparent}°C · 湿度 ${weather.humidity}% · ${info.phase}`:weatherError?"暂时无法联网，以下按季节与周期提供离线建议。":"天气数据由 Open‑Meteo 提供，无需账号。"}</p></div><i>{weather&&weather.code>=50?"☂":"☼"}</i></div>
      <div className="care-grid"><article><span>01 · 祛湿饮品</span><h3>{weather&&weather.humidity>75?"空气偏湿，适合清爽祛湿":"温和补水，照顾当下体感"}</h3><p>{advice.drink}</p></article><article><span>02 · 一日三餐</span><h3>顺应周期的轻盈搭配</h3><p>{advice.meal}</p></article><article><span>03 · 今日运动</span><h3>{weather&&weather.code>=50?"雨天优先室内":"按体感选择室内或户外"}</h3><p>{weather&&weather.code>=50?`今天更适合室内活动。${advice.sport}`:advice.sport}</p></article><article><span>04 · 穿搭灵感</span><h3>{weather?`${weather.apparent}°C 体感穿搭`:"杭州当季舒适穿搭"}</h3><p>{advice.wear}{weather&&weather.temperature>30?" 高温注意防晒、补水。":weather&&weather.temperature<12?" 气温偏低，注意腰腹和脚踝保暖。":""}</p></article></div>
      <p className="health-disclaimer">健康与周期建议仅用于日常自我照顾，不用于诊断或治疗；若有持续不适或周期明显异常，请及时咨询医生。</p>
    </section>}
  </div>;
}

function TrendCanvas({ points }:{ points:{label:string;income:number;expense:number}[] }) {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    const ratio=window.devicePixelRatio||1;const width=canvas.clientWidth;const height=canvas.clientHeight;
    canvas.width=width*ratio;canvas.height=height*ratio;const ctx=canvas.getContext("2d");if(!ctx)return;ctx.scale(ratio,ratio);ctx.clearRect(0,0,width,height);
    const max=Math.max(1,...points.flatMap(p=>[p.income,p.expense]));const padX=20,padY=18,chartW=width-padX*2,chartH=height-padY*2;
    const draw=(key:"income"|"expense",color:string)=>{ctx.beginPath();points.forEach((p,i)=>{const x=padX+(points.length===1?0:i/(points.length-1))*chartW;const y=padY+chartH-(p[key]/max)*chartH;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=color;ctx.lineWidth=2.2;ctx.lineCap="round";ctx.lineJoin="round";ctx.stroke();points.forEach((p,i)=>{const x=padX+(points.length===1?0:i/(points.length-1))*chartW;const y=padY+chartH-(p[key]/max)*chartH;ctx.beginPath();ctx.arc(x,y,2.8,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()})};
    ctx.strokeStyle="#eee3df";ctx.lineWidth=1;for(let i=0;i<4;i++){const y=padY+i*chartH/3;ctx.beginPath();ctx.moveTo(padX,y);ctx.lineTo(width-padX,y);ctx.stroke()}
    draw("income","#84ad91");draw("expense","#d27d8b");
  },[points]);
  return <canvas className="trend-canvas" ref={ref} aria-label="收支趋势图"/>;
}

function Finance({ data, patch }:{data:WorkbenchData;patch:(fn:(d:WorkbenchData)=>WorkbenchData)=>void}) {
  const [range,setRange]=useState<"day"|"week"|"month"|"year">("month");
  const [tab,setTab]=useState<"ledger"|"shopping"|"advice">("ledger");
  const [quick,setQuick]=useState("");
  const [editor,setEditor]=useState<FinanceEntry|null|"new">(null);
  const [categoryForm,setCategoryForm]=useState({name:"",type:"expense" as "income"|"expense",color:"#D48793"});
  const [showCategory,setShowCategory]=useState(false);
  const [shopForm,setShopForm]=useState({name:"",price:""});
  const [goalForm,setGoalForm]=useState({name:"",target:"",saved:""});
  const [incomeInput,setIncomeInput]=useState("");
  const [deleteTarget,setDeleteTarget]=useState<{kind:"entry"|"shop"|"goal"|"category";id:string}|null>(null);
  const today=todayKey();
  const rangeStart=useMemo(()=>{
    const d=new Date();
    if(range==="week")d.setDate(d.getDate()-6);
    if(range==="month")d.setDate(1);
    if(range==="year"){d.setMonth(0);d.setDate(1)}
    return dayKey(d);
  },[range]);
  const scoped=data.financeEntries.filter(e=>e.date>=rangeStart&&e.date<=today);
  const expenseTotal=scoped.filter(e=>e.type==="expense").reduce((s,e)=>s+e.amount,0);
  const incomeTotal=scoped.filter(e=>e.type==="income").reduce((s,e)=>s+e.amount,0);
  const expenseGroups=Object.entries(scoped.filter(e=>e.type==="expense").reduce((acc,e)=>{acc[e.categoryId]=(acc[e.categoryId]||0)+e.amount;return acc},{} as Record<string,number>)).sort((a,b)=>b[1]-a[1]);
  const colors=expenseGroups.map(([id])=>data.financeCategories.find(c=>c.id===id)?.color||"#aaa");
  let angle=0;const donut=expenseGroups.length?`conic-gradient(${expenseGroups.map(([,value],i)=>{const from=angle;angle+=value/expenseTotal*360;return `${colors[i]} ${from}deg ${angle}deg`}).join(",")})`:"#f1e8e5";
  const trend=useMemo(()=>{
    const count=range==="year"?12:range==="month"?Math.min(new Date().getDate(),14):7;const result:{label:string;income:number;expense:number}[]=[];
    for(let i=count-1;i>=0;i--){const d=new Date();if(range==="year"){d.setMonth(d.getMonth()-i);d.setDate(1)}else d.setDate(d.getDate()-i);const key=range==="year"?`${d.getFullYear()}-${pad(d.getMonth()+1)}`:dayKey(d);const matches=data.financeEntries.filter(e=>range==="year"?e.date.startsWith(key):e.date===key);result.push({label:range==="year"?`${d.getMonth()+1}月`:`${d.getMonth()+1}/${d.getDate()}`,income:matches.filter(e=>e.type==="income").reduce((s,e)=>s+e.amount,0),expense:matches.filter(e=>e.type==="expense").reduce((s,e)=>s+e.amount,0)})}return result;
  },[data.financeEntries,range]);
  const parseEntry=()=>{
    const text=quick.trim();if(!text)return;
    const d=new Date();if(/昨天/.test(text))d.setDate(d.getDate()-1);else if(/前天/.test(text))d.setDate(d.getDate()-2);
    let time=`${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`;const tm=text.match(/(?:上午|中午|下午|晚上)?\s*(\d{1,2})[点:：](\d{1,2})?/);if(tm){let h=Number(tm[1]);if(/下午|晚上/.test(tm[0])&&h<12)h+=12;if(/中午/.test(tm[0])&&h<11)h+=12;time=`${pad(h)}:${pad(Number(tm[2]||0))}`}
    const nums=[...text.matchAll(/(\d+(?:\.\d{1,2})?)\s*(?:元|块)?/g)].map(m=>Number(m[1]));const amount=nums[nums.length-1]||0;if(!amount)return;
    const isIncome=/收入|工资|奖金|红包|卖闲置|收到|转入|生活费/.test(text);const map:[RegExp,string][]=[[/饭|吃|餐|肉片|外卖|早餐|午餐|晚餐/,"餐饮"],[/奶茶|咖啡|茶|饮料/,"饮品"],[/地铁|打车|公交|滴滴/,"交通"],[/房租|租金/,"房租"],[/普拉提|健身|瑜伽/,"运动"],[/书|课程|学习/,"学习"],[/衣服|裙|鞋|服饰/,"服饰"],[/护肤|化妆|美容/,"美容"],[/工资/,"工资"],[/红包/,"红包"],[/闲置/,"卖闲置"],[/旅行|酒店|机票/,"旅行"],[/快递/,"快递"],[/医院|药|医疗/,"医疗"],[/游戏/,"游戏"]];
    const name=map.find(([key])=>key.test(text))?.[1]||(isIncome?"其他收入":"其他");let cat=data.financeCategories.find(c=>c.type===(isIncome?"income":"expense")&&c.name===name);if(!cat)cat=data.financeCategories.find(c=>c.type===(isIncome?"income":"expense"));
    patch(x=>({...x,financeEntries:[...x.financeEntries,{id:uid(),type:isIncome?"income":"expense",categoryId:cat!.id,amount,note:text.replace(/昨天|前天/g,"").trim(),date:dayKey(d),time,updatedAt:Date.now()}]}));setQuick("");
  };
  const addShopping=(e:FormEvent)=>{e.preventDefault();if(!shopForm.name.trim())return;patch(d=>({...d,shoppingItems:[...d.shoppingItems,{id:uid(),name:shopForm.name.trim(),price:Number(shopForm.price)||0,purchased:false,updatedAt:Date.now()}]}));setShopForm({name:"",price:""})};
  const addGoal=(e:FormEvent)=>{e.preventDefault();if(!goalForm.name.trim())return;patch(d=>({...d,savingsGoals:[...d.savingsGoals,{id:uid(),name:goalForm.name.trim(),target:Number(goalForm.target)||0,saved:Number(goalForm.saved)||0,updatedAt:Date.now()}]}));setGoalForm({name:"",target:"",saved:""})};
  const saveCategory=(e:FormEvent)=>{e.preventDefault();if(!categoryForm.name.trim())return;patch(d=>({...d,financeCategories:[...d.financeCategories,{id:uid(),...categoryForm,name:categoryForm.name.trim(),updatedAt:Date.now()}]}));setShowCategory(false);setCategoryForm({name:"",type:"expense",color:"#D48793"})};
  const remove=()=>{if(!deleteTarget)return;patch(d=>deleteTarget.kind==="entry"?{...d,financeEntries:d.financeEntries.filter(x=>x.id!==deleteTarget.id)}:deleteTarget.kind==="shop"?{...d,shoppingItems:d.shoppingItems.filter(x=>x.id!==deleteTarget.id)}:deleteTarget.kind==="goal"?{...d,savingsGoals:d.savingsGoals.filter(x=>x.id!==deleteTarget.id)}:{...d,financeCategories:d.financeCategories.filter(x=>x.id!==deleteTarget.id)});setDeleteTarget(null)};
  const unbought=data.shoppingItems.filter(x=>!x.purchased).reduce((s,x)=>s+x.price,0);
  const adviceRatio=data.financeSettings.monthlyIncome?Math.min(60,Math.max(10,Math.round((data.financeSettings.monthlyIncome-expenseTotal)/data.financeSettings.monthlyIncome*100))):null;
  return <div className="page finance-page">
    <header className="finance-hero"><div><span className="eyebrow">MY MONEY GARDEN</span><h1>让每一笔钱，都去想去的地方</h1><p>认真记录，轻松看见生活的选择与积累。</p></div><div className="privacy-income"><i>♡</i><span>收入隐私保护已开启<small>所有收入金额默认隐藏</small></span></div></header>
    <nav className="growth-tabs finance-tabs"><button className={tab==="ledger"?"active":""} onClick={()=>setTab("ledger")}>记账看板</button><button className={tab==="shopping"?"active":""} onClick={()=>setTab("shopping")}>购物与攒钱</button><button className={tab==="advice"?"active":""} onClick={()=>setTab("advice")}>理财建议</button></nav>
    {tab==="ledger"&&<section>
      <div className="finance-toolbar"><div className="range-tabs">{([["day","当天"],["week","本周"],["month","本月"],["year","本年"]] as const).map(([id,label])=><button className={range===id?"active":""} key={id} onClick={()=>setRange(id)}>{label}</button>)}</div><div><button className="secondary" onClick={()=>setShowCategory(true)}>管理分类</button><button onClick={()=>setEditor("new")}>＋ 记一笔</button></div></div>
      <div className="finance-summary"><article className="income"><span>收入</span><h2>¥ ••••••</h2><p>已记录 {scoped.filter(e=>e.type==="income").length} 笔 · 金额已隐藏</p></article><article className="expense"><span>支出</span><h2>¥ {expenseTotal.toFixed(2)}</h2><p>共 {scoped.filter(e=>e.type==="expense").length} 笔</p></article><article className="balance"><span>收支状态</span><h2>{incomeTotal>=expenseTotal?"有结余":"需留意"}</h2><p>不展示具体收入和结余金额</p></article></div>
      <div className="chart-grid"><article className="donut-card"><div className="finance-card-head"><h2>支出分类</h2><span>百分比</span></div><div className="donut-wrap"><div className="donut" style={{background:donut}}><i><b>{expenseGroups.length}</b><small>个分类</small></i></div><div className="donut-legend">{expenseGroups.slice(0,6).map(([id,value],i)=><span key={id}><i style={{background:colors[i]}}></i><b>{data.financeCategories.find(c=>c.id===id)?.name}</b><small>{expenseTotal?Math.round(value/expenseTotal*100):0}%</small></span>)}{!expenseGroups.length&&<p>记下支出后，这里会长出一朵分类小花。</p>}</div></div></article><article className="trend-card"><div className="finance-card-head"><h2>收支趋势</h2><span><i className="green"></i>收入 <i className="pink"></i>支出</span></div><TrendCanvas points={trend}/><div className="trend-labels">{trend.map((p,i)=><span key={i}>{p.label}</span>)}</div></article></div>
      <div className="quick-ledger"><span>✦</span><input value={quick} onChange={e=>setQuick(e.target.value)} onKeyDown={e=>e.key==="Enter"&&parseEntry()} placeholder="试试说：昨天中午吃了水煮肉片花了30" /><button onClick={parseEntry}>自动记账</button></div>
      <section className="ledger-timeline"><div className="finance-card-head"><h2>账目时间线</h2><span>同一天按时间从早到晚</span></div>{[...new Set(scoped.map(e=>e.date))].sort((a,b)=>b.localeCompare(a)).map(date=><div className="ledger-day" key={date}><header><b>{displayDate(date)}</b><span>{weekday(date)}</span></header>{scoped.filter(e=>e.date===date).sort((a,b)=>a.time.localeCompare(b.time)).map(entry=>{const cat=data.financeCategories.find(c=>c.id===entry.categoryId);return <article key={entry.id}><time>{entry.time}</time><i style={{background:cat?.color}}>{entry.type==="income"?"＋":"－"}</i><button onClick={()=>setEditor(entry)}><b>{cat?.name||"未分类"}</b><span>{entry.note}</span></button><strong className={entry.type}>{entry.type==="income"?"¥ ••••":`- ¥ ${entry.amount.toFixed(2)}`}</strong><button className="more" onClick={()=>setDeleteTarget({kind:"entry",id:entry.id})}>×</button></article>})}</div>)}{!scoped.length&&<Empty text="这一段时间还没有账目，第一笔也可以很轻松。" />}</section>
      {editor&&<FinanceEditor item={editor==="new"?null:editor} data={data} patch={patch} close={()=>setEditor(null)}/>}
      {showCategory&&<Modal title="添加收支分类" onClose={()=>setShowCategory(false)}><form className="editor-form" onSubmit={saveCategory}><label>类型<select value={categoryForm.type} onChange={e=>setCategoryForm({...categoryForm,type:e.target.value as "income"|"expense"})}><option value="expense">支出</option><option value="income">收入</option></select></label><label>分类名称<input value={categoryForm.name} onChange={e=>setCategoryForm({...categoryForm,name:e.target.value})} required/></label><label>颜色<input type="color" value={categoryForm.color} onChange={e=>setCategoryForm({...categoryForm,color:e.target.value})}/></label><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowCategory(false)}>取消</button><button>保存分类</button></div></form></Modal>}
    </section>}
    {tab==="shopping"&&<section className="shopping-layout">
      <article className="shopping-panel"><div className="finance-card-head"><div><span className="eyebrow">WISH LIST</span><h2>想买的小东西</h2></div><b>还需攒 ¥ {unbought.toFixed(2)}</b></div><form className="shop-form" onSubmit={addShopping}><input value={shopForm.name} onChange={e=>setShopForm({...shopForm,name:e.target.value})} placeholder="想买什么？"/><input type="number" value={shopForm.price} onChange={e=>setShopForm({...shopForm,price:e.target.value})} placeholder="价格"/><button>添加</button></form><div className="shopping-list">{data.shoppingItems.map(item=><div key={item.id}><label><input type="checkbox" checked={item.purchased} onChange={()=>patch(d=>({...d,shoppingItems:d.shoppingItems.map(x=>x.id===item.id?{...x,purchased:!x.purchased,updatedAt:Date.now()}:x)}))}/><i></i></label><input className={item.purchased?"strike":""} value={item.name} onChange={e=>patch(d=>({...d,shoppingItems:d.shoppingItems.map(x=>x.id===item.id?{...x,name:e.target.value,updatedAt:Date.now()}:x)}))}/><b>¥ {item.price.toFixed(2)}</b><button onClick={()=>setDeleteTarget({kind:"shop",id:item.id})}>×</button></div>)}</div></article>
      <article className="savings-panel"><div className="finance-card-head"><div><span className="eyebrow">SAVING PLAN</span><h2>攒钱计划</h2></div></div><form className="goal-money-form" onSubmit={addGoal}><input value={goalForm.name} onChange={e=>setGoalForm({...goalForm,name:e.target.value})} placeholder="目标名称"/><input type="number" value={goalForm.target} onChange={e=>setGoalForm({...goalForm,target:e.target.value})} placeholder="目标金额"/><input type="number" value={goalForm.saved} onChange={e=>setGoalForm({...goalForm,saved:e.target.value})} placeholder="已存"/><button>＋</button></form>{data.savingsGoals.map(goal=>{const pct=goal.target?Math.min(100,Math.round(goal.saved/goal.target*100)):0;return <section className="saving-goal" key={goal.id}><header><input value={goal.name} onChange={e=>patch(d=>({...d,savingsGoals:d.savingsGoals.map(x=>x.id===goal.id?{...x,name:e.target.value,updatedAt:Date.now()}:x)}))}/><button onClick={()=>setDeleteTarget({kind:"goal",id:goal.id})}>×</button></header><div className="saving-numbers"><span>已完成 <b>{pct}%</b></span><span>目标 ¥ {goal.target.toFixed(0)}</span></div><div className="saving-progress"><i style={{width:`${pct}%`}}/></div><label>当前已存<input type="number" value={goal.saved} onChange={e=>patch(d=>({...d,savingsGoals:d.savingsGoals.map(x=>x.id===goal.id?{...x,saved:Number(e.target.value),updatedAt:Date.now()}:x)}))}/></label></section>})}</article>
    </section>}
    {tab==="advice"&&<section className="advice-layout">
      <article className="income-setting"><span className="eyebrow">PRIVATE INPUT</span><h2>收入设置</h2><p>录入后只用于计算比例建议。保存后，页面不会回显具体数字。</p><div><input type="password" inputMode="decimal" value={incomeInput} onChange={e=>setIncomeInput(e.target.value)} placeholder={data.financeSettings.monthlyIncome?"当前收入已安全保存":"输入月收入"}/><button onClick={()=>{if(Number(incomeInput)>0){patch(d=>({...d,financeSettings:{monthlyIncome:Number(incomeInput),updatedAt:Date.now()}}));setIncomeInput("")}}}>保存</button></div><small>数据仅保存在此设备，不会上传。</small></article>
      <article className="advice-cards"><div><i>01</i><span><h3>先建立安全垫</h3><p>优先准备可覆盖 3–6 个月必要支出的应急资金，并放在流动性较好的位置。</p></span></div><div><i>02</i><span><h3>量入为出</h3><p>{adviceRatio?`结合当前记录，可先尝试把约 ${adviceRatio}% 的收入用于储蓄与长期目标，再按生活变化调整。`:"录入收入并坚持记账后，工作台会给出不显示金额的储蓄比例参考。"}</p></span></div><div><i>03</i><span><h3>风险与自己匹配</h3><p>购买金融产品前，了解风险等级、期限、费用和流动性；不使用借款进行投资。</p></span></div><div><i>04</i><span><h3>保持分散与长期</h3><p>先保障日常现金流，再根据风险承受能力考虑低风险配置，避免把资金集中在单一产品。</p></span></div></article>
      <p className="finance-disclaimer">以上为一般性财务整理与风险教育，不构成投资建议；产品选择请结合自身情况并通过正规金融机构核实。</p>
    </section>}
    {deleteTarget&&<Modal title="确认删除这条财务记录吗？" onClose={()=>setDeleteTarget(null)}><p className="modal-copy">删除后会影响相应统计，小熊再帮你确认一次。</p><div className="modal-actions"><button className="secondary" onClick={()=>setDeleteTarget(null)}>先保留</button><button className="danger" onClick={remove}>确认删除</button></div></Modal>}
  </div>;
}

function FinanceEditor({item,data,patch,close}:{item:FinanceEntry|null;data:WorkbenchData;patch:(fn:(d:WorkbenchData)=>WorkbenchData)=>void;close:()=>void}) {
  const [form,setForm]=useState({type:item?.type||"expense" as "income"|"expense",categoryId:item?.categoryId||data.financeCategories.find(c=>c.type==="expense")!.id,amount:item?.amount?String(item.amount):"",note:item?.note||"",date:item?.date||todayKey(),time:item?.time||`${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`});
  const submit=(e:FormEvent)=>{e.preventDefault();if(!(Number(form.amount)>0))return;patch(d=>({...d,financeEntries:item?d.financeEntries.map(x=>x.id===item.id?{...x,...form,amount:Number(form.amount),updatedAt:Date.now()}:x):[...d.financeEntries,{...form,id:uid(),amount:Number(form.amount),updatedAt:Date.now()}]}));close()};
  return <Modal title={item?"编辑账目":"手动记一笔"} onClose={close}><form className="editor-form" onSubmit={submit}><div className="two-col"><label>收支类型<select value={form.type} onChange={e=>{const type=e.target.value as "income"|"expense";setForm({...form,type,categoryId:data.financeCategories.find(c=>c.type===type)!.id})}}><option value="expense">支出</option><option value="income">收入</option></select></label><label>分类<select value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}>{data.financeCategories.filter(c=>c.type===form.type).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div><label>金额<input type="number" min=".01" step=".01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/></label><label>备注<input value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label><div className="two-col"><label>日期<input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>时间<input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={close}>取消</button><button>保存账目</button></div></form></Modal>;
}

function Growth({ data, patch }: { data: WorkbenchData; patch: (fn:(d:WorkbenchData)=>WorkbenchData)=>void }) {
  const [tab,setTab]=useState<"path"|"learn"|"goals">("path");
  const [openSkill,setOpenSkill]=useState<string>("agent");
  const [openTrack,setOpenTrack]=useState<string>("ielts");
  const [sourceText,setSourceText]=useState("");
  const [goalText,setGoalText]=useState("");
  const [goalKind,setGoalKind]=useState<Goal["kind"]>("证书");
  const [deleteGoal,setDeleteGoal]=useState<string|null>(null);
  const today=todayKey();
  const checked=(trackId:string)=>data.checkins.some(c=>c.trackId===trackId&&c.date===today);
  const toggleTrack=(trackId:string)=>{
    patch(d=>{
      const hit=d.checkins.find(c=>c.trackId===trackId&&c.date===today);
      return {...d,checkins:hit?d.checkins.filter(c=>c.id!==hit.id):[...d.checkins,{id:uid(),trackId,date:today,note:"完成今日学习",updatedAt:Date.now()}]};
    });
  };
  const cycleSkill=(id:string)=>{
    const states:ProgressState[]=["未开始","进行中","已掌握"];
    patch(d=>({...d,skills:d.skills.map(s=>s.id===id?{...s,progress:states[(states.indexOf(s.progress)+1)%3],lastCheckin:today,updatedAt:Date.now()}:s)}));
  };
  const summarize=(id:string)=>{
    const sentences=sourceText.split(/[。！？\n]+/).map(x=>x.trim()).filter(Boolean).slice(0,4);
    if(!sentences.length)return;
    patch(d=>({...d,skills:d.skills.map(s=>s.id===id?{...s,notes:`资料提炼：${sentences.map((x,i)=>`${i+1}. ${x}`).join("；")}`,updatedAt:Date.now()}:s)}));
    setSourceText("");
  };
  const addGoal=(e:FormEvent)=>{
    e.preventDefault();if(!goalText.trim())return;
    patch(d=>({...d,goals:[...d.goals,{id:uid(),kind:goalKind,text:goalText.trim(),done:false,updatedAt:Date.now()}]}));setGoalText("");
  };
  const mastered=data.skills.filter(s=>s.progress==="已掌握").length;
  const inProgress=data.skills.filter(s=>s.progress==="进行中").length;
  return <div className="page growth-page">
    <header className="growth-hero"><div><span className="eyebrow">RPA + AI GROWTH MAP</span><h1>把成长，变成看得见的路径</h1><p>先成为更专注的 RPA 开发者，再一步步走向 RPA + AI。</p><div className="growth-stats"><span><b>{inProgress}</b> 项进行中</span><span><b>{mastered}</b> 项已掌握</span><span><b>{data.checkins.filter(c=>c.date===today).length}</b> 项今日打卡</span></div></div><img src="/bears/bear-grid.jpg" alt="学习中的水彩小熊" /></header>
    <nav className="growth-tabs"><button className={tab==="path"?"active":""} onClick={()=>setTab("path")}>职业技能树</button><button className={tab==="learn"?"active":""} onClick={()=>setTab("learn")}>学习打卡</button><button className={tab==="goals"?"active":""} onClick={()=>setTab("goals")}>长期目标</button></nav>

    {tab==="path"&&<section>
      <div className="growth-section-head"><div><span className="eyebrow">CAREER PATH</span><h2>RPA + AI 技能路径</h2></div><p>点击技能卡片查看计划，再点击状态按钮推进进度。</p></div>
      <div className="skill-grid">{data.skills.map(skill=><article key={skill.id} className={`skill-card ${openSkill===skill.id?"open":""}`}>
        <button className="skill-summary" onClick={()=>setOpenSkill(openSkill===skill.id?"":skill.id)}><i>{skill.icon}</i><span><b>{skill.name}</b><small>{skill.points.slice(0,3).join(" · ")}</small></span><em className={skill.progress==="已掌握"?"mastered":skill.progress==="进行中"?"doing":""}>{skill.progress}</em></button>
        {openSkill===skill.id&&<div className="skill-detail">
          <div className="plan-columns"><div><h4>初级计划</h4>{skill.beginner.map(x=><p key={x}>○ {x}</p>)}</div><div><h4>进阶计划</h4>{skill.advanced.map(x=><p key={x}>◇ {x}</p>)}</div></div>
          <div className="knowledge"><h4>核心知识点</h4>{skill.points.map(x=><span key={x}>{x}</span>)}</div>
          <div className="resource-list"><h4>推荐资料</h4>{skill.resources.map(x=><p key={x}>↗ {x}</p>)}</div>
          {skill.notes&&<div className="skill-note"><b>我的总结</b><p>{skill.notes}</p></div>}
          <details className="material-box"><summary>粘贴我的资料并本地提炼</summary><textarea value={sourceText} onChange={e=>setSourceText(e.target.value)} placeholder="粘贴学习笔记或资料文字。工作台会在本地抽取前四个要点，不会上传。"/><button onClick={()=>summarize(skill.id)}>提炼到技能卡</button></details>
          <footer><small>{skill.lastCheckin?`最近打卡：${displayDate(skill.lastCheckin)}`:"还没有打卡"}</small><button onClick={()=>cycleSkill(skill.id)}>更新进度并打卡 →</button></footer>
        </div>}
      </article>)}</div>
    </section>}

    {tab==="learn"&&<section>
      <div className="growth-section-head"><div><span className="eyebrow">DAILY LEARNING</span><h2>今天学一点，就很好</h2></div><p>每项都有实际内容、阶段计划和独立打卡。</p></div>
      <div className="track-layout"><aside>{data.learningTracks.map(track=><button key={track.id} className={openTrack===track.id?"active":""} onClick={()=>setOpenTrack(track.id)}><i>{track.icon}</i><span>{track.name}<small>{track.subtitle}</small></span><b className={checked(track.id)?"checked":""}>{checked(track.id)?"✓":""}</b></button>)}</aside>
      {data.learningTracks.filter(t=>t.id===openTrack).map(track=><article className="track-detail" key={track.id}><div className="track-title"><div><span className="track-icon">{track.icon}</span><div><h2>{track.name}</h2><p>{track.subtitle}</p></div></div><button className={checked(track.id)?"checked":""} onClick={()=>toggleTrack(track.id)}>{checked(track.id)?"✓ 今日已打卡":"今日打卡"}</button></div>
        <div className="today-learning"><span>今日内容</span>{track.today.map(x=><p key={x}>✦ {x}</p>)}<blockquote>{track.material}</blockquote></div>
        <div className="stage-plan"><h3>阶段学习计划</h3>{track.plan.map((x,i)=><div key={x}><b>0{i+1}</b><span>{x}</span></div>)}</div>
        <div className="track-note"><label>我的学习记录<textarea value={data.checkins.find(c=>c.trackId===track.id&&c.date===today)?.note||""} onChange={e=>patch(d=>({...d,checkins:d.checkins.map(c=>c.trackId===track.id&&c.date===today?{...c,note:e.target.value,updatedAt:Date.now()}:c)}))} placeholder={checked(track.id)?"写下今天实际学了什么…":"打卡后可以记录实际学习内容"}/></label></div>
      </article>)}</div>
    </section>}

    {tab==="goals"&&<section>
      <div className="growth-section-head"><div><span className="eyebrow">LONG-TERM DREAMS</span><h2>想抵达的地方，一件件写下来</h2></div><p>目标可以直接点击文字编辑，完成时轻轻勾选。</p></div>
      <form className="goal-form" onSubmit={addGoal}><select value={goalKind} onChange={e=>setGoalKind(e.target.value as Goal["kind"])}><option>证书</option><option>副业</option><option>技能</option></select><input value={goalText} onChange={e=>setGoalText(e.target.value)} placeholder="添加一个长期目标…" /><button>＋ 添加目标</button></form>
      <div className="goal-columns">{(["证书","副业","技能"] as Goal["kind"][]).map(kind=><section className="goal-column" key={kind}><header><i>{kind==="证书"?"♢":kind==="副业"?"♡":"✦"}</i><div><h3>{kind==="证书"?"想考取的证":kind==="副业"?"想做的副业":"想拓展的技能"}</h3><small>{data.goals.filter(g=>g.kind===kind&&g.done).length}/{data.goals.filter(g=>g.kind===kind).length} 完成</small></div></header>{data.goals.filter(g=>g.kind===kind).map(goal=><div className="goal-row" key={goal.id}><label><input type="checkbox" checked={goal.done} onChange={()=>patch(d=>({...d,goals:d.goals.map(g=>g.id===goal.id?{...g,done:!g.done,updatedAt:Date.now()}:g)}))}/><i></i></label><input className={goal.done?"strike":""} value={goal.text} onChange={e=>patch(d=>({...d,goals:d.goals.map(g=>g.id===goal.id?{...g,text:e.target.value,updatedAt:Date.now()}:g)}))}/><button onClick={()=>setDeleteGoal(goal.id)}>×</button></div>)}{!data.goals.some(g=>g.kind===kind)&&<p className="goal-empty">还没有写下目标</p>}</section>)}</div>
    </section>}
    {deleteGoal&&<Modal title="删除这个长期目标吗？" onClose={()=>setDeleteGoal(null)}><p className="modal-copy">这条目标会从清单中移除，小熊再帮你确认一次。</p><div className="modal-actions"><button className="secondary" onClick={()=>setDeleteGoal(null)}>先保留</button><button className="danger" onClick={()=>{patch(d=>({...d,goals:d.goals.filter(g=>g.id!==deleteGoal)}));setDeleteGoal(null)}}>确认删除</button></div></Modal>}
  </div>;
}

function EventEditor({ item, date, data, patch, close }: { item: EventItem|null; date:string; data:WorkbenchData; patch:any; close:()=>void }) {
  const [form,setForm]=useState({date:item?.date||date,start:item?.start||"09:00",end:item?.end||"10:00",title:item?.title||"",categoryId:item?.categoryId||"work"});
  const submit=(e:FormEvent)=>{e.preventDefault();if(!form.title.trim())return;patch((d:WorkbenchData)=>({...d,events:item?d.events.map(x=>x.id===item.id?{...x,...form,title:form.title.trim(),updatedAt:Date.now()}:x):[...d.events,{...form,title:form.title.trim(),id:uid(),updatedAt:Date.now()}]}));close();};
  return <Modal title={item?"编辑日程":"新建日程"} onClose={close}><form className="editor-form" onSubmit={submit}><label>事项名称<input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="准备作品集" required/></label><label>日期<input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><div className="two-col"><label>开始<input type="time" value={form.start} onChange={e=>setForm({...form,start:e.target.value})}/></label><label>结束<input type="time" value={form.end} onChange={e=>setForm({...form,end:e.target.value})}/></label></div><label>分类<select value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}>{data.categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><div className="modal-actions"><button type="button" className="secondary" onClick={close}>取消</button><button>保存日程</button></div></form></Modal>;
}

function MemoEditor({ patch, close }: { patch:any; close:()=>void }) {
  const [text,setText]=useState(""); const submit=(e:FormEvent)=>{e.preventDefault();if(!text.trim())return;patch((d:WorkbenchData)=>({...d,memos:d.memos.map(m=>({...m,order:m.order+1})).concat({id:uid(),text:text.trim(),order:0,createdAt:Date.now(),updatedAt:Date.now()})}));close();};
  return <Modal title="写一张小纸条" onClose={close}><form className="editor-form" onSubmit={submit}><label>想记下什么？<textarea autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder="突然想到…" rows={4}/></label><div className="modal-actions"><button type="button" className="secondary" onClick={close}>取消</button><button>收进备忘</button></div></form></Modal>;
}

function Jobs({data,patch}:{data:WorkbenchData;patch:(fn:(d:WorkbenchData)=>WorkbenchData)=>void}) {
  const statuses:JobStatus[]=["感兴趣","已投递","已面试","已拒绝"];
  const [keyword,setKeyword]=useState("RPA");
  const [status,setStatus]=useState<JobStatus|"全部">("全部");
  const [showAdd,setShowAdd]=useState(false);
  const [deleteId,setDeleteId]=useState<string|null>(null);
  const [form,setForm]=useState({company:"",title:"",salary:"",companySize:"",location:"杭州",jd:"",url:""});
  const filtered=data.jobs.filter(j=>{
    const text=`${j.title} ${j.jd}`.toLowerCase();
    const words=keyword.toLowerCase().split(/[\s/、]+/).filter(Boolean);
    return (!words.length||words.some(w=>text.includes(w)))&&j.companySize>100&&j.location.includes("杭州")&&(status==="全部"||j.status===status);
  }).sort((a,b)=>b.updatedAt-a.updatedAt);
  const addJob=(e:FormEvent)=>{
    e.preventDefault(); const size=Number(form.companySize);
    if(!form.company.trim()||!form.title.trim()||!form.jd.trim()||!Number.isFinite(size))return;
    const url=/^https?:\/\//i.test(form.url)?form.url:"";
    const now=Date.now();
    patch(d=>({...d,jobs:[{id:uid(),company:form.company.trim(),title:form.title.trim(),salary:form.salary.trim()||"薪资面议",companySize:size,location:form.location.trim()||"杭州",jd:form.jd.trim(),url,source:"手动录入",publishedAt:todayKey(),status:"感兴趣",statusUpdatedAt:now,updatedAt:now},...d.jobs]}));
    setForm({company:"",title:"",salary:"",companySize:"",location:"杭州",jd:"",url:""});setShowAdd(false);
  };
  const setJobStatus=(id:string,next:JobStatus)=>patch(d=>({...d,jobs:d.jobs.map(j=>j.id===id?{...j,status:next,statusUpdatedAt:Date.now(),updatedAt:Date.now()}:j)}));
  return <div className="page jobs-page">
    <section className="jobs-hero">
      <div><span className="eyebrow">CAREER OPPORTUNITIES</span><h1>去遇见更适合你的机会</h1><p>聚焦杭州 · RPA / 影刀 · 100 人以上公司，所有追踪状态仅保存在本机。</p></div>
      <div className="job-match"><i>✦</i><div><b>{filtered.length} 个匹配岗位</b><small>按你的期望自动筛选</small></div></div>
    </section>
    <div className="growth-tabs jobs-tabs">
      {(["全部",...statuses] as const).map(s=><button key={s} className={status===s?"active":""} onClick={()=>setStatus(s)}>{s}<small>{s==="全部"?data.jobs.length:data.jobs.filter(j=>j.status===s).length}</small></button>)}
    </div>
    <section className="job-source-note">
      <div><span className="eyebrow">PUBLIC JOB SOURCES</span><h2>公开岗位入口</h2><p>无需关联账号。岗位可能随时下线，公司规模与薪资请在投递前再次核验。</p></div>
      <div><a href="https://m.zhipin.com/zhaopin/ca858bd04f5d99261HV-09m5GQ~~/" target="_blank" rel="noreferrer">查看 BOSS 公开搜索</a><a className="secondary" href="https://mwenku.51job.com/hangzhou_jobs/202601/Python/" target="_blank" rel="noreferrer">查看前程无忧公开页</a></div>
    </section>
    <div className="job-toolbar">
      <label><span>⌕</span><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="搜索 RPA、影刀、AI Agent…"/></label>
      <button onClick={()=>setShowAdd(true)}>＋ 录入岗位</button>
    </div>
    <section className="job-rule">
      <span>当前筛选</span><b>JD 含“{keyword||"不限"}”</b><b>公司人数 ＞ 100</b><b>杭州</b>
    </section>
    <section className="job-grid">
      {filtered.map(job=><article className="job-card" key={job.id}>
        <header><div className="company-mark">{job.company.slice(0,1)}</div><div><span>{job.company}</span><h2>{job.title}</h2></div><button onClick={()=>setDeleteId(job.id)} aria-label={`删除${job.title}`}>×</button></header>
        <div className="job-meta"><b>{job.salary}</b><span>杭州</span><span>{job.companySize>=1000?"1000 人以上":`${job.companySize}–499 人`}</span></div>
        <p>{job.jd}</p>
        <div className="match-reasons"><span>✓ RPA 方向</span><span>✓ 规模符合</span><span>✓ 杭州岗位</span></div>
        <footer><div><small>{job.source}</small><time>更新于 {job.publishedAt}</time></div><select value={job.status} onChange={e=>setJobStatus(job.id,e.target.value as JobStatus)} aria-label="更新求职状态">{statuses.map(s=><option key={s}>{s}</option>)}</select>{job.url?<a href={job.url} target="_blank" rel="noreferrer">查看 / 投递 →</a>:<span className="no-link">暂无链接</span>}</footer>
      </article>)}
      {!filtered.length&&<Empty text="暂时没有符合全部条件的岗位，换个关键词或录入一条试试吧。"/>}
    </section>
    <section className="job-pipeline"><div><span className="eyebrow">APPLICATION TRACKER</span><h2>我的求职进度</h2></div>{statuses.map(s=><article key={s}><b>{data.jobs.filter(j=>j.status===s).length}</b><span>{s}</span><i style={{width:`${Math.max(8,data.jobs.length?data.jobs.filter(j=>j.status===s).length/data.jobs.length*100:0)}%`}}/></article>)}</section>
    {showAdd&&<Modal title="录入一个新岗位" onClose={()=>setShowAdd(false)}><form className="editor-form job-editor" onSubmit={addJob}><div className="two-col"><label>公司名称<input value={form.company} onChange={e=>setForm({...form,company:e.target.value})} required/></label><label>岗位名称<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></label></div><div className="two-col"><label>薪资范围<input value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})} placeholder="如 10–15K"/></label><label>公司人数<input type="number" min="1" value={form.companySize} onChange={e=>setForm({...form,companySize:e.target.value})} required/></label></div><label>工作地点<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label><label>JD 摘要<textarea rows={4} value={form.jd} onChange={e=>setForm({...form,jd:e.target.value})} placeholder="粘贴包含 RPA 或影刀的岗位描述…" required/></label><label>投递链接（可选）<input type="url" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://"/></label><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowAdd(false)}>取消</button><button>保存岗位</button></div></form></Modal>}
    {deleteId&&<Modal title="删除这个岗位吗？" onClose={()=>setDeleteId(null)}><p className="modal-copy">岗位和当前投递状态都会从本机移除。</p><div className="modal-actions"><button className="secondary" onClick={()=>setDeleteId(null)}>先保留</button><button className="danger" onClick={()=>{patch(d=>({...d,jobs:d.jobs.filter(j=>j.id!==deleteId)}));setDeleteId(null)}}>确认删除</button></div></Modal>}
  </div>;
}

function Travel({data,patch}:{data:WorkbenchData;patch:(fn:(d:WorkbenchData)=>WorkbenchData)=>void}) {
  const [tab,setTab]=useState<"dreams"|"plans"|"local"|"dates">("dreams");
  const [selectedId,setSelectedId]=useState(data.travelPlans[0]?.id||"");
  const [destination,setDestination]=useState({place:"",country:""});
  const [showTrip,setShowTrip]=useState(false);
  const [tripForm,setTripForm]=useState({name:"",startDate:todayKey(),endDate:addDays(todayKey(),2)});
  const [itinerary,setItinerary]=useState({day:"1",time:"09:00",content:""});
  const [packingForm,setPackingForm]=useState({category:"其他杂物类",name:""});
  const [templateForm,setTemplateForm]=useState({category:"其他杂物类",name:""});
  const [showSpecial,setShowSpecial]=useState(false);
  const [specialForm,setSpecialForm]=useState({title:"",date:todayKey(),kind:"节日" as SpecialDay["kind"],calendar:"公历" as SpecialDay["calendar"],lunarDate:"",reminderDays:"3"});
  const [deleteTarget,setDeleteTarget]=useState<{kind:"destination"|"trip"|"special"|"template"|"itinerary"|"packing";id:string}|null>(null);
  const [weather,setWeather]=useState<{temperature:number;code:number}|null>(null);
  const active=data.travelPlans.find(x=>x.id===selectedId)||data.travelPlans[0];
  useEffect(()=>{if(tab!=="local"||weather)return;fetch("https://api.open-meteo.com/v1/forecast?latitude=30.2741&longitude=120.1551&current=temperature_2m,weather_code&timezone=Asia%2FShanghai").then(r=>r.json()).then(j=>setWeather({temperature:j.current.temperature_2m,code:j.current.weather_code})).catch(()=>{})},[tab,weather]);
  const addDestination=(e:FormEvent)=>{e.preventDefault();if(!destination.place.trim())return;patch(d=>({...d,destinations:[...d.destinations,{id:uid(),place:destination.place.trim(),country:destination.country.trim()||"待补充",visited:false,updatedAt:Date.now()}]}));setDestination({place:"",country:""})};
  const addTrip=(e:FormEvent)=>{e.preventDefault();if(!tripForm.name.trim()||tripForm.endDate<tripForm.startDate)return;const id=uid();patch(d=>({...d,travelPlans:[...d.travelPlans,{id,name:tripForm.name.trim(),startDate:tripForm.startDate,endDate:tripForm.endDate,itinerary:[],packing:d.packingTemplate.map(x=>({...x,id:uid(),checked:false})),updatedAt:Date.now()}]}));setSelectedId(id);setTripForm({name:"",startDate:todayKey(),endDate:addDays(todayKey(),2)});setShowTrip(false)};
  const updatePlan=(fn:(p:TravelPlan)=>TravelPlan)=>patch(d=>({...d,travelPlans:d.travelPlans.map(p=>p.id===active?.id?{...fn(p),updatedAt:Date.now()}:p)}));
  const addItinerary=(e:FormEvent)=>{e.preventDefault();if(!active||!itinerary.content.trim())return;updatePlan(p=>({...p,itinerary:[...p.itinerary,{id:uid(),day:Math.max(1,Number(itinerary.day)||1),time:itinerary.time,content:itinerary.content.trim()}]}));setItinerary({...itinerary,content:""})};
  const addPacking=(e:FormEvent)=>{e.preventDefault();if(!active||!packingForm.name.trim())return;updatePlan(p=>({...p,packing:[...p.packing,{id:uid(),category:packingForm.category,name:packingForm.name.trim(),checked:false}]}));setPackingForm({...packingForm,name:""})};
  const addSpecial=(e:FormEvent)=>{e.preventDefault();if(!specialForm.title.trim())return;patch(d=>({...d,specialDays:[...d.specialDays,{id:uid(),title:specialForm.title.trim(),date:specialForm.date,kind:specialForm.kind,calendar:specialForm.calendar,lunarDate:specialForm.calendar==="农历"?specialForm.lunarDate.trim():undefined,reminderDays:Number(specialForm.reminderDays)||3,updatedAt:Date.now()}]}));setShowSpecial(false);setSpecialForm({title:"",date:todayKey(),kind:"节日",calendar:"公历",lunarDate:"",reminderDays:"3"})};
  const remove=()=>{if(!deleteTarget)return;patch(d=>{
    if(deleteTarget.kind==="destination")return {...d,destinations:d.destinations.filter(x=>x.id!==deleteTarget.id)};
    if(deleteTarget.kind==="trip")return {...d,travelPlans:d.travelPlans.filter(x=>x.id!==deleteTarget.id)};
    if(deleteTarget.kind==="special")return {...d,specialDays:d.specialDays.filter(x=>x.id!==deleteTarget.id)};
    if(deleteTarget.kind==="template")return {...d,packingTemplate:d.packingTemplate.filter(x=>x.id!==deleteTarget.id)};
    return {...d,travelPlans:d.travelPlans.map(p=>p.id===active?.id?{...p,itinerary:deleteTarget.kind==="itinerary"?p.itinerary.filter(x=>x.id!==deleteTarget.id):p.itinerary,packing:deleteTarget.kind==="packing"?p.packing.filter(x=>x.id!==deleteTarget.id):p.packing,updatedAt:Date.now()}:p)};
  });if(deleteTarget.kind==="trip")setSelectedId("");setDeleteTarget(null)};
  const done=active?.packing.filter(x=>x.checked).length||0,total=active?.packing.length||0;
  const month=new Date().getMonth()+1;const rainy=weather?weather.code>=50:false;
  const season=month>=3&&month<=5?"春日":month>=6&&month<=8?"夏日":month>=9&&month<=11?"秋日":"冬日";
  const localIdeas=rainy?[
    ["书店与咖啡","去天目里或运河边找一家书店，慢慢看书写手账。","室内 · 雨天友好"],
    ["博物馆半日","选一座博物馆，再为自己安排一顿安静的晚餐。","室内 · 轻松"],
    ["手作体验","尝试陶艺、银饰或花艺，让注意力回到双手。","室内 · 治愈"],
  ]:[
    ["九溪轻徒步",`${season}沿九溪烟树慢慢走，带水并留意防晒。`,"户外 · 低强度"],
    ["西湖晨间散步","从北山街出发，避开人流，给自己一小时。","户外 · 免费"],
    ["运河边看落日","沿桥西历史街区散步，再选一家小店吃晚饭。","户外 · 松弛"],
  ];
  return <div className="page travel-page">
    <section className="travel-hero"><div><span className="eyebrow">MY LITTLE JOURNEYS</span><h1>把想去的远方，慢慢变成计划</h1><p>从目的地心愿、每日行程到打包清单，每一段期待都好好收进这里。</p></div><div className="travel-stamp"><b>{data.destinations.filter(x=>x.visited).length}</b><span>已抵达</span><small>{data.destinations.filter(x=>!x.visited).length} 个地方正在等你</small></div></section>
    <nav className="growth-tabs travel-tabs"><button className={tab==="dreams"?"active":""} onClick={()=>setTab("dreams")}>目的地清单</button><button className={tab==="plans"?"active":""} onClick={()=>setTab("plans")}>旅行计划</button><button className={tab==="local"?"active":""} onClick={()=>setTab("local")}>杭州独处</button><button className={tab==="dates"?"active":""} onClick={()=>setTab("dates")}>特别日子</button></nav>
    {tab==="dreams"&&<section className="travel-dreams"><div className="travel-section-head"><div><span className="eyebrow">DREAM DESTINATIONS</span><h2>总有一天，要亲自去看看</h2></div><p>去过的地方会留下温柔的勾选。</p></div><form className="destination-form" onSubmit={addDestination}><input value={destination.place} onChange={e=>setDestination({...destination,place:e.target.value})} placeholder="城市或目的地"/><input value={destination.country} onChange={e=>setDestination({...destination,country:e.target.value})} placeholder="国家 / 地区"/><button>＋ 添加</button></form><div className="destination-grid">{data.destinations.map(x=><article className={x.visited?"visited":""} key={x.id}><label><input type="checkbox" checked={x.visited} onChange={()=>patch(d=>({...d,destinations:d.destinations.map(y=>y.id===x.id?{...y,visited:!y.visited,updatedAt:Date.now()}:y)}))}/><i>{x.visited?"✓":"✈"}</i></label><div><span>{x.country}</span><h3>{x.place}</h3><small>{x.visited?"已经抵达过":"想去看看"}</small></div><button onClick={()=>setDeleteTarget({kind:"destination",id:x.id})}>×</button></article>)}</div></section>}
    {tab==="plans"&&<section><div className="travel-section-head"><div><span className="eyebrow">TRIP PLANNER</span><h2>一场旅行，一份独立计划</h2></div><button onClick={()=>setShowTrip(true)}>＋ 新建旅行</button></div><div className="trip-layout"><aside className="trip-list">{data.travelPlans.map(p=><button className={active?.id===p.id?"active":""} key={p.id} onClick={()=>setSelectedId(p.id)}><i>✦</i><span><b>{p.name}</b><small>{displayDate(p.startDate)} — {displayDate(p.endDate)}</small></span></button>)}{!data.travelPlans.length&&<Empty text="还没有旅行计划，先写下第一段期待吧。"/>}</aside>{active&&<div className="trip-detail"><header><div><span className="eyebrow">UPCOMING TRIP</span><input value={active.name} onChange={e=>updatePlan(p=>({...p,name:e.target.value}))}/><p>{active.startDate} 至 {active.endDate} · 共 {dateDiff(active.startDate,active.endDate)+1} 天</p></div><button onClick={()=>setDeleteTarget({kind:"trip",id:active.id})}>删除计划</button></header><div className="trip-columns"><section><h3>每日行程</h3><form className="itinerary-form" onSubmit={addItinerary}><input type="number" min="1" value={itinerary.day} onChange={e=>setItinerary({...itinerary,day:e.target.value})}/><input type="time" value={itinerary.time} onChange={e=>setItinerary({...itinerary,time:e.target.value})}/><input value={itinerary.content} onChange={e=>setItinerary({...itinerary,content:e.target.value})} placeholder="添加行程内容"/><button>添加</button></form><div className="itinerary-list">{[...active.itinerary].sort((a,b)=>a.day-b.day||a.time.localeCompare(b.time)).map(x=><article key={x.id}><b>DAY {x.day}</b><time>{x.time}</time><input value={x.content} onChange={e=>updatePlan(p=>({...p,itinerary:p.itinerary.map(y=>y.id===x.id?{...y,content:e.target.value}:y)}))}/><button onClick={()=>setDeleteTarget({kind:"itinerary",id:x.id})}>×</button></article>)}</div></section><section className="packing-panel"><div className="packing-head"><div><h3>打包清单</h3><span>{done} / {total} 已装好</span></div><b>{total?Math.round(done/total*100):0}%</b></div><div className="packing-progress"><i style={{width:`${total?done/total*100:0}%`}}/></div><form className="packing-add" onSubmit={addPacking}><select value={packingForm.category} onChange={e=>setPackingForm({...packingForm,category:e.target.value})}>{Object.keys(packingGroups).map(x=><option key={x}>{x}</option>)}</select><input value={packingForm.name} onChange={e=>setPackingForm({...packingForm,name:e.target.value})} placeholder="添加物品"/><button>＋</button></form>{Object.keys(packingGroups).map(group=>{const items=active.packing.filter(x=>x.category===group);return items.length?<div className="packing-group" key={group}><h4>{group}</h4>{items.map(x=><label key={x.id}><input type="checkbox" checked={x.checked} onChange={()=>updatePlan(p=>({...p,packing:p.packing.map(y=>y.id===x.id?{...y,checked:!y.checked}:y)}))}/><i></i><input className={x.checked?"strike":""} value={x.name} onChange={e=>updatePlan(p=>({...p,packing:p.packing.map(y=>y.id===x.id?{...y,name:e.target.value}:y)}))}/><button onClick={()=>setDeleteTarget({kind:"packing",id:x.id})}>×</button></label>)}</div>:null})}</section></div></div>}</div><section className="template-panel"><div><h3>固定必备物品模板</h3><p>新建旅行时会自动带入；这里的修改不会覆盖已有旅行。</p></div><form onSubmit={e=>{e.preventDefault();if(!templateForm.name.trim())return;patch(d=>({...d,packingTemplate:[...d.packingTemplate,{id:uid(),category:templateForm.category,name:templateForm.name.trim(),checked:false}]}));setTemplateForm({...templateForm,name:""})}}><select value={templateForm.category} onChange={e=>setTemplateForm({...templateForm,category:e.target.value})}>{Object.keys(packingGroups).map(x=><option key={x}>{x}</option>)}</select><input value={templateForm.name} onChange={e=>setTemplateForm({...templateForm,name:e.target.value})} placeholder="新增固定物品"/><button>添加</button></form><div>{data.packingTemplate.map(x=><span key={x.id}>{x.name}<button onClick={()=>setDeleteTarget({kind:"template",id:x.id})}>×</button></span>)}</div></section></section>}
    {tab==="local"&&<section><div className="local-weather"><div><span className="eyebrow">HANGZHOU · {season}</span><h2>{weather?`${weather.code>=50?"雨天":"晴好"} · ${weather.temperature}°C`:"按杭州当季推荐"}</h2><p>{weather?"已结合当前天气更新；无法联网时仍会提供季节建议。":"正在尝试获取无需账号的实时天气…"}</p></div><i>{rainy?"☂":"☼"}</i></div><div className="solo-grid">{localIdeas.map((x,i)=><article key={x[0]}><span>0{i+1} · {x[2]}</span><h3>{x[0]}</h3><p>{x[1]}</p><small>一个人也可以，把时间过得很漂亮。</small></article>)}</div></section>}
    {tab==="dates"&&<section><div className="travel-section-head"><div><span className="eyebrow">SPECIAL DAYS</span><h2>值得期待的日子，不要错过</h2></div><button onClick={()=>setShowSpecial(true)}>＋ 添加特别日子</button></div><div className="special-grid">{[...data.specialDays].sort((a,b)=>a.date.localeCompare(b.date)).map(x=><article key={x.id}><i>{x.kind==="生日"?"🎂":x.kind==="演唱会"?"♫":x.kind==="折扣"?"％":"✦"}</i><div><span>{x.kind} · {x.calendar}{x.lunarDate?` ${x.lunarDate}`:""}</span><h3>{x.title}</h3><p>{displayDate(x.date)} · 提前 {x.reminderDays} 天提醒</p></div><button onClick={()=>setDeleteTarget({kind:"special",id:x.id})}>×</button></article>)}</div></section>}
    {showTrip&&<Modal title="创建旅行计划" onClose={()=>setShowTrip(false)}><form className="editor-form" onSubmit={addTrip}><label>旅行名称<input value={tripForm.name} onChange={e=>setTripForm({...tripForm,name:e.target.value})} placeholder="例如：济州岛四日慢旅行" required/></label><div className="two-col"><label>出发日期<input type="date" value={tripForm.startDate} onChange={e=>setTripForm({...tripForm,startDate:e.target.value})}/></label><label>返程日期<input type="date" min={tripForm.startDate} value={tripForm.endDate} onChange={e=>setTripForm({...tripForm,endDate:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowTrip(false)}>取消</button><button>创建并带入清单</button></div></form></Modal>}
    {showSpecial&&<Modal title="添加特别日子" onClose={()=>setShowSpecial(false)}><form className="editor-form" onSubmit={addSpecial}><label>名称<input value={specialForm.title} onChange={e=>setSpecialForm({...specialForm,title:e.target.value})} placeholder="生日、演唱会或折扣日" required/></label><div className="two-col"><label>类型<select value={specialForm.kind} onChange={e=>setSpecialForm({...specialForm,kind:e.target.value as SpecialDay["kind"]})}><option>节日</option><option>折扣</option><option>演唱会</option><option>生日</option></select></label><label>历法<select value={specialForm.calendar} onChange={e=>setSpecialForm({...specialForm,calendar:e.target.value as SpecialDay["calendar"]})}><option>公历</option><option>农历</option></select></label></div>{specialForm.calendar==="农历"&&<label>农历日期说明<input value={specialForm.lunarDate} onChange={e=>setSpecialForm({...specialForm,lunarDate:e.target.value})} placeholder="例如：八月初五"/></label>}<div className="two-col"><label>{specialForm.calendar==="农历"?"下一次公历日期":"日期"}<input type="date" value={specialForm.date} onChange={e=>setSpecialForm({...specialForm,date:e.target.value})}/></label><label>提前提醒天数<input type="number" min="0" value={specialForm.reminderDays} onChange={e=>setSpecialForm({...specialForm,reminderDays:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowSpecial(false)}>取消</button><button>保存日子</button></div></form></Modal>}
    {deleteTarget&&<Modal title="确认删除这项内容吗？" onClose={()=>setDeleteTarget(null)}><p className="modal-copy">删除后会从当前设备和后续导出的 JSON 中移除。</p><div className="modal-actions"><button className="secondary" onClick={()=>setDeleteTarget(null)}>先保留</button><button className="danger" onClick={remove}>确认删除</button></div></Modal>}
  </div>;
}

function ComingSoon({view}:{view:View}) {
  const item=nav.find(n=>n.id===view)!;
  return <div className="page coming"><span className="eyebrow">NEXT CHAPTER</span><h1>{item.label}模块</h1><img src="/bears/bear-trio.jpg" alt="三只水彩小熊" /><h2>小熊正在认真搭建这里</h2><p>阶段一先把首页、日历与备忘照顾好。这个模块已经留好位置，会在后续阶段自然长出来。</p></div>;
}
