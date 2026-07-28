"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type View = "home" | "calendar" | "health" | "finance" | "jobs" | "travel" | "memos";
type Category = { id: string; name: string; color: string };
type EventItem = { id: string; date: string; start: string; end: string; title: string; categoryId: string; updatedAt: number };
type Todo = { id: string; date: string; text: string; done: boolean; order: number; updatedAt: number };
type Memo = { id: string; text: string; order: number; createdAt: number; updatedAt: number };
type WorkbenchData = {
  version: 1;
  exportedAt?: number;
  categories: Category[];
  events: EventItem[];
  todos: Todo[];
  memos: Memo[];
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

const categories: Category[] = [
  { id: "work", name: "工作", color: "#79A8E8" },
  { id: "life", name: "生活", color: "#81C7A6" },
  { id: "sport", name: "运动", color: "#F2A96B" },
  { id: "fun", name: "娱乐", color: "#A997D8" },
  { id: "other", name: "其他", color: "#A9A5A3" },
];

const seedData = (): WorkbenchData => {
  const today = todayKey();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const now = Date.now();
  return {
    version: 1,
    categories,
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
      setData(saved ? JSON.parse(saved) : seedData());
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
        setPendingImport(parsed);
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
      return { ...current, categories: [...cats.values()], events: merge(current.events, pendingImport.events), todos: merge(current.todos, pendingImport.todos), memos: merge(current.memos, pendingImport.memos) };
    });
    setPendingImport(null); setImportMode(null);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><img src="/bears/app-bear.jpg" alt="" /><div><strong>小熊工作台</strong><span>认真生活，也要拥抱自己</span></div></div>
        <nav>{nav.map((n) => <button key={n.id} className={view === n.id ? "active" : ""} onClick={() => go(n.id)}><i>{n.icon}</i><span>{n.label}</span>{["health","finance","jobs","travel"].includes(n.id) && <em>规划中</em>}</button>)}</nav>
        <div className="sync-box"><span>✦ 数据只在本机保存</span><button onClick={exportJSON}>导出 JSON</button><button className="secondary" onClick={() => fileRef.current?.click()}>导入 JSON</button></div>
      </aside>

      <main className="content">
        {view === "home" && <Dashboard data={data} go={go} toggleTodo={toggleTodo} />}
        {view === "calendar" && <Calendar data={data} dates={dates} selectedDate={selectedDate} setSelectedDate={setSelectedDate} category={category} toggleTodo={toggleTodo} move={move} onAdd={() => setEventModal("new")} onEdit={setEventModal} onDelete={setDeleteTarget} patch={patch} />}
        {view === "memos" && <Memos data={data} go={go} toggleTodo={toggleTodo} move={move} onAdd={() => setMemoModal(true)} onDelete={setDeleteTarget} patch={patch} />}
        {!["home","calendar","memos"].includes(view) && <ComingSoon view={view} />}
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

function Dashboard({ data, go, toggleTodo }: { data: WorkbenchData; go: (v: View, d?: string) => void; toggleTodo: (id: string) => void }) {
  const today = todayKey();
  const d = new Date();
  const todays = data.todos.filter((t) => t.date === today);
  const latest = [...data.memos].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  const greeting = greetings[Math.floor((d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % greetings.length)];
  return <div className="page dashboard">
    <header className="topbar"><div><p>{d.getFullYear()}年{d.getMonth()+1}月{d.getDate()}日 · {weekday(today)}</p><h1>早上好，今天也慢慢来 <span>♡</span></h1></div><button className="avatar" aria-label="个人设置"><img src="/bears/bear-grid.jpg" alt="" /></button></header>
    <section className="hero"><div className="hero-copy"><span className="eyebrow">TODAY&apos;S LITTLE NOTE</span><blockquote>“{greeting}”</blockquote><p>— 来自今天的小熊</p></div><img src="/bears/app-bear.jpg" alt="戴着蓝色蝴蝶结的水彩小熊" /></section>
    <div className="section-title"><div><span>今日概览</span><h2>把重要的事，轻轻接住</h2></div><button className="text-btn" onClick={() => go("calendar", today)}>查看今日日程 →</button></div>
    <section className="overview-grid">
      <button className="overview-card pink" onClick={() => go("calendar", today)}><div className="card-title"><span>今日待办</span><i>✓</i></div><strong>{todays.filter(t=>t.done).length}<small> / {todays.length}</small></strong><div className="progress"><i style={{width: `${todays.length ? todays.filter(t=>t.done).length/todays.length*100 : 0}%`}} /></div><p>{todays.length ? `完成 ${todays.filter(t=>t.done).length} 件啦，继续稳稳前进` : "今天还没有待办，给自己一点自由"}</p></button>
      <button className="overview-card cream" onClick={() => go("memos")}><div className="card-title"><span>临时备忘</span><i>✎</i></div>{latest.length ? <ul>{latest.map(m=><li key={m.id}>• {m.text}</li>)}</ul> : <p>还没有小纸条</p>}<span className="card-link">打开备忘 →</span></button>
      <div className="overview-card lilac"><div className="card-title"><span>今日打卡</span><i>✦</i></div><div className="checkin-row">{[["学习","20 min",true],["健身","普拉提",false],["职业","技能树",false]].map(([a,b,c])=><button key={String(a)} className={c ? "done" : ""}><i>{c ? "✓" : ""}</i><span><b>{a}</b><small>{b}</small></span></button>)}</div></div>
    </section>
    <section className="today-panel"><div className="panel-head"><div><span className="eyebrow">TODAY&apos;S PLAN</span><h2>今天的小计划</h2></div><button onClick={() => go("calendar", today)}>＋ 添加待办</button></div>{todays.length ? <div className="dashboard-todos">{todays.sort((a,b)=>a.order-b.order).map(t=><label key={t.id}><input type="checkbox" checked={t.done} onChange={()=>toggleTodo(t.id)} /><i></i><span className={t.done?"strike":""}>{t.text}</span><small>{t.done ? "已完成" : "待完成"}</small></label>)}</div> : <Empty text="今天还没有安排，先喝杯水吧。" />}</section>
  </div>;
}

function Calendar({ data, dates, selectedDate, setSelectedDate, category, toggleTodo, move, onAdd, onEdit, onDelete, patch }: any) {
  const [todoText, setTodoText] = useState("");
  const [quickText, setQuickText] = useState("");
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
    <div className="calendar-layout"><aside className="date-rail">{dates.map((date:string)=><button key={date} onClick={()=>setSelectedDate(date)} className={`${selectedDate===date?"selected":""} ${date===todayKey()?"today":""}`}><small>{weekday(date)}</small><strong>{new Date(`${date}T12:00:00`).getDate()}</strong><span>{date===todayKey()?"今天":`${new Date(`${date}T12:00:00`).getMonth()+1}月`}</span></button>)}</aside>
    <section className="day-detail"><div className="day-heading"><div><span>{displayDate(selectedDate)} · {weekday(selectedDate)}</span><h2>{selectedDate===todayKey()?"今天，温柔地完成这些事":"这一天的安排"}</h2></div><button className="secondary" onClick={onAdd}>＋ 添加日程</button></div>
      <div className="event-list">{data.events.filter((e:EventItem)=>e.date===selectedDate).sort((a:EventItem,b:EventItem)=>a.start.localeCompare(b.start)).map((e:EventItem)=><article className="event-card" key={e.id} style={{"--event":category(e.categoryId).color} as React.CSSProperties}><time>{e.start}<small>{e.end}</small></time><i></i><div><span>{category(e.categoryId).name}</span><button onClick={()=>onEdit(e)}>{e.title}</button></div><button className="more" onClick={()=>onDelete({kind:"event",id:e.id})} aria-label="删除日程">×</button></article>)}{!data.events.some((e:EventItem)=>e.date===selectedDate)&&<Empty text="这一天还空空的，留给期待也很好。" />}</div>
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

function EventEditor({ item, date, data, patch, close }: { item: EventItem|null; date:string; data:WorkbenchData; patch:any; close:()=>void }) {
  const [form,setForm]=useState({date:item?.date||date,start:item?.start||"09:00",end:item?.end||"10:00",title:item?.title||"",categoryId:item?.categoryId||"work"});
  const submit=(e:FormEvent)=>{e.preventDefault();if(!form.title.trim())return;patch((d:WorkbenchData)=>({...d,events:item?d.events.map(x=>x.id===item.id?{...x,...form,title:form.title.trim(),updatedAt:Date.now()}:x):[...d.events,{...form,title:form.title.trim(),id:uid(),updatedAt:Date.now()}]}));close();};
  return <Modal title={item?"编辑日程":"新建日程"} onClose={close}><form className="editor-form" onSubmit={submit}><label>事项名称<input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="准备作品集" required/></label><label>日期<input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><div className="two-col"><label>开始<input type="time" value={form.start} onChange={e=>setForm({...form,start:e.target.value})}/></label><label>结束<input type="time" value={form.end} onChange={e=>setForm({...form,end:e.target.value})}/></label></div><label>分类<select value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}>{data.categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><div className="modal-actions"><button type="button" className="secondary" onClick={close}>取消</button><button>保存日程</button></div></form></Modal>;
}

function MemoEditor({ patch, close }: { patch:any; close:()=>void }) {
  const [text,setText]=useState(""); const submit=(e:FormEvent)=>{e.preventDefault();if(!text.trim())return;patch((d:WorkbenchData)=>({...d,memos:d.memos.map(m=>({...m,order:m.order+1})).concat({id:uid(),text:text.trim(),order:0,createdAt:Date.now(),updatedAt:Date.now()})}));close();};
  return <Modal title="写一张小纸条" onClose={close}><form className="editor-form" onSubmit={submit}><label>想记下什么？<textarea autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder="突然想到…" rows={4}/></label><div className="modal-actions"><button type="button" className="secondary" onClick={close}>取消</button><button>收进备忘</button></div></form></Modal>;
}

function ComingSoon({view}:{view:View}) {
  const item=nav.find(n=>n.id===view)!;
  return <div className="page coming"><span className="eyebrow">NEXT CHAPTER</span><h1>{item.label}模块</h1><img src="/bears/bear-trio.jpg" alt="三只水彩小熊" /><h2>小熊正在认真搭建这里</h2><p>阶段一先把首页、日历与备忘照顾好。这个模块已经留好位置，会在后续阶段自然长出来。</p></div>;
}
