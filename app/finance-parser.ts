const pad=(value:number)=>String(value).padStart(2,"0");
const dayKey=(date:Date)=>`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;

export type ParsedFinanceText={date:string;time:string;amount:number;type:"income"|"expense";category:string;note:string};

export function parseFinanceText(source:string,now=new Date()):ParsedFinanceText|null{
  const text=source.trim();if(!text)return null;
  const date=new Date(now);if(/昨天/.test(text))date.setDate(date.getDate()-1);else if(/前天/.test(text))date.setDate(date.getDate()-2);
  const explicit=text.match(/(20\d{2})[年/\-.](\d{1,2})[月/\-.](\d{1,2})[日号]?/);
  const monthDay=text.match(/(?<!\d)(\d{1,2})月(\d{1,2})[日号]?/);
  if(explicit)date.setFullYear(Number(explicit[1]),Number(explicit[2])-1,Number(explicit[3]));else if(monthDay)date.setFullYear(date.getFullYear(),Number(monthDay[1])-1,Number(monthDay[2]));
  let time=`${pad(now.getHours())}:${pad(now.getMinutes())}`;const matchedTime=text.match(/(?:上午|中午|下午|晚上)?\s*(\d{1,2})[点:：](\d{1,2})?/);
  if(matchedTime){let hour=Number(matchedTime[1]);if(/下午|晚上/.test(matchedTime[0])&&hour<12)hour+=12;if(/中午/.test(matchedTime[0])&&hour<11)hour+=12;time=`${pad(hour)}:${pad(Number(matchedTime[2]||0))}`}else if(/早晨|早上/.test(text))time="09:00";else if(/上午/.test(text))time="10:00";else if(/中午/.test(text))time="12:00";else if(/下午/.test(text))time="15:00";else if(/晚上/.test(text))time="19:00";
  const money=[...text.matchAll(/(?:¥|￥)\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:元|块)/g)].map(match=>Number(match[1]||match[2]));
  const numbers=[...text.matchAll(/\d+(?:\.\d{1,2})?/g)].map(match=>Number(match[0]));const amount=money.at(-1)||numbers.at(-1)||0;if(!amount)return null;
  const type=/收入|工资|奖金|红包|卖闲置|收到|转入|生活费/.test(text)?"income":"expense";
  const categories:[RegExp,string][]=[[/草莓|苹果|香蕉|橙子|橘子|葡萄|蓝莓|芒果|西瓜|水果/,"水果"],[/拿铁|美式|奶茶|咖啡|茶|饮料|果汁|气泡水/,"饮品"],[/项链|耳环|耳钉|戒指|手链|饰品/,"饰品"],[/内衣|短袖|牛仔短裤|衣服|裙|鞋|服饰|裤子|外套|衬衫/,"服饰"],[/地铁|打车|公交|滴滴|电单车|共享单车|单车|出租车|高铁|火车/,"交通"],[/饭|吃|餐|肉片|外卖|早餐|午餐|晚餐/,"餐饮"],[/房租|租金/,"房租"],[/普拉提|健身|瑜伽/,"运动"],[/书|课程|学习/,"学习"],[/护肤|化妆|美容/,"美容"],[/工资/,"工资"],[/红包/,"红包"],[/闲置/,"卖闲置"],[/旅行|酒店|机票/,"旅行"],[/快递/,"快递"],[/医院|药|医疗/,"医疗"],[/游戏/,"游戏"]];
  const category=categories.find(([pattern])=>pattern.test(text))?.[1]||(type==="income"?"其他收入":"其他");
  const note=text.replace(/20\d{2}[年/\-.]\d{1,2}[月/\-.]\d{1,2}[日号]?/g,"").replace(/(?:20\d{2}年)?\d{1,2}月\d{1,2}[日号]?/g,"").replace(/今天|昨天|前天|早晨|早上|上午|中午|下午|晚上/g,"").replace(/(?:\d{1,2})[点:：]\d{0,2}/g,"").replace(/\d+(?:\.\d{1,2})?\s*(?:元|块)?/g,"").replace(/花了|支付|支出|收入|消费|一笔/g,"").replace(/[，,。.\s/\-]+/g," ").trim()||category;
  return {date:dayKey(date),time,amount,type,category,note};
}
