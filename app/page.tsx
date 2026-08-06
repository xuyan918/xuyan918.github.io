"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { EXTRA_LOCATION_ROWS } from "./location-options";

type View = "home" | "calendar" | "growth" | "health" | "finance" | "jobs" | "travel" | "memos" | "cats";
type Category = { id: string; name: string; color: string };
type EventItem = { id: string; date: string; start: string; end: string; title: string; categoryId: string; updatedAt: number };
type Todo = { id: string; date: string; text: string; done: boolean; order: number; updatedAt: number };
type Memo = { id: string; text: string; order: number; createdAt: number; updatedAt: number };
type ProgressState = "未开始" | "进行中" | "已掌握";
type Skill = { id: string; name: string; icon: string; progress: ProgressState; beginner: string[]; advanced: string[]; points: string[]; resources: string[]; notes: string; lastCheckin?: string; updatedAt: number };
type LearningTrack = { id: string; name: string; icon: string; subtitle: string; plan: string[]; today: string[]; material: string; updatedAt: number };
type Checkin = { id: string; trackId: string; date: string; note: string; updatedAt: number };
type Goal = { id: string; kind: string; text: string; done: boolean; updatedAt: number };
type PeriodRecord = { id: string; start: string; end: string; updatedAt: number };
type WorkoutPlan = { id: string; weekday: number; title: string; intensity: "轻柔" | "适中" | "较高"; order?:number; completedDates?:string[]; updatedAt: number };
type HealthLog = { id: string; date: string; weight?: number; trained: boolean; workout?: string; foodNote: string; foodImage?:string; calories?: number; updatedAt: number };
type Recipe = { id: string; meal: "早餐" | "午餐" | "晚餐"; name: string; ingredients: string; calories: number; custom?: boolean; updatedAt: number };
type HealthSettings = { privacy: boolean; cycleLength: number; periodLength: number; country?:string; admin1?:string; city?:string; latitude?:number; longitude?:number; timezone?:string; updatedAt: number };
type FinanceCategory = { id:string; type:"income"|"expense"; name:string; color:string; updatedAt:number };
type FinanceEntry = { id:string; type:"income"|"expense"; categoryId:string; amount:number; note:string; date:string; time:string; updatedAt:number };
type ShoppingItem = { id:string; name:string; price:number; saved?:number; purchased:boolean; updatedAt:number };
type SavingsGoal = { id:string; name:string; target:number; saved:number; updatedAt:number };
type FinanceSettings = { monthlyIncome?:number; updatedAt:number };
type JobStatus = "感兴趣" | "已投递" | "已面试" | "已拒绝";
type JobListing = { id:string; company:string; title:string; salary:string; companySize:number; location:string; jd:string; url:string; source:string; publishedAt:string; status:JobStatus; statusUpdatedAt:number; updatedAt:number };
type JobCriterion = { id:string; kind:"关键词"|"地点"|"最低公司人数"; value:string; updatedAt:number };
type Destination = { id:string; place:string; country:string; visited:boolean; latitude?:number; longitude?:number; updatedAt:number };
type ItineraryItem = { id:string; day:number; time:string; content:string };
type PackingItem = { id:string; category:string; name:string; checked:boolean };
type TravelPlan = { id:string; name:string; startDate:string; endDate:string; itinerary:ItineraryItem[]; packing:PackingItem[]; updatedAt:number };
type SpecialCategory = { id:string; name:string; icon:string; order:number; updatedAt:number };
type SpecialDay = { id:string; title:string; date:string; kind:string; calendar:"公历"|"农历"; lunarDate?:string; lunarMonth?:number; lunarDay?:number; reminderDays:number; recurrence?:"weekly"|"monthly"|"yearly"; weekday?:number; monthDay?:number; month?:number; updatedAt:number };
type CatProfile = { id:string; name:string; photo?:string; birthday:string; breed:string; sex:"妹妹"|"弟弟"|"未知"; homeDate:string; neutered:boolean; updatedAt:number };
type CatCare = { id:string; catId:string; title:string; date:string; done:boolean; order:number; updatedAt:number };
type CatGrowth = { id:string; catId:string; date:string; title:string; note:string; photo?:string; updatedAt:number };
type CatHealth = { id:string; catId:string; kind:"疫苗"|"驱虫"|"体检"|"复查"|"用药"|"其他"; title:string; date:string; note:string; done:boolean; updatedAt:number };
type CatWeight = { id:string; catId:string; date:string; weight:number; updatedAt:number };
type ReadingBook = { id:string; title:string; author:string; category:string; currentPage:number; totalPages:number; status:"想读"|"在读"|"读完"; updatedAt:number };
type SavedPodcast = { id:string; title:string; host:string; category:string; currentEpisode:number; updatedAt:number };
type MoodTag = { id:string; name:string; updatedAt:number };
type MoodEntry = { id:string; date:string; mood:string; content:string; tagIds:string[]; updatedAt:number };
type WorkbenchData = {
  version: 1;
  exportedAt?: number;
  modifiedAt?: number;
  categories: Category[];
  events: EventItem[];
  todos: Todo[];
  memos: Memo[];
  skills: Skill[];
  learningTracks: LearningTrack[];
  checkins: Checkin[];
  goals: Goal[];
  goalCategories: MoodTag[];
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
  jobCriteria: JobCriterion[];
  destinations: Destination[];
  travelPlans: TravelPlan[];
  packingTemplate: PackingItem[];
  specialCategories: SpecialCategory[];
  specialDays: SpecialDay[];
  catProfiles: CatProfile[];
  catCare: CatCare[];
  catGrowth: CatGrowth[];
  catHealth: CatHealth[];
  catWeights: CatWeight[];
  readingBooks: ReadingBook[];
  savedPodcasts: SavedPodcast[];
  bookCategories: MoodTag[];
  podcastCategories: MoodTag[];
  moodTags: MoodTag[];
  moodEntries: MoodEntry[];
};

const STORAGE_KEY = "bear-workbench-v1";
const BACKUP_KEY = "bear-workbench-history-v1";
type BackupSnapshot={id:string;createdAt:number;reason:string;raw:string};
const readSnapshots=():BackupSnapshot[]=>{try{const value=JSON.parse(localStorage.getItem(BACKUP_KEY)||"[]");return Array.isArray(value)?value:[]}catch{return []}};
const saveSnapshot=(raw:string,reason:string,force=false)=>{if(!raw)return;try{JSON.parse(raw)}catch{return}const snapshots=readSnapshots();if(snapshots[0]?.raw===raw)return;if(!force&&snapshots[0]&&Date.now()-snapshots[0].createdAt<120000)return;const next=[{id:uid(),createdAt:Date.now(),reason,raw},...snapshots].slice(0,15);try{localStorage.setItem(BACKUP_KEY,JSON.stringify(next))}catch{try{localStorage.setItem(BACKUP_KEY,JSON.stringify(next.slice(0,3)))}catch{}}};
const dataModifiedAt=(data:any)=>{if(Number.isFinite(data?.modifiedAt))return data.modifiedAt as number;let latest=0;Object.values(data||{}).forEach(value=>{if(Array.isArray(value))value.forEach(item=>{if(Number.isFinite(item?.updatedAt))latest=Math.max(latest,item.updatedAt);if(Number.isFinite(item?.createdAt))latest=Math.max(latest,item.createdAt)})});return latest};
const SALARY_CLEANUP_KEY = "bear-workbench-salary-cleaned-20260729";
const GROWTH_CLEANUP_KEY = "bear-workbench-growth-cleaned-20260731";
const JOB_FILTER_CLEANUP_KEY = "bear-workbench-job-filters-cleaned-20260731";
const SPECIAL_DAYS_CLEANUP_KEY = "bear-workbench-special-days-categories-20260731";
const CONTENT_REFRESH_KEY = "bear-workbench-content-refresh-20260801";
const BIRTHDAY_CLEANUP_KEY = "bear-workbench-birthdays-cleaned-20260802";
const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayKey = () => dayKey(new Date());
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const DEFAULT_LOCATION={country:"中国",admin1:"浙江省",city:"杭州市",latitude:30.2741,longitude:120.1551,timezone:"Asia/Shanghai"};
type CityOption={country:string;city:string;admin1:string;latitude:number;longitude:number;timezone:string};
const LOCATION_OPTIONS:CityOption[]=[
  ["中国","杭州","浙江省",30.2741,120.1551,"Asia/Shanghai"],["中国","上海","上海市",31.2304,121.4737,"Asia/Shanghai"],["中国","北京","北京市",39.9042,116.4074,"Asia/Shanghai"],["中国","广州","广东省",23.1291,113.2644,"Asia/Shanghai"],["中国","深圳","广东省",22.5431,114.0579,"Asia/Shanghai"],["中国","成都","四川省",30.5728,104.0668,"Asia/Shanghai"],["中国","南京","江苏省",32.0603,118.7969,"Asia/Shanghai"],["中国","苏州","江苏省",31.2989,120.5853,"Asia/Shanghai"],["中国","厦门","福建省",24.4798,118.0894,"Asia/Shanghai"],["中国","武汉","湖北省",30.5928,114.3055,"Asia/Shanghai"],["中国","重庆","重庆市",29.563,106.5516,"Asia/Shanghai"],["中国","西安","陕西省",34.3416,108.9398,"Asia/Shanghai"],["中国","青岛","山东省",36.0671,120.3826,"Asia/Shanghai"],["中国","长沙","湖南省",28.2282,112.9388,"Asia/Shanghai"],["中国","香港","香港特别行政区",22.3193,114.1694,"Asia/Hong_Kong"],["中国","澳门","澳门特别行政区",22.1987,113.5439,"Asia/Macau"],
  ["中国","天津","天津市",39.0842,117.2009,"Asia/Shanghai"],["中国","石家庄","河北省",38.0428,114.5149,"Asia/Shanghai"],["中国","太原","山西省",37.8706,112.5489,"Asia/Shanghai"],["中国","呼和浩特","内蒙古自治区",40.8426,111.7492,"Asia/Shanghai"],["中国","沈阳","辽宁省",41.8057,123.4315,"Asia/Shanghai"],["中国","大连","辽宁省",38.914,121.6147,"Asia/Shanghai"],["中国","长春","吉林省",43.8171,125.3235,"Asia/Shanghai"],["中国","哈尔滨","黑龙江省",45.8038,126.535,"Asia/Shanghai"],
  ["中国","无锡","江苏省",31.4912,120.3119,"Asia/Shanghai"],["中国","宁波","浙江省",29.8683,121.544,"Asia/Shanghai"],["中国","温州","浙江省",27.9939,120.6994,"Asia/Shanghai"],["中国","合肥","安徽省",31.8206,117.2272,"Asia/Shanghai"],["中国","福州","福建省",26.0745,119.2965,"Asia/Shanghai"],["中国","南昌","江西省",28.682,115.8579,"Asia/Shanghai"],["中国","济南","山东省",36.6512,117.1201,"Asia/Shanghai"],["中国","郑州","河南省",34.7466,113.6254,"Asia/Shanghai"],
  ["中国","洛阳","河南省",34.6197,112.454,"Asia/Shanghai"],["中国","宜昌","湖北省",30.6919,111.2865,"Asia/Shanghai"],["中国","张家界","湖南省",29.1171,110.4792,"Asia/Shanghai"],["中国","珠海","广东省",22.2707,113.5767,"Asia/Shanghai"],["中国","佛山","广东省",23.0218,113.1219,"Asia/Shanghai"],["中国","东莞","广东省",23.0207,113.7518,"Asia/Shanghai"],["中国","南宁","广西壮族自治区",22.817,108.3665,"Asia/Shanghai"],["中国","桂林","广西壮族自治区",25.2742,110.2991,"Asia/Shanghai"],
  ["中国","海口","海南省",20.044,110.1999,"Asia/Shanghai"],["中国","三亚","海南省",18.2528,109.5119,"Asia/Shanghai"],["中国","贵阳","贵州省",26.647,106.6302,"Asia/Shanghai"],["中国","昆明","云南省",25.0389,102.7183,"Asia/Shanghai"],["中国","大理","云南省",25.6065,100.2676,"Asia/Shanghai"],["中国","丽江","云南省",26.8721,100.2299,"Asia/Shanghai"],["中国","拉萨","西藏自治区",29.652,91.1721,"Asia/Shanghai"],["中国","兰州","甘肃省",36.0611,103.8343,"Asia/Shanghai"],["中国","西宁","青海省",36.6171,101.7782,"Asia/Shanghai"],["中国","银川","宁夏回族自治区",38.4872,106.2309,"Asia/Shanghai"],["中国","乌鲁木齐","新疆维吾尔自治区",43.8256,87.6168,"Asia/Shanghai"],["中国","台北","台湾省",25.033,121.5654,"Asia/Taipei"],
  ["中国","烟台","山东省",37.4638,121.4479,"Asia/Shanghai"],["中国","塔城","新疆维吾尔自治区",46.7453,82.9803,"Asia/Shanghai"],["中国","秦皇岛","河北省",39.9354,119.6005,"Asia/Shanghai"],["中国","保定","河北省",38.8739,115.4646,"Asia/Shanghai"],["中国","唐山","河北省",39.6305,118.1802,"Asia/Shanghai"],["中国","大同","山西省",40.0768,113.3001,"Asia/Shanghai"],["中国","包头","内蒙古自治区",40.6578,109.8403,"Asia/Shanghai"],["中国","赤峰","内蒙古自治区",42.2578,118.8869,"Asia/Shanghai"],
  ["中国","丹东","辽宁省",40.0008,124.3547,"Asia/Shanghai"],["中国","延吉","吉林省",42.8912,129.5091,"Asia/Shanghai"],["中国","牡丹江","黑龙江省",44.5517,129.6332,"Asia/Shanghai"],["中国","徐州","江苏省",34.2044,117.2858,"Asia/Shanghai"],["中国","扬州","江苏省",32.3942,119.4129,"Asia/Shanghai"],["中国","常州","江苏省",31.8107,119.9741,"Asia/Shanghai"],["中国","绍兴","浙江省",30.0303,120.5802,"Asia/Shanghai"],["中国","嘉兴","浙江省",30.7461,120.7555,"Asia/Shanghai"],["中国","金华","浙江省",29.0787,119.6474,"Asia/Shanghai"],["中国","舟山","浙江省",29.9853,122.2072,"Asia/Shanghai"],
  ["中国","黄山","安徽省",29.7147,118.3376,"Asia/Shanghai"],["中国","泉州","福建省",24.8741,118.6757,"Asia/Shanghai"],["中国","景德镇","江西省",29.2687,117.1784,"Asia/Shanghai"],["中国","威海","山东省",37.5131,122.1204,"Asia/Shanghai"],["中国","潍坊","山东省",36.7069,119.1618,"Asia/Shanghai"],["中国","开封","河南省",34.7972,114.3076,"Asia/Shanghai"],["中国","襄阳","湖北省",32.0089,112.1224,"Asia/Shanghai"],["中国","恩施","湖北省",30.2722,109.4882,"Asia/Shanghai"],["中国","衡阳","湖南省",26.8932,112.5719,"Asia/Shanghai"],["中国","汕头","广东省",23.3541,116.682,"Asia/Shanghai"],["中国","惠州","广东省",23.1115,114.4168,"Asia/Shanghai"],["中国","中山","广东省",22.5176,113.3926,"Asia/Shanghai"],
  ["中国","北海","广西壮族自治区",21.4813,109.1202,"Asia/Shanghai"],["中国","柳州","广西壮族自治区",24.3264,109.4281,"Asia/Shanghai"],["中国","乐山","四川省",29.5521,103.7656,"Asia/Shanghai"],["中国","绵阳","四川省",31.4675,104.6796,"Asia/Shanghai"],["中国","九寨沟","四川省",33.2605,103.9186,"Asia/Shanghai"],["中国","遵义","贵州省",27.7257,106.9271,"Asia/Shanghai"],["中国","西双版纳","云南省",22.0075,100.7979,"Asia/Shanghai"],["中国","香格里拉","云南省",27.8297,99.7008,"Asia/Shanghai"],["中国","日喀则","西藏自治区",29.2675,88.8812,"Asia/Shanghai"],["中国","敦煌","甘肃省",40.1421,94.6619,"Asia/Shanghai"],["中国","喀什","新疆维吾尔自治区",39.4704,75.9898,"Asia/Shanghai"],["中国","伊宁","新疆维吾尔自治区",43.9771,81.5275,"Asia/Shanghai"],["中国","阿勒泰","新疆维吾尔自治区",47.8484,88.1396,"Asia/Shanghai"],["中国","高雄","台湾省",22.6273,120.3014,"Asia/Taipei"],
  ["中国","承德","河北省",40.9515,117.9634,"Asia/Shanghai"],["中国","张家口","河北省",40.7675,114.8863,"Asia/Shanghai"],["中国","邯郸","河北省",36.6256,114.5391,"Asia/Shanghai"],["中国","沧州","河北省",38.3044,116.8387,"Asia/Shanghai"],["中国","廊坊","河北省",39.5383,116.6838,"Asia/Shanghai"],["中国","运城","山西省",35.0264,111.0075,"Asia/Shanghai"],["中国","临汾","山西省",36.088,111.519,"Asia/Shanghai"],["中国","晋中","山西省",37.687,112.7527,"Asia/Shanghai"],["中国","鄂尔多斯","内蒙古自治区",39.6086,109.7813,"Asia/Shanghai"],["中国","呼伦贝尔","内蒙古自治区",49.2116,119.7657,"Asia/Shanghai"],
  ["中国","鞍山","辽宁省",41.1086,122.9943,"Asia/Shanghai"],["中国","锦州","辽宁省",41.0951,121.127,"Asia/Shanghai"],["中国","营口","辽宁省",40.6668,122.2349,"Asia/Shanghai"],["中国","吉林市","吉林省",43.8378,126.5494,"Asia/Shanghai"],["中国","齐齐哈尔","黑龙江省",47.3543,123.9182,"Asia/Shanghai"],["中国","大庆","黑龙江省",46.5893,125.1038,"Asia/Shanghai"],["中国","南通","江苏省",31.9802,120.8943,"Asia/Shanghai"],["中国","盐城","江苏省",33.3477,120.1636,"Asia/Shanghai"],["中国","镇江","江苏省",32.1878,119.425,"Asia/Shanghai"],["中国","连云港","江苏省",34.5967,119.2216,"Asia/Shanghai"],
  ["中国","湖州","浙江省",30.8943,120.0873,"Asia/Shanghai"],["中国","台州","浙江省",28.6564,121.4208,"Asia/Shanghai"],["中国","衢州","浙江省",28.9359,118.8742,"Asia/Shanghai"],["中国","丽水","浙江省",28.4676,119.9229,"Asia/Shanghai"],["中国","芜湖","安徽省",31.3525,118.4331,"Asia/Shanghai"],["中国","安庆","安徽省",30.5435,117.0637,"Asia/Shanghai"],["中国","莆田","福建省",25.4541,119.0077,"Asia/Shanghai"],["中国","漳州","福建省",24.513,117.6471,"Asia/Shanghai"],["中国","龙岩","福建省",25.0751,117.0173,"Asia/Shanghai"],["中国","九江","江西省",29.7051,116.0019,"Asia/Shanghai"],["中国","赣州","江西省",25.8311,114.935,"Asia/Shanghai"],["中国","上饶","江西省",28.4549,117.9434,"Asia/Shanghai"],
  ["中国","淄博","山东省",36.8135,118.055,"Asia/Shanghai"],["中国","临沂","山东省",35.1047,118.3564,"Asia/Shanghai"],["中国","济宁","山东省",35.4149,116.5871,"Asia/Shanghai"],["中国","泰安","山东省",36.2003,117.0879,"Asia/Shanghai"],["中国","日照","山东省",35.4164,119.5269,"Asia/Shanghai"],["中国","南阳","河南省",32.9907,112.5283,"Asia/Shanghai"],["中国","新乡","河南省",35.303,113.9268,"Asia/Shanghai"],["中国","安阳","河南省",36.0977,114.3924,"Asia/Shanghai"],["中国","荆州","湖北省",30.3348,112.2407,"Asia/Shanghai"],["中国","黄石","湖北省",30.2011,115.0389,"Asia/Shanghai"],["中国","岳阳","湖南省",29.3571,113.1292,"Asia/Shanghai"],["中国","株洲","湖南省",27.8274,113.1339,"Asia/Shanghai"],["中国","常德","湖南省",29.0316,111.6985,"Asia/Shanghai"],
  ["中国","江门","广东省",22.5787,113.0819,"Asia/Shanghai"],["中国","湛江","广东省",21.2707,110.3594,"Asia/Shanghai"],["中国","肇庆","广东省",23.0472,112.4651,"Asia/Shanghai"],["中国","清远","广东省",23.6818,113.056,"Asia/Shanghai"],["中国","韶关","广东省",24.8104,113.5972,"Asia/Shanghai"],["中国","梧州","广西壮族自治区",23.4769,111.279,"Asia/Shanghai"],["中国","玉林","广西壮族自治区",22.654,110.1809,"Asia/Shanghai"],["中国","防城港","广西壮族自治区",21.6869,108.3538,"Asia/Shanghai"],["中国","儋州","海南省",19.5211,109.5808,"Asia/Shanghai"],["中国","宜宾","四川省",28.7513,104.6417,"Asia/Shanghai"],["中国","泸州","四川省",28.8717,105.4423,"Asia/Shanghai"],["中国","攀枝花","四川省",26.5823,101.7187,"Asia/Shanghai"],["中国","南充","四川省",30.8378,106.1107,"Asia/Shanghai"],
  ["中国","安顺","贵州省",26.2537,105.9476,"Asia/Shanghai"],["中国","六盘水","贵州省",26.5927,104.8304,"Asia/Shanghai"],["中国","曲靖","云南省",25.4902,103.7962,"Asia/Shanghai"],["中国","腾冲","云南省",25.0205,98.4973,"Asia/Shanghai"],["中国","林芝","西藏自治区",29.6489,94.3615,"Asia/Shanghai"],["中国","天水","甘肃省",34.5809,105.7249,"Asia/Shanghai"],["中国","张掖","甘肃省",38.9259,100.4498,"Asia/Shanghai"],["中国","嘉峪关","甘肃省",39.772,98.2892,"Asia/Shanghai"],["中国","格尔木","青海省",36.4064,94.9285,"Asia/Shanghai"],["中国","克拉玛依","新疆维吾尔自治区",45.5799,84.8892,"Asia/Shanghai"],["中国","库尔勒","新疆维吾尔自治区",41.7259,86.1746,"Asia/Shanghai"],["中国","博乐","新疆维吾尔自治区",44.8539,82.0514,"Asia/Shanghai"],
  ["日本","东京","东京都",35.6762,139.6503,"Asia/Tokyo"],["日本","大阪","大阪府",34.6937,135.5023,"Asia/Tokyo"],["日本","京都","京都府",35.0116,135.7681,"Asia/Tokyo"],["日本","札幌","北海道",43.0618,141.3545,"Asia/Tokyo"],["日本","福冈","福冈县",33.5904,130.4017,"Asia/Tokyo"],
  ["日本","横滨","神奈川县",35.4437,139.638,"Asia/Tokyo"],["日本","名古屋","爱知县",35.1815,136.9066,"Asia/Tokyo"],["日本","神户","兵库县",34.6901,135.1955,"Asia/Tokyo"],["日本","奈良","奈良县",34.6851,135.8048,"Asia/Tokyo"],["日本","冲绳","冲绳县",26.2124,127.6809,"Asia/Tokyo"],["日本","广岛","广岛县",34.3853,132.4553,"Asia/Tokyo"],["日本","仙台","宫城县",38.2682,140.8694,"Asia/Tokyo"],["日本","金泽","石川县",36.5613,136.6562,"Asia/Tokyo"],["日本","函馆","北海道",41.7688,140.7288,"Asia/Tokyo"],
  ["韩国","首尔","首尔特别市",37.5665,126.978,"Asia/Seoul"],["韩国","济州","济州特别自治道",33.4996,126.5312,"Asia/Seoul"],["韩国","釜山","釜山广域市",35.1796,129.0756,"Asia/Seoul"],
  ["韩国","仁川","仁川广域市",37.4563,126.7052,"Asia/Seoul"],["韩国","大邱","大邱广域市",35.8714,128.6014,"Asia/Seoul"],["韩国","大田","大田广域市",36.3504,127.3845,"Asia/Seoul"],["韩国","光州","光州广域市",35.1595,126.8526,"Asia/Seoul"],["韩国","庆州","庆尚北道",35.8562,129.2247,"Asia/Seoul"],["韩国","江陵","江原特别自治道",37.7519,128.8761,"Asia/Seoul"],
  ["泰国","曼谷","曼谷",13.7563,100.5018,"Asia/Bangkok"],["泰国","清迈","清迈府",18.7883,98.9853,"Asia/Bangkok"],["泰国","普吉","普吉府",7.8804,98.3923,"Asia/Bangkok"],["新加坡","新加坡","新加坡",1.3521,103.8198,"Asia/Singapore"],
  ["泰国","芭提雅","春武里府",12.9236,100.8825,"Asia/Bangkok"],["泰国","清莱","清莱府",19.9105,99.8406,"Asia/Bangkok"],["泰国","甲米","甲米府",8.0863,98.9063,"Asia/Bangkok"],["泰国","苏梅岛","素叻他尼府",9.512,100.0136,"Asia/Bangkok"],["泰国","华欣","巴蜀府",12.5684,99.9577,"Asia/Bangkok"],
  ["马来西亚","吉隆坡","吉隆坡",3.139,101.6869,"Asia/Kuala_Lumpur"],["马来西亚","槟城","槟城州",5.4141,100.3288,"Asia/Kuala_Lumpur"],["越南","河内","河内",21.0278,105.8342,"Asia/Ho_Chi_Minh"],["越南","胡志明市","胡志明市",10.8231,106.6297,"Asia/Ho_Chi_Minh"],
  ["印度尼西亚","巴厘岛","巴厘省",-8.4095,115.1889,"Asia/Makassar"],["印度尼西亚","雅加达","雅加达首都特区",-6.2088,106.8456,"Asia/Jakarta"],["菲律宾","马尼拉","马尼拉大都会",14.5995,120.9842,"Asia/Manila"],["柬埔寨","金边","金边",11.5564,104.9282,"Asia/Phnom_Penh"],["柬埔寨","暹粒","暹粒省",13.3633,103.8564,"Asia/Phnom_Penh"],
  ["冰岛","雷克雅未克","首都区",64.1466,-21.9426,"Atlantic/Reykjavik"],
  ["法国","巴黎","法兰西岛",48.8566,2.3522,"Europe/Paris"],["英国","伦敦","英格兰",51.5074,-.1278,"Europe/London"],["意大利","罗马","拉齐奥",41.9028,12.4964,"Europe/Rome"],["西班牙","巴塞罗那","加泰罗尼亚",41.3874,2.1686,"Europe/Madrid"],
  ["法国","里昂","奥弗涅-罗讷-阿尔卑斯",45.764,4.8357,"Europe/Paris"],["法国","马赛","普罗旺斯-阿尔卑斯-蓝色海岸",43.2965,5.3698,"Europe/Paris"],["法国","波尔多","新阿基坦",44.8378,-.5792,"Europe/Paris"],["法国","斯特拉斯堡","大东部",48.5734,7.7521,"Europe/Paris"],["法国","图卢兹","奥克西塔尼",43.6047,1.4442,"Europe/Paris"],["法国","戛纳","普罗旺斯-阿尔卑斯-蓝色海岸",43.5528,7.0174,"Europe/Paris"],
  ["英国","曼彻斯特","英格兰",53.4808,-2.2426,"Europe/London"],["英国","利物浦","英格兰",53.4084,-2.9916,"Europe/London"],["英国","伯明翰","英格兰",52.4862,-1.8904,"Europe/London"],["英国","牛津","英格兰",51.752,-1.2577,"Europe/London"],["英国","剑桥","英格兰",52.2053,.1218,"Europe/London"],["英国","约克","英格兰",53.959,-1.0815,"Europe/London"],["英国","贝尔法斯特","北爱尔兰",54.5973,-5.9301,"Europe/London"],
  ["意大利","威尼斯","威尼托",45.4408,12.3155,"Europe/Rome"],["意大利","那不勒斯","坎帕尼亚",40.8518,14.2681,"Europe/Rome"],["意大利","都灵","皮埃蒙特",45.0703,7.6869,"Europe/Rome"],["意大利","博洛尼亚","艾米利亚-罗马涅",44.4949,11.3426,"Europe/Rome"],["意大利","比萨","托斯卡纳",43.7228,10.4017,"Europe/Rome"],["意大利","巴勒莫","西西里",38.1157,13.3615,"Europe/Rome"],
  ["法国","尼斯","普罗旺斯-阿尔卑斯-蓝色海岸",43.7102,7.262,"Europe/Paris"],["英国","爱丁堡","苏格兰",55.9533,-3.1883,"Europe/London"],["意大利","米兰","伦巴第",45.4642,9.19,"Europe/Rome"],["意大利","佛罗伦萨","托斯卡纳",43.7696,11.2558,"Europe/Rome"],["西班牙","马德里","马德里自治区",40.4168,-3.7038,"Europe/Madrid"],["德国","柏林","柏林",52.52,13.405,"Europe/Berlin"],["德国","慕尼黑","巴伐利亚",48.1351,11.582,"Europe/Berlin"],["荷兰","阿姆斯特丹","北荷兰省",52.3676,4.9041,"Europe/Amsterdam"],["瑞士","苏黎世","苏黎世州",47.3769,8.5417,"Europe/Zurich"],["奥地利","维也纳","维也纳",48.2082,16.3738,"Europe/Vienna"],["葡萄牙","里斯本","里斯本区",38.7223,-9.1393,"Europe/Lisbon"],["希腊","雅典","阿提卡",37.9838,23.7275,"Europe/Athens"],["土耳其","伊斯坦布尔","伊斯坦布尔省",41.0082,28.9784,"Europe/Istanbul"],
  ["德国","汉堡","汉堡",53.5511,9.9937,"Europe/Berlin"],["德国","法兰克福","黑森州",50.1109,8.6821,"Europe/Berlin"],["德国","科隆","北莱茵-威斯特法伦",50.9375,6.9603,"Europe/Berlin"],["德国","杜塞尔多夫","北莱茵-威斯特法伦",51.2277,6.7735,"Europe/Berlin"],["德国","德累斯顿","萨克森州",51.0504,13.7373,"Europe/Berlin"],["德国","海德堡","巴登-符腾堡州",49.3988,8.6724,"Europe/Berlin"],["德国","斯图加特","巴登-符腾堡州",48.7758,9.1829,"Europe/Berlin"],
  ["美国","纽约","纽约州",40.7128,-74.006,"America/New_York"],["美国","洛杉矶","加利福尼亚州",34.0522,-118.2437,"America/Los_Angeles"],["美国","旧金山","加利福尼亚州",37.7749,-122.4194,"America/Los_Angeles"],["美国","西雅图","华盛顿州",47.6062,-122.3321,"America/Los_Angeles"],["美国","芝加哥","伊利诺伊州",41.8781,-87.6298,"America/Chicago"],["美国","波士顿","马萨诸塞州",42.3601,-71.0589,"America/New_York"],["美国","华盛顿","哥伦比亚特区",38.9072,-77.0369,"America/New_York"],["美国","拉斯维加斯","内华达州",36.1699,-115.1398,"America/Los_Angeles"],["美国","夏威夷","夏威夷州",21.3099,-157.8581,"Pacific/Honolulu"],
  ["美国","迈阿密","佛罗里达州",25.7617,-80.1918,"America/New_York"],["美国","奥兰多","佛罗里达州",28.5383,-81.3792,"America/New_York"],["美国","圣迭戈","加利福尼亚州",32.7157,-117.1611,"America/Los_Angeles"],["美国","休斯敦","得克萨斯州",29.7604,-95.3698,"America/Chicago"],["美国","达拉斯","得克萨斯州",32.7767,-96.797,"America/Chicago"],["美国","新奥尔良","路易斯安那州",29.9511,-90.0715,"America/Chicago"],["美国","费城","宾夕法尼亚州",39.9526,-75.1652,"America/New_York"],["美国","亚特兰大","佐治亚州",33.749,-84.388,"America/New_York"],["美国","波特兰","俄勒冈州",45.5152,-122.6784,"America/Los_Angeles"],
  ["加拿大","温哥华","不列颠哥伦比亚省",49.2827,-123.1207,"America/Vancouver"],["加拿大","多伦多","安大略省",43.6532,-79.3832,"America/Toronto"],["加拿大","蒙特利尔","魁北克省",45.5017,-73.5673,"America/Toronto"],["澳大利亚","悉尼","新南威尔士州",-33.8688,151.2093,"Australia/Sydney"],["澳大利亚","墨尔本","维多利亚州",-37.8136,144.9631,"Australia/Melbourne"],["澳大利亚","布里斯班","昆士兰州",-27.4698,153.0251,"Australia/Brisbane"],["新西兰","奥克兰","奥克兰",-36.8509,174.7645,"Pacific/Auckland"],["新西兰","皇后镇","奥塔哥大区",-45.0312,168.6626,"Pacific/Auckland"],["阿联酋","迪拜","迪拜",25.2048,55.2708,"Asia/Dubai"],["阿联酋","阿布扎比","阿布扎比",24.4539,54.3773,"Asia/Dubai"]
  , ["澳大利亚","珀斯","西澳大利亚州",-31.9523,115.8613,"Australia/Perth"],["澳大利亚","阿德莱德","南澳大利亚州",-34.9285,138.6007,"Australia/Adelaide"],["澳大利亚","堪培拉","澳大利亚首都领地",-35.2809,149.13,"Australia/Sydney"],["澳大利亚","黄金海岸","昆士兰州",-28.0167,153.4,"Australia/Brisbane"],["澳大利亚","霍巴特","塔斯马尼亚州",-42.8821,147.3272,"Australia/Hobart"],["澳大利亚","达尔文","北领地",-12.4634,130.8456,"Australia/Darwin"]
].map(([country,city,admin1,latitude,longitude,timezone])=>({country,city,admin1,latitude,longitude,timezone})) as CityOption[];
LOCATION_OPTIONS.push(...EXTRA_LOCATION_ROWS.map(([country,city,admin1,latitude,longitude,timezone])=>({country,city,admin1,latitude,longitude,timezone})));
const LOCATION_COUNTRIES=[...new Set(LOCATION_OPTIONS.map(x=>x.country))];
const citiesFor=(country:string)=>LOCATION_OPTIONS.filter(x=>x.country===country);
const findLocationOption=(country:string,city:string)=>LOCATION_OPTIONS.find(x=>x.country===country&&(x.city===city||`${x.city}市`===city));
const locationOption=(country:string,city:string)=>findLocationOption(country,city)||LOCATION_OPTIONS[0];
const healthLocation=(settings:HealthSettings)=>({
  country:settings.country||DEFAULT_LOCATION.country,
  admin1:settings.admin1||DEFAULT_LOCATION.admin1,
  city:settings.city||DEFAULT_LOCATION.city,
  latitude:Number.isFinite(settings.latitude)?settings.latitude!:DEFAULT_LOCATION.latitude,
  longitude:Number.isFinite(settings.longitude)?settings.longitude!:DEFAULT_LOCATION.longitude,
  timezone:settings.timezone||DEFAULT_LOCATION.timezone,
});
const localSeason=(latitude:number,month=new Date().getMonth()+1)=>{
  if(Math.abs(latitude)<23.5)return "热带时令";
  const north=latitude>=0;
  const season=month>=3&&month<=5?"春日":month>=6&&month<=8?"夏日":month>=9&&month<=11?"秋日":"冬日";
  if(north)return season;
  return ({春日:"秋日",夏日:"冬日",秋日:"春日",冬日:"夏日"} as Record<string,string>)[season];
};
const weekday = (date: string) => ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][new Date(`${date}T12:00:00`).getDay()];
const displayDate = (date: string) => {
  const d = new Date(`${date}T12:00:00`);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};
type DailyWord = { word:string; phonetic:string; meaning:string; example:string };
const dailyIndex = (date:string,length:number) => Math.abs(Math.floor(new Date(`${date}T12:00:00`).getTime()/86400000))%length;
const IELTS_WORDS:DailyWord[][] = [
  [
    ["resilient","/rɪˈzɪliənt/","有韧性的","She remained resilient through every change."],["allocate","/ˈæləkeɪt/","分配","We should allocate more time to revision."],["crucial","/ˈkruːʃəl/","至关重要的","Sleep is crucial for effective learning."],["enhance","/ɪnˈhɑːns/","提升","Regular reading can enhance your vocabulary."],["sustainable","/səˈsteɪnəbəl/","可持续的","Cities need sustainable transport systems."],["perspective","/pəˈspektɪv/","观点；视角","Travel gave her a fresh perspective on life."],["significant","/sɪɡˈnɪfɪkənt/","显著的","The policy produced a significant improvement."],["adapt","/əˈdæpt/","适应","People quickly adapt to new technology."],["contribute","/kənˈtrɪbjuːt/","促成；贡献","Exercise contributes to better mental health."],["inevitable","/ɪˈnevɪtəbəl/","不可避免的","Some degree of change is inevitable."]
  ],
  [
    ["coherent","/kəʊˈhɪərənt/","连贯的","Her argument was clear and coherent."],["compelling","/kəmˈpelɪŋ/","令人信服的","The report presents compelling evidence."],["evaluate","/ɪˈvæljueɪt/","评估","Students should evaluate each source carefully."],["implement","/ˈɪmplɪment/","实施","The city plans to implement the new policy."],["maintain","/meɪnˈteɪn/","维持","It is difficult to maintain a healthy balance."],["prioritize","/praɪˈɒrətaɪz/","优先处理","We need to prioritize urgent tasks."],["fluctuate","/ˈflʌktʃueɪt/","波动","Energy prices fluctuate throughout the year."],["accessible","/əkˈsesəbəl/","易获得的","Online courses make education more accessible."],["controversial","/ˌkɒntrəˈvɜːʃəl/","有争议的","The proposal remains highly controversial."],["justify","/ˈdʒʌstɪfaɪ/","证明……合理","You must justify your opinion with examples."]
  ],
  [
    ["diverse","/daɪˈvɜːs/","多样的","The city has a diverse population."],["efficient","/ɪˈfɪʃənt/","高效的","Public transport is an efficient option."],["emerge","/ɪˈmɜːdʒ/","出现","New challenges may emerge over time."],["impact","/ˈɪmpækt/","影响","Tourism has a major impact on local culture."],["indicate","/ˈɪndɪkeɪt/","表明","The figures indicate steady growth."],["motivate","/ˈməʊtɪveɪt/","激励","Small goals can motivate learners."],["preserve","/prɪˈzɜːv/","保护","We should preserve historic buildings."],["relevant","/ˈreləvənt/","相关的","Include only relevant information."],["transform","/trænsˈfɔːm/","改变","Technology can transform the workplace."],["widespread","/ˈwaɪdspred/","广泛的","Smartphone use is now widespread."]
  ]
].map(set=>set.map(([word,phonetic,meaning,example])=>({word,phonetic,meaning,example})));
const TRACK_DAILIES:Record<string,{items:string[];material:string}[]> = {
  topik:[{items:["안녕하세요 — 你好","오늘 — 今天","공부하다 — 学习","좋아하다 — 喜欢","천천히 — 慢慢地","语法：-고 싶어요（想要……）","开口：오늘 한국어를 공부하고 싶어요."],material:"先听读 3 遍，再遮住中文独立说出完整句。"},{items:["약속 — 约定","시간 — 时间","친구 — 朋友","만나다 — 见面","기다리다 — 等待","语法：-(으)ㄹ 거예요（将要……）","造句：주말에 친구를 만날 거예요."],material:"把例句里的“朋友”替换成家人、同事，再说两遍。"},{items:["날씨 — 天气","따뜻하다 — 温暖","산책 — 散步","공원 — 公园","기분 — 心情","语法：-아서/어서（因为／然后）","造句：날씨가 좋아서 공원에서 산책해요."],material:"注意 좋아서 的连读，录下自己的一遍朗读。"}],
  cpa:[{items:["概念：资产的定义、确认条件与常见分类","辨析：资产与费用的边界","例题：用银行存款购入设备，会同时影响哪些科目？","复盘：用一句话解释“预期带来经济利益”"],material:"用 15 分钟画出资产、负债、所有者权益的关系图。"},{items:["概念：权责发生制","辨析：收付实现制与权责发生制","例题：12 月提供服务、次年 1 月收款，收入何时确认？","复盘：列举一个预付和一个应付场景"],material:"先判断业务发生时间，再判断现金收付时间。"},{items:["概念：借贷记账法与会计恒等式","规则：资产增加记借方，负债增加记贷方","例题：短期借款到账如何编制分录？","复盘：检查借贷金额是否相等"],material:"今天只练 3 笔简单分录，重点是方向准确。"}],
  photoshop:[{items:["工具：污点修复画笔（J）","理解：新建空白图层并勾选“对所有图层取样”","练习：移除生活照中的一个小杂物","检查：放大 100% 查看纹理是否自然"],material:"快捷键：⌘J 复制图层；⌘T 自由变换。"},{items:["工具：快速选择工具（W）","理解：选择并遮住比直接删除更可逆","练习：把人物从纯色背景中分离","检查：用“选择并遮住”优化发丝边缘"],material:"粗选 → 边缘优化 → 图层蒙版 → 回看细节。"},{items:["工具：曲线（⌘M）","理解：黑场、灰场与白场","练习：修正一张偏暗照片","检查：避免高光过曝和暗部死黑"],material:"先做轻微 S 曲线，再切换图层可见性比较前后。"}],
  law:[{items:["案例：公司只用口头通知解除劳动合同，劳动者申请仲裁。","知识点：解除理由、程序与经济补偿是三个不同问题。","处理结果：公司无法证明合法解除依据，通常需承担违法解除责任或支付相应赔偿。","行动：保存劳动合同、工资记录、考勤与沟通证据。"],material:"结果会随证据和具体事实变化；仅作常识学习，不替代专业法律意见。"},{items:["案例：退租时房东以墙面自然变旧为由扣除全部押金。","知识点：应区分正常使用损耗与承租人造成的实际损坏。","处理结果：若房东无法证明具体损失及金额，调解或裁判通常不会支持无依据扣除全部押金。","行动：入住、退租时拍摄带日期的视频并保留交接记录。"],material:"合同约定、房屋现状和证据会影响结果；重要沟通尽量留书面记录。"},{items:["案例：消费者网购普通商品后在七日内申请无理由退货，商家以已拆封拒绝。","知识点：拆封不当然丧失退货权，但定作、鲜活易腐等法定例外除外。","处理结果：不属于例外且商品保持完好的，平台介入或诉讼通常会支持依法退货。","行动：保留订单、商品页面、完整包装和沟通记录。"],material:"商品性质和完好标准会影响结果，先核对平台规则与现行法律。"}],
  "finance-study":[{items:["基础：股票代表对公司的所有权份额，收益与风险来自公司经营和市场定价。","辨析：股价上涨不等于公司价值永远上升，短期价格可能大幅波动。","自测：买入前能否说清公司如何赚钱、主要风险和自己的持有期限？","风险：不借钱投资，不把应急资金投入高波动资产。"],material:"先理解资产，再考虑交易；仅作投资者教育，不构成投资建议。"},{items:["基础：基金把多位投资者的资金交由基金管理人按约定组合投资。","分类：常见有货币、债券、混合、股票和指数基金，风险收益特征不同。","费用：关注申购赎回费、管理费、托管费及销售服务费。","自测：产品投资范围、风险等级和费用是否与自己的期限匹配？"],material:"基金分散了单一证券风险，但不等于保本，也可能发生亏损。"},{items:["基础：指数基金力求跟踪特定指数，ETF通常可在交易所买卖。","指标：比较跟踪指数、跟踪误差、规模、流动性和综合费率。","风险：宽基指数也会随市场下跌，行业主题基金的波动往往更集中。","行动：写下投资目标、期限和可承受回撤，再决定是否参与。"],material:"长期、分散和费用意识比追逐短期热点更适合建立基础认知。"}]
};
const EXTRA_TRACK_DAILIES:Record<string,{items:string[];material:string}[]>={
  law:[
    {items:["案例：劳动者下班途中发生交通事故，且本人不承担主要责任，能否认定工伤？","规则：工伤认定会同时审查是否属于合理的上下班时间与路线、是否为交通事故，以及交警责任认定是否满足‘非本人主要责任’。仅有受伤事实并不足够。","处理思路：及时报警并取得事故责任认定书，保存劳动关系、考勤、路线与就医材料，在法定期限内由单位或个人申请工伤认定。","结果提示：符合条件的，后续还需经过劳动能力鉴定，再据伤残等级和实际费用确定待遇。"],material:"把实体权利、举证材料和办理程序分开理解。案例结论会因事实与证据变化，不替代个案法律意见。"},
    {items:["案例：朋友借款后迟迟不还，双方只有转账记录，没有书面借条。","规则：转账记录能够证明资金流动，但借贷关系还需结合聊天内容、转账备注、双方关系及款项用途综合判断；对方也可能主张这是赠与、还款或共同消费。","处理思路：先以书面方式明确催款金额、借款时间和还款期限，完整保存原始聊天及转账凭证；协商不成时注意三年诉讼时效及管辖法院。","结果提示：证据能形成完整链条时，法院通常会支持返还本金及依法可支持的利息；证据不足时存在败诉风险。"],material:"不要只截取一张聊天截图，尽量保留账号主体、上下文、时间和原始载体。"},
    {items:["案例：网络平台上的照片、文字被他人搬运并用于商业宣传。","规则：原创摄影与文字可能受著作权保护，肖像、姓名或私人生活信息还可能涉及人格权与个人信息权益。是否侵权要看作品独创性、授权范围、使用目的和合理使用边界。","处理思路：先固定侵权页面、发布时间、传播范围和对方主体信息，再通过平台投诉、律师函或诉讼要求停止使用、消除影响并赔偿合理损失。","结果提示：权属证明和侵权获利难以确定时，法院会综合作品价值、主观过错、传播范围等因素酌定赔偿。"],material:"证据保全要早于投诉下架；必要时使用可信时间戳或公证方式固定页面。"}
  ],
  "finance-study":[
    {items:["主题：净值、收益率与最大回撤分别回答不同问题。净值展示基金每份资产的价值，区间收益率受起止日期影响，最大回撤反映一段时期内从高点到低点的最大跌幅。","比较方法：同类、同基准、同时间窗口再比较，不用短期冠军榜代替长期判断。还要同时观察波动、回撤修复时间、基金经理任期及持仓风格是否漂移。","行动清单：写下资金使用日期、可承受亏损和分批投入规则；若短期内必须使用，优先考虑流动性与本金波动，而不是只追求收益。","风险提醒：历史业绩不代表未来表现，回撤承受力不能只靠想象，应以真实现金流和睡眠质量为边界。"],material:"先学会描述风险，再谈收益；本内容用于投资者教育，不构成个别产品建议。"},
    {items:["主题：估值不是预测明天涨跌，而是判断当前价格隐含了怎样的增长预期。常见指标包括市盈率、市净率、自由现金流收益率等，不同行业适用性不同。","分析顺序：先理解商业模式与利润来源，再看行业周期、竞争格局、资产质量和现金流，最后把估值与自身投资期限结合。","常见误区：低市盈率不一定便宜，可能对应盈利下滑；高估值也不必然错误，但需要更持续、更确定的增长兑现。","练习：选择一家熟悉的公司，用三句话写清它如何赚钱、最可能的风险，以及什么事实会推翻你的判断。"],material:"估值是一组假设，不是精确答案。给假设留出安全边际，并持续核对事实。"},
    {items:["主题：资产配置决定组合里不同风险来源的比例。股票、债券、现金类资产在不同市场环境中的表现可能不同，分散的目标是避免单一风险摧毁整个计划。","执行方法：先预留应急资金，再按目标期限分层；设定可理解的目标比例和再平衡规则，而不是上涨后追买、下跌后恐慌卖出。","费用意识：申赎费、管理费、托管费、销售服务费和交易摩擦会长期侵蚀收益，比较产品时应看综合成本。","练习：为一年内、三到五年、十年以上三个目标分别写出可接受的波动范围和流动性要求。"],material:"适合自己的配置通常朴素、可持续、能在下跌时继续执行。"}
  ],
  photoshop:[
    {items:["主题：图层蒙版是非破坏性编辑的核心。白色显示、黑色隐藏、灰色半透明；它保留原始像素，便于随时返工。","步骤：复制原图层，新建蒙版，用低硬度画笔在蒙版上逐步隐藏边缘；按住 Option 点击蒙版可单独检查黑白区域。","细节：发丝、玻璃、毛绒等复杂边缘应结合‘选择并遮住’中的平滑、羽化、对比度和净化颜色，避免生硬白边。","练习：用同一张小熊素材做圆形头像和柔和贴纸两版，比较硬边与羽化边缘的差异。"],material:"今天的重点不是一次抠得完美，而是养成随时可修改的图层结构。"},
    {items:["主题：色阶与曲线都能调整明暗，但曲线能更精细地控制不同亮度区间。横轴代表原始亮度，纵轴代表调整后亮度。","步骤：先观察直方图是否有断层或两端溢出，再用轻微 S 曲线提升对比；需要局部调整时给曲线调整层添加蒙版。","细节：修肤时避免把高光推到纯白、暗部压成死黑；频繁开关调整层，确认画面变好而不是只变得更艳。","练习：分别制作自然、奶油粉、清透冷调三版，并记录每版黑场、中间调和高光的变化。"],material:"调整层、命名和分组会让作品更容易复用，也方便日后重新微调。"},
    {items:["主题：文字排版先建立信息层级，再选择字体。标题、正文、说明文字应在字号、字重、颜色或间距上有清晰差异。","步骤：建立网格和安全边距，控制每行字数与行距；中文正文通常需要更舒展的行距，装饰字体只用于少量重点。","细节：不要用多个相似但不一致的粉色；先确定主色、辅助色和强调色，再用对齐与留白维持秩序。","练习：用小熊图片制作一张手机海报，限定两种字体、三种字号和三种颜色，完成后缩小到手机尺寸检查可读性。"],material:"好排版不是把元素塞满，而是让读者一眼知道先看哪里、再看哪里。"}
  ],
  topik:[
    {items:["场景：餐厅点餐。메뉴（菜单）、주문하다（点餐）、추천하다（推荐）、맵다（辣）、덜 맵게（少辣）。","语法：-(으)세요 用于较礼貌地请求或指示；有收音的词干接 -으세요，无收音通常接 -세요。","例句：이 메뉴를 덜 맵게 해 주세요.（请把这道菜做得少辣一些。）","TOPIK 提示：先找句尾语法判断语气，再结合名词和动词定位场景，不要逐字翻译。"],material:"先听整句抓语气，再按‘这道菜／少辣／请做’三个意群跟读。"},
    {items:["场景：交通与问路。지하철（地铁）、갈아타다（换乘）、출구（出口）、건너편（对面）、걸리다（花费时间）。","语法：-(으)려면 表示‘如果想要……’，前半句提出目的，后半句给出条件或方法。","例句：시청에 가려면 어디에서 갈아타야 해요?（如果要去市政府，应该在哪里换乘？）","TOPIK 提示：听力题中的数字、站名、方向词常是关键信息，可先在草稿上记箭头和数字。"],material:"把 목적地替换成机场、学校和公司，各说一遍完整问句。"},
    {items:["场景：表达计划。계획（计划）、준비하다（准备）、신청하다（申请）、경험（经验）、목표（目标）。","语法：-기 위해(서) 表示‘为了……’，书面语中常见，前接动词词干并说明后续行动的目的。","例句：시험에 합격하기 위해서 매일 복습하고 있어요.（为了通过考试，我每天都在复习。）","TOPIK 提示：阅读题先圈连接词和句尾，再判断因果、转折、目的或条件关系。"],material:"朗读时不要把 위해서 拆得过碎，先慢速读准，再连成自然语流。"}
  ],
  cpa:[
    {items:["主题：收入确认的核心不是收到现金，而是企业何时履行履约义务并取得收款权利。先识别合同与履约义务，再确定交易价格及其分摊，最后判断在某一时点还是某一时段确认收入。","案例：客户预付全年服务费并不意味着企业当日确认全年收入；若服务在一年内持续提供，通常应随履约进度确认。","易错点：区分合同负债、应收账款和收入，分析退货、折扣、可变对价及重大融资成分。","练习：为会员年费、一次性交付的软件和持续运维服务分别写出收入确认时点与理由。"],material:"做题时按五步法写在草稿上，先判断业务实质，再计算金额。"},
    {items:["主题：金融资产分类取决于企业管理该资产的业务模式，以及合同现金流是否仅为本金和利息。分类会影响后续计量与损益呈现。","理解：摊余成本、以公允价值计量且变动计入其他综合收益、以公允价值计量且变动计入当期损益，不能只靠资产名称机械判断。","易错点：关注重分类条件、减值的预期信用损失模型，以及交易性金融资产相关费用的处理。","练习：比较持有至收取现金流的债券与短期交易股票在初始确认、期末计量上的差异。"],material:"先写‘为何持有’和‘现金流是什么’，再选择计量类别。"},
    {items:["主题：审计风险模型把重大错报风险与检查风险联系起来。注册会计师需要理解被审计单位及其环境，识别财务报表层次和认定层次风险，再设计总体应对与进一步程序。","程序：风险评估程序用于识别风险；控制测试关注相关控制是否有效运行；实质性程序直接发现重大错报，三者目的不同。","易错点：重要性不是绝对金额，职业怀疑也不是默认管理层不诚实，而是保持质疑并审慎评价证据。","练习：以存货为例，分别为存在、完整性、计价三个认定设计一项审计程序。"],material:"把每一道审计题都还原成‘风险—认定—程序—证据’四步。"}
  ]
};
Object.entries(EXTRA_TRACK_DAILIES).forEach(([id,sets])=>TRACK_DAILIES[id]?.push(...sets));
const TRACK_RESOURCES:Record<string,{label:string;url:string}[]>={
  law:[{label:"中国法律服务网",url:"https://www.12348.gov.cn/"},{label:"B站 · 法律常识案例",url:"https://search.bilibili.com/all?keyword=%E6%B3%95%E5%BE%8B%E5%B8%B8%E8%AF%86%20%E6%A1%88%E4%BE%8B"}],
  "finance-study":[{label:"中国投资者网",url:"https://www.investor.org.cn/"},{label:"上交所投资者教育",url:"https://edu.sse.com.cn/"},{label:"B站 · 股票基金基础",url:"https://search.bilibili.com/all?keyword=%E8%82%A1%E7%A5%A8%20%E5%9F%BA%E9%87%91%20%E5%85%A5%E9%97%A8"}],
  photoshop:[{label:"Adobe Photoshop 中文教程",url:"https://helpx.adobe.com/cn/photoshop/tutorials.html"},{label:"B站 · Photoshop 系统教程",url:"https://search.bilibili.com/all?keyword=Photoshop%20%E7%B3%BB%E7%BB%9F%E6%95%99%E7%A8%8B"}],
  topik:[{label:"B站 · TOPIK 系统学习",url:"https://search.bilibili.com/all?keyword=TOPIK%20%E9%9F%A9%E8%AF%AD%20%E7%B3%BB%E7%BB%9F%E8%AF%BE"}],
  cpa:[{label:"中国注册会计师协会",url:"https://www.cicpa.org.cn/"},{label:"B站 · CPA 知识点",url:"https://search.bilibili.com/all?keyword=CPA%20%E6%B3%A8%E5%86%8C%E4%BC%9A%E8%AE%A1%E5%B8%88%20%E7%9F%A5%E8%AF%86%E7%82%B9"}]
};
const trackDaily = (id:string,date:string)=>{
  const ieltsSpeaking=[
    {text:"She remained resilient, identified the real problem, and proposed a practical solution.",translation:"她保持坚韧，找出了真正的问题，并提出了切实可行的解决方案。"},
    {text:"Public transport makes education and employment more accessible to everyone.",translation:"公共交通让每个人都更容易获得教育和就业机会。"},
    {text:"Small but consistent habits can transform the way we learn.",translation:"微小但持续的习惯能够改变我们的学习方式。"},
  ];
  const topikSpeaking=[
    {text:"오늘 한국어를 공부하고 싶어요.",translation:"今天我想学习韩语。"},
    {text:"주말에 친구를 만날 거예요.",translation:"周末我要去见朋友。"},
    {text:"날씨가 좋아서 공원에서 산책해요.",translation:"因为天气很好，所以我在公园散步。"},
  ];
  if(id==="ielts"){const speaking=ieltsSpeaking[dailyIndex(date,ieltsSpeaking.length)];return {words:IELTS_WORDS[dailyIndex(date,IELTS_WORDS.length)],items:["口语任务：先听示范，再按意群完成两遍跟读","跟读提示：注意重音、连读和句末语调"],material:speaking.text,speaking:speaking.text,translation:speaking.translation,language:"en-US"}}
  const sets=TRACK_DAILIES[id];
  if(id==="topik"&&sets){const speaking=topikSpeaking[dailyIndex(date,topikSpeaking.length)];return {...sets[dailyIndex(date,sets.length)],speaking:speaking.text,translation:speaking.translation,language:"ko-KR"}}
  return sets?{...sets[dailyIndex(date,sets.length)]}:{items:[],material:""};
};
const WORD_TRANSLATIONS:Record<string,string>={
  resilient:"她在每一次变化中都保持坚韧。",allocate:"我们应该为复习分配更多时间。",crucial:"睡眠对于高效学习至关重要。",enhance:"经常阅读可以提升你的词汇量。",sustainable:"城市需要可持续的交通系统。",perspective:"旅行让她对生活有了新的视角。",significant:"这项政策带来了显著改善。",adapt:"人们很快就能适应新技术。",contribute:"运动有助于改善心理健康。",inevitable:"某种程度的变化不可避免。",
  coherent:"她的论点清晰且连贯。",compelling:"这份报告提供了令人信服的证据。",evaluate:"学生应该认真评估每一个信息来源。",implement:"这座城市计划实施新政策。",maintain:"维持健康的平衡并不容易。",prioritize:"我们需要优先处理紧急任务。",fluctuate:"能源价格全年都会波动。",accessible:"在线课程让教育更容易获得。",controversial:"这项提议仍然极具争议。",justify:"你必须用例子证明自己的观点合理。",
  diverse:"这座城市拥有多元化的人口。",efficient:"公共交通是一种高效的选择。",emerge:"随着时间推移，新的挑战可能出现。",impact:"旅游业对当地文化有重大影响。",indicate:"这些数据表明增长保持稳定。",motivate:"小目标能够激励学习者。",preserve:"我们应该保护历史建筑。",relevant:"只加入相关信息。",transform:"科技可以改变工作场所。",widespread:"智能手机的使用如今十分普遍。"
};
const lessonFor=(skill:Skill,topic:string)=>{
  const detail=SKILL_DETAILS[skill.id];
  const examples:Record<string,string>={
    agent:"例如：一个待办 Agent 先读取今日任务，再调用日历工具查找空闲时间，最后生成计划；涉及删除或发送时必须等待人工确认。",
    html:"例如：用 <nav> 表示导航、<main> 表示主体、<button> 承担点击动作，而不是全部使用无语义的 div。",
    xpath:"例如：//button[contains(normalize-space(),'保存')] 会寻找文字含“保存”的按钮；比依赖页面中的第几个按钮更稳定。",
    python:"例如：把读取文件、清洗数据和保存结果拆成三个函数，并用 try/except 捕获可预期错误。",
    mysql:"例如：订单表通过 user_id 关联用户表；查询前先明确“一行代表什么”，再决定 JOIN 与聚合方式。",
    api:"例如：GET 用于读取，POST 常用于创建；遇到 429 应等待后重试，不能无间隔反复请求。",
    prompt:"例如：把“帮我总结”改成“用三条要点总结，每条不超过 30 字，并列出一个待确认问题”。",
    workflow:"例如：付款流程应包含待处理、成功、失败和人工复核状态；重复回调不能造成二次扣款。",
    bi:"例如：分析月度支出时，金额是指标，月份和类别是维度；折线图适合趋势，条形图适合类别比较。",
    warehouse:"例如：销售事实表记录订单明细，日期、商品和客户作为维度；所有分析必须尊重事实表粒度。",
    linux:"例如：`tail -f app.log` 持续查看日志，`grep ERROR app.log` 筛选错误；修改权限前先理解读、写、执行含义。"
  };
  return {title:`${skill.name} · ${topic}`,definition:`“${topic}”是 ${skill.name} 学习路径中的关键部分。${detail?.intro||""}`,explanation:`学习时不要只记术语：先弄清它解决什么问题、输入和输出是什么、失败时会怎样，再把它放进真实任务中验证。${detail?.steps?.join("；")||""}。`,example:examples[skill.id]||"把这个知识点放入一个真实的小任务中，记录你的假设、操作步骤、结果和需要改进的地方。",practice:detail?.practice||[]};
};
const SKILL_LINKS:Record<string,{label:string;url:string}[]> = {
  agent:[{label:"B站：AI Agent 入门",url:"https://search.bilibili.com/all?keyword=AI%20Agent%20%E5%85%A5%E9%97%A8"}],html:[{label:"菜鸟教程：HTML",url:"https://www.runoob.com/html/html-tutorial.html"}],xpath:[{label:"B站：XPath 实战",url:"https://search.bilibili.com/all?keyword=XPath%20%E5%AE%9E%E6%88%98"}],python:[{label:"菜鸟教程：Python",url:"https://www.runoob.com/python3/python3-tutorial.html"}],mysql:[{label:"菜鸟教程：MySQL",url:"https://www.runoob.com/mysql/mysql-tutorial.html"}],api:[{label:"B站：HTTP 与 API",url:"https://search.bilibili.com/all?keyword=HTTP%20API%20%E5%85%A5%E9%97%A8"}],prompt:[{label:"B站：提示词工程",url:"https://search.bilibili.com/all?keyword=%E6%8F%90%E7%A4%BA%E8%AF%8D%E5%B7%A5%E7%A8%8B"}],workflow:[{label:"B站：工作流自动化",url:"https://search.bilibili.com/all?keyword=%E5%B7%A5%E4%BD%9C%E6%B5%81%E8%87%AA%E5%8A%A8%E5%8C%96"}],bi:[{label:"B站：Power BI 入门",url:"https://search.bilibili.com/all?keyword=Power%20BI%20%E5%85%A5%E9%97%A8"}],warehouse:[{label:"阿里云：数据仓库基础",url:"https://developer.aliyun.com/article/740387"}],linux:[{label:"菜鸟教程：Linux",url:"https://www.runoob.com/linux/linux-tutorial.html"}],expression:[{label:"B站：高情商沟通与拒绝",url:"https://search.bilibili.com/all?keyword=%E9%AB%98%E6%83%85%E5%95%86%20%E6%B2%9F%E9%80%9A%20%E6%8B%92%E7%BB%9D"},{label:"B站：职场向上管理",url:"https://search.bilibili.com/all?keyword=%E8%81%8C%E5%9C%BA%20%E5%90%91%E4%B8%8A%E7%AE%A1%E7%90%86"}]
};
const SKILL_DETAILS:Record<string,{intro:string;steps:string[];practice:string[]}> = {
  agent:{intro:"Agent 能围绕目标规划步骤、调用工具并根据结果继续行动。重点还包括可控、可观测和失败可恢复。",steps:["理解模型、工具、状态与记忆的分工","用结构化输出约束每一步","为超时、重复执行和敏感操作建立边界"],practice:["做一个读取待办并生成计划的 Agent","记录工具调用结果和错误","设计必须人工确认的动作"]},
  html:{intro:"HTML 决定网页内容的结构与语义，也直接影响可访问性、SEO 和维护。",steps:["掌握语义标签","理解表单与键盘操作","正确表达图片、媒体与元数据"],practice:["搭一页语义化简历","让表单都有 label","检查无障碍树"]},
  xpath:{intro:"XPath 用路径和条件定位文档节点，是 RPA 稳定抓取的重要基础。",steps:["区分绝对与相对路径","掌握属性、文本和谓词","使用祖先、兄弟和后代轴"],practice:["为按钮写三种定位","避免易变序号","为动态列表设计稳定定位"]},
  python:{intro:"Python 可把数据处理、文件操作和接口调用封装成可复用工具。",steps:["数据结构、函数与异常","文件、JSON、日期及日志","requests、pandas 与自动化"],practice:["批量重命名并记录日志","调用 API 后清洗结果","拆成可测试函数"]},
  mysql:{intro:"MySQL 应从建模和可靠查询开始，再进入索引、事务与性能优化。",steps:["表、主键、外键和类型","过滤、聚合与 JOIN","索引、执行计划和事务"],practice:["设计待办数据表","写月度汇总查询","用 EXPLAIN 比较索引"]},
  api:{intro:"API 是系统交换数据的契约，稳定集成还需理解鉴权、错误处理和幂等性。",steps:["方法、状态码、Header 与 JSON","Token、OAuth 与最小权限","分页、限流、超时和重试"],practice:["用 Postman 调试 CRUD","为 429 设计退避","密钥不写入代码"]},
  prompt:{intro:"提示工程是清楚表达目标、上下文、约束和验收标准，并用评测持续迭代。",steps:["明确任务、边界和格式","用示例消除歧义","建立测试集"],practice:["改写一个模糊需求","设计 JSON Schema","做十个案例回归"]},
  workflow:{intro:"工作流把复杂任务拆成可追踪节点，并考虑分支、重试、补偿和人工介入。",steps:["明确触发、处理和输出","增加日志与唯一标识","设计恢复和人工接管"],practice:["画审批状态图","保证重复触发不重复写入","模拟失败并恢复"]},
  bi:{intro:"BI 把业务问题转成指标、维度和可行动的可视化。",steps:["定义业务问题和口径","建立指标关系","选择合适图表"],practice:["制作收支看板","写清指标口径","30 秒看出异常"]},
  warehouse:{intro:"数据仓库整合历史数据，关键是一致口径、分层、质量和可追溯性。",steps:["理解事实表与维度表","学习采集、明细与汇总分层","补充质量与血缘"],practice:["设计星型模型","写清表粒度","校验缺失与重复"]},
  linux:{intro:"Linux 基础帮助部署、观察和排查服务，重点是文件、权限、进程、网络与日志。",steps:["文件与管道命令","权限和进程","端口、服务、日志和 Shell"],practice:["用管道筛日志","查看端口占用","写带退出码的脚本"]},
  expression:{intro:"表达能力是在理解关系与边界后，把观点、需求和拒绝说得清楚、得体且有力量。",steps:["日常社交：倾听、追问与分享具体细节","结构表达：先结论，再原因和下一步","职场沟通：识别目标、资源、责任与边界"],practice:["用认可＋边界＋替代方案拒绝一次请求","用背景—行动—结果讲一个有趣故事","面对反问时回到事实和原问题，不进入自证陷阱"]}
};
const SKILL_MORE_POINTS:Record<string,string[]>={
  agent:["上下文管理","结构化输出","工具权限与人工确认","评测与可观测性"],html:["页面地标与标题层级","键盘焦点","响应式图片","表单校验"],xpath:["normalize-space 文本处理","动态属性定位","祖先与兄弟轴","等待与重试策略"],python:["类型提示","日志与配置","单元测试","虚拟环境与依赖"],mysql:["查询执行计划","复合索引","锁与隔离级别","备份恢复"],api:["幂等键","指数退避","Webhook 验签","接口版本管理"],prompt:["任务分解","少样本示例","提示注入防护","回归评测"],workflow:["补偿事务","人工接管","告警与追踪","版本与回滚"],bi:["指标口径","筛选上下文","视觉层级","异常解释"],warehouse:["数据粒度","缓慢变化维","数据血缘","质量规则"],linux:["systemd 服务","磁盘与内存排查","网络诊断","Shell 安全"],expression:["积极倾听","结论先行","冲突降温","职责边界"]
};
const skillKnowledge=(skill:Skill)=>[...new Set([...skill.points,...(SKILL_MORE_POINTS[skill.id]||[])])];
const dateDiff = (from:string,to:string) => Math.floor((new Date(`${to}T12:00:00`).getTime()-new Date(`${from}T12:00:00`).getTime())/86400000);
const addDays = (date:string,days:number) => { const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()+days);return dayKey(d); };
const promoDay=(id:string,title:string,rule:Partial<SpecialDay>):SpecialDay=>{const now=new Date(`${todayKey()}T12:00:00`);let date=todayKey();if(rule.recurrence==="weekly"){const diff=((rule.weekday||0)-now.getDay()+7)%7;date=addDays(date,diff)}else if(rule.recurrence==="monthly"){const candidate=new Date(now.getFullYear(),now.getMonth(),rule.monthDay||1,12);if(candidate<now)candidate.setMonth(candidate.getMonth()+1);date=dayKey(candidate)}else if(rule.recurrence==="yearly"){const candidate=new Date(now.getFullYear(),(rule.month||1)-1,rule.monthDay||1,12);if(candidate<now)candidate.setFullYear(candidate.getFullYear()+1);date=dayKey(candidate)}return {id:`promo-${id}`,title,date,kind:"折扣",calendar:"公历",reminderDays:0,updatedAt:Date.now(),...rule}};
const weeklyPromos:Record<number,string[]> = {
  1:["麦当劳会员日","喜茶小程序免配送费","罗森会员满15减5","一点点会员免费升大杯","霸王茶姬会员免费升大杯","杨国福88折","老乡鸡会员送鸡蛋","袁记云饺0.1元加云吞"],
  2:["盒马会员日88折","塔斯汀会员日买一送一","喜茶高阶及以上会员免费加小料","CoCo小程序小料免费加","达美乐指定款式七折","正新鸡排15元两个","必胜客会员日","茉莉奶白小程序免配送费","禾绿寿司会员日","阿嬷手作免配送费","沪上阿姨指定饮品第二杯半价"],
  3:["达美乐指定款式七折","蜜雪冰城满12减2","必胜客尖叫星期三","正新鸡排9.9三个汉堡","霸王茶姬免配送费","茶百道会员免费升杯","塔斯汀翅桶用券","Tims贝果堡套餐半价","古茗12点公众号抢免单券/买一送一","乐乐茶第二杯半价","茶颜悦色会员日","汉堡王会员国王日9.9一加一套餐","海底捞周三会员日实付满80元送一样菜品","星巴克会员蛋糕三明治7折/满30送美式","招行信用卡五折掌上生活App抢券","费大厨会员送一个菜（9:00–11:00、15:00–17:00小程序领券）","7-11便利店会员满35减7"],
  4:["肯德基疯狂星期四","老乡鸡会员送一个鸡腿","茶百道会员日","霸王茶姬11点买一送一券","CoCo拼单88折"],
  5:["茶颜悦色零食买四送一","罗森会员面包日","CoCo升杯日","茶百道会员免费升杯"]
};
const monthlyPromos:Record<number,string[]>={20:["古茗会员日"],8:["好想来会员88折","老婆大人会员日88折"],18:["德克士买一送一"]};
const PROMO_SPECIAL_DAYS:SpecialDay[]=[
  ...Object.entries(weeklyPromos).flatMap(([weekdayNumber,names])=>names.map((title,i)=>promoDay(`w${weekdayNumber}-${i}`,title,{recurrence:"weekly",weekday:Number(weekdayNumber)}))),
  ...Object.entries(monthlyPromos).flatMap(([monthDay,names])=>names.map((title,i)=>promoDay(`m${monthDay}-${i}`,title,{recurrence:"monthly",monthDay:Number(monthDay)}))),
  promoDay("haidilao-0901","海底捞9月1日送30元代金券",{recurrence:"yearly",month:9,monthDay:1})
];
const lunarParts=(date:string)=>{const parts=new Intl.DateTimeFormat("zh-CN-u-ca-chinese",{month:"numeric",day:"numeric"}).formatToParts(new Date(`${date}T12:00:00`));return {month:Number(parts.find(x=>x.type==="month")?.value),day:Number(parts.find(x=>x.type==="day")?.value)}};
const occursOn=(item:SpecialDay,date:string)=>{const d=new Date(`${date}T12:00:00`);if(item.calendar==="农历"&&item.recurrence==="yearly"){const lunar=lunarParts(date);return lunar.month===item.lunarMonth&&lunar.day===item.lunarDay}if(item.recurrence==="weekly")return d.getDay()===item.weekday;if(item.recurrence==="monthly")return d.getDate()===item.monthDay;if(item.recurrence==="yearly")return d.getMonth()+1===item.month&&d.getDate()===item.monthDay;return item.date===date};
const nextSpecialDate=(item:SpecialDay,from=todayKey())=>{if(!item.recurrence)return item.date;for(let i=0;i<370;i++){const date=addDays(from,i);if(occursOn(item,date))return date}return item.date};
const isMerchantSpecial=(item:SpecialDay)=>item.kind==="商家优惠活动"||item.id.startsWith("promo-");
const specialRank=(item:SpecialDay)=>item.kind==="生日"?0:(item.kind==="纪念日"?1:(isMerchantSpecial(item)?3:2));
const specialDaysForDate=(items:SpecialDay[],date:string)=>items.filter(item=>occursOn(item,date)).sort((a,b)=>specialRank(a)-specialRank(b)||a.updatedAt-b.updatedAt);
const specialRuleLabel=(item:SpecialDay)=>item.calendar==="农历"&&item.recurrence==="yearly"?`农历每年 ${item.lunarDate||`${item.lunarMonth}月${item.lunarDay}日`}`:item.recurrence==="weekly"?`每周${["日","一","二","三","四","五","六"][item.weekday||0]}`:item.recurrence==="monthly"?`每月 ${item.monthDay} 日`:item.recurrence==="yearly"?`每年 ${item.month} 月 ${item.monthDay} 日`:"单次提醒";
const chineseNumber=(text:string)=>{const digits:Record<string,number>={一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};const value=text.replace(/^初/,"").replace(/^廿/,"二十");if(value==="十")return 10;if(value==="二十")return 20;if(value==="三十")return 30;if(value.startsWith("十"))return 10+(digits[value[1]]||0);if(value.startsWith("二十"))return 20+(digits[value[2]]||0);return digits[value]||Number(value)||0};
const parseLunarPhrase=(row:string)=>{const cleaned=row.replace(/^\s*(?:农历|阴历)\s*/,"");const match=cleaned.match(/^(正月|冬月|腊月|(?:十[一二]?|[一二三四五六七八九])月)(初?[一二三四五六七八九十]+|廿[一二三四五六七八九]?|二十[一二三四五六七八九]?|三十)(.*)$/);if(!match)return null;const monthNames:Record<string,number>={正月:1,冬月:11,腊月:12};const month=monthNames[match[1]]||chineseNumber(match[1].replace("月",""));const day=chineseNumber(match[2]);if(month<1||month>12||day<1||day>30)return null;const title=match[3].replace(/^\s*(?:重阳节)?\s*(?:是|为|：|:)?\s*/,"").trim();return title?{month,day,title,lunarDate:`${match[1]}${match[2]}`}:null};
function defaultSpecialCategories(now=Date.now()):SpecialCategory[]{
  return [
    {id:"birthday",name:"生日",icon:"🎂",order:0,updatedAt:now},{id:"anniversary",name:"纪念日",icon:"♡",order:1,updatedAt:now},{id:"festival",name:"节日",icon:"✦",order:2,updatedAt:now},{id:"concert",name:"演唱会",icon:"♫",order:3,updatedAt:now},{id:"merchant",name:"商家优惠活动",icon:"％",order:4,updatedAt:now},
  ];
}
const withKnownSpecials=(items:SpecialDay[])=>items.filter(x=>!x.id.startsWith("promo-")&&x.title!=="会员超市折扣日");
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
  let nextStart=latest.start;
  while(nextStart<=date)nextStart=addDays(nextStart,cycle);
  return {phase,day,nextStart,nextEnd:addDays(nextStart,duration-1),cycle,duration};
};

type MapGeometry={type:"Polygon"|"MultiPolygon";coordinates:number[][][]|number[][][][]};
type MapFeature={type:"Feature";properties?:Record<string,unknown>;geometry:MapGeometry};
const mapPoint=(longitude:number,latitude:number)=>({x:(longitude+180)/360*1000,y:(90-latitude)/180*500});
const geometryPath=(geometry:MapGeometry)=>{
  const polygons=geometry.type==="Polygon"?[geometry.coordinates as number[][][]]:geometry.coordinates as number[][][][];
  return polygons.map(polygon=>polygon.map(ring=>ring.map(([longitude,latitude],index)=>{const point=mapPoint(longitude,latitude);return `${index?"L":"M"}${point.x.toFixed(2)},${point.y.toFixed(2)}`}).join(" ")+" Z").join(" ")).join(" ");
};
async function locatePlace(place:string,country:string){
  const query=[place,country].filter(Boolean).join(" ");
  const response=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=zh&format=json`);
  if(!response.ok)throw new Error("geocode");
  const json=await response.json();
  const candidates=(json.results||[]) as {name:string;country?:string;admin1?:string;latitude:number;longitude:number}[];
  const normalized=country.replace(/省|市|特别行政区|自治区|壮族|回族|维吾尔/g,"");
  const result=candidates.find(x=>!normalized||`${x.country||""}${x.admin1||""}`.includes(normalized))||candidates[0];
  if(!result)throw new Error("not-found");
  return {latitude:result.latitude,longitude:result.longitude,country:country.trim()||result.country||"待补充"};
}

function GeoWorldMap({places}:{places:Destination[]}){
  const [world,setWorld]=useState<MapFeature[]>([]);
  const [provinces,setProvinces]=useState<MapFeature[]>([]);
  const [zoom,setZoom]=useState(1);
  const [center,setCenter]=useState({x:500,y:250});
  const svgRef=useRef<SVGSVGElement>(null);
  const pointers=useRef(new Map<number,{x:number;y:number}>());
  const drag=useRef<{x:number;y:number;centerX:number;centerY:number}|null>(null);
  const pinch=useRef<{distance:number;zoom:number}|null>(null);
  const frame=useRef<number|null>(null);
  useEffect(()=>{let active=true;Promise.all([fetch("/maps/world-countries.geojson").then(r=>r.json()),fetch("/maps/china-provinces.geojson").then(r=>r.json())]).then(([a,b])=>{if(active){setWorld(a.features||[]);setProvinces(b.features||[])}}).catch(()=>{});return()=>{active=false}},[]);
  const viewWidth=1000/zoom,viewHeight=500/zoom;
  const clampedCenter={x:Math.max(viewWidth/2,Math.min(1000-viewWidth/2,center.x)),y:Math.max(viewHeight/2,Math.min(500-viewHeight/2,center.y))};
  useEffect(()=>()=>{if(frame.current!==null)cancelAnimationFrame(frame.current)},[]);
  const changeZoom=(next:number)=>{const value=Math.max(1,Math.min(8,next));setZoom(value);if(value===1)setCenter({x:500,y:250})};
  const queueCenter=(next:{x:number;y:number})=>{if(frame.current!==null)cancelAnimationFrame(frame.current);frame.current=requestAnimationFrame(()=>{setCenter(next);frame.current=null})};
  const plottedPlaces=places.map(place=>{const known=findLocationOption(place.country,place.place);return known?{...place,latitude:known.latitude,longitude:known.longitude}:place});
  return <div className="geo-world-map">
    <svg ref={svgRef} viewBox={`${clampedCenter.x-viewWidth/2} ${clampedCenter.y-viewHeight/2} ${viewWidth} ${viewHeight}`} aria-label="可缩放的世界地图" onWheel={e=>{e.preventDefault();changeZoom(zoom*(e.deltaY<0?1.25:.8))}} onPointerDown={e=>{pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});e.currentTarget.setPointerCapture(e.pointerId);const pts=[...pointers.current.values()];if(pts.length===1)drag.current={x:e.clientX,y:e.clientY,centerX:center.x,centerY:center.y};if(pts.length===2){pinch.current={distance:Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y),zoom};drag.current=null}}} onPointerMove={e=>{if(!pointers.current.has(e.pointerId)||!svgRef.current)return;pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});const pts=[...pointers.current.values()];if(pts.length>=2&&pinch.current){const distance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);changeZoom(pinch.current.zoom*distance/Math.max(1,pinch.current.distance));return}if(!drag.current)return;const rect=svgRef.current.getBoundingClientRect();queueCenter({x:drag.current.centerX-(e.clientX-drag.current.x)*viewWidth/rect.width,y:drag.current.centerY-(e.clientY-drag.current.y)*viewHeight/rect.height})}} onPointerUp={e=>{pointers.current.delete(e.pointerId);pinch.current=null;const remaining=[...pointers.current.values()][0];drag.current=remaining?{x:remaining.x,y:remaining.y,centerX:center.x,centerY:center.y}:null}} onPointerCancel={e=>{pointers.current.delete(e.pointerId);pinch.current=null;drag.current=null}}>
      <rect width="1000" height="500" className="map-ocean"/>
      <g className="map-countries">{world.map((feature,index)=><path key={index} d={geometryPath(feature.geometry)}/>)}</g>
      <g className="map-provinces">{provinces.map((feature,index)=><path key={index} d={geometryPath(feature.geometry)}/>)}</g>
      <g className="map-markers">{plottedPlaces.filter(x=>Number.isFinite(x.latitude)&&Number.isFinite(x.longitude)).map(place=>{const point=mapPoint(place.longitude!,place.latitude!);return <g className={place.visited?"visited":"planned"} key={place.id} transform={`translate(${point.x} ${point.y})`}><circle r={5/Math.sqrt(zoom)}/><circle className="marker-core" r={2/Math.sqrt(zoom)}/>{zoom>=2&&<text x={8/zoom} y={-7/zoom} fontSize={11/zoom}>{place.place}</text>}<title>{place.place} · {place.country} · {place.visited?"已经去过":"想去看看"}</title></g>})}</g>
    </svg>
    <div className="map-controls"><button type="button" onClick={()=>changeZoom(zoom*1.4)} aria-label="放大地图">＋</button><button type="button" onClick={()=>changeZoom(zoom/1.4)} aria-label="缩小地图">－</button><button type="button" onClick={()=>{setZoom(1);setCenter({x:500,y:250})}}>全图</button></div>
    <small><i className="visited-dot"/> 已经去过　<i className="planned-dot"/> 想去看看 · 双指或滚轮缩放</small>
  </div>;
}

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
    { id:"bi",name:"BI",icon:"▥",progress:"未开始" as ProgressState,beginner:["指标与维度","基础图表"],advanced:["看板设计","数据建模"],points:["指标","维度","可视化","Power BI"],resources:["Microsoft Learn Power BI"],notes:"",updatedAt:now },
    { id:"warehouse",name:"数据仓库",icon:"▤",progress:"未开始" as ProgressState,beginner:["事实表与维度表","ETL 基础"],advanced:["分层建模","质量与血缘"],points:["ETL","星型模型","分层"],resources:["阿里云数据仓库基础文章"],notes:"",updatedAt:now },
    { id:"linux",name:"Linux",icon:"$_",progress:"未开始" as ProgressState,beginner:["目录与常用命令","文件权限"],advanced:["进程、网络与脚本","部署排障"],points:["Shell","权限","进程","网络"],resources:["Linux Journey","鸟哥的 Linux 私房菜"],notes:"",updatedAt:now },
    { id:"expression",name:"表达能力",icon:"Aa",progress:"未开始" as ProgressState,beginner:["聊天不冷场与主动倾听","把一件事讲得清楚又有趣","高情商拒绝别人的 3 种方式"],advanced:["被反问时不陷入自证陷阱","职场向上管理","巧妙拒绝职责外任务与不合理要求"],points:["日常社交","故事表达","边界沟通","向上管理","非暴力沟通"],resources:["B 站：高情商沟通","B 站：职场表达"],notes:"",updatedAt:now },
  ],
  learningTracks: [
    { id:"law",name:"法律常识",icon:"§",subtitle:"",plan:["建立法律体系与基本概念","学习检索法条和识别争议焦点","结合案例训练证据与程序意识"],today:["案例：公司解除劳动合同，需要符合什么条件？","要点：注意保存劳动合同、工资记录与沟通证据。"],material:"内容仅作常识学习，具体问题仍需咨询专业人士。",updatedAt:now },
    { id:"finance-study",name:"股票基金",icon:"¥",subtitle:"",plan:["认识股票、基金与常见指数","理解风险、收益、费用和流动性","建立长期、分散且适合自己的投资框架"],today:["先理解股票与基金的基本差异。"],material:"仅作投资者教育，不构成投资建议。",updatedAt:now },
    { id:"photoshop",name:"Photoshop",icon:"Ps",subtitle:"",plan:["认识图层与选区","基础修图与文字排版","完成 3 个小设计案例"],today:["工具：污点修复画笔（J）","练习：为一张生活照移除一个小杂物"],material:"快捷键：⌘J 复制图层；⌘T 自由变换。",updatedAt:now },
    { id:"ielts",name:"雅思备考",icon:"EN",subtitle:"",plan:["第 1 阶段：语音与核心词汇","第 2 阶段：听读输入","第 3 阶段：写作与口语输出"],today:["resilient /rɪˈzɪliənt/ 有韧性的","allocate /ˈæləkeɪt/ 分配","口语：描述一次解决工作难题的经历"],material:"跟读例句：She remained resilient through every change.",updatedAt:now },
    { id:"topik",name:"韩语 TOPIK",icon:"한",subtitle:"",plan:["掌握韩文字母与发音","积累生活场景词汇","TOPIK I 语法与题型"],today:["안녕하세요 你好","오늘 今天","공부하다 学习","좋아하다 喜欢","천천히 慢慢地","语法：-고 싶어요（想要……）"],material:"오늘 한국어를 공부하고 싶어요.",updatedAt:now },
    { id:"cpa",name:"注册会计师",icon:"CPA",subtitle:"",plan:["会计要素与记账基础","审计与税法概览","按章节建立知识树"],today:["概念：资产是由过去事项形成、由企业控制并预期带来经济利益的资源","例题：用银行存款购入设备，会同时影响哪些会计科目？"],material:"建议每天 15 分钟，不追求速度，先建立框架。",updatedAt:now },
  ],
  checkins: [] as Checkin[],
  goals: [] as Goal[],
  goalCategories:[{id:"goal-cat-certificate",name:"证书",updatedAt:now},{id:"goal-cat-skill",name:"技能",updatedAt:now}] as MoodTag[],
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
    healthSettings:{privacy:false,cycleLength:28,periodLength:5,...DEFAULT_LOCATION,updatedAt:now},
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
  financeSettings:{updatedAt:now},
});

const phaseFiveDefaults = (now=Date.now()) => ({
  jobs:[
  ] as JobListing[],
  jobCriteria:[] as JobCriterion[],
});
const withoutStoredSalary = (parsed:any, defaults:ReturnType<typeof phaseFourDefaults>, cleanup=true) => {
  const settings = parsed.financeSettings || defaults.financeSettings;
  const financeSettings = cleanup ? {updatedAt:Date.now()} : settings;
  const entries = Array.isArray(parsed.financeEntries) ? parsed.financeEntries : defaults.financeEntries;
  const wageIds = new Set((Array.isArray(parsed.financeCategories) ? parsed.financeCategories : defaults.financeCategories).filter((c:FinanceCategory)=>c.type==="income"&&c.name==="工资").map((c:FinanceCategory)=>c.id));
  const financeEntries = cleanup ? entries.filter((e:FinanceEntry)=>!(wageIds.has(e.categoryId)&&e.note==="本月到手工资")) : entries;
  return {financeSettings,financeEntries};
};

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
    specialCategories:defaultSpecialCategories(now),
    specialDays:[] as SpecialDay[],
  };
};

const catDefaults=(now=Date.now())=>({
  catProfiles:[] as CatProfile[],
  catCare:[] as CatCare[],
  catGrowth:[] as CatGrowth[],
  catHealth:[] as CatHealth[],
  catWeights:[] as CatWeight[],
  readingBooks:[] as ReadingBook[],
  savedPodcasts:[] as SavedPodcast[],
  bookCategories:["文学","金融","人工智能","商业"].map((name,i)=>({id:`book-cat-${i}`,name,updatedAt:now})) as MoodTag[],
  podcastCategories:["情感","金融","人工智能","商业"].map((name,i)=>({id:`podcast-cat-${i}`,name,updatedAt:now})) as MoodTag[],
  moodTags:["朋友","阅读","思考","美食","工作"].map((name,i)=>({id:`mood-tag-${i}`,name,updatedAt:now})) as MoodTag[],
  moodEntries:[] as MoodEntry[],
});

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
    ...catDefaults(now),
    events: [
      { id: uid(), date: today, start: "09:30", end: "10:30", title: "整理本周 RPA 任务", categoryId: "work", updatedAt: now },
      { id: uid(), date: today, start: "18:30", end: "19:30", title: "普拉提课程", categoryId: "sport", updatedAt: now },
      { id: uid(), date: dayKey(tomorrow), start: "20:00", end: "20:30", title: "英语口语练习", categoryId: "life", updatedAt: now },
    ],
    todos: [
      { id: uid(), date: today, text: "复盘一个自动化流程", done: true, order: 0, updatedAt: now },
      { id: uid(), date: today, text: "学习 20 分钟 Python", done: false, order: 1, updatedAt: now },
    ],
    memos: [
      { id: uid(), text: "周末去逛一家安静的书店", order: 0, createdAt: now - 2000, updatedAt: now - 2000 },
      { id: uid(), text: "记得补充日常用品", order: 1, createdAt: now - 1000, updatedAt: now - 1000 },
    ],
  };
};

const nav: { id: View; label: string; icon: string }[] = [
  { id: "home", label: "首页", icon: "⌂" },
  { id: "calendar", label: "日程", icon: "▦" },
  { id: "growth", label: "成长", icon: "✦" },
  { id: "health", label: "健康", icon: "♡" },
  { id: "finance", label: "财务", icon: "◒" },
  { id: "travel", label: "旅行", icon: "✈" },
  { id: "memos", label: "备忘", icon: "☷" },
  { id: "cats", label: "猫咪", icon: "🐾" },
];

const greetings = [
  "认真完成一件小事，也是在稳稳地向前走。",
  "今天不必追赶谁，按照自己的节奏就很好。",
  "你值得更好的生活，也在为喜欢的未来踏实努力。",
  "把日子过成喜欢的样子，本身就是一种了不起。",
  "小熊今天也很喜欢你认真生活的样子。",
  "窗外的风轻轻吹过，而你比今天更明亮。",
  "给今天留一点期待，也给自己留一点温柔。",
  "慢慢积累的每一天，都会在未来悄悄发光。",
  "先照顾好此刻的自己，再从容地走向下一站。",
  "愿你今天有清晰的方向，也有放松的片刻。",
  "不慌不忙地生活，也是一种很了不起的能力。",
  "把注意力放回自己，今天会有新的小收获。",
];

function useWorkbench() {
  const [data, setData] = useState<WorkbenchData | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        saveSnapshot(saved,"打开工作台前自动保护",true);
        const parsed = JSON.parse(saved);
        const defaults = phaseTwoDefaults();
        const healthDefaults = phaseThreeDefaults();
        const financeDefaults = phaseFourDefaults();
        const jobDefaults = phaseFiveDefaults();
        const travelDefaults = phaseSixDefaults();
        const petDefaults = catDefaults();
        const shouldCleanSalary = localStorage.getItem(SALARY_CLEANUP_KEY)!=="done";
        const shouldCleanGrowth = localStorage.getItem(GROWTH_CLEANUP_KEY)!=="done";
        const shouldCleanJobFilters = localStorage.getItem(JOB_FILTER_CLEANUP_KEY)!=="done";
        const shouldCleanSpecialDays = localStorage.getItem(SPECIAL_DAYS_CLEANUP_KEY)!=="done";
        const shouldRefreshContent = localStorage.getItem(CONTENT_REFRESH_KEY)!=="done";
        const shouldCleanBirthdays = localStorage.getItem(BIRTHDAY_CLEANUP_KEY)!=="done";
        const cleanFinance = withoutStoredSalary(parsed,financeDefaults,shouldCleanSalary);
        if(shouldCleanSalary)localStorage.setItem(SALARY_CLEANUP_KEY,"done");
        if(shouldCleanGrowth)localStorage.setItem(GROWTH_CLEANUP_KEY,"done");
        if(shouldCleanJobFilters)localStorage.setItem(JOB_FILTER_CLEANUP_KEY,"done");
        if(shouldCleanSpecialDays)localStorage.setItem(SPECIAL_DAYS_CLEANUP_KEY,"done");
        if(shouldRefreshContent)localStorage.setItem(CONTENT_REFRESH_KEY,"done");
        if(shouldCleanBirthdays)localStorage.setItem(BIRTHDAY_CLEANUP_KEY,"done");
        const normalizedBookCategories=(Array.isArray(parsed.bookCategories)?parsed.bookCategories:petDefaults.bookCategories).filter((x:MoodTag)=>!["女性","新闻","读书","小说"].includes(x.name));
        if(!normalizedBookCategories.some((x:MoodTag)=>x.name==="文学"))normalizedBookCategories.unshift({id:"book-cat-literature",name:"文学",updatedAt:Date.now()});
        const normalizedPodcastCategories=(Array.isArray(parsed.podcastCategories)?parsed.podcastCategories:petDefaults.podcastCategories).filter((x:MoodTag)=>!["女性","新闻","读书"].includes(x.name));
        if(!normalizedPodcastCategories.some((x:MoodTag)=>x.name==="情感"))normalizedPodcastCategories.unshift({id:"podcast-cat-emotion",name:"情感",updatedAt:Date.now()});
        const trackOrder=["law","finance-study","photoshop","ielts","topik","cpa"];
        const trackDefaults=new Map(defaults.learningTracks.map(track=>[track.id,track]));
        const normalizedTracks=(Array.isArray(parsed.learningTracks)?parsed.learningTracks:defaults.learningTracks)
          .map((track:LearningTrack)=>{
            const fallback=trackDefaults.get(track.id);
            if(track.id==="law")return {...track,name:"法律常识",subtitle:"",plan:["建立法律体系与基本概念","学习检索法条和识别争议焦点","结合案例训练证据与程序意识"]};
            if(track.id==="finance-study")return {...track,name:"股票基金",subtitle:"",plan:fallback?.plan||track.plan};
            return {...track,subtitle:""};
          })
          .sort((a:LearningTrack,b:LearningTrack)=>trackOrder.indexOf(a.id)-trackOrder.indexOf(b.id));
        const normalizedSpecialDays=withKnownSpecials(Array.isArray(parsed.specialDays)?parsed.specialDays:travelDefaults.specialDays).filter((item:SpecialDay)=>!shouldCleanBirthdays||item.kind!=="生日"||!["我的生日","妈妈的生日","爸爸的生日"].includes(item.title));
        setData({
          ...parsed,
          modifiedAt:parsed.modifiedAt||dataModifiedAt(parsed)||Date.now(),
          todos: (Array.isArray(parsed.todos) ? parsed.todos : []).filter((todo:Todo)=>todo.text!=="更新求职简历"),
          skills: (()=>{const list=(Array.isArray(parsed.skills)?parsed.skills:defaults.skills).map((skill:Skill)=>({...skill,name:skill.name.replace(/（基础）/g,"")}));const expression=defaults.skills.find(x=>x.id==="expression");return expression&&!list.some((x:Skill)=>x.id==="expression")?[...list,expression]:list})(),
          learningTracks: normalizedTracks,
          checkins: Array.isArray(parsed.checkins) ? parsed.checkins : defaults.checkins,
          goals: (shouldCleanGrowth ? [] : (Array.isArray(parsed.goals) ? parsed.goals : defaults.goals)).filter((goal:Goal|{kind:string})=>goal.kind!=="副业") as Goal[],
          goalCategories: Array.isArray(parsed.goalCategories) ? parsed.goalCategories : defaults.goalCategories,
          periods: Array.isArray(parsed.periods) ? parsed.periods : healthDefaults.periods,
          workoutPlans: Array.isArray(parsed.workoutPlans) ? parsed.workoutPlans : healthDefaults.workoutPlans,
          healthLogs: Array.isArray(parsed.healthLogs) ? parsed.healthLogs : healthDefaults.healthLogs,
          recipes: Array.isArray(parsed.recipes) ? parsed.recipes : healthDefaults.recipes,
          healthSettings: {...healthDefaults.healthSettings,...(parsed.healthSettings||{})},
          financeCategories: Array.isArray(parsed.financeCategories) ? parsed.financeCategories : financeDefaults.financeCategories,
          financeEntries: cleanFinance.financeEntries,
          shoppingItems: Array.isArray(parsed.shoppingItems) ? parsed.shoppingItems : financeDefaults.shoppingItems,
          savingsGoals: Array.isArray(parsed.savingsGoals) ? parsed.savingsGoals : financeDefaults.savingsGoals,
          financeSettings: cleanFinance.financeSettings,
          jobs: (Array.isArray(parsed.jobs) ? parsed.jobs : jobDefaults.jobs).filter((job:JobListing)=>job.id!=="job-jiansheng"),
          jobCriteria: (Array.isArray(parsed.jobCriteria) ? parsed.jobCriteria : jobDefaults.jobCriteria).filter((criterion:JobCriterion)=>!shouldCleanJobFilters||!["criterion-keyword","criterion-size","criterion-location"].includes(criterion.id)),
          destinations: Array.isArray(parsed.destinations) ? parsed.destinations : travelDefaults.destinations,
          travelPlans: Array.isArray(parsed.travelPlans) ? parsed.travelPlans : travelDefaults.travelPlans,
          packingTemplate: Array.isArray(parsed.packingTemplate) ? parsed.packingTemplate : travelDefaults.packingTemplate,
          specialCategories: Array.isArray(parsed.specialCategories) ? parsed.specialCategories : travelDefaults.specialCategories,
          specialDays: normalizedSpecialDays,
          catProfiles: Array.isArray(parsed.catProfiles) ? parsed.catProfiles : petDefaults.catProfiles,
          catCare: Array.isArray(parsed.catCare) ? parsed.catCare : petDefaults.catCare,
          catGrowth: Array.isArray(parsed.catGrowth) ? parsed.catGrowth : petDefaults.catGrowth,
          catHealth: Array.isArray(parsed.catHealth) ? parsed.catHealth : petDefaults.catHealth,
          catWeights: Array.isArray(parsed.catWeights) ? parsed.catWeights : petDefaults.catWeights,
          readingBooks: (Array.isArray(parsed.readingBooks) ? parsed.readingBooks : petDefaults.readingBooks).map((x:ReadingBook)=>shouldRefreshContent&&["女性","新闻","读书","小说"].includes(x.category)?{...x,category:"文学"}:x),
          savedPodcasts: (Array.isArray(parsed.savedPodcasts) ? parsed.savedPodcasts : petDefaults.savedPodcasts).map((x:SavedPodcast)=>shouldRefreshContent&&["女性","新闻","读书"].includes(x.category)?{...x,category:"情感"}:x),
          bookCategories: normalizedBookCategories,
          podcastCategories: normalizedPodcastCategories,
          moodTags: Array.isArray(parsed.moodTags) ? parsed.moodTags : petDefaults.moodTags,
          moodEntries: Array.isArray(parsed.moodEntries) ? parsed.moodEntries : petDefaults.moodEntries,
        });
      } else setData({...seedData(),modifiedAt:Date.now()});
    } catch {
      const raw=localStorage.getItem(STORAGE_KEY);if(raw)saveSnapshot(raw,"读取异常时紧急保护",true);
      setData({...seedData(),modifiedAt:Date.now()});
    }
  }, []);
  useEffect(() => {
    if (!data)return;
    const current=localStorage.getItem(STORAGE_KEY);
    if(current){try{const stored=JSON.parse(current);if(dataModifiedAt(stored)>dataModifiedAt(data)){setData(stored);return}}catch{}const next=JSON.stringify(data);if(current!==next){saveSnapshot(current,"修改前自动保护");localStorage.setItem(STORAGE_KEY,next)}}else localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
  }, [data]);
  useEffect(()=>{const sync=(event:StorageEvent)=>{if(event.key!==STORAGE_KEY||!event.newValue)return;try{const incoming=JSON.parse(event.newValue);setData(current=>!current||dataModifiedAt(incoming)>dataModifiedAt(current)?incoming:current)}catch{}};window.addEventListener("storage",sync);return()=>window.removeEventListener("storage",sync)},[]);
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
  return <div className="empty"><img src="/bears/v2/bear-flower.png" alt="" /><p>{text}</p></div>;
}

export default function Home() {
  const [data, setData] = useWorkbench();
  const [view, setView] = useState<View>("home");
  const [growthStartTab,setGrowthStartTab]=useState<"path"|"learn"|"goals"|"jobs">("path");
  const [healthStartTab,setHealthStartTab]=useState<"cycle"|"fitness"|"food"|"care">("cycle");
  const [financeStartTab,setFinanceStartTab]=useState<"ledger"|"shopping"|"advice">("ledger");
  const [catStartId,setCatStartId]=useState("");
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [eventModal, setEventModal] = useState<EventItem | "new" | null>(null);
  const [memoModal, setMemoModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "event" | "todo" | "memo"; id: string } | null>(null);
  const [importMode, setImportMode] = useState<"replace" | "merge" | null>(null);
  const [pendingImport, setPendingImport] = useState<WorkbenchData | null>(null);
  const [showDataTools,setShowDataTools]=useState(false);
  const [backupHistory,setBackupHistory]=useState<BackupSnapshot[]>([]);
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

  const patch = (fn: (draft: WorkbenchData) => WorkbenchData) => setData((old) => old ? {...fn(old),modifiedAt:Date.now()} : old);
  const go = (next: View, date?: string) => { if (date) setSelectedDate(date); setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goSection=(next:"growth"|"health"|"finance",tab:"learn"|"fitness"|"path"|"care"|"shopping")=>{
    if(next==="growth")setGrowthStartTab(tab==="learn"?"learn":"path");
    if(next==="health")setHealthStartTab(tab==="care"?"care":"fitness");
    if(next==="finance")setFinanceStartTab("shopping");
    go(next);
  };
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

  const downloadJSON=(raw:string,name:string)=>{
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };
  const exportJSON = () => downloadJSON(JSON.stringify({ ...data, exportedAt: Date.now() }, null, 2),`小熊工作台-${todayKey()}.json`);
  const openDataTools=()=>{setBackupHistory(readSnapshots());setShowDataTools(true)};
  const restoreSnapshot=(snapshot:BackupSnapshot)=>{try{const restored=JSON.parse(snapshot.raw) as WorkbenchData;saveSnapshot(JSON.stringify(data),"恢复历史版本前保护",true);setData({...restored,modifiedAt:Date.now()});setShowDataTools(false)}catch{alert("这个历史版本无法读取，请先导出后保留。")}};

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
        const petDefaults = catDefaults();
        const cleanFinance = withoutStoredSalary(parsed,financeDefaults);
        setPendingImport({
          ...parsed,
          skills: Array.isArray(parsed.skills) ? parsed.skills : defaults.skills,
          learningTracks: Array.isArray(parsed.learningTracks) ? parsed.learningTracks : defaults.learningTracks,
          checkins: Array.isArray(parsed.checkins) ? parsed.checkins : defaults.checkins,
          goals: (Array.isArray(parsed.goals) ? parsed.goals : defaults.goals).filter((goal:Goal|{kind:string})=>goal.kind!=="副业") as Goal[],
          goalCategories: Array.isArray(parsed.goalCategories) ? parsed.goalCategories : defaults.goalCategories,
          periods: Array.isArray(parsed.periods) ? parsed.periods : healthDefaults.periods,
          workoutPlans: Array.isArray(parsed.workoutPlans) ? parsed.workoutPlans : healthDefaults.workoutPlans,
          healthLogs: Array.isArray(parsed.healthLogs) ? parsed.healthLogs : healthDefaults.healthLogs,
          recipes: Array.isArray(parsed.recipes) ? parsed.recipes : healthDefaults.recipes,
          healthSettings: {...healthDefaults.healthSettings,...(parsed.healthSettings||{})},
          financeCategories: Array.isArray(parsed.financeCategories) ? parsed.financeCategories : financeDefaults.financeCategories,
          financeEntries: cleanFinance.financeEntries,
          shoppingItems: Array.isArray(parsed.shoppingItems) ? parsed.shoppingItems : financeDefaults.shoppingItems,
          savingsGoals: Array.isArray(parsed.savingsGoals) ? parsed.savingsGoals : financeDefaults.savingsGoals,
          financeSettings: cleanFinance.financeSettings,
          jobs: Array.isArray(parsed.jobs) ? parsed.jobs : jobDefaults.jobs,
          jobCriteria: Array.isArray(parsed.jobCriteria) ? parsed.jobCriteria : jobDefaults.jobCriteria,
          destinations: Array.isArray(parsed.destinations) ? parsed.destinations : travelDefaults.destinations,
          travelPlans: Array.isArray(parsed.travelPlans) ? parsed.travelPlans : travelDefaults.travelPlans,
          packingTemplate: Array.isArray(parsed.packingTemplate) ? parsed.packingTemplate : travelDefaults.packingTemplate,
          specialCategories: Array.isArray(parsed.specialCategories) ? parsed.specialCategories : travelDefaults.specialCategories,
          specialDays: withKnownSpecials(Array.isArray(parsed.specialDays) ? parsed.specialDays : travelDefaults.specialDays),
          catProfiles: Array.isArray(parsed.catProfiles) ? parsed.catProfiles : petDefaults.catProfiles,
          catCare: Array.isArray(parsed.catCare) ? parsed.catCare : petDefaults.catCare,
          catGrowth: Array.isArray(parsed.catGrowth) ? parsed.catGrowth : petDefaults.catGrowth,
          catHealth: Array.isArray(parsed.catHealth) ? parsed.catHealth : petDefaults.catHealth,
          catWeights: Array.isArray(parsed.catWeights) ? parsed.catWeights : petDefaults.catWeights,
          readingBooks: Array.isArray(parsed.readingBooks) ? parsed.readingBooks : petDefaults.readingBooks,
          savedPodcasts: Array.isArray(parsed.savedPodcasts) ? parsed.savedPodcasts : petDefaults.savedPodcasts,
          bookCategories: Array.isArray(parsed.bookCategories) ? parsed.bookCategories : petDefaults.bookCategories,
          podcastCategories: Array.isArray(parsed.podcastCategories) ? parsed.podcastCategories : petDefaults.podcastCategories,
          moodTags: Array.isArray(parsed.moodTags) ? parsed.moodTags : petDefaults.moodTags,
          moodEntries: Array.isArray(parsed.moodEntries) ? parsed.moodEntries : petDefaults.moodEntries,
        });
        setImportMode("merge");
      } catch { alert("这个文件不是有效的小熊工作台数据。"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const performImport = () => {
    if (!pendingImport || !importMode) return;
    if (importMode === "replace") {saveSnapshot(JSON.stringify(data),"导入覆盖前保护",true);setData({...pendingImport,modifiedAt:Date.now()});}
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
        goalCategories: merge(current.goalCategories, pendingImport.goalCategories),
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
        jobCriteria: merge(current.jobCriteria, pendingImport.jobCriteria),
        destinations: merge(current.destinations, pendingImport.destinations),
        travelPlans: merge(current.travelPlans, pendingImport.travelPlans),
        packingTemplate: pendingImport.packingTemplate.length ? pendingImport.packingTemplate : current.packingTemplate,
        specialCategories: merge(current.specialCategories, pendingImport.specialCategories),
        specialDays: merge(current.specialDays, pendingImport.specialDays),
        catProfiles: merge(current.catProfiles, pendingImport.catProfiles),
        catCare: merge(current.catCare, pendingImport.catCare),
        catGrowth: merge(current.catGrowth, pendingImport.catGrowth),
        catHealth: merge(current.catHealth, pendingImport.catHealth),
        catWeights: merge(current.catWeights, pendingImport.catWeights),
        readingBooks: merge(current.readingBooks, pendingImport.readingBooks),
        savedPodcasts: merge(current.savedPodcasts, pendingImport.savedPodcasts),
        bookCategories: merge(current.bookCategories, pendingImport.bookCategories),
        podcastCategories: merge(current.podcastCategories, pendingImport.podcastCategories),
        moodTags: merge(current.moodTags, pendingImport.moodTags),
        moodEntries: merge(current.moodEntries, pendingImport.moodEntries),
      };
    });
    setPendingImport(null); setImportMode(null);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><img src="/bears/v2/bear-heart.png" alt="" /><div><strong>小熊工作台</strong><span>认真生活，也要拥抱自己</span></div></div>
        <nav>{nav.map((n) => <button key={n.id} className={view === n.id ? "active" : ""} onClick={() => go(n.id)}><i>{n.icon}</i><span>{n.label}</span></button>)}</nav>
        <div className="sync-box"><span>✦ 数据安全中心</span><button onClick={openDataTools}>备份与恢复</button><button onClick={exportJSON}>导出 JSON</button><button className="secondary" onClick={() => fileRef.current?.click()}>导入 JSON</button></div>
      </aside>

      <main className="content">
        {view === "home" && <Dashboard data={data} go={go} goSection={goSection} openCat={(id)=>{setCatStartId(id);go("cats")}} toggleTodo={toggleTodo} patch={patch} />}
        {view === "calendar" && <Calendar data={data} dates={dates} selectedDate={selectedDate} setSelectedDate={setSelectedDate} category={category} toggleTodo={toggleTodo} move={move} onAdd={() => setEventModal("new")} onEdit={setEventModal} onDelete={setDeleteTarget} patch={patch} />}
        {view === "growth" && <Growth data={data} patch={patch} initialTab={growthStartTab} />}
        {view === "health" && <Health data={data} patch={patch} initialTab={healthStartTab} />}
        {view === "finance" && <Finance data={data} patch={patch} initialTab={financeStartTab} />}
        {view === "jobs" && <Growth data={data} patch={patch} initialTab="jobs" />}
        {view === "travel" && <Travel data={data} patch={patch} />}
        {view === "memos" && <Memos data={data} go={go} toggleTodo={toggleTodo} move={move} onAdd={() => setMemoModal(true)} onDelete={setDeleteTarget} patch={patch} />}
        {view === "cats" && <Cats data={data} patch={patch} initialCatId={catStartId} />}
        {!["home","calendar","growth","health","finance","jobs","travel","memos","cats"].includes(view) && <ComingSoon view={view} />}
      </main>

      <nav className="mobile-nav">{nav.map((n) => <button key={n.id} className={view === n.id ? "active" : ""} onClick={() => go(n.id)}><i>{n.icon}</i><span>{n.label}</span></button>)}</nav>
      <button className="mobile-data-button" onClick={openDataTools} aria-label="打开数据备份"><i>⇩</i><span>数据备份</span></button>
      {view !== "memos" && <button className="bear-fab" onClick={() => setMemoModal(true)} aria-label="快速备忘"><img src="/bears/v2/bear-heart.png" alt="" /><span>记一下</span></button>}

      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={readImport} />
      {eventModal && <EventEditor item={eventModal === "new" ? null : eventModal} date={selectedDate} data={data} patch={patch} close={() => setEventModal(null)} />}
      {memoModal && <MemoEditor patch={patch} close={() => setMemoModal(false)} />}
      {showDataTools&&<Modal title="数据安全中心" onClose={()=>setShowDataTools(false)}><div className="mobile-data-panel"><p>当前设备中有 <b>{data.events.length}</b> 条日程、<b>{data.todos.length}</b> 条待办、<b>{data.memos.length}</b> 条备忘，以及其他模块的本机记录。</p><div className="data-primary-actions"><button onClick={exportJSON}>导出当前数据 JSON</button><button className="secondary" onClick={()=>fileRef.current?.click()}>导入以前的 JSON 备份</button></div><section className="backup-history"><header><div><b>自动历史版本</b><small>修改前与升级前自动保留，最多 15 份</small></div><span>{backupHistory.length} 份</span></header>{backupHistory.map(snapshot=>{let summary="历史数据";try{const item=JSON.parse(snapshot.raw);summary=`${item.events?.length||0} 日程 · ${item.todos?.length||0} 待办 · ${item.memos?.length||0} 备忘`}catch{}return <article key={snapshot.id}><div><b>{new Date(snapshot.createdAt).toLocaleString("zh-CN",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})}</b><span>{snapshot.reason} · {summary}</span></div><button className="secondary" onClick={()=>downloadJSON(snapshot.raw,`小熊工作台-历史版本-${snapshot.createdAt}.json`)}>导出</button><button onClick={()=>restoreSnapshot(snapshot)}>恢复</button></article>})}{!backupHistory.length&&<small>从下一次修改开始，这里会自动保留可恢复的历史版本。</small>}</section><small>自动历史能防止误覆盖；重要数据仍建议定期导出 JSON 到“文件”或 iCloud Drive。</small></div></Modal>}
      {deleteTarget && <Modal title="要删除这条内容吗？" onClose={() => setDeleteTarget(null)}><p className="modal-copy">删除后无法从当前设备恢复，小熊再帮你确认一次。</p><div className="modal-actions"><button className="secondary" onClick={() => setDeleteTarget(null)}>先保留</button><button className="danger" onClick={performDelete}>确认删除</button></div></Modal>}
      {pendingImport && <Modal title="导入工作台数据" onClose={() => { setPendingImport(null); setImportMode(null); }}><p className="modal-copy">文件中有 {pendingImport.events.length} 条日程、{pendingImport.todos.length} 个待办和 {pendingImport.memos.length} 条备忘。</p><div className="mode-choices"><label><input type="radio" checked={importMode === "merge"} onChange={() => setImportMode("merge")} /> 智能合并 <small>保留两端内容，同一条以最新修改为准</small></label><label><input type="radio" checked={importMode === "replace"} onChange={() => setImportMode("replace")} /> 完全覆盖 <small>当前设备数据将被文件内容替换</small></label></div><div className="modal-actions"><button className="secondary" onClick={() => setPendingImport(null)}>取消</button><button onClick={performImport}>确认导入</button></div></Modal>}
    </div>
  );
}

function Dashboard({ data, go, goSection, openCat, toggleTodo, patch }: { data: WorkbenchData; go: (v: View, d?: string) => void; goSection:(v:"growth"|"health"|"finance",tab:"learn"|"fitness"|"path"|"care"|"shopping")=>void; openCat:(id:string)=>void; toggleTodo: (id: string) => void; patch:(fn:(d:WorkbenchData)=>WorkbenchData)=>void }) {
  const today = todayKey();
  const d = new Date();
  const [todoText,setTodoText]=useState("");
  const [editingTodo,setEditingTodo]=useState<string|null>(null);
  const [deleteTodo,setDeleteTodo]=useState<string|null>(null);
  const [memoText,setMemoText]=useState("");
  const [editingMemo,setEditingMemo]=useState<string|null>(null);
  const [deleteMemo,setDeleteMemo]=useState<string|null>(null);
  const [showPromoReminders,setShowPromoReminders]=useState(false);
  const [homeWeather,setHomeWeather]=useState<{temperature:number;apparent:number;code:number}|null>(null);
  const location=healthLocation(data.healthSettings);
  const todays = data.todos.filter((t) => t.date === today);
  const todayStudy = data.checkins.filter((c) => c.date === today);
  const careerCount = data.skills.filter((s) => s.lastCheckin === today).length;
  const todayPlans=data.workoutPlans.filter(p=>p.weekday===new Date().getDay());
  const fitnessCount=todayPlans.filter(p=>p.completedDates?.includes(today)).length;
  const todaysEvents=[...data.events].filter(e=>e.date===today).sort((a,b)=>a.start.localeCompare(b.start));
  const nowTime=`${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const nextEvent=todaysEvents.find(e=>e.start>=nowTime)||todaysEvents[0];
  const latest = [...data.memos].filter(m=>m.createdAt>=Date.now()-3*86400000).sort((a, b) => b.createdAt - a.createdAt);
  const allReminders=data.specialDays.map(item=>({item,date:nextSpecialDate(item,today)})).filter(x=>{const days=dateDiff(today,x.date);return days>=0&&days<=Math.max(3,x.item.reminderDays)}).sort((a,b)=>a.date.localeCompare(b.date)||specialRank(a.item)-specialRank(b.item)||a.item.updatedAt-b.item.updatedAt);
  const promoReminders=allReminders.filter(x=>x.item.kind==="商家优惠活动");
  const reminders=allReminders.filter(x=>x.item.kind!=="商家优惠活动").slice(0,3);
  const nextCycle=cycleInfo(data,today);
  const cycleReminderDays=nextCycle.nextStart?dateDiff(today,nextCycle.nextStart):-1;
  const showCycleReminder=!data.healthSettings.privacy&&cycleReminderDays>=0&&cycleReminderDays<=3;
  const greeting = greetings[Math.floor((d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % greetings.length)];
  const checkinMetrics=[
    {label:"学习",done:new Set(todayStudy.map(x=>x.trackId)).size,total:data.learningTracks.length,target:"growth" as const,tab:"learn" as const,detail:`${todayStudy.length} / ${data.learningTracks.length} 项`},
    {label:"健身",done:fitnessCount,total:todayPlans.length,target:"health" as const,tab:"fitness" as const,detail:todayPlans.length?`${fitnessCount} / ${todayPlans.length} 项`:"今天暂无计划"},
    {label:"职业",done:careerCount,total:data.skills.length,target:"growth" as const,tab:"path" as const,detail:`${careerCount} / ${data.skills.length} 项`},
  ];
  useEffect(()=>{fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,weather_code&timezone=${encodeURIComponent(location.timezone)}`).then(r=>{if(!r.ok)throw new Error();return r.json()}).then(j=>setHomeWeather({temperature:j.current.temperature_2m,apparent:j.current.apparent_temperature,code:j.current.weather_code})).catch(()=>{})},[location.latitude,location.longitude,location.timezone]);
  const monthPrefix=today.slice(0,7);
  const workoutCount=data.workoutPlans.reduce((sum,p)=>sum+(p.completedDates||[]).filter(date=>date.startsWith(monthPrefix)).length,0);
  const learningDays=new Set([...data.checkins.filter(x=>x.date.startsWith(monthPrefix)).map(x=>x.date),...data.skills.map(x=>x.lastCheckin).filter((x):x is string=>Boolean(x?.startsWith(monthPrefix)))]).size;
  const savingTarget=data.shoppingItems.filter(x=>!x.purchased).reduce((sum,x)=>sum+x.price,0);
  const savingDone=data.shoppingItems.filter(x=>!x.purchased).reduce((sum,x)=>sum+Math.min(x.saved||0,x.price),0);
  const savingProgress=savingTarget?Math.min(100,Math.round(savingDone/savingTarget*100)):0;
  const phase=data.healthSettings.privacy?"隐私模式":cycleInfo(data).phase;
  const homeCats=[...data.catProfiles].sort((a,b)=>{
    if(a.homeDate&&b.homeDate)return a.homeDate.localeCompare(b.homeDate)||a.updatedAt-b.updatedAt;
    if(a.homeDate)return -1;
    if(b.homeDate)return 1;
    return a.updatedAt-b.updatedAt;
  });
  const weatherLead=homeWeather?homeWeather.code>=50?`${location.city}今天有雨、体感约 ${Math.round(homeWeather.apparent)}°C，记得带伞；`:`${location.city}今天体感约 ${Math.round(homeWeather.apparent)}°C，适合适度活动；`:"今天按自己的体感安排节奏；";
  const phaseTip=phase==="月经期"?"以保暖、补水和轻柔活动为主。":phase==="卵泡期"?"能量通常在回升，可以循序增加活动量。":phase==="排卵期"?"状态活跃时也要充分热身、注意关节稳定。":phase==="黄体期"?"给睡眠和稳定饮食多一点优先级。":"规律吃饭、适量活动，也记得留一点休息时间。";
  const healthTip=`${weatherLead}${phaseTip}`;
  const hour=d.getHours();
  const timeGreeting=hour>=5&&hour<11?"早上好":hour>=11&&hour<14?"中午好":hour>=14&&hour<18?"下午好":"晚上好";
  const warmLines={lateNight:["夜深了，早点休息吧","把今天轻轻放下吧","安心睡个好觉吧"],morning:["愿今天轻盈明亮","带着好心情出发","今天也元气满满"],noon:["好好吃饭，稍作休息","午间歇一歇吧","为下午蓄满能量"],afternoon:["喝口水，慢慢向前","按自己的节奏来","今天依然闪闪发光"],evening:["今天辛苦了，放松吧","把疲惫轻轻放下","今晚好好照顾自己"]};
  const warmPeriod=hour>=1&&hour<5?"lateNight":hour>=5&&hour<11?"morning":hour>=11&&hour<14?"noon":hour>=14&&hour<18?"afternoon":"evening";
  const warmLine=warmLines[warmPeriod][dailyIndex(today,warmLines[warmPeriod].length)];
  const addTodo=(e:FormEvent)=>{e.preventDefault();if(!todoText.trim())return;patch(x=>({...x,todos:[...x.todos,{id:uid(),date:today,text:todoText.trim(),done:false,order:todays.length,updatedAt:Date.now()}]}));setTodoText("")};
  const addMemo=(e:FormEvent)=>{e.preventDefault();if(!memoText.trim())return;patch(x=>({...x,memos:x.memos.map(m=>({...m,order:m.order+1})).concat({id:uid(),text:memoText.trim(),order:0,createdAt:Date.now(),updatedAt:Date.now()})}));setMemoText("")};
  return <div className="page dashboard">
    <header className="topbar"><div><p>{d.getFullYear()}年{d.getMonth()+1}月{d.getDate()}日 · {weekday(today)}</p><h1>{timeGreeting}，{warmLine} <span>♡</span></h1></div><button className="avatar" aria-label="个人设置"><img src="/bears/v2/bear-profile.png" alt="" /></button></header>
    <section className="hero"><div className="hero-copy"><span className="eyebrow">TODAY&apos;S LITTLE NOTE</span><blockquote>“{greeting}”</blockquote><p>— 来自今天的小熊</p></div><img src="/bears/v2/bear-heart.png" alt="抱着粉色爱心的水彩小熊" /></section>
    <div className="section-title"><div><span>今日概览</span><h2>把重要的事，轻轻接住</h2></div><button className="text-btn" onClick={() => go("calendar", today)}>查看今日日程 →</button></div>
    {(reminders.length>0||promoReminders.length>0||showCycleReminder)&&<section className="dashboard-reminder future-status"><div className="insight-head"><div><span className="eyebrow">NEXT THREE DAYS</span><h2>未来三天提醒</h2></div></div><div className="future-reminder-items">{showCycleReminder&&<button onClick={()=>go("health")}><b>❀ 经期温柔提醒</b><small>{cycleReminderDays===0?"预计今天开始":`预计 ${cycleReminderDays} 天后开始`} · 提前准备常用物品，给身体多一点休息</small></button>}{reminders.map(x=><button key={x.item.id} onClick={()=>{go("memos");setTimeout(()=>document.getElementById("special-dates")?.scrollIntoView({behavior:"smooth"}),120)}}><b>{x.item.kind==="生日"?"🎂":x.item.kind==="纪念日"?"♡":"✦"} {x.item.title}</b><small>{x.date===today?"今天":`${dateDiff(today,x.date)} 天后`}</small></button>)}{promoReminders.length>0&&<button onClick={()=>setShowPromoReminders(true)}><b>％ 商家优惠活动</b><small>未来三天共 {promoReminders.length} 项，点击展开</small></button>}</div></section>}
    <section className="dashboard-top-grid">
      <button className="overview-card pink next-event-card" onClick={() => go("calendar", today)}><div className="home-card-heading"><div><span className="eyebrow">NEXT UP</span><h2>下一项日程</h2></div><i>◷</i></div>{nextEvent?<><strong>{nextEvent.start}</strong><h3>{nextEvent.title}</h3><p>{nextEvent.start}—{nextEvent.end} · 点击查看今天的完整安排</p></>:<><strong>—</strong><h3>今天没有日程</h3><p>留一点空白，也是一种认真生活。</p></>}</button>
      <section className="overview-card cream home-memos"><div className="home-card-heading"><div><span className="eyebrow">QUICK NOTES</span><h2>快速备忘</h2></div><button onClick={()=>go("memos")}>查看全部 →</button></div><form onSubmit={addMemo}><input value={memoText} onChange={e=>setMemoText(e.target.value)} placeholder="记下一个临时想法…"/><button>＋</button></form>{latest.length?<div>{latest.map(m=><article key={m.id}>{editingMemo===m.id?<input autoFocus value={m.text} onChange={e=>patch(x=>({...x,memos:x.memos.map(y=>y.id===m.id?{...y,text:e.target.value,updatedAt:Date.now()}:y)}))} onBlur={()=>setEditingMemo(null)}/>:<button onClick={()=>setEditingMemo(m.id)}>{m.text}</button>}<button onClick={()=>setDeleteMemo(m.id)}>×</button></article>)}</div>:<p>近三天还没有备忘</p>}</section>
    </section>
    <section className="overview-card lilac dashboard-primary-todos"><div className="home-card-heading"><div><span className="eyebrow">TODAY&apos;S TO-DO</span><h2>今日待办</h2></div><div className="panel-actions"><span className="todo-count">{todays.filter(x=>x.done).length} / {todays.length} 完成</span><button onClick={()=>go("calendar",today)}>查看全部 →</button></div></div><form className="dashboard-add-todo" onSubmit={addTodo}><input value={todoText} onChange={e=>setTodoText(e.target.value)} placeholder="添加一个临时待办…"/><button>＋ 添加</button></form>{todays.length?<div className="dashboard-todos">{todays.sort((a,b)=>a.order-b.order).map(t=><div className="dashboard-todo-row" key={t.id}><label aria-label={`切换${t.text}完成状态`}><input type="checkbox" checked={t.done} onChange={()=>toggleTodo(t.id)}/><i></i></label><input className={t.done?"strike":""} value={t.text} onFocus={()=>setEditingTodo(t.id)} onChange={e=>patch(x=>({...x,todos:x.todos.map(y=>y.id===t.id?{...y,text:e.target.value,updatedAt:Date.now()}:y)}))} onBlur={()=>setEditingTodo(null)} aria-label="修改待办内容"/><button className={editingTodo===t.id?"editing":""} onClick={()=>setDeleteTodo(t.id)} aria-label="删除待办">×</button></div>)}</div>:<Empty text="今天还没有待办，先写下一件最想完成的小事吧。"/>}</section>
    <section className="overview-card lilac dashboard-checkin"><div className="home-card-heading"><div><span className="eyebrow">TODAY&apos;S CHECK-IN</span><h2>今日打卡</h2></div><i>✦</i></div><div className="checkin-row">{checkinMetrics.map(x=>{const progress=x.total?x.done/x.total:0;const state=progress===0?"":progress>=1?"done":"partial";return <button key={x.label} className={state} onClick={()=>goSection(x.target,x.tab)}><i style={{"--check-progress":`${progress*360}deg`} as React.CSSProperties}>{progress>=1?"✓":progress>0?<b>{Math.round(progress*100)}</b>:""}</i><span><b>{x.label}</b><small>{x.detail}</small></span></button>})}</div></section>
    <section className="dashboard-insights">
      <section className="month-status"><div className="insight-head"><div><span className="eyebrow">THIS MONTH</span><h2>本月状态</h2></div></div><div className="month-metrics"><button onClick={()=>goSection("finance","shopping")}><i className="saving-ring" style={{"--saving-progress":`${savingProgress*3.6}deg`} as React.CSSProperties}><b>{savingProgress}%</b></i><span>储蓄进度</span></button><button onClick={()=>goSection("health","fitness")}><b>{workoutCount}<small> 次</small></b><span>运动完成</span></button><button onClick={()=>goSection("growth","learn")}><b>{learningDays}<small> 天</small></b><span>学习记录</span></button></div></section>
      <button className="health-glance" onClick={()=>goSection("health","care")}><div className="insight-head"><div><span className="eyebrow">TODAY&apos;S WELLNESS</span><h2>今日健康提示</h2></div><i>{homeWeather?.code&&homeWeather.code>=50?"☂":"♡"}</i></div><p>{healthTip}</p><span>查看保养建议 →</span></button>
    </section>
    <section className="home-cats">{homeCats.length?homeCats.map(homeCat=>{const care=data.catCare.filter(x=>x.catId===homeCat.id&&x.date===today);const latestWeight=[...data.catWeights].filter(x=>x.catId===homeCat.id).sort((a,b)=>b.date.localeCompare(a.date))[0];const reminder=[...data.catHealth].filter(x=>x.catId===homeCat.id&&!x.done&&x.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0];return <button className="home-cat-card" key={homeCat.id} onClick={()=>openCat(homeCat.id)}><div className="cat-home-avatar">{homeCat.photo?<img src={homeCat.photo} alt={homeCat.name}/>:<span>🐾</span>}</div><div><span className="eyebrow">MY LITTLE CAT</span><h2>{homeCat.name}的今天</h2><p>{reminder?`下一项：${displayDate(reminder.date)} ${reminder.title}`:"今天没有临近的健康提醒"}</p></div><div className="cat-home-metrics"><b>{care.filter(x=>x.done).length}/{care.length}<small> 今日照护</small></b><b>{latestWeight?`${latestWeight.weight} kg`:"—"}<small> 最近体重</small></b></div><i>记录今天 →</i></button>}):<button className="home-cat-card empty-cat" onClick={()=>go("cats")}><div className="cat-home-avatar"><span>🐾</span></div><div><span className="eyebrow">MY LITTLE CAT</span><h2>猫咪今日</h2><p>建立猫咪档案，开始记录一起生活的每一天。</p></div><i>开始记录 →</i></button>}</section>
    {showPromoReminders&&<Modal title="未来三天 · 商家优惠活动" onClose={()=>setShowPromoReminders(false)}><div className="home-promo-list">{promoReminders.map(x=><section key={x.item.id}><time>{x.date===today?"今天":`${dateDiff(today,x.date)} 天后`} · {displayDate(x.date)}</time><p><i>％</i>{x.item.title}</p></section>)}</div></Modal>}
    {deleteTodo&&<Modal title="删除这个临时待办吗？" onClose={()=>setDeleteTodo(null)}><p className="modal-copy">它也会同时从日历和备忘中的 To-do 汇总里移除。</p><div className="modal-actions"><button className="secondary" onClick={()=>setDeleteTodo(null)}>先保留</button><button className="danger" onClick={()=>{patch(x=>({...x,todos:x.todos.filter(y=>y.id!==deleteTodo)}));setDeleteTodo(null)}}>确认删除</button></div></Modal>}
    {deleteMemo&&<Modal title="删除这条快速备忘吗？" onClose={()=>setDeleteMemo(null)}><div className="modal-actions"><button className="secondary" onClick={()=>setDeleteMemo(null)}>先保留</button><button className="danger" onClick={()=>{patch(x=>({...x,memos:x.memos.filter(y=>y.id!==deleteMemo)}));setDeleteMemo(null)}}>确认删除</button></div></Modal>}
  </div>;
}

function Calendar({ data, dates, selectedDate, setSelectedDate, category, toggleTodo, move, onAdd, onEdit, onDelete, patch }: any) {
  const [todoDrafts, setTodoDrafts] = useState<Record<string,string>>({});
  const [quickText, setQuickText] = useState("");
  const [promoDate, setPromoDate] = useState<string|null>(null);
  const anchor=new Date(`${selectedDate}T12:00:00`);anchor.setDate(anchor.getDate()-((anchor.getDay()+6)%7));
  const weekDates=Array.from({length:7},(_,i)=>addDays(dayKey(anchor),i));
  const periodMark=(date:string)=>{
    if(data.healthSettings.privacy)return "";
    if(data.periods.some((p:PeriodRecord)=>date>=p.start&&date<=p.end))return "actual";
    const info=cycleInfo(data,todayKey());
    return date>=info.nextStart&&date<=info.nextEnd?"forecast":"";
  };
  const addTodo = (e: FormEvent,date:string) => { e.preventDefault();const text=todoDrafts[date]?.trim();if(!text)return;patch((d: WorkbenchData)=>({...d,todos:[...d.todos,{id:uid(),date,text,done:false,order:d.todos.filter(t=>t.date===date).length,updatedAt:Date.now()}]}));setTodoDrafts(x=>({...x,[date]:""}));};
  const parseQuick = () => {
    const text = quickText.trim(); if (!text) return;
    let date = selectedDate, start = "09:00";
    const base = new Date(); if (/明天/.test(text)) { base.setDate(base.getDate()+1); date=dayKey(base); } else if (/后天/.test(text)) { base.setDate(base.getDate()+2); date=dayKey(base); }
    const tm = text.match(/(?:上午|早上|中午|下午|晚上)?\s*(\d{1,2})(?:[:：](\d{1,2})|点(半|\d{1,2}分?)?)?/);
    if (tm) { let h=Number(tm[1]);if (/下午|晚上/.test(tm[0])&&h<12)h+=12;if(/中午/.test(tm[0])&&h<11)h+=12;const minute=tm[2]||tm[3]?.replace("分","")||"00";start=`${pad(h)}:${minute==="半"?"30":pad(Number(minute))}`; }
    const title = text.replace(/今天|明天|后天|上午|早上|中午|下午|晚上/g,"").replace(/\d{1,2}(?:[:：]\d{1,2}|点(?:半|\d{1,2}分?)?)/g,"").replace(/^[，,\s]+|[，,\s]+$/g,"").trim() || text;
    const categoryId=/普拉提|瑜伽|跑步|健身|训练|游泳|骑行|羽毛球|网球|运动/.test(title)?"sport":/电影|游戏|演唱会|音乐会|看展/.test(title)?"fun":/购物|买菜|家务|吃饭|取快递|收快递/.test(title)?"life":/工作|会议|面试|复盘|RPA|汇报/.test(title)?"work":"other";
    const endD = new Date(`2000-01-01T${start}:00`); endD.setHours(endD.getHours()+1);
    patch((d:WorkbenchData)=>({...d,events:[...d.events,{id:uid(),date,start,end:`${pad(endD.getHours())}:${pad(endD.getMinutes())}`,title,categoryId,updatedAt:Date.now()}],workoutPlans:categoryId==="sport"?d.workoutPlans.map(p=>p.weekday===new Date(`${date}T12:00:00`).getDay()?{...p,title,updatedAt:Date.now()}:p):d.workoutPlans}));setQuickText("");setSelectedDate(date);
  };
  return <div className="page calendar-page">
    <header className="page-head"><div><span className="eyebrow">MY WEEK</span><h1>本周日程与待办</h1></div><button onClick={onAdd}>＋ 新建日程</button></header>
    <div className="quick-parse"><span>✦</span><input value={quickText} onChange={e=>setQuickText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&parseQuick()} placeholder="试试说：后天下午 3 点半普拉提" /><button onClick={parseQuick}>帮我记下</button></div>
    <div className="week-nav"><button onClick={()=>setSelectedDate(addDays(weekDates[0],-7))}>← 上一周</button><div className="week-nav-center"><b>{displayDate(weekDates[0])} — {displayDate(weekDates[6])}</b><label className="week-jump-picker"><span>跳转到</span><input type="date" value={selectedDate} onChange={e=>e.target.value&&setSelectedDate(e.target.value)} aria-label="选择日期并跳转到所在周"/></label></div><button onClick={()=>setSelectedDate(addDays(weekDates[0],7))}>下一周 →</button></div>
    <div className="week-calendar">{weekDates.map(date=>{const dayEvents=data.events.filter((e:EventItem)=>e.date===date).sort((a:EventItem,b:EventItem)=>a.start.localeCompare(b.start));const dayTodos=data.todos.filter((t:Todo)=>t.date===date).sort((a:Todo,b:Todo)=>a.order-b.order);const catReminders=data.catHealth.filter((x:CatHealth)=>x.date===date&&!x.done);const daySpecials=specialDaysForDate(data.specialDays,date);const dayPromos=daySpecials.filter((x:SpecialDay)=>x.id.startsWith("promo-"));const otherSpecials=daySpecials.filter((x:SpecialDay)=>!x.id.startsWith("promo-"));return <section key={date} className={`week-day ${date===todayKey()?"today":""}`}><header><div className="week-date"><small>{weekday(date)}</small><b>{new Date(`${date}T12:00:00`).getDate()}</b><span>{new Date(`${date}T12:00:00`).getMonth()+1}月</span></div><div className="week-day-title"><h2>{date===todayKey()?"今天":displayDate(date)}</h2><div className="calendar-checkins">{periodMark(date)&&<b>✿ {periodMark(date)==="actual"?"经期":"预测"}</b>}{data.healthLogs.some((l:HealthLog)=>l.date===date&&l.trained)&&<b>✓ 训练</b>}{catReminders.map((x:CatHealth)=><b className="cat-calendar-reminder" key={x.id}>🐾 {data.catProfiles.find((cat:CatProfile)=>cat.id===x.catId)?.name||"猫咪"} · {x.title}</b>)}{dayPromos.length>0&&<button onClick={()=>setPromoDate(date)}>％ 商家优惠活动 <small>{dayPromos.length} 项</small></button>}{otherSpecials.map((x:SpecialDay)=><b key={x.id}>{x.kind==="生日"?"🎂":x.kind==="纪念日"?"♡":"✦"} {x.title}</b>)}</div></div><button onClick={()=>{setSelectedDate(date);onAdd()}}>＋ 日程</button></header><div className="week-day-body"><div className="week-events"><h3>日程 <span>{dayEvents.length}</span></h3>{dayEvents.map((e:EventItem)=><article className="event-card" key={e.id} style={{"--event":category(e.categoryId).color} as React.CSSProperties}><time>{e.start}<small>{e.end}</small></time><i></i><div><span>{category(e.categoryId).name}</span><button onClick={()=>onEdit(e)}>{e.title}</button></div><button className="more" onClick={()=>onDelete({kind:"event",id:e.id})}>×</button></article>)}{!dayEvents.length&&<p className="week-empty">没有日程，时间可以自由安排。</p>}</div><div className="week-todos"><div className="todo-head"><h3>To-do</h3><span>{dayTodos.filter((t:Todo)=>t.done).length} / {dayTodos.length}</span></div>{dayTodos.map((t:Todo)=><div className="todo-row" key={t.id}><label><input type="checkbox" checked={t.done} onChange={()=>toggleTodo(t.id)}/><i></i><textarea rows={Math.min(5,Math.max(1,Math.ceil(t.text.length/18)))} className={t.done?"strike":""} value={t.text} onChange={e=>patch((d:WorkbenchData)=>({...d,todos:d.todos.map(x=>x.id===t.id?{...x,text:e.target.value,updatedAt:Date.now()}:x)}))}/></label><div><button onClick={()=>move("todo",t.id,-1)}>↑</button><button onClick={()=>move("todo",t.id,1)}>↓</button><button onClick={()=>onDelete({kind:"todo",id:t.id})}>×</button></div></div>)}<form className="add-todo" onSubmit={e=>addTodo(e,date)}><input value={todoDrafts[date]||""} onChange={e=>setTodoDrafts(x=>({...x,[date]:e.target.value}))} placeholder="添加待办…"/><button>添加</button></form></div></div></section>})}</div>
    {promoDate&&<Modal title={`${displayDate(promoDate)} · 商家优惠活动`} onClose={()=>setPromoDate(null)}><div className="calendar-promo-list">{specialDaysForDate(data.specialDays,promoDate).filter((x:SpecialDay)=>x.id.startsWith("promo-")).map((x:SpecialDay)=><p key={x.id}><i>％</i><span>{x.title}</span></p>)}</div></Modal>}
  </div>;
}

function LegacyMemos({ data, go, toggleTodo, move, onAdd, onDelete, patch }: any) {
  const [editing, setEditing] = useState<string|null>(null); const [text,setText]=useState("");
  const [showSpecial,setShowSpecial]=useState(false);
  const [showPromos,setShowPromos]=useState(false);
  const [deleteSpecial,setDeleteSpecial]=useState<string|null>(null);
  const [specialForm,setSpecialForm]=useState({title:"",date:todayKey(),kind:"节日" as SpecialDay["kind"],calendar:"公历" as SpecialDay["calendar"],lunarDate:"",reminderDays:"3"});
  const save=(id:string)=>{if(text.trim())patch((d:WorkbenchData)=>({...d,memos:d.memos.map(m=>m.id===id?{...m,text:text.trim(),updatedAt:Date.now()}:m)}));setEditing(null);};
  const addSpecial=(e:FormEvent)=>{e.preventDefault();if(!specialForm.title.trim())return;patch((d:WorkbenchData)=>({...d,specialDays:[...d.specialDays,{id:uid(),title:specialForm.title.trim(),date:specialForm.date,kind:specialForm.kind,calendar:specialForm.calendar,lunarDate:specialForm.calendar==="农历"?specialForm.lunarDate.trim():undefined,reminderDays:Number(specialForm.reminderDays)||3,updatedAt:Date.now()}]}));setShowSpecial(false);setSpecialForm({title:"",date:todayKey(),kind:"节日",calendar:"公历",lunarDate:"",reminderDays:"3"})};
  return <div className="page memo-page"><header className="page-head"><div><span className="eyebrow">LITTLE NOTES</span><h1>备忘</h1><p>所有历史灵感都收在这里。</p></div><button onClick={onAdd}>＋ 快速备忘</button></header>
  <div className="memo-grid single"><section className="paper-panel"><div className="panel-head"><div><h2>快速备忘</h2><p>点击文字即可修改，也可以排序或删除</p></div><span>共 {data.memos.length} 条</span></div>
  <div className="memo-list">{[...data.memos].sort((a,b)=>a.order-b.order).map((m:Memo)=><article key={m.id}>{editing===m.id?<input autoFocus value={text} onChange={e=>setText(e.target.value)} onBlur={()=>save(m.id)} onKeyDown={e=>e.key==="Enter"&&save(m.id)}/>:<button className="memo-text" onClick={()=>{setEditing(m.id);setText(m.text)}}>{m.text}</button>}<footer><time>{new Date(m.createdAt).toLocaleString("zh-CN",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})}</time><div><button onClick={()=>move("memo",m.id,-1)}>↑</button><button onClick={()=>move("memo",m.id,1)}>↓</button><button onClick={()=>onDelete({kind:"memo",id:m.id})}>删除</button></div></footer></article>)}{!data.memos.length&&<Empty text="灵感还没落下来，小熊在这里等你。" />}</div></section>
  </div>
  <section className="memo-specials" id="special-dates"><div className="travel-section-head"><div><span className="eyebrow">SPECIAL DAYS</span><h2>特别日子</h2></div><button onClick={()=>setShowSpecial(true)}>＋ 添加特别日子</button></div><div className="special-grid compact-specials"><button className="promo-folder" onClick={()=>setShowPromos(true)}><i>％</i><div><span>每周 · 每月 · 每年自动重复</span><h3>商家优惠活动</h3><p>{data.specialDays.filter((x:SpecialDay)=>x.id.startsWith("promo-")).length} 项优惠 · 点击展开完整清单</p></div><b>查看全部 →</b></button>{data.specialDays.filter((x:SpecialDay)=>!x.id.startsWith("promo-")).sort((a:SpecialDay,b:SpecialDay)=>nextSpecialDate(a).localeCompare(nextSpecialDate(b))).map((x:SpecialDay)=>{const next=nextSpecialDate(x);return <article key={x.id}><i>{x.kind==="生日"?"🎂":x.kind==="演唱会"?"♫":x.kind==="折扣"?"％":"✦"}</i><div><span>{specialRuleLabel(x)}</span><h3>{x.title}</h3><p>{displayDate(next)} · 提前 {x.reminderDays} 天提醒</p></div><button onClick={()=>setDeleteSpecial(x.id)}>×</button></article>})}</div></section>
  {showPromos&&<Modal title="商家优惠活动" onClose={()=>setShowPromos(false)}><div className="promo-catalog">{[1,2,3,4,5].map(day=><details key={day} open={day===new Date().getDay()}><summary>每周{["日","一","二","三","四","五","六"][day]}<span>{data.specialDays.filter((x:SpecialDay)=>x.id.startsWith("promo-")&&x.recurrence==="weekly"&&x.weekday===day).length} 项</span></summary><div>{data.specialDays.filter((x:SpecialDay)=>x.id.startsWith("promo-")&&x.recurrence==="weekly"&&x.weekday===day).map((x:SpecialDay)=><p key={x.id}>％ {x.title}</p>)}</div></details>)}<details><summary>每月会员日<span>{data.specialDays.filter((x:SpecialDay)=>x.id.startsWith("promo-")&&x.recurrence==="monthly").length} 项</span></summary><div>{data.specialDays.filter((x:SpecialDay)=>x.id.startsWith("promo-")&&x.recurrence==="monthly").sort((a:SpecialDay,b:SpecialDay)=>(a.monthDay||0)-(b.monthDay||0)).map((x:SpecialDay)=><p key={x.id}><b>每月 {x.monthDay} 日</b> · {x.title}</p>)}</div></details><details><summary>生日与年度权益<span>{data.specialDays.filter((x:SpecialDay)=>x.id.startsWith("promo-")&&x.recurrence==="yearly").length} 项</span></summary><div>{data.specialDays.filter((x:SpecialDay)=>x.id.startsWith("promo-")&&x.recurrence==="yearly").sort((a:SpecialDay,b:SpecialDay)=>(a.monthDay||0)-(b.monthDay||0)).map((x:SpecialDay)=><p key={x.id}><b>{x.month} 月 {x.monthDay} 日</b> · {x.title}</p>)}</div></details></div></Modal>}
  {showSpecial&&<Modal title="添加特别日子" onClose={()=>setShowSpecial(false)}><form className="editor-form" onSubmit={addSpecial}><label>名称<input value={specialForm.title} onChange={e=>setSpecialForm({...specialForm,title:e.target.value})} placeholder="生日、演唱会或折扣日" required/></label><div className="two-col"><label>类型<select value={specialForm.kind} onChange={e=>setSpecialForm({...specialForm,kind:e.target.value as SpecialDay["kind"]})}><option>节日</option><option>折扣</option><option>演唱会</option><option>生日</option></select></label><label>历法<select value={specialForm.calendar} onChange={e=>setSpecialForm({...specialForm,calendar:e.target.value as SpecialDay["calendar"]})}><option>公历</option><option>农历</option></select></label></div>{specialForm.calendar==="农历"&&<label>农历日期说明<input value={specialForm.lunarDate} onChange={e=>setSpecialForm({...specialForm,lunarDate:e.target.value})} placeholder="例如：八月初五"/></label>}<div className="two-col"><label>{specialForm.calendar==="农历"?"下一次公历日期":"日期"}<input type="date" value={specialForm.date} onChange={e=>setSpecialForm({...specialForm,date:e.target.value})}/></label><label>提前提醒天数<input type="number" min="0" value={specialForm.reminderDays} onChange={e=>setSpecialForm({...specialForm,reminderDays:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowSpecial(false)}>取消</button><button>保存日子</button></div></form></Modal>}
  {deleteSpecial&&<Modal title="删除这个特别日子吗？" onClose={()=>setDeleteSpecial(null)}><div className="modal-actions"><button className="secondary" onClick={()=>setDeleteSpecial(null)}>先保留</button><button className="danger" onClick={()=>{patch((d:WorkbenchData)=>({...d,specialDays:d.specialDays.filter(x=>x.id!==deleteSpecial)}));setDeleteSpecial(null)}}>确认删除</button></div></Modal>}
  <button className="bear-fab inner" onClick={onAdd}><img src="/bears/v2/bear-sleep.png" alt="" /><span>记一下</span></button></div>;
}

function Memos({ data, move, onAdd, onDelete, patch }: any) {
  const [memoTab,setMemoTab]=useState<"quick"|"special"|"mood">("quick");
  const [editingMemo,setEditingMemo]=useState<string|null>(null);
  const [memoText,setMemoText]=useState("");
  const [selectedCategory,setSelectedCategory]=useState<SpecialCategory|null>(null);
  const [showCategory,setShowCategory]=useState(false);
  const [categoryName,setCategoryName]=useState("");
  const [batchText,setBatchText]=useState("");
  const [batchStatus,setBatchStatus]=useState("");
  const [editingSpecial,setEditingSpecial]=useState<SpecialDay|null>(null);
  const [moodForm,setMoodForm]=useState({id:"",date:todayKey(),mood:"平静",content:"",tagIds:[] as string[]});
  const [tagDraft,setTagDraft]=useState("");
  const freshForm=()=>({title:"",date:todayKey(),calendar:"公历" as SpecialDay["calendar"],rule:"fixed" as "fixed"|"weekly"|"monthly"|"yearly",weekday:"1",monthDay:"1",month:String(new Date().getMonth()+1),lunarMonth:"1",lunarDay:"1",reminderDays:"3"});
  const [specialForm,setSpecialForm]=useState(freshForm);
  const saveMemo=(id:string)=>{if(memoText.trim())patch((d:WorkbenchData)=>({...d,memos:d.memos.map(m=>m.id===id?{...m,text:memoText.trim(),updatedAt:Date.now()}:m)}));setEditingMemo(null)};
  const openCategory=(category:SpecialCategory)=>{setSelectedCategory(category);setEditingSpecial(null);setSpecialForm(freshForm());setBatchText("");setBatchStatus("")};
  const startEdit=(item:SpecialDay)=>{setEditingSpecial(item);setSpecialForm({title:item.title,date:item.date,calendar:item.calendar||"公历",rule:item.recurrence||"fixed",weekday:String(item.weekday??1),monthDay:String(item.monthDay??1),month:String(item.month??1),lunarMonth:String(item.lunarMonth??1),lunarDay:String(item.lunarDay??1),reminderDays:String(item.reminderDays)})};
  const saveSpecial=(e:FormEvent)=>{e.preventDefault();if(!selectedCategory||!specialForm.title.trim())return;const lunar=specialForm.calendar==="农历";const rule=lunar?"yearly":specialForm.rule;const lunarMonth=Math.max(1,Math.min(12,Number(specialForm.lunarMonth)||1));const lunarDay=Math.max(1,Math.min(30,Number(specialForm.lunarDay)||1));const item:SpecialDay={id:editingSpecial?.id||(selectedCategory.id==="merchant"?`promo-${uid()}`:uid()),title:specialForm.title.trim(),kind:selectedCategory.name,calendar:specialForm.calendar,date:specialForm.date,lunarDate:lunar?`${lunarMonth}月${lunarDay}日`:undefined,lunarMonth:lunar?lunarMonth:undefined,lunarDay:lunar?lunarDay:undefined,reminderDays:Number(specialForm.reminderDays)||0,updatedAt:editingSpecial?.updatedAt||Date.now(),recurrence:rule==="fixed"?undefined:rule,weekday:!lunar&&rule==="weekly"?Number(specialForm.weekday):undefined,monthDay:!lunar&&(rule==="monthly"||rule==="yearly")?Number(specialForm.monthDay):undefined,month:!lunar&&rule==="yearly"?Number(specialForm.month):undefined};patch((d:WorkbenchData)=>({...d,specialDays:editingSpecial?d.specialDays.map(x=>x.id===editingSpecial.id?item:x):[...d.specialDays,item]}));setEditingSpecial(null);setSpecialForm(freshForm())};
  const addCategory=(e:FormEvent)=>{e.preventDefault();if(!categoryName.trim())return;const category:SpecialCategory={id:uid(),name:categoryName.trim(),icon:"✦",order:data.specialCategories.length,updatedAt:Date.now()};patch((d:WorkbenchData)=>({...d,specialCategories:[...d.specialCategories,category]}));setCategoryName("");setShowCategory(false);openCategory(category)};
  const categoryItems=(category:SpecialCategory)=>data.specialDays.filter((x:SpecialDay)=>category.id==="merchant"?x.id.startsWith("promo-"):x.kind===category.name&&!x.id.startsWith("promo-"));
  const importSpecialDays=()=>{
    if(!selectedCategory||!batchText.trim())return;
    const weekdayMap:Record<string,number>={日:0,天:0,一:1,二:2,三:3,四:4,五:5,六:6};
    const rows=batchText.split(/[\n；;。]+/).map(x=>x.trim()).filter(Boolean);
    const imported:SpecialDay[]=[];
    rows.forEach((row,rowIndex)=>{
      let recurrence:"weekly"|"monthly"|"yearly"|undefined;let weekdayValue:number|undefined;let monthDay:number|undefined;let month:number|undefined;let date=todayKey();let names="";
      const lunar=parseLunarPhrase(row);if(lunar){imported.push({id:selectedCategory.id==="merchant"?`promo-${uid()}`:uid(),title:lunar.title,kind:selectedCategory.name,calendar:"农历",date,reminderDays:3,recurrence:"yearly",lunarMonth:lunar.month,lunarDay:lunar.day,lunarDate:lunar.lunarDate,updatedAt:Date.now()+rowIndex*100});return}
      let match=row.match(/^每周([一二三四五六日天])\s*[：:]?\s*(.+)$/);if(match){recurrence="weekly";weekdayValue=weekdayMap[match[1]];names=match[2]}
      if(!match){match=row.match(/^每月(\d{1,2})[号日]\s*[：:]?\s*(.+)$/);if(match){recurrence="monthly";monthDay=Number(match[1]);names=match[2]}}
      if(!match){match=row.match(/^每年(\d{1,2})月(\d{1,2})[号日]?\s*[：:]?\s*(.+)$/);if(match){recurrence="yearly";month=Number(match[1]);monthDay=Number(match[2]);names=match[3]}}
      if(!match){match=row.match(/^(20\d{2})年(\d{1,2})月(\d{1,2})[号日]?\s*(?:是|为|：|:)?\s*(.+)$/);if(match){date=`${match[1]}-${pad(Number(match[2]))}-${pad(Number(match[3]))}`;names=match[4]}}
      if(!match){match=row.match(/^(\d{1,2})月(\d{1,2})[号日]?\s*(?:是|为|：|:)?\s*(.+)$/);if(match){recurrence="yearly";month=Number(match[1]);monthDay=Number(match[2]);names=match[3]}}
      if(!names)return;
      names.split(/[、，,]+/).map(x=>x.trim()).filter(Boolean).forEach((title,itemIndex)=>imported.push({id:selectedCategory.id==="merchant"?`promo-${uid()}`:uid(),title,kind:selectedCategory.name,calendar:"公历",date,reminderDays:3,recurrence,weekday:weekdayValue,monthDay,month,updatedAt:Date.now()+rowIndex*100+itemIndex}));
    });
    if(imported.length){patch((d:WorkbenchData)=>({...d,specialDays:[...d.specialDays,...imported]}));setBatchText("");setBatchStatus(`已识别并添加 ${imported.length} 个日子。`)}else setBatchStatus("没有识别到日期，请按示例格式输入后再试。");
  };
  return <div className="page memo-page">
    <header className="memo-hero"><div><span className="eyebrow">LITTLE NOTES</span><h1>备忘</h1><p>把灵感、重要日子和心情，都温柔地安放在这里。</p></div><img src="/bears/v2/bear-ribbon.png" alt="戴粉色蝴蝶结的水彩小熊" /></header>
    <nav className="growth-tabs memo-tabs"><button className={memoTab==="quick"?"active":""} onClick={()=>setMemoTab("quick")}>快速备忘</button><button className={memoTab==="special"?"active":""} onClick={()=>setMemoTab("special")}>特别日子</button><button className={memoTab==="mood"?"active":""} onClick={()=>setMemoTab("mood")}>心情手帐</button></nav>
    {memoTab==="quick"&&<>
    <div className="memo-grid single"><section className="paper-panel"><div className="panel-head"><div><span className="eyebrow">QUICK NOTES</span><h2>快速备忘</h2><p>点击文字即可修改，也可以排序或删除</p></div><div className="quick-memo-actions"><span>共 {data.memos.length} 条</span><button onClick={onAdd}>＋ 添加快速备忘</button></div></div>
      <div className="memo-list">{[...data.memos].sort((a,b)=>a.order-b.order).map((m:Memo)=><article key={m.id}>{editingMemo===m.id?<input autoFocus value={memoText} onChange={e=>setMemoText(e.target.value)} onBlur={()=>saveMemo(m.id)} onKeyDown={e=>e.key==="Enter"&&saveMemo(m.id)}/>:<button className="memo-text" onClick={()=>{setEditingMemo(m.id);setMemoText(m.text)}}>{m.text}</button>}<footer><time>{new Date(m.createdAt).toLocaleString("zh-CN",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})}</time><div><button onClick={()=>move("memo",m.id,-1)}>↑</button><button onClick={()=>move("memo",m.id,1)}>↓</button><button onClick={()=>onDelete({kind:"memo",id:m.id})}>删除</button></div></footer></article>)}{!data.memos.length&&<Empty text="灵感还没落下来，小熊在这里等你。" />}</div>
    </section></div>
    </>}
    {memoTab==="special"&&<>
    <section className="memo-specials" id="special-dates"><div className="travel-section-head"><div><span className="eyebrow">SPECIAL DAYS</span><h2>特别日子</h2></div><button onClick={()=>setShowCategory(true)}>＋ 新建分类</button></div>
      <div className="special-grid compact-specials category-folders">{[...data.specialCategories].sort((a,b)=>a.order-b.order).map((category:SpecialCategory)=>{const items=categoryItems(category);return <button className={`promo-folder category-folder ${category.id}`} key={category.id} onClick={()=>openCategory(category)}><i>{category.icon}</i><div><span>每周 · 每月 · 每年 · 固定日期</span><h3>{category.name}</h3><p>{items.length} 个日子 · 点击管理</p></div><b>打开 →</b></button>})}</div>
    </section>
    </>}
    {memoTab==="mood"&&<section className="mood-journal"><div className="growth-section-head"><div><span className="eyebrow">MOOD JOURNAL</span><h2>心情手帐</h2></div><p>记下今天真实的感受，也给想法贴一个容易找到的标签。</p></div><form className="mood-form" onSubmit={e=>{e.preventDefault();if(!moodForm.content.trim())return;const item:MoodEntry={id:moodForm.id||uid(),date:moodForm.date,mood:moodForm.mood,content:moodForm.content.trim(),tagIds:moodForm.tagIds,updatedAt:Date.now()};patch((d:WorkbenchData)=>({...d,moodEntries:moodForm.id?d.moodEntries.map(x=>x.id===moodForm.id?item:x):[item,...d.moodEntries]}));setMoodForm({id:"",date:todayKey(),mood:"平静",content:"",tagIds:[]})}}><div><input type="date" value={moodForm.date} onChange={e=>setMoodForm({...moodForm,date:e.target.value})}/><select value={moodForm.mood} onChange={e=>setMoodForm({...moodForm,mood:e.target.value})}>{["开心","平静","期待","疲惫","低落","生气","焦虑"].map(x=><option key={x}>{x}</option>)}</select></div><textarea value={moodForm.content} onChange={e=>setMoodForm({...moodForm,content:e.target.value})} placeholder="今天发生了什么？此刻有什么想法？"/><div className="mood-tag-picker">{data.moodTags.map((tag:MoodTag)=><button type="button" className={moodForm.tagIds.includes(tag.id)?"active":""} key={tag.id} onClick={()=>setMoodForm({...moodForm,tagIds:moodForm.tagIds.includes(tag.id)?moodForm.tagIds.filter(x=>x!==tag.id):[...moodForm.tagIds,tag.id]})}>#{tag.name}</button>)}</div><button>{moodForm.id?"保存修改":"写进手帐"}</button></form><div className="mood-tag-manager"><form onSubmit={e=>{e.preventDefault();if(!tagDraft.trim())return;patch((d:WorkbenchData)=>({...d,moodTags:[...d.moodTags,{id:uid(),name:tagDraft.trim(),updatedAt:Date.now()}]}));setTagDraft("")}}><input value={tagDraft} onChange={e=>setTagDraft(e.target.value)} placeholder="新建标签"/><button>＋</button></form>{data.moodTags.map((tag:MoodTag)=><label key={tag.id}><input value={tag.name} onChange={e=>patch((d:WorkbenchData)=>({...d,moodTags:d.moodTags.map(x=>x.id===tag.id?{...x,name:e.target.value,updatedAt:Date.now()}:x)}))}/><button onClick={()=>patch((d:WorkbenchData)=>({...d,moodTags:d.moodTags.filter(x=>x.id!==tag.id),moodEntries:d.moodEntries.map(x=>({...x,tagIds:x.tagIds.filter(id=>id!==tag.id)}))}))}>×</button></label>)}</div><div className="mood-entry-list">{[...data.moodEntries].sort((a:MoodEntry,b:MoodEntry)=>b.date.localeCompare(a.date)||b.updatedAt-a.updatedAt).map((entry:MoodEntry)=><article key={entry.id}><header><b>{entry.mood}</b><time>{displayDate(entry.date)}</time></header><p>{entry.content}</p><div>{entry.tagIds.map(id=>data.moodTags.find((x:MoodTag)=>x.id===id)).filter(Boolean).map((tag:MoodTag)=><span key={tag.id}>#{tag.name}</span>)}</div><footer><button onClick={()=>setMoodForm({...entry})}>修改</button><button onClick={()=>patch((d:WorkbenchData)=>({...d,moodEntries:d.moodEntries.filter(x=>x.id!==entry.id)}))}>删除</button></footer></article>)}{!data.moodEntries.length&&<Empty text="今天的心情，还没有落在纸上。" />}</div></section>}
    {showCategory&&<Modal title="新建特别日子分类" onClose={()=>setShowCategory(false)}><form className="editor-form" onSubmit={addCategory}><label>分类名称<input autoFocus value={categoryName} onChange={e=>setCategoryName(e.target.value)} placeholder="例如：宠物、家人或重要约会" required/></label><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowCategory(false)}>取消</button><button>建立分类</button></div></form></Modal>}
    {selectedCategory&&<Modal title={`${selectedCategory.icon} ${selectedCategory.name}`} onClose={()=>setSelectedCategory(null)}><div className="special-category-manager"><label className="special-category-edit">分类名称<input value={selectedCategory.name} onChange={e=>{const name=e.target.value;const oldName=selectedCategory.name;setSelectedCategory({...selectedCategory,name});patch((d:WorkbenchData)=>({...d,specialCategories:d.specialCategories.map(x=>x.id===selectedCategory.id?{...x,name,updatedAt:Date.now()}:x),specialDays:d.specialDays.map(x=>x.kind===oldName?{...x,kind:name,updatedAt:Date.now()}:x)}))}}/></label><form className="editor-form compact-special-form" onSubmit={saveSpecial}><label>名称<input value={specialForm.title} onChange={e=>setSpecialForm({...specialForm,title:e.target.value})} placeholder={`添加${selectedCategory.name}`} required/></label><div className="two-col"><label>历法<select value={specialForm.calendar} onChange={e=>setSpecialForm({...specialForm,calendar:e.target.value as SpecialDay["calendar"]})}><option>公历</option><option>农历</option></select></label><label>提前提醒<input type="number" min="0" value={specialForm.reminderDays} onChange={e=>setSpecialForm({...specialForm,reminderDays:e.target.value})}/></label></div>{specialForm.calendar==="公历"&&<label>重复方式<select value={specialForm.rule} onChange={e=>setSpecialForm({...specialForm,rule:e.target.value as typeof specialForm.rule})}><option value="fixed">固定日期</option><option value="weekly">每周几</option><option value="monthly">每月几号</option><option value="yearly">每年几月几号</option></select></label>}
      <section className="special-batch-import"><b>批量识别</b><p>支持“每周一：名称”“每月20号：名称”“每年9月18日：名称”、具体日期，以及“腊月十八是某某的生日”等农历表达。</p><textarea value={batchText} onChange={e=>setBatchText(e.target.value)} placeholder="把公历、农历或循环日期和名称粘贴到这里…"/><button type="button" onClick={importSpecialDays}>识别并添加</button>{batchStatus&&<small>{batchStatus}</small>}</section>
      {specialForm.calendar==="农历"&&<div className="two-col"><label>农历月份<input type="number" min="1" max="12" value={specialForm.lunarMonth} onChange={e=>setSpecialForm({...specialForm,lunarMonth:e.target.value})}/></label><label>农历日期<input type="number" min="1" max="30" value={specialForm.lunarDay} onChange={e=>setSpecialForm({...specialForm,lunarDay:e.target.value})}/></label></div>}
      {specialForm.calendar==="公历"&&specialForm.rule==="fixed"&&<label>日期<input type="date" value={specialForm.date} onChange={e=>setSpecialForm({...specialForm,date:e.target.value})}/></label>}
      {specialForm.calendar==="公历"&&specialForm.rule==="weekly"&&<label>星期<select value={specialForm.weekday} onChange={e=>setSpecialForm({...specialForm,weekday:e.target.value})}>{["日","一","二","三","四","五","六"].map((x,i)=><option value={i} key={x}>星期{x}</option>)}</select></label>}
      {specialForm.calendar==="公历"&&specialForm.rule==="monthly"&&<label>每月几号<input type="number" min="1" max="31" value={specialForm.monthDay} onChange={e=>setSpecialForm({...specialForm,monthDay:e.target.value})}/></label>}
      {specialForm.calendar==="公历"&&specialForm.rule==="yearly"&&<div className="two-col"><label>月份<input type="number" min="1" max="12" value={specialForm.month} onChange={e=>setSpecialForm({...specialForm,month:e.target.value})}/></label><label>日期<input type="number" min="1" max="31" value={specialForm.monthDay} onChange={e=>setSpecialForm({...specialForm,monthDay:e.target.value})}/></label></div>}
      <div className="modal-actions">{editingSpecial&&<button type="button" className="secondary" onClick={()=>{setEditingSpecial(null);setSpecialForm(freshForm())}}>取消修改</button>}<button>{editingSpecial?"保存修改":"添加日子"}</button></div></form>
      <div className="special-manager-list">{categoryItems(selectedCategory).sort((a:SpecialDay,b:SpecialDay)=>a.updatedAt-b.updatedAt).map((item:SpecialDay)=><article key={item.id}><i>{selectedCategory.icon}</i><div><b>{item.title}</b><span>{specialRuleLabel(item)} · 提前 {item.reminderDays} 天</span></div><button type="button" onClick={()=>startEdit(item)}>修改</button><button type="button" className="danger-text" onClick={()=>patch((d:WorkbenchData)=>({...d,specialDays:d.specialDays.filter(x=>x.id!==item.id)}))}>删除</button></article>)}{!categoryItems(selectedCategory).length&&<Empty text="这里还没有特别日子。" />}</div>
      <button className="delete-category" onClick={()=>{patch((d:WorkbenchData)=>({...d,specialCategories:d.specialCategories.filter(x=>x.id!==selectedCategory.id),specialDays:d.specialDays.filter(x=>x.kind!==selectedCategory.name)}));setSelectedCategory(null)}}>删除这个分类</button></div></Modal>}
    <button className="bear-fab inner" onClick={onAdd}><img src="/bears/v2/bear-sleep.png" alt="" /><span>记一下</span></button>
  </div>
}

function Health({ data, patch, initialTab="cycle" }: { data:WorkbenchData; patch:(fn:(d:WorkbenchData)=>WorkbenchData)=>void; initialTab?:"cycle"|"fitness"|"food"|"care" }) {
  const [tab,setTab]=useState<"cycle"|"fitness"|"food"|"care">(initialTab);
  const [periodForm,setPeriodForm]=useState({start:todayKey(),end:todayKey()});
  const [showPeriod,setShowPeriod]=useState(false);
  const [deletePeriod,setDeletePeriod]=useState<string|null>(null);
  const [meal,setMeal]=useState<Recipe["meal"]>("早餐");
  const [recipeForm,setRecipeForm]=useState({name:"",ingredients:"",calories:""});
  const [showRecipe,setShowRecipe]=useState(false);
  const [deleteRecipe,setDeleteRecipe]=useState<string|null>(null);
  const [logForm,setLogForm]=useState({weight:"",foodNote:""});
  const [foodImage,setFoodImage]=useState("");
  const [workoutForm,setWorkoutForm]=useState({weekday:new Date().getDay(),title:"",intensity:"适中" as WorkoutPlan["intensity"]});
  const [showWorkoutAdd,setShowWorkoutAdd]=useState(false);
  const [deleteWorkout,setDeleteWorkout]=useState<string|null>(null);
  const mondayOf=(date:string)=>{const value=new Date(`${date}T12:00:00`);value.setDate(value.getDate()-((value.getDay()+6)%7));return dayKey(value)};
  const currentFitnessWeek=mondayOf(todayKey());
  const [fitnessWeek,setFitnessWeek]=useState(currentFitnessWeek);
  const [weather,setWeather]=useState<{temperature:number;humidity:number;apparent:number;code:number}|null>(null);
  const [weatherError,setWeatherError]=useState(false);
  const location=healthLocation(data.healthSettings);
  const initialLocation=locationOption(location.country,location.city);
  const [locationForm,setLocationForm]=useState({country:initialLocation.country,city:initialLocation.city});
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
    "黄体期":{title:"稳住状态，减少内耗",body:"可能出现疲倦或食欲变化，规律睡眠和稳定饮食更重要。",drink:"茯苓陈皮茶或温热大麦茶，避免过甜。",meal:"富镁食物可选南瓜籽一小把、杏仁 10 粒、菠菜、黑豆或 70% 以上黑巧克力 1–2 小块；再搭配燕麦、糙米等复合碳水和高纤维蔬菜。",sport:"中低强度普拉提、快走与拉伸，按感受降强度。",wear:"柔和分层穿搭，腰腹选择不紧绷的版型。"},
    "未记录":{title:"先记录一次周期，建议会更贴合",body:"添加最近一次经期开始和结束日期，即可获得阶段提示。",drink:"日常温水，少量多次。",meal:"规律三餐，保证蛋白质与蔬菜。",sport:"从散步和基础拉伸开始。",wear:"根据体感选择舒适、透气的衣物。"},
  };
  const advice=phaseAdvice[info.phase];
  const outfitPools=weather?.code!==undefined&&weather.code>=50?[4,6,11]:weather?.temperature!==undefined&&weather.temperature>=28?[1,5,9]:weather?.temperature!==undefined&&weather.temperature<=12?[3,7,10,11]:localSeason(location.latitude)==="秋日"?[7,10,2]:[0,2,6,8];
  const outfitIndex=outfitPools[dailyIndex(today,outfitPools.length)];
  const outfitLabels=["柔粉针织花裙","清爽背心阔腿裤","海盐蓝条纹裙","粉米长羽绒层次","雨天浅蓝防护","轻盈碎花吊带裙","奶油衬衫牛仔裤","燕麦针织格纹裙","柔粉百褶通勤装","轻便短裤休闲装","焦糖碎花叠穿","雾蓝长外套保暖"];
  const estimateCalories=(text:string)=>{
    const table:{key:RegExp;kcal:number;name:string}[]=[
      {key:/米饭|一碗饭/,kcal:230,name:"米饭"},{key:/面条|拌面|汤面/,kcal:350,name:"面食"},{key:/鸡胸|鸡肉/,kcal:220,name:"鸡肉"},{key:/牛肉/,kcal:280,name:"牛肉"},{key:/猪肉|水煮肉片/,kcal:420,name:"猪肉"},{key:/奶茶/,kcal:450,name:"奶茶"},{key:/拿铁|咖啡/,kcal:120,name:"咖啡"},{key:/酸奶/,kcal:150,name:"酸奶"},{key:/鸡蛋|水煮蛋/,kcal:80,name:"鸡蛋"},{key:/苹果|香蕉|水果/,kcal:120,name:"水果"},{key:/沙拉/,kcal:300,name:"沙拉"},{key:/火锅/,kcal:800,name:"火锅"},{key:/燕麦/,kcal:180,name:"燕麦"},{key:/豆腐/,kcal:120,name:"豆腐"},{key:/虾|虾仁/,kcal:120,name:"虾仁"},{key:/三文鱼/,kcal:260,name:"三文鱼"},{key:/面包|吐司/,kcal:160,name:"面包"},{key:/坚果|杏仁|南瓜籽/,kcal:170,name:"坚果"},{key:/蔬菜|菠菜|西兰花/,kcal:60,name:"蔬菜"}
    ];
    const hits=table.filter(x=>x.key.test(text));
    const portion=/半份|半碗|一半/.test(text)?.5:/两份|两碗|2份|2碗/.test(text)?2:/三份|三碗|3份|3碗/.test(text)?3:1;
    return {calories:Math.round(hits.reduce((sum,x)=>sum+x.kcal,0)*portion),items:hits.map(x=>x.name)};
  };
  const workoutDate=(weekdayNumber:number)=>addDays(fitnessWeek,(weekdayNumber+6)%7);
  const fitnessWeekEnd=addDays(fitnessWeek,6);
  const selectedCurrentWeek=fitnessWeek===currentFitnessWeek;
  const toggleWorkout=(id:string,date:string)=>patch(d=>({...d,workoutPlans:d.workoutPlans.map(p=>p.id===id?{...p,completedDates:(p.completedDates||[]).includes(date)?(p.completedDates||[]).filter(x=>x!==date):[...(p.completedDates||[]),date],updatedAt:Date.now()}:p)}));
  const addWorkout=(e:FormEvent)=>{e.preventDefault();if(!workoutForm.title.trim())return;patch(d=>({...d,workoutPlans:[...d.workoutPlans,{id:uid(),weekday:workoutForm.weekday,title:workoutForm.title.trim(),intensity:workoutForm.intensity,order:d.workoutPlans.filter(p=>p.weekday===workoutForm.weekday).length,completedDates:[],updatedAt:Date.now()}]}));setWorkoutForm({...workoutForm,title:""});setShowWorkoutAdd(false)};
  const moveWorkout=(id:string,direction:number)=>patch(d=>{const current=d.workoutPlans.find(p=>p.id===id);if(!current)return d;const group=d.workoutPlans.filter(p=>p.weekday===current.weekday).sort((a,b)=>(a.order??0)-(b.order??0));const index=group.findIndex(p=>p.id===id),target=index+direction;if(target<0||target>=group.length)return d;[group[index],group[target]]=[group[target],group[index]];const orders=new Map(group.map((p,i)=>[p.id,i]));return {...d,workoutPlans:d.workoutPlans.map(p=>orders.has(p.id)?{...p,order:orders.get(p.id),updatedAt:Date.now()}:p)}});
  const handleFoodImage=(e:ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{const image=new Image();image.onload=()=>{const scale=Math.min(1,900/image.width);const canvas=document.createElement("canvas");canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext("2d")?.drawImage(image,0,0,canvas.width,canvas.height);setFoodImage(canvas.toDataURL("image/jpeg",.72))};image.src=String(reader.result)};reader.readAsDataURL(file)};
  useEffect(()=>{
    if(tab!=="care")return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&timezone=${encodeURIComponent(location.timezone)}`)
      .then(r=>{if(!r.ok)throw new Error();return r.json()})
      .then(j=>setWeather({temperature:j.current.temperature_2m,humidity:j.current.relative_humidity_2m,apparent:j.current.apparent_temperature,code:j.current.weather_code}))
      .catch(()=>setWeatherError(true));
  },[tab,location.latitude,location.longitude,location.timezone]);
  const saveLocation=(e:FormEvent)=>{e.preventDefault();const selected=locationOption(locationForm.country,locationForm.city);patch(d=>({...d,healthSettings:{...d.healthSettings,...selected,updatedAt:Date.now()}}));setLocationForm({country:selected.country,city:selected.city})};
  const savePeriod=(e:FormEvent)=>{
    e.preventDefault();if(periodForm.end<periodForm.start)return;
    const record={id:uid(),...periodForm,updatedAt:Date.now()};
    const nextPeriods=[...data.periods,record].sort((a,b)=>b.start.localeCompare(a.start));
    const gaps=nextPeriods.slice(0,-1).map((p,i)=>dateDiff(nextPeriods[i+1].start,p.start)).filter(x=>x>15&&x<60);
    const lens=nextPeriods.map(p=>dateDiff(p.start,p.end)+1).filter(x=>x>0&&x<15);
    patch(d=>({...d,periods:nextPeriods,healthSettings:{...d.healthSettings,cycleLength:gaps.length?Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length):d.healthSettings.cycleLength,periodLength:lens.length?Math.round(lens.reduce((a,b)=>a+b,0)/lens.length):d.healthSettings.periodLength,updatedAt:Date.now()}}));setShowPeriod(false);
  };
  const saveLog=()=>{
    const calories=estimateCalories(logForm.foodNote).calories;
    patch(d=>({...d,healthLogs:d.healthLogs.some(l=>l.date===today)?d.healthLogs.map(l=>l.date===today?{...l,weight:logForm.weight?Number(logForm.weight):l.weight,foodNote:logForm.foodNote||l.foodNote,foodImage:foodImage||l.foodImage,calories:calories||l.calories,updatedAt:Date.now()}:l):[...d.healthLogs,{id:uid(),date:today,weight:logForm.weight?Number(logForm.weight):undefined,trained:false,foodNote:logForm.foodNote,foodImage:foodImage||undefined,calories:calories||undefined,updatedAt:Date.now()}]}));setLogForm({weight:"",foodNote:""});
  };
  const addRecipe=(e:FormEvent)=>{e.preventDefault();if(!recipeForm.name.trim())return;const estimated=estimateCalories(`${recipeForm.name} ${recipeForm.ingredients}`).calories;patch(d=>({...d,recipes:[...d.recipes,{id:uid(),meal,name:recipeForm.name.trim(),ingredients:recipeForm.ingredients.trim(),calories:Number(recipeForm.calories)||estimated,custom:true,updatedAt:Date.now()}]}));setRecipeForm({name:"",ingredients:"",calories:""});setShowRecipe(false)};
  const recipeMethod=(recipe:Recipe)=>({
    r1:"燕麦加少量水煮 3–5 分钟，放凉后拌入无糖酸奶；铺上蓝莓和一小把坚果即可。",
    r2:"鸡蛋煮熟或少油煎熟；牛油果压泥铺在烤脆的全麦吐司上，放上鸡蛋并少量调味。",
    r3:"鸡胸肉用少量盐和黑胡椒腌 10 分钟后煎熟切片；与洗净的生菜、番茄和熟玉米拌匀。",
    r4:"杂粮饭提前煮熟；西兰花焯水，菌菇与豆腐少油翻炒，最后铺在饭上并用生抽轻调味。",
    r5:"番茄炒软出汁后加水煮开，放入豆腐和虾仁煮至变色，最后加入青菜并少量调味。",
    r6:"大米和小米洗净后加水煮开，放入南瓜块小火煮软；加入鸡肉丝煮熟，搅匀至浓稠。",
  } as Record<string,string>)[recipe.id]||`先将${recipe.ingredients||"食材"}洗净备好；按“主食或耐煮食材先熟、蛋白质充分加热、蔬菜最后加入”的顺序烹饪，少油少盐并根据实际份量调整。`;
  const solarTerms=["小寒","立春","惊蛰","清明","立夏","芒种","小暑","立秋","白露","寒露","立冬","大雪"];
  const currentTerm=location.country.includes("中国")?solarTerms[new Date().getMonth()]:localSeason(location.latitude);
  const weatherText=(code:number)=>code<2?"晴朗":code<4?"多云":code<60?"阴天":code<80?"有雨":"强对流";
  return <div className="page health-page">
    <header className="health-hero"><div><span className="eyebrow">MY WELLNESS</span><h1>听见身体的小小声音</h1><p>记录周期、运动与饮食，让照顾自己成为轻松的日常。</p><div className="phase-pill"><i>✿</i><span>{data.healthSettings.privacy?"隐私模式已开启":`周期第 ${info.day||"–"} 天 · ${info.phase}`}</span></div></div><img src="/bears/v2/bear-ribbon.png" alt="戴粉色蝴蝶结的水彩小熊" /></header>
    <nav className="growth-tabs health-tabs"><button className={tab==="cycle"?"active":""} onClick={()=>setTab("cycle")}>周期记录</button><button className={tab==="fitness"?"active":""} onClick={()=>setTab("fitness")}>健身计划</button><button className={tab==="food"?"active":""} onClick={()=>setTab("food")}>饮食与监测</button><button className={tab==="care"?"active":""} onClick={()=>setTab("care")}>保养建议</button></nav>
    {tab==="cycle"&&<section className="health-grid">
      <article className="cycle-card feature"><div className="health-card-head"><div><span className="eyebrow">CYCLE OVERVIEW</span><h2>{data.healthSettings.privacy?"周期信息已隐藏":info.phase}</h2></div><button className={data.healthSettings.privacy?"private active":"private"} onClick={()=>patch(d=>({...d,healthSettings:{...d.healthSettings,privacy:!d.healthSettings.privacy,updatedAt:Date.now()}}))}>{data.healthSettings.privacy?"◉ 显示周期":"○ 隐藏周期"}</button></div>{data.healthSettings.privacy?<div className="privacy-cover"><span>♡</span><h3>小秘密被好好收起来了</h3><p>日历标注和预测也已同时隐藏。</p></div>:<><div className="cycle-ring"><div><b>{info.day}</b><span>周期天数</span></div></div><div className="cycle-metrics"><span><b>{avgCycle} 天</b>平均周期</span><span><b>{avgDuration} 天</b>平均经期</span><span><b>{displayDate(info.nextStart)}</b>预计下次</span></div></>}</article>
      <article className="cycle-card advice"><span className="eyebrow">TODAY&apos;S BODY NOTE</span><h2>{advice.title}</h2><p>{advice.body}</p><div className="phase-track">{["月经期","卵泡期","排卵期","黄体期"].map(x=><span className={x===info.phase?"active":""} key={x}>{x}</span>)}</div><small>周期预测仅用于日常记录，不替代医疗诊断。</small></article>
      <article className="cycle-card records"><div className="health-card-head"><div><span className="eyebrow">PERIOD RECORDS</span><h2>经期记录</h2><p>记录越完整，预测越贴合你的节奏</p></div><button onClick={()=>setShowPeriod(true)}>＋ 添加记录</button></div><div className="period-list">{sortedPeriods.map(p=><div key={p.id}><i>✿</i><span><b>{displayDate(p.start)} — {displayDate(p.end)}</b><small>持续 {dateDiff(p.start,p.end)+1} 天</small></span><button onClick={()=>setDeletePeriod(p.id)}>×</button></div>)}</div></article>
      {showPeriod&&<Modal title="添加经期记录" onClose={()=>setShowPeriod(false)}><form className="editor-form" onSubmit={savePeriod}><div className="two-col"><label>开始日期<input type="date" value={periodForm.start} onChange={e=>setPeriodForm({...periodForm,start:e.target.value})}/></label><label>结束日期<input type="date" min={periodForm.start} value={periodForm.end} onChange={e=>setPeriodForm({...periodForm,end:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowPeriod(false)}>取消</button><button>保存记录</button></div></form></Modal>}
      {deletePeriod&&<Modal title="删除这次经期记录吗？" onClose={()=>setDeletePeriod(null)}><p className="modal-copy">删除后周期平均值和预测日期会重新计算。</p><div className="modal-actions"><button className="secondary" onClick={()=>setDeletePeriod(null)}>先保留</button><button className="danger" onClick={()=>{patch(d=>({...d,periods:d.periods.filter(p=>p.id!==deletePeriod)}));setDeletePeriod(null)}}>确认删除</button></div></Modal>}
    </section>}
    {tab==="fitness"&&<section>
      <div className="growth-section-head fitness-heading"><div><span className="eyebrow">WEEKLY MOVEMENT</span><h2>{selectedCurrentWeek?"本周健身计划":"历史健身计划"}</h2></div><p>当前阶段：{info.phase} · 建议以{info.phase==="卵泡期"?"中高":info.phase==="月经期"?"轻柔":"中低"}强度为主</p></div>
      <nav className="fitness-history-nav" aria-label="健身计划周选择"><button onClick={()=>setFitnessWeek(addDays(fitnessWeek,-7))}>← 上一周</button><label>选择日期<input type="date" value={fitnessWeek} onChange={e=>setFitnessWeek(mondayOf(e.target.value))}/></label><b>{displayDate(fitnessWeek)} — {displayDate(fitnessWeekEnd)}</b><button onClick={()=>setFitnessWeek(currentFitnessWeek)} disabled={selectedCurrentWeek}>回到本周</button><button onClick={()=>setFitnessWeek(addDays(fitnessWeek,7))}>下一周 →</button></nav>
      {selectedCurrentWeek&&<aside className="today-workout wide"><span className="eyebrow">TODAY</span><h2>今天的运动</h2><p>{advice.sport}</p><div className="today-workout-list">{data.workoutPlans.filter(p=>p.weekday===new Date().getDay()).sort((a,b)=>(a.order??0)-(b.order??0)).map(plan=><label key={plan.id}><input type="checkbox" checked={plan.completedDates?.includes(today)||false} onChange={()=>toggleWorkout(plan.id,today)}/><i></i><span><b className={plan.completedDates?.includes(today)?"strike":""}>{plan.title}</b><small>{plan.intensity}</small></span></label>)}</div><strong>{data.workoutPlans.filter(p=>p.weekday===new Date().getDay()&&p.completedDates?.includes(today)).length} / {data.workoutPlans.filter(p=>p.weekday===new Date().getDay()).length} 项完成</strong></aside>}
      <section className="week-plan multi-day">{[1,2,3,4,5,6,0].map(day=>{const date=workoutDate(day);const plans=data.workoutPlans.filter(p=>p.weekday===day).sort((a,b)=>(a.order??0)-(b.order??0));return <article key={date} className={date===today?"today":""}><header><span>{weekdays[day]}<small>{displayDate(date)}</small></span>{date===today&&<b>今天</b>}{selectedCurrentWeek&&<button onClick={()=>{setWorkoutForm({...workoutForm,weekday:day,title:""});setShowWorkoutAdd(true)}}>＋ 添加</button>}</header><div className="workout-items">{plans.map(plan=><div className="workout-item" key={plan.id}><label><input type="checkbox" checked={plan.completedDates?.includes(date)||false} onChange={()=>toggleWorkout(plan.id,date)}/><i></i></label><div><input readOnly={!selectedCurrentWeek} className={plan.completedDates?.includes(date)?"strike":""} value={plan.title} onChange={e=>patch(d=>({...d,workoutPlans:d.workoutPlans.map(p=>p.id===plan.id?{...p,title:e.target.value,updatedAt:Date.now()}:p)}))}/><select disabled={!selectedCurrentWeek} value={plan.intensity} onChange={e=>patch(d=>({...d,workoutPlans:d.workoutPlans.map(p=>p.id===plan.id?{...p,intensity:e.target.value as WorkoutPlan["intensity"],updatedAt:Date.now()}:p)}))}><option>轻柔</option><option>适中</option><option>较高</option></select></div>{selectedCurrentWeek&&<span><button onClick={()=>moveWorkout(plan.id,-1)} aria-label="上移">↑</button><button onClick={()=>moveWorkout(plan.id,1)} aria-label="下移">↓</button><button onClick={()=>setDeleteWorkout(plan.id)} aria-label="删除">×</button></span>}</div>)}{!plans.length&&<p className="workout-empty">这一天没有安排运动。</p>}</div></article>})}</section>
      {showWorkoutAdd&&<Modal title={`添加${weekdays[workoutForm.weekday]}运动`} onClose={()=>setShowWorkoutAdd(false)}><form className="editor-form" onSubmit={addWorkout}><label>运动名称<input autoFocus value={workoutForm.title} onChange={e=>setWorkoutForm({...workoutForm,title:e.target.value})} placeholder="例如：普拉提核心训练" required/></label><label>运动强度<select value={workoutForm.intensity} onChange={e=>setWorkoutForm({...workoutForm,intensity:e.target.value as WorkoutPlan["intensity"]})}><option>轻柔</option><option>适中</option><option>较高</option></select></label><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowWorkoutAdd(false)}>取消</button><button>添加活动</button></div></form></Modal>}
      {deleteWorkout&&<Modal title="删除这项运动吗？" onClose={()=>setDeleteWorkout(null)}><p className="modal-copy">这项运动及其历史勾选记录会一起移除。</p><div className="modal-actions"><button className="secondary" onClick={()=>setDeleteWorkout(null)}>先保留</button><button className="danger" onClick={()=>{patch(d=>({...d,workoutPlans:d.workoutPlans.filter(p=>p.id!==deleteWorkout)}));setDeleteWorkout(null)}}>确认删除</button></div></Modal>}
    </section>}
    {tab==="food"&&<section>
      <div className="meal-tabs"><div>{(["早餐","午餐","晚餐"] as Recipe["meal"][]).map(x=><button className={meal===x?"active":""} key={x} onClick={()=>setMeal(x)}>{x}</button>)}</div><button onClick={()=>setShowRecipe(true)}>＋ 添加我的菜谱</button></div>
      <div className="recipe-grid">{data.recipes.filter(r=>r.meal===meal).map(recipe=><article key={recipe.id}><span>{recipe.custom?"我的菜谱":meal}</span><h3>{recipe.name}</h3><p>{recipe.ingredients}</p><details className="recipe-method"><summary>具体做法</summary><p>{recipeMethod(recipe)}</p></details><footer><b>约 {recipe.calories} kcal</b>{recipe.custom&&<button onClick={()=>setDeleteRecipe(recipe.id)}>删除</button>}</footer></article>)}</div>
      <section className="daily-health-log enhanced"><div><span className="eyebrow">DAILY CHECK</span><h2>今日健康记录</h2></div><label>体重（kg）<input type="number" step=".1" value={logForm.weight} onChange={e=>setLogForm({...logForm,weight:e.target.value})} placeholder={todayLog?.weight?String(todayLog.weight):"选填"}/></label><label className="food-description">饮食描述<input value={logForm.foodNote} onChange={e=>setLogForm({...logForm,foodNote:e.target.value})} placeholder={todayLog?.foodNote||"例如：一碗米饭、半份鸡胸肉、一杯酸奶"}/><small>{estimateCalories(logForm.foodNote).items.length?`已识别：${estimateCalories(logForm.foodNote).items.join("、")}`:"加入食物名称和份量，估算会更接近实际。"}</small></label><label className="food-photo"><input type="file" accept="image/*" capture="environment" onChange={handleFoodImage}/>{foodImage||todayLog?.foodImage?<img src={foodImage||todayLog?.foodImage} alt="今日餐食预览"/>:<span>＋ 拍照或上传餐食图片<small>选填 · 仅保存在当前设备</small></span>}</label><div className="calorie-result"><b>{estimateCalories(logForm.foodNote).calories||todayLog?.calories||"–"}</b><span>自动估算 kcal</span><small>结果为常见份量估值，仅供日常记录</small></div><button onClick={saveLog}>保存今日记录</button></section>
      {showRecipe&&<Modal title="添加我的菜谱" onClose={()=>setShowRecipe(false)}><form className="editor-form" onSubmit={addRecipe}><label>菜谱名称<input value={recipeForm.name} onChange={e=>setRecipeForm({...recipeForm,name:e.target.value})} required/></label><label>主要食材与份量<input value={recipeForm.ingredients} onChange={e=>setRecipeForm({...recipeForm,ingredients:e.target.value})} placeholder="例如：燕麦半碗、酸奶一杯、香蕉一根"/></label><label>热量（选填）<input type="number" value={recipeForm.calories} onChange={e=>setRecipeForm({...recipeForm,calories:e.target.value})} placeholder="留空则由工作台估算"/></label><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowRecipe(false)}>取消</button><button>保存菜谱</button></div></form></Modal>}
      {deleteRecipe&&<Modal title="删除这份自定义菜谱吗？" onClose={()=>setDeleteRecipe(null)}><p className="modal-copy">删除后会从你的菜谱清单中移除。</p><div className="modal-actions"><button className="secondary" onClick={()=>setDeleteRecipe(null)}>先保留</button><button className="danger" onClick={()=>{patch(d=>({...d,recipes:d.recipes.filter(r=>r.id!==deleteRecipe)}));setDeleteRecipe(null)}}>确认删除</button></div></Modal>}
    </section>}
    {tab==="care"&&<section>
      <form className="location-picker" onSubmit={saveLocation}><div><span className="eyebrow">YOUR LOCATION</span><h2>所在地</h2><p>点击下拉框选择国家与城市。</p></div><label>国家 / 地区<select value={locationForm.country} onChange={e=>{const country=e.target.value;setLocationForm({country,city:citiesFor(country)[0]?.city||""})}}>{LOCATION_COUNTRIES.map(country=><option key={country} value={country}>{country}</option>)}</select></label><label>城市<select value={locationForm.city} onChange={e=>setLocationForm({...locationForm,city:e.target.value})}>{citiesFor(locationForm.country).map(item=><option key={item.city} value={item.city}>{item.city}</option>)}</select></label><button disabled={!locationOption(locationForm.country,locationForm.city)}>应用位置</button></form>
      <div className="weather-banner"><div><span className="eyebrow">{location.city.toUpperCase()} · {currentTerm}</span><h2>{weather?`${weatherText(weather.code)} · ${weather.temperature}°C`:`正在读取${location.city}天气…`}</h2><p>{weather?`体感 ${weather.apparent}°C · 湿度 ${weather.humidity}% · ${info.phase}`:weatherError?`暂时无法联网，以下按${localSeason(location.latitude)}与周期提供离线建议。`:"天气数据由 Open‑Meteo 提供，无需账号。"}</p></div><i>{weather&&weather.code>=50?"☂":"☼"}</i></div>
      <div className="care-grid"><article><span>01 · 日常饮品</span><h3>{weather&&weather.humidity>75?"空气偏湿，适合清爽饮品":"温和补水，照顾当下体感"}</h3><p>{advice.drink}</p></article><article><span>02 · 一日三餐</span><h3>顺应周期的轻盈搭配</h3><p>{advice.meal}</p></article><article><span>03 · 今日运动</span><h3>{weather&&weather.code>=50?"雨天优先室内":"按体感选择室内或户外"}</h3><p>{weather&&weather.code>=50?`今天更适合室内活动。${advice.sport}`:advice.sport}</p></article><article><span>04 · 穿搭灵感</span><h3>{weather?`${weather.apparent}°C 体感穿搭`:`${location.city}${localSeason(location.latitude)}舒适穿搭`}</h3><p>{advice.wear}{weather&&weather.temperature>30?" 高温注意防晒、补水。":weather&&weather.temperature<12?" 气温偏低，注意腰腹和脚踝保暖。":""}</p></article></div>
      <figure className={`outfit-inspiration outfit-${outfitIndex}`}><div role="img" aria-label={outfitLabels[outfitIndex]}></div><figcaption><span className="eyebrow">TODAY&apos;S OUTFIT</span><h3>{outfitLabels[outfitIndex]}</h3><p>{advice.wear}</p></figcaption></figure>
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

function Finance({ data, patch, initialTab="ledger" }:{data:WorkbenchData;patch:(fn:(d:WorkbenchData)=>WorkbenchData)=>void;initialTab?:"ledger"|"shopping"|"advice"}) {
  const [range,setRange]=useState<"day"|"week"|"month"|"year">("month");
  const [tab,setTab]=useState<"ledger"|"shopping"|"advice">(initialTab);
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
  const parseEntry=(source=quick)=>{
    const text=source.trim();if(!text)return false;
    const d=new Date();if(/昨天/.test(text))d.setDate(d.getDate()-1);else if(/前天/.test(text))d.setDate(d.getDate()-2);
    const explicitDate=text.match(/(20\d{2})[年/\-.](\d{1,2})[月/\-.](\d{1,2})日?/);if(explicitDate)d.setFullYear(Number(explicitDate[1]),Number(explicitDate[2])-1,Number(explicitDate[3]));
    let time=`${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`;const tm=text.match(/(?:上午|中午|下午|晚上)?\s*(\d{1,2})[点:：](\d{1,2})?/);if(tm){let h=Number(tm[1]);if(/下午|晚上/.test(tm[0])&&h<12)h+=12;if(/中午/.test(tm[0])&&h<11)h+=12;time=`${pad(h)}:${pad(Number(tm[2]||0))}`}else if(/早晨|早上/.test(text))time="09:00";else if(/上午/.test(text))time="10:00";else if(/中午/.test(text))time="12:00";else if(/下午/.test(text))time="15:00";else if(/晚上/.test(text))time="19:00";
    const money=[...text.matchAll(/(?:¥|￥)\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:元|块)/g)].map(m=>Number(m[1]||m[2]));const nums=[...text.matchAll(/\d+(?:\.\d{1,2})?/g)].map(m=>Number(m[0]));const amount=money[money.length-1]||nums[nums.length-1]||0;if(!amount)return false;
    const isIncome=/收入|工资|奖金|红包|卖闲置|收到|转入|生活费/.test(text);const map:[RegExp,string][]=[[/饭|吃|餐|肉片|外卖|早餐|午餐|晚餐/,"餐饮"],[/奶茶|咖啡|茶|饮料/,"饮品"],[/地铁|打车|公交|滴滴/,"交通"],[/房租|租金/,"房租"],[/普拉提|健身|瑜伽/,"运动"],[/书|课程|学习/,"学习"],[/衣服|裙|鞋|服饰/,"服饰"],[/护肤|化妆|美容/,"美容"],[/工资/,"工资"],[/红包/,"红包"],[/闲置/,"卖闲置"],[/旅行|酒店|机票/,"旅行"],[/快递/,"快递"],[/医院|药|医疗/,"医疗"],[/游戏/,"游戏"]];
    const name=map.find(([key])=>key.test(text))?.[1]||(isIncome?"其他收入":"其他");let cat=data.financeCategories.find(c=>c.type===(isIncome?"income":"expense")&&c.name===name);if(!cat)cat=data.financeCategories.find(c=>c.type===(isIncome?"income":"expense"));
    const note=text.replace(/今天|昨天|前天|早晨|早上|上午|中午|下午|晚上/g,"").replace(/(?:\d{1,2})[点:：]\d{0,2}/g,"").replace(/\d+(?:\.\d{1,2})?\s*(?:元|块)?/g,"").replace(/花了|支付|支出|收入|消费|一笔/g,"").replace(/[，,。.\s]+/g," ").trim()||name;
    patch(x=>({...x,financeEntries:[...x.financeEntries,{id:uid(),type:isIncome?"income":"expense",categoryId:cat!.id,amount,note,date:dayKey(d),time,updatedAt:Date.now()}]}));setQuick("");return true;
  };
  const addShopping=(e:FormEvent)=>{e.preventDefault();if(!shopForm.name.trim())return;const name=shopForm.name.trim(),price=Number(shopForm.price)||0,now=Date.now();patch(d=>({...d,shoppingItems:[...d.shoppingItems,{id:uid(),name,price,saved:0,purchased:false,updatedAt:now}],savingsGoals:[...d.savingsGoals,{id:uid(),name,target:price,saved:0,updatedAt:now}]}));setShopForm({name:"",price:""})};
  const addGoal=(e:FormEvent)=>{e.preventDefault();if(!goalForm.name.trim())return;patch(d=>({...d,savingsGoals:[...d.savingsGoals,{id:uid(),name:goalForm.name.trim(),target:Number(goalForm.target)||0,saved:Number(goalForm.saved)||0,updatedAt:Date.now()}]}));setGoalForm({name:"",target:"",saved:""})};
  const saveCategory=(e:FormEvent)=>{e.preventDefault();if(!categoryForm.name.trim())return;patch(d=>({...d,financeCategories:[...d.financeCategories,{id:uid(),...categoryForm,name:categoryForm.name.trim(),updatedAt:Date.now()}]}));setShowCategory(false);setCategoryForm({name:"",type:"expense",color:"#D48793"})};
  const remove=()=>{if(!deleteTarget)return;patch(d=>{if(deleteTarget.kind==="entry")return {...d,financeEntries:d.financeEntries.filter(x=>x.id!==deleteTarget.id)};if(deleteTarget.kind==="shop")return {...d,shoppingItems:d.shoppingItems.filter(x=>x.id!==deleteTarget.id)};if(deleteTarget.kind==="goal")return {...d,savingsGoals:d.savingsGoals.filter(x=>x.id!==deleteTarget.id)};const removed=d.financeCategories.find(x=>x.id===deleteTarget.id);const fallback=d.financeCategories.find(x=>x.id!==deleteTarget.id&&x.type===removed?.type);return {...d,financeCategories:d.financeCategories.filter(x=>x.id!==deleteTarget.id),financeEntries:fallback?d.financeEntries.map(x=>x.categoryId===deleteTarget.id?{...x,categoryId:fallback.id,updatedAt:Date.now()}:x):d.financeEntries}});setDeleteTarget(null)};
  const unbought=data.shoppingItems.filter(x=>!x.purchased).reduce((s,x)=>s+x.price,0);
  const adviceRatio=data.financeSettings.monthlyIncome?Math.min(60,Math.max(10,Math.round((data.financeSettings.monthlyIncome-expenseTotal)/data.financeSettings.monthlyIncome*100))):null;
  return <div className="page finance-page">
    <header className="finance-hero"><div><span className="eyebrow">MY MONEY GARDEN</span><h1>让每一笔钱，都去想去的地方</h1><p>认真记录，轻松看见生活的选择与积累。</p></div><div className="privacy-income"><i>♡</i><span>建议页保护工资隐私<small>账本正常展示收入与结余</small></span></div></header>
    <nav className="growth-tabs finance-tabs"><button className={tab==="ledger"?"active":""} onClick={()=>setTab("ledger")}>记账看板</button><button className={tab==="shopping"?"active":""} onClick={()=>setTab("shopping")}>购物与攒钱</button><button className={tab==="advice"?"active":""} onClick={()=>setTab("advice")}>理财建议</button></nav>
    {tab==="ledger"&&<section>
      <div className="finance-toolbar"><div className="range-tabs">{([["day","当天"],["week","本周"],["month","本月"],["year","本年"]] as const).map(([id,label])=><button className={range===id?"active":""} key={id} onClick={()=>setRange(id)}>{label}</button>)}</div><div><button className="secondary" onClick={()=>setShowCategory(true)}>管理分类</button><button onClick={()=>setEditor("new")}>＋ 记一笔</button></div></div>
      <div className="finance-summary"><article className="income"><span>收入</span><h2>¥ {incomeTotal.toFixed(2)}</h2><p>共记录 {scoped.filter(e=>e.type==="income").length} 笔</p></article><article className="expense"><span>支出</span><h2>¥ {expenseTotal.toFixed(2)}</h2><p>共 {scoped.filter(e=>e.type==="expense").length} 笔</p></article><article className="balance"><span>结余</span><h2>¥ {(incomeTotal-expenseTotal).toFixed(2)}</h2><p>{incomeTotal>=expenseTotal?"当前仍有结余":"当前支出高于收入"}</p></article></div>
      <div className={`chart-grid ${range==="day"?"single-chart":""}`}><article className="donut-card"><div className="finance-card-head"><h2>支出分类</h2><span>金额与占比</span></div><div className="donut-wrap"><div className="donut" style={{background:donut}}><i><b>{expenseGroups.length}</b><small>个分类</small></i></div><div className="donut-legend">{expenseGroups.map(([id,value],i)=><span key={id}><i style={{background:colors[i]}}></i><b>{data.financeCategories.find(c=>c.id===id)?.name}</b><small>¥ {value.toFixed(2)} · {expenseTotal?Math.round(value/expenseTotal*100):0}%</small></span>)}{!expenseGroups.length&&<p>记下支出后，这里会长出一朵分类小花。</p>}</div></div></article>{range!=="day"&&<article className="trend-card"><div className="finance-card-head"><h2>收支趋势</h2><span><i className="green"></i>收入 <i className="pink"></i>支出</span></div><TrendCanvas points={trend}/><div className="trend-labels">{trend.map((p,i)=><span key={i}>{p.label}</span>)}</div></article>}</div>
      <div className="quick-ledger enhanced"><span>✦</span><input value={quick} onChange={e=>setQuick(e.target.value)} onKeyDown={e=>e.key==="Enter"&&parseEntry()} placeholder="试试输入：昨天中午吃了水煮肉片花了30" /><button onClick={()=>parseEntry()}>自动记账</button></div>
      <section className="ledger-timeline"><div className="finance-card-head"><h2>账目时间线</h2><span>同一天按时间从早到晚</span></div>{[...new Set(scoped.map(e=>e.date))].sort((a,b)=>b.localeCompare(a)).map(date=><div className="ledger-day" key={date}><header><b>{displayDate(date)}</b><span>{weekday(date)}</span></header>{scoped.filter(e=>e.date===date).sort((a,b)=>a.time.localeCompare(b.time)).map(entry=>{const cat=data.financeCategories.find(c=>c.id===entry.categoryId);return <article key={entry.id}><time>{entry.time}</time><i style={{background:cat?.color}}>{entry.type==="income"?"＋":"－"}</i><button onClick={()=>setEditor(entry)}><b>{cat?.name||"未分类"}</b><span>{entry.note}</span></button><strong className={entry.type}>{entry.type==="income"?`+ ¥ ${entry.amount.toFixed(2)}`:`- ¥ ${entry.amount.toFixed(2)}`}</strong><button className="more" onClick={()=>setDeleteTarget({kind:"entry",id:entry.id})}>×</button></article>})}</div>)}{!scoped.length&&<Empty text="这一段时间还没有账目，第一笔也可以很轻松。" />}</section>
      {editor&&<FinanceEditor item={editor==="new"?null:editor} data={data} patch={patch} close={()=>setEditor(null)}/>}
      {showCategory&&<Modal title="管理收支分类" onClose={()=>setShowCategory(false)}><form className="editor-form" onSubmit={saveCategory}><div className="two-col"><label>类型<select value={categoryForm.type} onChange={e=>setCategoryForm({...categoryForm,type:e.target.value as "income"|"expense"})}><option value="expense">支出</option><option value="income">收入</option></select></label><label>颜色<input type="color" value={categoryForm.color} onChange={e=>setCategoryForm({...categoryForm,color:e.target.value})}/></label></div><label>新增分类<input value={categoryForm.name} onChange={e=>setCategoryForm({...categoryForm,name:e.target.value})} placeholder="输入分类名称" required/></label><div className="modal-actions"><button>＋ 添加分类</button></div></form><div className="finance-category-manager">{data.financeCategories.map(category=><article key={category.id}><input type="color" value={category.color} onChange={e=>patch(d=>({...d,financeCategories:d.financeCategories.map(x=>x.id===category.id?{...x,color:e.target.value,updatedAt:Date.now()}:x)}))}/><select value={category.type} onChange={e=>{const type=e.target.value as FinanceCategory["type"];patch(d=>({...d,financeCategories:d.financeCategories.map(x=>x.id===category.id?{...x,type,updatedAt:Date.now()}:x),financeEntries:d.financeEntries.map(x=>x.categoryId===category.id?{...x,type,updatedAt:Date.now()}:x)}))}}><option value="expense">支出</option><option value="income">收入</option></select><input value={category.name} onChange={e=>patch(d=>({...d,financeCategories:d.financeCategories.map(x=>x.id===category.id?{...x,name:e.target.value,updatedAt:Date.now()}:x)}))}/><button type="button" onClick={()=>setDeleteTarget({kind:"category",id:category.id})}>删除</button></article>)}</div></Modal>}
    </section>}
    {tab==="shopping"&&<section className="shopping-layout">
      <article className="shopping-panel"><div className="finance-card-head"><div><span className="eyebrow">SHOPPING LIST</span><h2>购物清单</h2></div><b>未购买合计 ¥ {unbought.toFixed(2)}</b></div><form className="shop-form" onSubmit={addShopping}><input value={shopForm.name} onChange={e=>setShopForm({...shopForm,name:e.target.value})} placeholder="想买什么？"/><input type="number" value={shopForm.price} onChange={e=>setShopForm({...shopForm,price:e.target.value})} placeholder="价格"/><button>添加</button></form><div className="shopping-list">{data.shoppingItems.map(item=><div key={item.id}><label><input type="checkbox" checked={item.purchased} onChange={()=>patch(d=>({...d,shoppingItems:d.shoppingItems.map(x=>x.id===item.id?{...x,purchased:!x.purchased,updatedAt:Date.now()}:x)}))}/><i></i></label><input className={item.purchased?"strike":""} value={item.name} onChange={e=>patch(d=>({...d,shoppingItems:d.shoppingItems.map(x=>x.id===item.id?{...x,name:e.target.value,updatedAt:Date.now()}:x)}))}/><b>¥ {item.price.toFixed(2)}</b><button onClick={()=>setDeleteTarget({kind:"shop",id:item.id})}>×</button></div>)}</div></article>
      <article className="savings-panel linked-savings"><div className="finance-card-head"><div><span className="eyebrow">SAVINGS PLANS</span><h2>攒钱计划</h2></div><span>每一次积累，都在让期待更靠近。</span></div><form className="goal-money-form compact" onSubmit={addGoal}><input value={goalForm.name} onChange={e=>setGoalForm({...goalForm,name:e.target.value})} placeholder="计划名称"/><input type="number" min="0" value={goalForm.target} onChange={e=>setGoalForm({...goalForm,target:e.target.value})} placeholder="目标金额"/><input type="number" min="0" value={goalForm.saved} onChange={e=>setGoalForm({...goalForm,saved:e.target.value})} placeholder="已存金额"/><button>＋ 新建计划</button></form>{data.savingsGoals.map(goal=>{const pct=goal.target?Math.min(100,Math.round(goal.saved/goal.target*100)):0;return <section className="saving-goal editable" key={goal.id}><header><input value={goal.name} onChange={e=>patch(d=>({...d,savingsGoals:d.savingsGoals.map(x=>x.id===goal.id?{...x,name:e.target.value,updatedAt:Date.now()}:x)}))}/><button onClick={()=>setDeleteTarget({kind:"goal",id:goal.id})} aria-label={`删除${goal.name}`}>×</button></header><div className="saving-numbers"><span>已完成 <b>{pct}%</b></span><span>还差 ¥ {Math.max(0,goal.target-goal.saved).toFixed(0)}</span></div><div className="saving-progress"><i style={{width:`${pct}%`}}/></div><div className="saving-fields"><label>目标金额<input type="number" min="0" value={goal.target||""} onChange={e=>patch(d=>({...d,savingsGoals:d.savingsGoals.map(x=>x.id===goal.id?{...x,target:Number(e.target.value),updatedAt:Date.now()}:x)}))}/></label><label>当前已存<input type="number" min="0" value={goal.saved||""} onChange={e=>patch(d=>({...d,savingsGoals:d.savingsGoals.map(x=>x.id===goal.id?{...x,saved:Number(e.target.value),updatedAt:Date.now()}:x)}))}/></label></div></section>})}{!data.savingsGoals.length&&<p className="goal-empty">写下第一个目标，从一小步开始积累。</p>}</article>
    </section>}
    {tab==="advice"&&<section className="advice-layout">
      <article className="income-setting"><span className="eyebrow">PRIVATE INPUT</span><h2>收入设置</h2><div><input type="password" inputMode="decimal" value={incomeInput} onChange={e=>setIncomeInput(e.target.value)} placeholder={data.financeSettings.monthlyIncome?"当前收入已安全保存，可重新录入":"输入月收入"}/><button onClick={()=>{const amount=Number(incomeInput);if(amount>0){patch(d=>{const category=d.financeCategories.find(c=>c.type==="income"&&c.name==="工资");const month=today.slice(0,7);const existing=category&&d.financeEntries.find(e=>e.categoryId===category.id&&e.date.startsWith(month));return {...d,financeSettings:{monthlyIncome:amount,updatedAt:Date.now()},financeEntries:existing?d.financeEntries.map(e=>e.id===existing.id?{...e,amount,note:"本月到手工资",updatedAt:Date.now()}:e):category?[...d.financeEntries,{id:uid(),type:"income",categoryId:category.id,amount,note:"本月到手工资",date:today,time:"09:00",updatedAt:Date.now()}]:d.financeEntries}});setIncomeInput("")}}}>保存</button></div><small>数据仅保存在此设备，不会上传。</small></article>
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

function SpeakingPractice({text,language="en-US",translation=""}:{text:string;language?:string;translation?:string}) {
  const [recording,setRecording]=useState(false);
  const [audioUrl,setAudioUrl]=useState("");
  const [transcript,setTranscript]=useState("");
  const [feedback,setFeedback]=useState("");
  const [error,setError]=useState("");
  const recorderRef=useRef<MediaRecorder|null>(null);
  const recognitionRef=useRef<any>(null);
  const chunksRef=useRef<Blob[]>([]);
  useEffect(()=>()=>{if(audioUrl)URL.revokeObjectURL(audioUrl)},[audioUrl]);
  const analyze=(heard:string)=>{
    const clean=(s:string)=>s.toLowerCase().replace(/[^\p{L}'\s]/gu,"").split(/\s+/).filter(Boolean);
    const expected=clean(text),actual=clean(heard);
    const matched=expected.filter((word,i)=>actual[i]===word||actual.includes(word)).length;
    const score=Math.round(matched/Math.max(expected.length,1)*100);
    const missed=[...new Set(expected.filter(word=>!actual.includes(word)))].slice(0,4);
    setFeedback(`${score>=85?"跟读内容很完整，节奏可以再自然一些。":score>=60?"整体清楚，再留意个别词和意群停顿。":"建议放慢语速，先分成三个意群逐句练习。"} 文本匹配约 ${score}%${missed.length?`；可重点练习：${missed.join("、")}`:"。"}`);
  };
  const start=async()=>{
    setError("");setFeedback("");setTranscript("");
    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){setError("当前浏览器不支持录音，请使用最新版 Safari 或 Chrome。");return}
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const recorder=new MediaRecorder(stream); recorderRef.current=recorder; chunksRef.current=[];
      recorder.ondataavailable=e=>{if(e.data.size)chunksRef.current.push(e.data)};
      recorder.onstop=()=>{if(audioUrl)URL.revokeObjectURL(audioUrl);setAudioUrl(URL.createObjectURL(new Blob(chunksRef.current,{type:recorder.mimeType})));stream.getTracks().forEach(track=>track.stop())};
      const Recognition=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
      if(Recognition){
        const recognition=new Recognition(); recognitionRef.current=recognition; recognition.lang=language; recognition.interimResults=false;
        recognition.onresult=(e:any)=>{const heard=e.results?.[0]?.[0]?.transcript||"";setTranscript(heard);analyze(heard)};
        recognition.onerror=()=>setError("录音已保留，但本次未能完成语音转写，可以先回放自查。");
        recognition.start();
      } else setError("录音功能可用；当前浏览器不支持自动语音转写，请回放自查。");
      recorder.start();setRecording(true);
    }catch{setError("没有获得麦克风权限。你可以在浏览器设置中允许后再试。")}
  };
  const stop=()=>{recorderRef.current?.stop();try{recognitionRef.current?.stop()}catch{}setRecording(false)};
  const speak=()=>{if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang=language;utterance.rate=.82;window.speechSynthesis.speak(utterance)};
  return <section className="speaking-practice"><div><span>口语跟读</span><p>{text}</p>{translation&&<em>{translation}</em>}</div><div className="speaking-actions"><button className="listen" onClick={speak}>▷ 播放示范</button><button className={recording?"recording":""} onClick={recording?stop:start}>{recording?"■ 停止并分析":"● 点击录音"}</button></div><small>仅在你点击后申请麦克风权限；录音留在本设备，不会上传。</small>{audioUrl&&<audio controls src={audioUrl}/>} {transcript&&<p className="transcript"><b>识别文本：</b>{transcript}</p>}{feedback&&<p className="speech-feedback">{feedback}<small>浏览器文本匹配仅供练习参考，并非专业声学评分。</small></p>}{error&&<p className="speech-error">{error}</p>}</section>;
}

const DAILY_BOOKS=[["《始于极限》","上野千鹤子、铃木凉美","女性"],["《置身事内》","兰小欢","商业"],["《芯片战争》","克里斯·米勒","人工智能"],["《随机漫步的傻瓜》","纳西姆·塔勒布","金融"],["《新闻的骚动》","阿兰·德波顿","新闻"],["《百年孤独》","加西亚·马尔克斯","小说"],["《我与地坛》","史铁生","读书"],["《女性贫困》","NHK特别节目录制组","女性"],["《聪明的投资者》","本杰明·格雷厄姆","金融"],["《创新者的窘境》","克莱顿·克里斯坦森","商业"],["《你当像鸟飞往你的山》","塔拉·韦斯特弗","女性"],["《克拉拉与太阳》","石黑一雄","人工智能"]];
const DAILY_PODCASTS=[["随机波动","三位女性媒体人","女性"],["声东击西","徐涛","新闻"],["忽左忽右","程衍樑","新闻"],["跳岛FM","中信出版集团","读书"],["无人知晓","孟岩","金融"],["硅谷101","泓君","人工智能"],["晚点聊 LateTalk","晚点团队","商业"],["商业就是这样","第一财经","商业"],["The Daily","The New York Times","新闻"],["知行小酒馆","有知有行","金融"]];
const FALLBACK_NEWS=[
  {title:"稳中提质 韧性增强——透视上半年消费外贸外资走势",summary:"消费市场扩容提质，外贸创新发展加快，吸引外资质量继续提升。",source:"新华网",link:"https://www.news.cn/20260723/d03d07fe1d054cb4b3f5fc929ad641d0/c.html",publishedAt:"2026-07-23",category:"商业"},
  {title:"中国制造加速涌现“新”力量",summary:"上半年工业和信息化领域呈现新技术、新成果与新动能，多项先进制造取得进展。",source:"新华网",link:"https://www.news.cn/20260720/86639bcfb6b849bcab3561c9850195d7/c.html",publishedAt:"2026-07-20",category:"科技"},
  {title:"2026上半年中国经济展现强大韧性与活力",summary:"上半年国内生产总值同比增长4.7%，装备制造、高技术制造和进出口保持增长。",source:"新华网",link:"https://www.news.cn/20260715/249f48c52fa1424093bcea95a3383fa6/c.html",publishedAt:"2026-07-15",category:"经济"},
  {title:"全国夏粮产量首次突破3000亿斤",summary:"全国夏粮总产量达到3014.9亿斤，在多重天气影响下实现丰收。",source:"新华网",link:"https://www.news.cn/20260710/2df24b2da5b34ac7aafd2b2a3987cdcc/c.html",publishedAt:"2026-07-10",category:"民生"},
  {title:"2026年全国暑期文化和旅游消费季启动",summary:"各地将推出超3万场文旅活动和多项惠民措施，覆盖避暑、夜游、研学与非遗美食。",source:"新华网",link:"https://www.news.cn/culture/20260709/09575bd83280422788d151b8094f7720/c.html",publishedAt:"2026-07-09",category:"文化"},
  {title:"可再生能源消费政策将于8月实施",summary:"新政策推动可再生能源消费和绿色电力使用，助力能源结构继续转型。",source:"新华网",link:"https://www.news.cn/energy/20260626/849ed86b65c2444bb0a8d18dcac6455e/c.html",publishedAt:"2026-06-26",category:"能源"},
  {title:"我国成功发射实践三十一号卫星",summary:"长征三号乙运载火箭将卫星送入预定轨道，卫星主要用于空间环境探测。",source:"新华网",link:"https://www.news.cn/20260616/a719807f90ce46a99d5649fba5cadb43/c.html",publishedAt:"2026-06-16",category:"航天"},
  {title:"我国将迎来第22个中国航海日",summary:"今年航海日以数智赋能为主题，将举办论坛、航行安全治理对话等活动。",source:"新华网",link:"https://www.news.cn/politics/20260630/b99f997bc274439eb7a3cebbb75c0ec2/c.html",publishedAt:"2026-06-30",category:"社会"},
  {title:"铁路暑运启动 预计发送旅客10.1亿人次",summary:"铁路部门将根据暑期客流变化动态增加运力，并持续优化出行服务。",source:"新华网",link:"https://www.news.cn/government/20260701/9bc5e1e5d4b848a19fec99f73bb30a87/c.html",publishedAt:"2026-07-01",category:"出行"},
  {title:"国际油价波动牵动全球能源市场",summary:"国际能源市场受供需和地缘因素影响，市场关注价格对消费与产业链的传导。",source:"新华网",link:"https://www.news.cn/world/20260708/b37e19c96b064451abd32bd8a5760930/c.html",publishedAt:"2026-07-08",category:"国际"}
];

function MediaCategoryManager({title,items,draft,setDraft,onAdd,onRename,onDelete}:{title:string;items:MoodTag[];draft:string;setDraft:(value:string)=>void;onAdd:()=>void;onRename:(id:string,name:string)=>void;onDelete:(id:string)=>void}){
  return <section className="media-category-manager"><div><b>{title}</b></div><form onSubmit={e=>{e.preventDefault();onAdd()}}><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="新建分类"/><button>＋</button></form><div>{items.map(item=><label key={item.id}><input value={item.name} onChange={e=>onRename(item.id,e.target.value)}/><button type="button" onClick={()=>onDelete(item.id)}>×</button></label>)}</div></section>
}

function Growth({ data, patch, initialTab="path" }: { data: WorkbenchData; patch: (fn:(d:WorkbenchData)=>WorkbenchData)=>void; initialTab?:"path"|"learn"|"goals"|"jobs" }) {
  const [tab,setTab]=useState<"path"|"learn"|"goals"|"news"|"books"|"podcasts"|"jobs">(initialTab);
  const [openSkill,setOpenSkill]=useState<string>("agent");
  const [openTrack,setOpenTrack]=useState<string>("law");
  const [sourceText,setSourceText]=useState("");
  const [goalText,setGoalText]=useState("");
  const [goalKind,setGoalKind]=useState<Goal["kind"]>(data.goalCategories[0]?.name||"证书");
  const [goalCategoryDraft,setGoalCategoryDraft]=useState("");
  const [deleteGoal,setDeleteGoal]=useState<string|null>(null);
  const [detailSkill,setDetailSkill]=useState<Skill|null>(null);
  const [lesson,setLesson]=useState<{skill:Skill;topic:string}|null>(null);
  const [news,setNews]=useState(FALLBACK_NEWS);
  const [bookForm,setBookForm]=useState({title:"",author:"",category:"文学",currentPage:"",totalPages:"",status:"在读" as ReadingBook["status"]});
  const [podcastForm,setPodcastForm]=useState({title:"",host:"",category:"情感",currentEpisode:""});
  const [bookCategoryDraft,setBookCategoryDraft]=useState("");
  const [podcastCategoryDraft,setPodcastCategoryDraft]=useState("");
  const today=todayKey();
  useEffect(()=>{
    if(tab!=="news")return;
    fetch("https://60s.viki.moe/v2/60s").then(response=>{if(!response.ok)throw new Error();return response.json()}).then(result=>{
      const payload=result?.data||{};const items=Array.isArray(payload.news)?payload.news:[];
      if(items.length<10)return;
      setNews(items.slice(0,10).map((value:unknown,index:number)=>{const summary=String(value).replace(/^\d+[.、]\s*/,"");const title=summary.split(/[：:；;]/)[0].slice(0,34)||summary.slice(0,34);return {title,summary,source:"每日新闻公开源",link:payload.link||"https://60s.viki.moe/v2/60s",publishedAt:payload.date||todayKey(),category:["国内","社会","财经","科技","国际"][index%5]}}));
    }).catch(()=>setNews(FALLBACK_NEWS));
  },[tab,today]);
  useEffect(()=>{
    const openRecommendedMedia=(event:MouseEvent)=>{
      if(!/iPhone|iPad|Android/i.test(navigator.userAgent))return;
      const link=(event.target as HTMLElement).closest<HTMLAnchorElement>(".recommend-grid a");if(!link)return;
      const title=link.closest("article")?.querySelector("h3")?.textContent?.trim()||"";
      if(link.href.includes("book.douban.com")){event.preventDefault();window.location.href=`douban://douban.com/search?q=${encodeURIComponent(title)}`;return}
      if(link.href.includes("xiaoyuzhoufm.com")){event.preventDefault();window.location.href=`https://podcasts.apple.com/cn/search?term=${encodeURIComponent(title)}`}
    };
    document.addEventListener("click",openRecommendedMedia);
    return()=>document.removeEventListener("click",openRecommendedMedia);
  },[]);
  const checked=(trackId:string)=>data.checkins.some(c=>c.trackId===trackId&&c.date===today);
  const toggleTrack=(trackId:string)=>{
    patch(d=>{
      const hit=d.checkins.find(c=>c.trackId===trackId&&c.date===today);
      return {...d,checkins:hit?d.checkins.filter(c=>c.id!==hit.id):[...d.checkins,{id:uid(),trackId,date:today,note:"完成今日学习",updatedAt:Date.now()}]};
    });
  };
  const cycleSkill=(id:string)=>{
    const states:ProgressState[]=["未开始","进行中","已掌握"];
    patch(d=>({...d,skills:d.skills.map(s=>s.id===id?{...s,progress:states[(states.indexOf(s.progress)+1)%3],updatedAt:Date.now()}:s)}));
  };
  const toggleSkillCheckin=(id:string)=>patch(d=>({...d,skills:d.skills.map(s=>s.id===id?{...s,lastCheckin:s.lastCheckin===today?undefined:today,updatedAt:Date.now()}:s)}));
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
    <header className="growth-hero"><div><span className="eyebrow">GROWTH MAP</span><h1>把成长，变成看得见的路径</h1><div className="growth-stats"><span><b>{inProgress}</b> 项进行中</span><span><b>{mastered}</b> 项已掌握</span><span><b>{data.checkins.filter(c=>c.date===today).length}</b> 项今日打卡</span></div></div><img src="/bears/v2/bear-reading.png" alt="正在阅读的水彩小熊" /></header>
    <nav className="growth-tabs"><button className={tab==="path"?"active":""} onClick={()=>setTab("path")}>职业技能树</button><button className={tab==="learn"?"active":""} onClick={()=>setTab("learn")}>学习打卡</button><button className={tab==="news"?"active":""} onClick={()=>setTab("news")}>新闻资讯</button><button className={tab==="books"?"active":""} onClick={()=>setTab("books")}>阅读推荐</button><button className={tab==="podcasts"?"active":""} onClick={()=>setTab("podcasts")}>播客推荐</button><button className={tab==="goals"?"active":""} onClick={()=>setTab("goals")}>长期目标</button><button className={tab==="jobs"?"active":""} onClick={()=>setTab("jobs")}>招聘</button></nav>

    {tab==="books"&&<MediaCategoryManager title="书架分类" items={data.bookCategories} draft={bookCategoryDraft} setDraft={setBookCategoryDraft} onAdd={()=>{if(!bookCategoryDraft.trim())return;patch(d=>({...d,bookCategories:[...d.bookCategories,{id:uid(),name:bookCategoryDraft.trim(),updatedAt:Date.now()}]}));setBookCategoryDraft("")}} onRename={(id,name)=>patch(d=>{const old=d.bookCategories.find(x=>x.id===id)?.name;return {...d,bookCategories:d.bookCategories.map(x=>x.id===id?{...x,name,updatedAt:Date.now()}:x),readingBooks:d.readingBooks.map(x=>x.category===old?{...x,category:name,updatedAt:Date.now()}:x)}})} onDelete={id=>patch(d=>({...d,bookCategories:d.bookCategories.filter(x=>x.id!==id)}))}/>}
    {tab==="podcasts"&&<MediaCategoryManager title="播客分类" items={data.podcastCategories} draft={podcastCategoryDraft} setDraft={setPodcastCategoryDraft} onAdd={()=>{if(!podcastCategoryDraft.trim())return;patch(d=>({...d,podcastCategories:[...d.podcastCategories,{id:uid(),name:podcastCategoryDraft.trim(),updatedAt:Date.now()}]}));setPodcastCategoryDraft("")}} onRename={(id,name)=>patch(d=>{const old=d.podcastCategories.find(x=>x.id===id)?.name;return {...d,podcastCategories:d.podcastCategories.map(x=>x.id===id?{...x,name,updatedAt:Date.now()}:x),savedPodcasts:d.savedPodcasts.map(x=>x.category===old?{...x,category:name,updatedAt:Date.now()}:x)}})} onDelete={id=>patch(d=>({...d,podcastCategories:d.podcastCategories.filter(x=>x.id!==id)}))}/>}
    {tab==="goals"&&<MediaCategoryManager title="目标标签" items={data.goalCategories} draft={goalCategoryDraft} setDraft={setGoalCategoryDraft} onAdd={()=>{const name=goalCategoryDraft.trim();if(!name)return;patch(d=>({...d,goalCategories:[...d.goalCategories,{id:uid(),name,updatedAt:Date.now()}]}));setGoalKind(name);setGoalCategoryDraft("")}} onRename={(id,name)=>patch(d=>{const old=d.goalCategories.find(x=>x.id===id)?.name;setGoalKind(current=>current===old?name:current);return {...d,goalCategories:d.goalCategories.map(x=>x.id===id?{...x,name,updatedAt:Date.now()}:x),goals:d.goals.map(x=>x.kind===old?{...x,kind:name,updatedAt:Date.now()}:x)}})} onDelete={id=>patch(d=>{const removed=d.goalCategories.find(x=>x.id===id);const remaining=d.goalCategories.filter(x=>x.id!==id);const fallback=remaining[0]?.name||"";if(removed?.name===goalKind)setGoalKind(fallback);return {...d,goalCategories:remaining,goals:fallback?d.goals.map(x=>x.kind===removed?.name?{...x,kind:fallback,updatedAt:Date.now()}:x):d.goals.filter(x=>x.kind!==removed?.name)}})}/>}
    {tab==="path"&&<section>
      <div className="growth-section-head"><div><span className="eyebrow">CAREER PATH</span><h2>职业技能路径</h2></div><p>点击技能卡片查看计划，再点击状态按钮推进进度。</p></div>
      <div className="skill-grid">{data.skills.map(skill=><article key={skill.id} className={`skill-card ${openSkill===skill.id?"open":""}`}>
        <button className="skill-summary" onClick={()=>setOpenSkill(openSkill===skill.id?"":skill.id)}><i>{skill.icon}</i><span><b>{skill.name}</b><small>{skill.points.slice(0,3).join(" · ")}</small></span><em className={skill.progress==="已掌握"?"mastered":skill.progress==="进行中"?"doing":""}>{skill.progress}</em></button>
        {openSkill===skill.id&&<div className="skill-detail">
          <div className="plan-columns"><div><h4>初级计划</h4>{skill.beginner.map(x=><button className="lesson-link" key={x} onClick={()=>setLesson({skill,topic:x})}>○ {x}<span>学习 →</span></button>)}</div><div><h4>进阶计划</h4>{skill.advanced.map(x=><button className="lesson-link" key={x} onClick={()=>setLesson({skill,topic:x})}>◇ {x}<span>学习 →</span></button>)}</div></div>
          <div className="knowledge"><h4>核心知识点</h4>{skillKnowledge(skill).map(x=><button key={x} onClick={()=>setLesson({skill,topic:x})}>{x}</button>)}</div>
          <div className="resource-list"><h4>推荐资料</h4>{(SKILL_LINKS[skill.id]||[]).map(x=><a key={x.url} href={x.url} target="_blank" rel="noreferrer">↗ {x.label}</a>)}</div>
          {skill.notes&&<div className="skill-note"><b>我的总结</b><p>{skill.notes}</p></div>}
          <details className="material-box"><summary>粘贴我的资料并本地提炼</summary><textarea value={sourceText} onChange={e=>setSourceText(e.target.value)} placeholder="粘贴学习笔记或资料文字。工作台会在本地抽取前四个要点，不会上传。"/><button onClick={()=>summarize(skill.id)}>提炼到技能卡</button></details>
          <footer><button className={`skill-checkin ${skill.lastCheckin===today?"checked":""}`} onClick={()=>toggleSkillCheckin(skill.id)}><i>{skill.lastCheckin===today?"✓":""}</i>{skill.lastCheckin===today?"今日已打卡":"今日打卡"}</button><div><button className="secondary" onClick={()=>setDetailSkill(skill)}>深入讲解</button><button onClick={()=>cycleSkill(skill.id)}>更新技能进度 →</button></div></footer>
        </div>}
      </article>)}</div>
    </section>}

    {tab==="learn"&&<section>
      <div className="growth-section-head"><div><span className="eyebrow">DAILY LEARNING</span><h2>今天学一点，就很好</h2></div><p>每项都有实际内容、阶段计划和独立打卡。</p></div>
      <div className="track-layout"><aside>{data.learningTracks.map(track=><button key={track.id} className={openTrack===track.id?"active":""} onClick={()=>setOpenTrack(track.id)}><i>{track.icon}</i><span>{track.name}</span><b className={checked(track.id)?"checked":""}>{checked(track.id)?"✓":""}</b></button>)}</aside>
      {data.learningTracks.filter(t=>t.id===openTrack).map(track=>{const daily=trackDaily(track.id,today);return <article className="track-detail" key={track.id}><div className="track-title"><div><span className="track-icon">{track.icon}</span><div><h2>{track.name}</h2></div></div><button className={checked(track.id)?"checked":""} onClick={()=>toggleTrack(track.id)}>{checked(track.id)?"✓ 今日已打卡":"今日打卡"}</button></div>
        <div className="today-learning"><span>今日内容 · {displayDate(today)} <em>每天自动轮换</em></span>{daily.words&&<div className="word-grid">{daily.words.map((x,i)=><article key={x.word}><b>{i+1}. {x.word}</b><small>{x.phonetic} · {x.meaning}</small><p>{x.example}</p><em>{WORD_TRANSLATIONS[x.word]}</em></article>)}</div>}{daily.items.map(x=><p key={x}>✦ {x}</p>)}<blockquote>{daily.material}</blockquote></div>
        {daily.speaking&&<SpeakingPractice text={daily.speaking} language={daily.language} translation={daily.translation}/>}
        {track.id==="photoshop"&&<figure className="photoshop-practice"><img src="/bears/v2/bear-reading.png" alt="可用于 Photoshop 选区、蒙版与排版练习的小熊素材"/><figcaption>今日练习素材 · 可截图保存，用来练习选区、蒙版、调色或版式。</figcaption></figure>}
        {TRACK_RESOURCES[track.id]&&<div className="learning-resources">{TRACK_RESOURCES[track.id].map(link=><a href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label} ↗</a>)}</div>}
        <div className="stage-plan"><h3>阶段学习计划</h3>{track.plan.map((x,i)=><div key={x}><b>0{i+1}</b><span>{x}</span></div>)}</div>
        <div className="track-note"><label>我的学习记录<textarea value={data.checkins.find(c=>c.trackId===track.id&&c.date===today)?.note||""} onChange={e=>patch(d=>({...d,checkins:d.checkins.map(c=>c.trackId===track.id&&c.date===today?{...c,note:e.target.value,updatedAt:Date.now()}:c)}))} placeholder={checked(track.id)?"写下今天实际学了什么…":"打卡后可以记录实际学习内容"}/></label></div>
      </article>})}</div>
    </section>}

    {tab==="goals"&&<section>
      <div className="growth-section-head"><div><span className="eyebrow">LONG-TERM DREAMS</span><h2>想抵达的地方，一件件写下来</h2></div><p>目标可以直接点击文字编辑，完成时轻轻勾选。</p></div>
      <form className="goal-form" onSubmit={addGoal}><select value={goalKind} onChange={e=>setGoalKind(e.target.value)} disabled={!data.goalCategories.length}>{data.goalCategories.map(category=><option key={category.id}>{category.name}</option>)}</select><input value={goalText} onChange={e=>setGoalText(e.target.value)} placeholder="添加一个长期目标…" /><button disabled={!goalKind}>＋ 添加目标</button></form>
      <div className="goal-columns">{data.goalCategories.map((category,index)=>{const kind=category.name;return <section className="goal-column" key={category.id}><header><i>{index%2===0?"♢":"✦"}</i><div><h3>{kind}</h3><small>{data.goals.filter(g=>g.kind===kind&&g.done).length}/{data.goals.filter(g=>g.kind===kind).length} 完成</small></div></header>{data.goals.filter(g=>g.kind===kind).map(goal=><div className="goal-row" key={goal.id}><label><input type="checkbox" checked={goal.done} onChange={()=>patch(d=>({...d,goals:d.goals.map(g=>g.id===goal.id?{...g,done:!g.done,updatedAt:Date.now()}:g)}))}/><i></i></label><input className={goal.done?"strike":""} value={goal.text} onChange={e=>patch(d=>({...d,goals:d.goals.map(g=>g.id===goal.id?{...g,text:e.target.value,updatedAt:Date.now()}:g)}))}/><button onClick={()=>setDeleteGoal(goal.id)}>×</button></div>)}{!data.goals.some(g=>g.kind===kind)&&<p className="goal-empty">还没有写下目标</p>}</section>})}</div>
    </section>}
    {tab==="news"&&<section className="growth-feed"><div className="growth-section-head"><div><span className="eyebrow">DAILY NEWS · {displayDate(today)}</span><h2>今日 10 条新闻资讯</h2></div><p>精选国内公开来源，点击标题查看原文。</p></div><div className="news-list">{news.slice(0,10).map((item,i)=><a href={item.link} target="_blank" rel="noreferrer" key={`${item.title}-${i}`}><b>{pad(i+1)}</b><div><span>{item.category} · {item.source}</span><h3>{item.title}</h3><p>{item.summary}</p><small>{String(item.publishedAt).slice(0,16)}</small></div><i>↗</i></a>)}</div></section>}
    {tab==="books"&&<section className="growth-feed"><div className="growth-section-head"><div><span className="eyebrow">DAILY READING</span><h2>今天的阅读推荐</h2></div></div><div className="recommend-grid">{Array.from({length:6},(_,i)=>DAILY_BOOKS[(dailyIndex(today,DAILY_BOOKS.length)+i)%DAILY_BOOKS.length]).map(x=><article key={x[0]}><span>{x[2]}</span><h3>{x[0]}</h3><p>{x[1]}</p><a target="_blank" rel="noreferrer" href={`https://book.douban.com/subject_search?search_text=${encodeURIComponent(x[0])}`}>查看图书 ↗</a></article>)}</div><div className="library-panel"><h2>我的书架</h2><form className="media-add-form" onSubmit={e=>{e.preventDefault();if(!bookForm.title.trim())return;patch(d=>({...d,readingBooks:[...d.readingBooks,{id:uid(),title:bookForm.title.trim(),author:bookForm.author.trim(),category:bookForm.category,currentPage:Number(bookForm.currentPage)||0,totalPages:Number(bookForm.totalPages)||0,status:bookForm.status,updatedAt:Date.now()}]}));setBookForm({...bookForm,title:"",author:"",currentPage:"",totalPages:""})}}><input value={bookForm.title} onChange={e=>setBookForm({...bookForm,title:e.target.value})} placeholder="书名"/><input value={bookForm.author} onChange={e=>setBookForm({...bookForm,author:e.target.value})} placeholder="作者"/><select value={bookForm.category} onChange={e=>setBookForm({...bookForm,category:e.target.value})}>{data.bookCategories.map((x:MoodTag)=><option key={x.id}>{x.name}</option>)}</select><input type="number" min="0" value={bookForm.currentPage} onChange={e=>setBookForm({...bookForm,currentPage:e.target.value})} placeholder="已读页"/><input type="number" min="0" value={bookForm.totalPages} onChange={e=>setBookForm({...bookForm,totalPages:e.target.value})} placeholder="总页数"/><button>添加</button></form><div className="personal-media-list">{data.readingBooks.map(item=><article key={item.id}><input value={item.title} onChange={e=>patch(d=>({...d,readingBooks:d.readingBooks.map(x=>x.id===item.id?{...x,title:e.target.value,updatedAt:Date.now()}:x)}))}/><input value={item.author} onChange={e=>patch(d=>({...d,readingBooks:d.readingBooks.map(x=>x.id===item.id?{...x,author:e.target.value,updatedAt:Date.now()}:x)}))}/><label><input type="number" min="0" value={item.currentPage} onChange={e=>patch(d=>({...d,readingBooks:d.readingBooks.map(x=>x.id===item.id?{...x,currentPage:Number(e.target.value),updatedAt:Date.now()}:x)}))}/><span>/ {item.totalPages||"?"} 页 · {item.totalPages?Math.min(100,Math.round(item.currentPage/item.totalPages*100)):0}%</span></label><select value={item.status} onChange={e=>patch(d=>({...d,readingBooks:d.readingBooks.map(x=>x.id===item.id?{...x,status:e.target.value as ReadingBook["status"],updatedAt:Date.now()}:x)}))}><option>想读</option><option>在读</option><option>读完</option></select><button onClick={()=>patch(d=>({...d,readingBooks:d.readingBooks.filter(x=>x.id!==item.id)}))}>删除</button></article>)}</div></div></section>}
    {tab==="podcasts"&&<section className="growth-feed"><div className="growth-section-head"><div><span className="eyebrow">DAILY PODCASTS</span><h2>今天的播客推荐</h2></div></div><div className="recommend-grid podcast-grid">{Array.from({length:6},(_,i)=>DAILY_PODCASTS[(dailyIndex(today,DAILY_PODCASTS.length)+i)%DAILY_PODCASTS.length]).map(x=><article key={x[0]}><span>{x[2]}</span><h3>{x[0]}</h3><p>{x[1]}</p><a target="_blank" rel="noreferrer" href={`https://www.xiaoyuzhoufm.com/search?q=${encodeURIComponent(x[0])}`}>查找播客 ↗</a></article>)}</div><div className="library-panel"><h2>我的播客</h2><form className="media-add-form podcast" onSubmit={e=>{e.preventDefault();if(!podcastForm.title.trim())return;patch(d=>({...d,savedPodcasts:[...d.savedPodcasts,{id:uid(),title:podcastForm.title.trim(),host:podcastForm.host.trim(),category:podcastForm.category,currentEpisode:Number(podcastForm.currentEpisode)||0,updatedAt:Date.now()}]}));setPodcastForm({...podcastForm,title:"",host:"",currentEpisode:""})}}><input value={podcastForm.title} onChange={e=>setPodcastForm({...podcastForm,title:e.target.value})} placeholder="播客名称"/><input value={podcastForm.host} onChange={e=>setPodcastForm({...podcastForm,host:e.target.value})} placeholder="主播"/><select value={podcastForm.category} onChange={e=>setPodcastForm({...podcastForm,category:e.target.value})}>{data.podcastCategories.map((x:MoodTag)=><option key={x.id}>{x.name}</option>)}</select><input type="number" min="0" value={podcastForm.currentEpisode} onChange={e=>setPodcastForm({...podcastForm,currentEpisode:e.target.value})} placeholder="听到第几期"/><button>添加</button></form><div className="personal-media-list podcast">{data.savedPodcasts.map(item=><article key={item.id}><input value={item.title} onChange={e=>patch(d=>({...d,savedPodcasts:d.savedPodcasts.map(x=>x.id===item.id?{...x,title:e.target.value,updatedAt:Date.now()}:x)}))}/><input value={item.host} onChange={e=>patch(d=>({...d,savedPodcasts:d.savedPodcasts.map(x=>x.id===item.id?{...x,host:e.target.value,updatedAt:Date.now()}:x)}))}/><label><input type="number" min="0" value={item.currentEpisode} onChange={e=>patch(d=>({...d,savedPodcasts:d.savedPodcasts.map(x=>x.id===item.id?{...x,currentEpisode:Number(e.target.value),updatedAt:Date.now()}:x)}))}/><span>第 {item.currentEpisode} 期</span></label><button onClick={()=>patch(d=>({...d,savedPodcasts:d.savedPodcasts.filter(x=>x.id!==item.id)}))}>删除</button></article>)}</div></div></section>}
    {deleteGoal&&<Modal title="删除这个长期目标吗？" onClose={()=>setDeleteGoal(null)}><p className="modal-copy">这条目标会从清单中移除，小熊再帮你确认一次。</p><div className="modal-actions"><button className="secondary" onClick={()=>setDeleteGoal(null)}>先保留</button><button className="danger" onClick={()=>{patch(d=>({...d,goals:d.goals.filter(g=>g.id!==deleteGoal)}));setDeleteGoal(null)}}>确认删除</button></div></Modal>}
    {tab==="jobs"&&<Jobs data={data} patch={patch} embedded />}
    {detailSkill&&<Modal title={`${detailSkill.name} · 深入讲解`} onClose={()=>setDetailSkill(null)}><div className="skill-deep"><img src="/bears/v2/bear-reading.png" alt="陪伴学习的水彩小熊"/><p>{SKILL_DETAILS[detailSkill.id]?.intro}</p><div className="deep-columns"><section><h3>学习脉络</h3>{SKILL_DETAILS[detailSkill.id]?.steps.map((x,i)=><p key={x}><b>{i+1}</b>{x}</p>)}</section><section><h3>动手练习</h3>{SKILL_DETAILS[detailSkill.id]?.practice.map(x=><p key={x}>✦ {x}</p>)}</section></div><div className="deep-resources"><h3>官方推荐资料</h3>{(SKILL_LINKS[detailSkill.id]||[]).map(x=><a key={x.url} href={x.url} target="_blank" rel="noreferrer">{x.label}<span>打开 ↗</span></a>)}</div></div></Modal>}
    {lesson&&<Modal title={lessonFor(lesson.skill,lesson.topic).title} onClose={()=>setLesson(null)}><article className="knowledge-lesson"><section><span>01 · 先理解</span><p>{lessonFor(lesson.skill,lesson.topic).definition}</p></section><section><span>02 · 具体怎么学</span><p>{lessonFor(lesson.skill,lesson.topic).explanation}</p></section><section><span>03 · 放进真实场景</span><p>{lessonFor(lesson.skill,lesson.topic).example}</p></section><section><span>04 · 现在就练</span>{lessonFor(lesson.skill,lesson.topic).practice.map(x=><p key={x}>✦ {x}</p>)}</section><div className="deep-resources">{(SKILL_LINKS[lesson.skill.id]||[]).map(x=><a key={x.url} href={x.url} target="_blank" rel="noreferrer">{x.label}<span>继续学习 ↗</span></a>)}</div></article></Modal>}
  </div>;
}

function EventEditor({ item, date, data, patch, close }: { item: EventItem|null; date:string; data:WorkbenchData; patch:any; close:()=>void }) {
  const [form,setForm]=useState({date:item?.date||date,start:item?.start||"09:00",end:item?.end||item?.start||"09:00",title:item?.title||"",categoryId:item?.categoryId||"work"});
  const submit=(e:FormEvent)=>{e.preventDefault();if(!form.title.trim())return;const title=form.title.trim();const isSport=data.categories.find(c=>c.id===form.categoryId)?.name==="运动";const day=new Date(`${form.date}T12:00:00`).getDay();patch((d:WorkbenchData)=>{let workoutPlans=d.workoutPlans;if(isSport&&item){const oldDay=new Date(`${item.date}T12:00:00`).getDay();let changed=false;workoutPlans=d.workoutPlans.map(p=>{if(!changed&&p.weekday===oldDay&&p.title===item.title){changed=true;return {...p,weekday:day,title,updatedAt:Date.now()}}return p});if(!changed)workoutPlans=[...workoutPlans,{id:uid(),weekday:day,title,intensity:"适中",order:workoutPlans.filter(p=>p.weekday===day).length,completedDates:[],updatedAt:Date.now()}]}else if(isSport)workoutPlans=[...d.workoutPlans,{id:uid(),weekday:day,title,intensity:"适中",order:d.workoutPlans.filter(p=>p.weekday===day).length,completedDates:[],updatedAt:Date.now()}];return {...d,events:item?d.events.map(x=>x.id===item.id?{...x,...form,title,updatedAt:Date.now()}:x):[...d.events,{...form,title,id:uid(),updatedAt:Date.now()}],workoutPlans}});close();};
  return <Modal title={item?"编辑日程":"新建日程"} onClose={close}><form className="editor-form" onSubmit={submit}><label>事项名称<input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="准备作品集" required/></label><label>日期<input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><div className="two-col"><label>开始<input type="time" value={form.start} onChange={e=>{const start=e.target.value;setForm({...form,start,end:start})}}/></label><label>结束<input type="time" value={form.end} onChange={e=>setForm({...form,end:e.target.value})}/></label></div><label>分类<select value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}>{data.categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><div className="modal-actions"><button type="button" className="secondary" onClick={close}>取消</button><button>保存日程</button></div></form></Modal>;
}

function MemoEditor({ patch, close }: { patch:any; close:()=>void }) {
  const [text,setText]=useState(""); const submit=(e:FormEvent)=>{e.preventDefault();if(!text.trim())return;patch((d:WorkbenchData)=>({...d,memos:d.memos.map(m=>({...m,order:m.order+1})).concat({id:uid(),text:text.trim(),order:0,createdAt:Date.now(),updatedAt:Date.now()})}));close();};
  return <Modal title="写一张小纸条" onClose={close}><form className="editor-form" onSubmit={submit}><label>想记下什么？<textarea autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder="突然想到…" rows={4}/></label><div className="modal-actions"><button type="button" className="secondary" onClick={close}>取消</button><button>收进备忘</button></div></form></Modal>;
}

function Jobs({data,patch,embedded=false}:{data:WorkbenchData;patch:(fn:(d:WorkbenchData)=>WorkbenchData)=>void;embedded?:boolean}) {
  const statuses:JobStatus[]=["感兴趣","已投递","已面试","已拒绝"];
  const [keyword,setKeyword]=useState("");
  const [status,setStatus]=useState<JobStatus|"全部">("全部");
  const [showAdd,setShowAdd]=useState(false);
  const [deleteId,setDeleteId]=useState<string|null>(null);
  const [criterionDraft,setCriterionDraft]=useState<{kind:JobCriterion["kind"];value:string}>({kind:"关键词",value:""});
  const [form,setForm]=useState({company:"",title:"",salary:"",companySize:"",location:"杭州",jd:"",url:""});
  const filtered=data.jobs.filter(j=>{
    const text=`${j.title} ${j.jd}`.toLowerCase();
    const searchWords=keyword.toLowerCase().split(/[\s/、]+/).filter(Boolean);
    const matchesCriteria=data.jobCriteria.every(c=>{
      if(c.kind==="关键词"){const words=c.value.toLowerCase().split(/[\s/、]+/).filter(Boolean);return !words.length||words.some(w=>text.includes(w));}
      if(c.kind==="地点")return !c.value.trim()||j.location.includes(c.value.trim());
      const min=Number(c.value);return !Number.isFinite(min)||j.companySize>=min;
    });
    return (!searchWords.length||searchWords.some(w=>`${j.company} ${j.location} ${text}`.toLowerCase().includes(w)))&&matchesCriteria&&(status==="全部"||j.status===status);
  }).sort((a,b)=>b.updatedAt-a.updatedAt);
  const addCriterion=(e:FormEvent)=>{
    e.preventDefault(); if(!criterionDraft.value.trim())return;
    patch(d=>({...d,jobCriteria:[...d.jobCriteria,{id:uid(),kind:criterionDraft.kind,value:criterionDraft.value.trim(),updatedAt:Date.now()}]}));
    setCriterionDraft({kind:"关键词",value:""});
  };
  const updateCriterion=(id:string,next:Partial<JobCriterion>)=>patch(d=>({...d,jobCriteria:d.jobCriteria.map(c=>c.id===id?{...c,...next,updatedAt:Date.now()}:c)}));
  const addJob=(e:FormEvent)=>{
    e.preventDefault(); const size=Number(form.companySize);
    if(!form.company.trim()||!form.title.trim()||!form.jd.trim()||!Number.isFinite(size))return;
    const url=/^https?:\/\//i.test(form.url)?form.url:"";
    const now=Date.now();
    patch(d=>({...d,jobs:[{id:uid(),company:form.company.trim(),title:form.title.trim(),salary:form.salary.trim()||"薪资面议",companySize:size,location:form.location.trim()||"杭州",jd:form.jd.trim(),url,source:"手动录入",publishedAt:todayKey(),status:"感兴趣",statusUpdatedAt:now,updatedAt:now},...d.jobs]}));
    setForm({company:"",title:"",salary:"",companySize:"",location:"杭州",jd:"",url:""});setShowAdd(false);
  };
  const setJobStatus=(id:string,next:JobStatus)=>patch(d=>({...d,jobs:d.jobs.map(j=>j.id===id?{...j,status:next,statusUpdatedAt:Date.now(),updatedAt:Date.now()}:j)}));
  return <div className={`jobs-page ${embedded?"embedded":""}`}>
    <section className="job-source-note featured">
      <div><span className="eyebrow">PUBLIC JOB SOURCES</span><h2>公开岗位入口</h2><p>岗位可能随时下线，公司规模与薪资请在投递前再次核验。</p></div>
      <div><a href="https://m.zhipin.com/zhaopin/ca858bd04f5d99261HV-09m5GQ~~/" target="_blank" rel="noreferrer">查看 BOSS 公开搜索</a><a className="secondary" href="https://mwenku.51job.com/hangzhou_jobs/202601/Python/" target="_blank" rel="noreferrer">查看前程无忧公开页</a></div>
    </section>
    <div className="growth-tabs jobs-tabs">
      {(["全部",...statuses] as const).map(s=><button key={s} className={status===s?"active":""} onClick={()=>setStatus(s)}>{s}<small>{s==="全部"?data.jobs.length:data.jobs.filter(j=>j.status===s).length}</small></button>)}
    </div>
    <div className="job-toolbar">
      <label><span>⌕</span><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="在筛选结果中继续搜索…"/></label>
      <button onClick={()=>setShowAdd(true)}>＋ 录入岗位</button>
    </div>
    <section className="job-rule">
      <header><div><span className="eyebrow">FILTER RULES</span><h2>招聘筛选条件</h2></div><small>修改后会立即重新筛选</small></header>
      <div className="job-criteria">
        {data.jobCriteria.map(c=><article key={c.id}><select value={c.kind} onChange={e=>updateCriterion(c.id,{kind:e.target.value as JobCriterion["kind"]})}><option>关键词</option><option>地点</option><option>最低公司人数</option></select><input type={c.kind==="最低公司人数"?"number":"text"} min={c.kind==="最低公司人数"?"1":undefined} value={c.value} onChange={e=>updateCriterion(c.id,{value:e.target.value})}/><button onClick={()=>patch(d=>({...d,jobCriteria:d.jobCriteria.filter(x=>x.id!==c.id)}))} aria-label="删除筛选条件">×</button></article>)}
        {!data.jobCriteria.length&&<p>还没有筛选条件，会显示全部岗位。</p>}
      </div>
      <form className="job-criterion-add" onSubmit={addCriterion}><select value={criterionDraft.kind} onChange={e=>setCriterionDraft({...criterionDraft,kind:e.target.value as JobCriterion["kind"]})}><option>关键词</option><option>地点</option><option>最低公司人数</option></select><input type={criterionDraft.kind==="最低公司人数"?"number":"text"} min={criterionDraft.kind==="最低公司人数"?"1":undefined} value={criterionDraft.value} onChange={e=>setCriterionDraft({...criterionDraft,value:e.target.value})} placeholder={criterionDraft.kind==="关键词"?"例如：AI Agent / RPA":criterionDraft.kind==="地点"?"例如：杭州":"例如：100"}/><button>＋ 添加条件</button></form>
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
  const [tab,setTab]=useState<"world"|"dreams"|"plans"|"local">("world");
  const [selectedId,setSelectedId]=useState(data.travelPlans[0]?.id||"");
  const [destination,setDestination]=useState({place:"",country:""});
  const [visitedCity,setVisitedCity]=useState({place:"",country:""});
  const [mapStatus,setMapStatus]=useState("");
  const [showTrip,setShowTrip]=useState(false);
  const [tripForm,setTripForm]=useState({name:"",startDate:todayKey(),endDate:addDays(todayKey(),2)});
  const [itinerary,setItinerary]=useState({day:"1",time:"09:00",content:""});
  const [packingForm,setPackingForm]=useState({category:"其他杂物类",name:""});
  const [templateForm,setTemplateForm]=useState({category:"其他杂物类",name:""});
  const [deleteTarget,setDeleteTarget]=useState<{kind:"destination"|"trip"|"template"|"itinerary"|"packing";id:string}|null>(null);
  const [weather,setWeather]=useState<{temperature:number;code:number}|null>(null);
  const location=healthLocation(data.healthSettings);
  const active=data.travelPlans.find(x=>x.id===selectedId)||data.travelPlans[0];
  useEffect(()=>{if(tab!=="local")return;fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code&timezone=${encodeURIComponent(location.timezone)}`).then(r=>r.json()).then(j=>setWeather({temperature:j.current.temperature_2m,code:j.current.weather_code})).catch(()=>{})},[tab,location.latitude,location.longitude,location.timezone]);
  useEffect(()=>{const missing=data.destinations.find(x=>!Number.isFinite(x.latitude)||!Number.isFinite(x.longitude));if(!missing)return;let active=true;locatePlace(missing.place,missing.country).then(position=>{if(active)patch(d=>({...d,destinations:d.destinations.map(x=>x.id===missing.id?{...x,...position,updatedAt:Date.now()}:x)}))}).catch(()=>{});return()=>{active=false}},[data.destinations,patch]);
  const addDestination=(e:FormEvent)=>{e.preventDefault();const selected=locationOption(destination.country,destination.place);patch(d=>d.destinations.some(x=>x.country===selected.country&&x.place===selected.city)?d:{...d,destinations:[...d.destinations,{id:uid(),place:selected.city,country:selected.country,visited:false,latitude:selected.latitude,longitude:selected.longitude,updatedAt:Date.now()}]})};
  const addVisitedCity=(e:FormEvent)=>{e.preventDefault();const selected=locationOption(visitedCity.country,visitedCity.place);patch(d=>{const exists=d.destinations.some(x=>x.country===selected.country&&x.place===selected.city);return {...d,destinations:exists?d.destinations.map(x=>x.country===selected.country&&x.place===selected.city?{...x,visited:true,latitude:selected.latitude,longitude:selected.longitude,updatedAt:Date.now()}:x):[...d.destinations,{id:uid(),place:selected.city,country:selected.country,visited:true,latitude:selected.latitude,longitude:selected.longitude,updatedAt:Date.now()}]}});setMapStatus(`${selected.country} · ${selected.city} 已准确点亮在地图上。`)};
  const addTrip=(e:FormEvent)=>{e.preventDefault();if(!tripForm.name.trim()||tripForm.endDate<tripForm.startDate)return;const id=uid();patch(d=>({...d,travelPlans:[...d.travelPlans,{id,name:tripForm.name.trim(),startDate:tripForm.startDate,endDate:tripForm.endDate,itinerary:[],packing:d.packingTemplate.map(x=>({...x,id:uid(),checked:false})),updatedAt:Date.now()}]}));setSelectedId(id);setTripForm({name:"",startDate:todayKey(),endDate:addDays(todayKey(),2)});setShowTrip(false)};
  const updatePlan=(fn:(p:TravelPlan)=>TravelPlan)=>patch(d=>({...d,travelPlans:d.travelPlans.map(p=>p.id===active?.id?{...fn(p),updatedAt:Date.now()}:p)}));
  const addItinerary=(e:FormEvent)=>{e.preventDefault();if(!active||!itinerary.content.trim())return;updatePlan(p=>({...p,itinerary:[...p.itinerary,{id:uid(),day:Math.max(1,Number(itinerary.day)||1),time:itinerary.time,content:itinerary.content.trim()}]}));setItinerary({...itinerary,content:""})};
  const addPacking=(e:FormEvent)=>{e.preventDefault();if(!active||!packingForm.name.trim())return;updatePlan(p=>({...p,packing:[...p.packing,{id:uid(),category:packingForm.category,name:packingForm.name.trim(),checked:false}]}));setPackingForm({...packingForm,name:""})};
  const remove=()=>{if(!deleteTarget)return;patch(d=>{
    if(deleteTarget.kind==="destination")return {...d,destinations:d.destinations.filter(x=>x.id!==deleteTarget.id)};
    if(deleteTarget.kind==="trip")return {...d,travelPlans:d.travelPlans.filter(x=>x.id!==deleteTarget.id)};
    if(deleteTarget.kind==="template")return {...d,packingTemplate:d.packingTemplate.filter(x=>x.id!==deleteTarget.id)};
    return {...d,travelPlans:d.travelPlans.map(p=>p.id===active?.id?{...p,itinerary:deleteTarget.kind==="itinerary"?p.itinerary.filter(x=>x.id!==deleteTarget.id):p.itinerary,packing:deleteTarget.kind==="packing"?p.packing.filter(x=>x.id!==deleteTarget.id):p.packing,updatedAt:Date.now()}:p)};
  });if(deleteTarget.kind==="trip")setSelectedId("");setDeleteTarget(null)};
  const done=active?.packing.filter(x=>x.checked).length||0,total=active?.packing.length||0;
  const rainy=weather?weather.code>=50:false;
  const season=localSeason(location.latitude);
  const ideaDay=dailyIndex(todayKey(),3);
  const localIdeas=rainy?[
    ["书店与咖啡",`在${location.city}找一家安静的独立书店或咖啡馆，慢慢看书写手账。`,"室内 · 雨天友好"],
    ["博物馆半日",`选一座${location.city}的博物馆，再为自己安排一顿安静的晚餐。`,"室内 · 轻松"],
    ["手作体验",`搜索${location.city}附近的陶艺、银饰或花艺体验，让注意力回到双手。`,"室内 · 治愈"],
  ]:[
    ["城市轻徒步",`${season}在${location.city}选择一条绿道或公园路线慢慢走，带水并留意防晒。`,"户外 · 低强度"],
    ["晨间散步",`在${location.city}找一处临水或林荫步道，避开人流，给自己一小时。`,"户外 · 免费"],
    ["看一场落日",`查询${location.city}适合看落日的开放空间，散步后再选一家小店吃晚饭。`,"户外 · 松弛"],
  ];
  const ideaClosings=[
    ["把雨声当作背景，安静地陪自己一会儿。","给今天留一点不被催促的时间。","专注手边的小事，也是一种很好的休息。"],
    ["慢慢走，不赶路，也不需要完成什么。","带上耳机或相机，收集一段属于自己的风景。","在天色变暗以前，给自己留下一点松弛感。"],
    ["换一条没走过的路，也许会遇见新的喜欢。","把手机收起来十分钟，认真感受周围的风。","一个人的小小出发，也能成为值得记住的一天。"],
  ][ideaDay];
  return <div className="page travel-page">
    <section className="travel-hero"><div><span className="eyebrow">MY LITTLE JOURNEYS</span><h1>把想去的远方，慢慢变成计划</h1><p>从目的地心愿、每日行程到打包清单，每一段期待都好好收进这里。</p></div><div className="travel-visual"><img src="/bears/v2/bear-travel.png" alt="准备旅行的水彩小熊"/><div className="travel-stamp"><b>{data.destinations.filter(x=>x.visited).length}</b><span>已抵达</span><small>{data.destinations.filter(x=>!x.visited).length} 个地方正在等你</small></div></div></section>
    <nav className="growth-tabs travel-tabs"><button className={tab==="world"?"active":""} onClick={()=>setTab("world")}>看世界</button><button className={tab==="dreams"?"active":""} onClick={()=>setTab("dreams")}>目的地清单</button><button className={tab==="plans"?"active":""} onClick={()=>setTab("plans")}>旅行计划</button><button className={tab==="local"?"active":""} onClick={()=>setTab("local")}>周边独行</button></nav>
    {tab==="world"&&<section className="world-view"><div className="world-map"><div className="world-map-copy"><span className="eyebrow">PLACES I&apos;VE BEEN</span><h2>去过的地方，组成我的世界</h2><p>想去与已经抵达的城市，都会按真实经纬度点亮。</p></div><GeoWorldMap places={data.destinations}/></div><form className="world-city-form searchable-location" onSubmit={addVisitedCity}><select aria-label="看世界国家或地区" value={visitedCity.country} onChange={e=>setVisitedCity({country:e.target.value,place:""})}><option value="">选择国家 / 地区</option>{LOCATION_COUNTRIES.map(country=><option key={country} value={country}>{country}</option>)}</select><select aria-label="看世界城市" value={visitedCity.place} onChange={e=>setVisitedCity({...visitedCity,place:e.target.value})} disabled={!visitedCity.country}><option value="">选择城市</option>{citiesFor(visitedCity.country).map(item=><option key={item.city} value={item.city}>{item.city}</option>)}</select><button disabled={!citiesFor(visitedCity.country).some(x=>x.city===visitedCity.place)}>＋ 留下足迹</button></form>{mapStatus&&<p className="map-status">{mapStatus}</p>}<div className="visited-city-list">{data.destinations.filter(x=>x.visited).map(x=><article key={x.id}><i>⌖</i><div><b>{x.place}</b><span>{x.country}{Number.isFinite(x.latitude)?" · 已定位":" · 等待定位"}</span></div><button onClick={()=>patch(d=>({...d,destinations:d.destinations.filter(y=>y.id!==x.id)}))}>删除</button></article>)}{!data.destinations.some(x=>x.visited)&&<Empty text="地图还在等你的第一枚城市足迹。" />}</div></section>}
    {tab==="dreams"&&<section className="travel-dreams"><div className="travel-section-head"><div><span className="eyebrow">DREAM DESTINATIONS</span><h2>总有一天，要亲自去看看</h2></div><p>去过的地方会留下温柔的勾选。</p></div><form className="destination-form enhanced searchable-location" onSubmit={addDestination}><select aria-label="目的地国家或地区" value={destination.country} onChange={e=>setDestination({country:e.target.value,place:""})}><option value="">选择国家 / 地区</option>{LOCATION_COUNTRIES.map(country=><option key={country} value={country}>{country}</option>)}</select><select aria-label="目的地城市" value={destination.place} onChange={e=>setDestination({...destination,place:e.target.value})} disabled={!destination.country}><option value="">选择城市</option>{citiesFor(destination.country).map(item=><option key={item.city} value={item.city}>{item.city}</option>)}</select><button disabled={!citiesFor(destination.country).some(x=>x.city===destination.place)}>＋ 添加</button></form><div className="destination-grid">{data.destinations.filter(x=>!x.visited).map(x=><article key={x.id}><label><input type="checkbox" checked={false} onChange={()=>patch(d=>({...d,destinations:d.destinations.map(y=>y.id===x.id?{...y,visited:true,updatedAt:Date.now()}:y)}))}/><i>✈</i></label><div><span>{x.country}</span><h3>{x.place}</h3><small>想去看看</small></div><button onClick={()=>setDeleteTarget({kind:"destination",id:x.id})}>×</button></article>)}</div></section>}
    {tab==="plans"&&<section><div className="travel-section-head"><div><span className="eyebrow">TRIP PLANNER</span><h2>一场旅行，一份独立计划</h2></div><button onClick={()=>setShowTrip(true)}>＋ 新建旅行</button></div><div className="trip-layout"><aside className="trip-list">{data.travelPlans.map(p=><button className={active?.id===p.id?"active":""} key={p.id} onClick={()=>setSelectedId(p.id)}><i>✦</i><span><b>{p.name}</b><small>{displayDate(p.startDate)} — {displayDate(p.endDate)}</small></span></button>)}{!data.travelPlans.length&&<Empty text="还没有旅行计划，先写下第一段期待吧。"/>}</aside>{active&&<div className="trip-detail"><header><div><span className="eyebrow">UPCOMING TRIP</span><input value={active.name} onChange={e=>updatePlan(p=>({...p,name:e.target.value}))}/><p>{active.startDate} 至 {active.endDate} · 共 {dateDiff(active.startDate,active.endDate)+1} 天</p></div><button onClick={()=>setDeleteTarget({kind:"trip",id:active.id})}>删除计划</button></header><div className="trip-columns"><section><h3>每日行程</h3><form className="itinerary-form" onSubmit={addItinerary}><input type="number" min="1" value={itinerary.day} onChange={e=>setItinerary({...itinerary,day:e.target.value})}/><input type="time" value={itinerary.time} onChange={e=>setItinerary({...itinerary,time:e.target.value})}/><input value={itinerary.content} onChange={e=>setItinerary({...itinerary,content:e.target.value})} placeholder="添加行程内容"/><button>添加</button></form><div className="itinerary-list">{[...active.itinerary].sort((a,b)=>a.day-b.day||a.time.localeCompare(b.time)).map(x=><article key={x.id}><b>DAY {x.day}</b><time>{x.time}</time><input value={x.content} onChange={e=>updatePlan(p=>({...p,itinerary:p.itinerary.map(y=>y.id===x.id?{...y,content:e.target.value}:y)}))}/><button onClick={()=>setDeleteTarget({kind:"itinerary",id:x.id})}>×</button></article>)}</div></section><section className="packing-panel"><div className="packing-head"><div><h3>打包清单</h3><span>{done} / {total} 已装好</span></div><b>{total?Math.round(done/total*100):0}%</b></div><div className="packing-progress"><i style={{width:`${total?done/total*100:0}%`}}/></div><form className="packing-add" onSubmit={addPacking}><select value={packingForm.category} onChange={e=>setPackingForm({...packingForm,category:e.target.value})}>{Object.keys(packingGroups).map(x=><option key={x}>{x}</option>)}</select><input value={packingForm.name} onChange={e=>setPackingForm({...packingForm,name:e.target.value})} placeholder="添加物品"/><button>＋</button></form>{Object.keys(packingGroups).map(group=>{const items=active.packing.filter(x=>x.category===group);return items.length?<div className="packing-group" key={group}><h4>{group}</h4>{items.map(x=><label key={x.id}><input type="checkbox" checked={x.checked} onChange={()=>updatePlan(p=>({...p,packing:p.packing.map(y=>y.id===x.id?{...y,checked:!y.checked}:y)}))}/><i></i><input className={x.checked?"strike":""} value={x.name} onChange={e=>updatePlan(p=>({...p,packing:p.packing.map(y=>y.id===x.id?{...y,name:e.target.value}:y)}))}/><button onClick={()=>setDeleteTarget({kind:"packing",id:x.id})}>×</button></label>)}</div>:null})}</section></div></div>}</div><section className="template-panel"><div><h3>固定必备物品模板</h3><p>新建旅行时会自动带入；这里的修改不会覆盖已有旅行。</p></div><form onSubmit={e=>{e.preventDefault();if(!templateForm.name.trim())return;patch(d=>({...d,packingTemplate:[...d.packingTemplate,{id:uid(),category:templateForm.category,name:templateForm.name.trim(),checked:false}]}));setTemplateForm({...templateForm,name:""})}}><select value={templateForm.category} onChange={e=>setTemplateForm({...templateForm,category:e.target.value})}>{Object.keys(packingGroups).map(x=><option key={x}>{x}</option>)}</select><input value={templateForm.name} onChange={e=>setTemplateForm({...templateForm,name:e.target.value})} placeholder="新增固定物品"/><button>添加</button></form><div>{data.packingTemplate.map(x=><span key={x.id}>{x.name}<button onClick={()=>setDeleteTarget({kind:"template",id:x.id})}>×</button></span>)}</div></section></section>}
    {tab==="local"&&<section><div className="local-weather"><div><span className="eyebrow">{location.city.toUpperCase()} · {season}</span><h2>{weather?`${weather.code>=50?"雨天":"晴好"} · ${weather.temperature}°C`:`按${location.city}当季推荐`}</h2><p>{weather?"已结合当前天气更新；无法联网时仍会提供季节建议。":"正在尝试获取无需账号的实时天气…"}</p></div><i>{rainy?"☂":"☼"}</i></div><div className="solo-grid">{localIdeas.map((x,i)=><article key={x[0]}><span>0{i+1} · {x[2]}</span><h3>{x[0]}</h3><p>{x[1]}</p><small>{ideaClosings[i]}</small></article>)}</div></section>}
    {showTrip&&<Modal title="创建旅行计划" onClose={()=>setShowTrip(false)}><form className="editor-form" onSubmit={addTrip}><label>旅行名称<input value={tripForm.name} onChange={e=>setTripForm({...tripForm,name:e.target.value})} placeholder="例如：济州岛四日慢旅行" required/></label><div className="two-col"><label>出发日期<input type="date" value={tripForm.startDate} onChange={e=>setTripForm({...tripForm,startDate:e.target.value})}/></label><label>返程日期<input type="date" min={tripForm.startDate} value={tripForm.endDate} onChange={e=>setTripForm({...tripForm,endDate:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowTrip(false)}>取消</button><button>创建并带入清单</button></div></form></Modal>}
    {deleteTarget&&<Modal title="确认删除这项内容吗？" onClose={()=>setDeleteTarget(null)}><p className="modal-copy">删除后会从当前设备和后续导出的 JSON 中移除。</p><div className="modal-actions"><button className="secondary" onClick={()=>setDeleteTarget(null)}>先保留</button><button className="danger" onClick={remove}>确认删除</button></div></Modal>}
  </div>;
}

function Cats({data,patch,initialCatId}:{data:WorkbenchData;patch:(fn:(d:WorkbenchData)=>WorkbenchData)=>void;initialCatId?:string}) {
  const today=todayKey();
  const [catId,setCatId]=useState(initialCatId||data.catProfiles[0]?.id||"");
  const cat=data.catProfiles.find(x=>x.id===catId)||data.catProfiles[0];
  const [showProfile,setShowProfile]=useState(!cat);
  const [creatingCat,setCreatingCat]=useState(!cat);
  const [profile,setProfile]=useState({name:cat?.name||"",birthday:cat?.birthday||"",breed:cat?.breed||"",sex:cat?.sex||"未知" as CatProfile["sex"],homeDate:cat?.homeDate||"",neutered:cat?.neutered||false,photo:cat?.photo||""});
  const [careTitle,setCareTitle]=useState("");
  const [growth,setGrowth]=useState({title:"",note:"",date:today,photo:""});
  const [health,setHealth]=useState({kind:"驱虫" as CatHealth["kind"],title:"",date:today,note:""});
  const [weight,setWeight]=useState("");
  useEffect(()=>{if(initialCatId&&data.catProfiles.some(x=>x.id===initialCatId))setCatId(initialCatId)},[initialCatId,data.catProfiles]);
  useEffect(()=>{if(cat){setProfile({name:cat.name,birthday:cat.birthday,breed:cat.breed,sex:cat.sex,homeDate:cat.homeDate,neutered:cat.neutered,photo:cat.photo||""})}},[cat?.id]);
  const readImage=(file:File|undefined,done:(value:string)=>void)=>{if(!file)return;const reader=new FileReader();reader.onload=()=>done(String(reader.result));reader.readAsDataURL(file)};
  const saveProfile=(e:FormEvent)=>{e.preventDefault();if(!profile.name.trim())return;const target=creatingCat?undefined:cat;const id=target?.id||uid();const item:CatProfile={id,name:profile.name.trim(),birthday:profile.birthday,breed:profile.breed.trim(),sex:profile.sex,homeDate:profile.homeDate,neutered:profile.neutered,photo:profile.photo||undefined,updatedAt:Date.now()};patch(d=>({...d,catProfiles:target?d.catProfiles.map(x=>x.id===target.id?item:x):[...d.catProfiles,item],catCare:target?d.catCare:[...d.catCare,...["喂食","换水","铲屎"].map((title,order)=>({id:uid(),catId:id,title,date:today,done:false,order,updatedAt:Date.now()}))]}));setCatId(id);setCreatingCat(false);setShowProfile(false)};
  const newCat=()=>{setCreatingCat(true);setProfile({name:"",birthday:"",breed:"",sex:"未知",homeDate:"",neutered:false,photo:""});setShowProfile(true)};
  const cares=cat?data.catCare.filter(x=>x.catId===cat.id&&x.date===today).sort((a,b)=>a.order-b.order):[];
  const weights=cat?[...data.catWeights].filter(x=>x.catId===cat.id).sort((a,b)=>a.date.localeCompare(b.date)).slice(-8):[];
  const maxWeight=Math.max(...weights.map(x=>x.weight),1);
  const reminders=cat?[...data.catHealth].filter(x=>x.catId===cat.id).sort((a,b)=>a.date.localeCompare(b.date)):[];
  const stories=cat?[...data.catGrowth].filter(x=>x.catId===cat.id).sort((a,b)=>b.date.localeCompare(a.date)):[];
  const ageText=cat?.birthday?`${Math.max(0,Math.floor(dateDiff(cat.birthday,today)/30))} 个月`:"生日待补充";
  return <div className="page cats-page">
    <header className="page-head cat-page-head"><div><span className="eyebrow">LITTLE PAWPRINTS</span><h1>猫咪成长记录</h1><p>把健康、成长和一起生活的小瞬间，温柔地收在这里。</p></div><button onClick={newCat}>＋ 添加猫咪</button></header>
    {data.catProfiles.length>0&&<div className="cat-switcher">{data.catProfiles.map(x=><button className={cat?.id===x.id?"active":""} key={x.id} onClick={()=>setCatId(x.id)}>{x.photo?<img src={x.photo} alt=""/>:<i>🐾</i>}<span>{x.name}</span></button>)}</div>}
    {!cat?<section className="cat-welcome"><span>🐾</span><h2>先认识一下你的小猫</h2><p>填写一张简单的档案，之后的照护、体重和健康记录都会归到它名下。</p><button onClick={newCat}>建立猫咪档案</button></section>:<>
      <section className="cat-profile-card"><div className="cat-portrait">{cat.photo?<img src={cat.photo} alt={cat.name}/>:<span>🐱</span>}</div><div><span className="eyebrow">CAT PROFILE</span><h2>{cat.name}</h2><p>{cat.breed||"品种待补充"} · {cat.sex} · {ageText}</p><div className="cat-tags"><span>{cat.neutered?"已绝育":"未绝育"}</span>{cat.homeDate&&<span>{displayDate(cat.homeDate)} 到家</span>}</div></div><button onClick={()=>{setCreatingCat(false);setShowProfile(true)}}>编辑档案</button></section>
      <div className="cat-dashboard-grid">
        <section className="cat-panel cat-care-panel"><div className="cat-section-head"><div><span className="eyebrow">TODAY&apos;S CARE</span><h2>今日照护</h2></div><b>{cares.filter(x=>x.done).length}/{cares.length}</b></div><div className="cat-care-list">{cares.map(item=><article key={item.id}><label><input type="checkbox" checked={item.done} onChange={()=>patch(d=>({...d,catCare:d.catCare.map(x=>x.id===item.id?{...x,done:!x.done,updatedAt:Date.now()}:x)}))}/><i></i><input value={item.title} onChange={e=>patch(d=>({...d,catCare:d.catCare.map(x=>x.id===item.id?{...x,title:e.target.value,updatedAt:Date.now()}:x)}))}/></label><button onClick={()=>patch(d=>({...d,catCare:d.catCare.filter(x=>x.id!==item.id)}))}>×</button></article>)}</div><form className="cat-inline-form" onSubmit={e=>{e.preventDefault();if(!careTitle.trim())return;patch(d=>({...d,catCare:[...d.catCare,{id:uid(),catId:cat.id,title:careTitle.trim(),date:today,done:false,order:cares.length,updatedAt:Date.now()}]}));setCareTitle("")}}><input value={careTitle} onChange={e=>setCareTitle(e.target.value)} placeholder="添加喂药、梳毛等照护"/><button>＋</button></form></section>
        <section className="cat-panel"><div className="cat-section-head"><div><span className="eyebrow">WEIGHT CURVE</span><h2>体重趋势</h2></div><b>{weights.at(-1)?.weight||"—"} kg</b></div><div className="cat-weight-chart">{weights.length?weights.map(x=><div key={x.id}><span style={{height:`${Math.max(12,x.weight/maxWeight*100)}%`}} title={`${x.weight} kg`}></span><small>{displayDate(x.date)}</small><b>{x.weight}</b></div>):<p>记录第一次体重后，这里会出现趋势。</p>}</div><form className="cat-inline-form weight" onSubmit={e=>{e.preventDefault();const value=Number(weight);if(!value)return;patch(d=>({...d,catWeights:[...d.catWeights,{id:uid(),catId:cat.id,date:today,weight:value,updatedAt:Date.now()}]}));setWeight("")}}><input type="number" step=".01" min=".1" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="今天的体重（kg）"/><button>记录</button></form><div className="cat-weight-history">{[...weights].reverse().map(item=><article key={item.id}><input type="date" value={item.date} onChange={e=>patch(d=>({...d,catWeights:d.catWeights.map(x=>x.id===item.id?{...x,date:e.target.value,updatedAt:Date.now()}:x)}))}/><label><input type="number" min=".1" step=".01" value={item.weight} onChange={e=>patch(d=>({...d,catWeights:d.catWeights.map(x=>x.id===item.id?{...x,weight:Number(e.target.value),updatedAt:Date.now()}:x)}))}/><span>kg</span></label><button onClick={()=>patch(d=>({...d,catWeights:d.catWeights.filter(x=>x.id!==item.id)}))}>删除</button></article>)}</div></section>
      </div>
      <section className="cat-panel cat-health-panel"><div className="cat-section-head"><div><span className="eyebrow">HEALTH REMINDERS</span><h2>健康提醒</h2></div></div><form className="cat-health-form" onSubmit={e=>{e.preventDefault();if(!health.title.trim())return;patch(d=>({...d,catHealth:[...d.catHealth,{id:uid(),catId:cat.id,kind:health.kind,title:health.title.trim(),date:health.date,note:health.note.trim(),done:false,updatedAt:Date.now()}]}));setHealth({...health,title:"",note:""})}}><select value={health.kind} onChange={e=>setHealth({...health,kind:e.target.value as CatHealth["kind"]})}>{["疫苗","驱虫","体检","复查","用药","其他"].map(x=><option key={x}>{x}</option>)}</select><input value={health.title} onChange={e=>setHealth({...health,title:e.target.value})} placeholder="例如：体内驱虫"/><input type="date" value={health.date} onChange={e=>setHealth({...health,date:e.target.value})}/><input value={health.note} onChange={e=>setHealth({...health,note:e.target.value})} placeholder="备注（选填）"/><button>添加提醒</button></form><div className="cat-reminder-list">{reminders.map(item=><article className={item.done?"done":""} key={item.id}><button onClick={()=>patch(d=>({...d,catHealth:d.catHealth.map(x=>x.id===item.id?{...x,done:!x.done,updatedAt:Date.now()}:x)}))}>{item.done?"✓":"○"}</button><time>{displayDate(item.date)}</time><div><b>{item.kind} · {item.title}</b>{item.note&&<p>{item.note}</p>}</div><button onClick={()=>patch(d=>({...d,catHealth:d.catHealth.filter(x=>x.id!==item.id)}))}>删除</button></article>)}</div></section>
      <section className="cat-panel cat-growth-panel"><div className="cat-section-head"><div><span className="eyebrow">GROWTH TIMELINE</span><h2>成长时间轴</h2></div></div><form className="cat-growth-form" onSubmit={e=>{e.preventDefault();if(!growth.title.trim())return;patch(d=>({...d,catGrowth:[...d.catGrowth,{id:uid(),catId:cat.id,date:growth.date,title:growth.title.trim(),note:growth.note.trim(),photo:growth.photo||undefined,updatedAt:Date.now()}]}));setGrowth({title:"",note:"",date:today,photo:""})}}><input type="date" value={growth.date} onChange={e=>setGrowth({...growth,date:e.target.value})}/><input value={growth.title} onChange={e=>setGrowth({...growth,title:e.target.value})} placeholder="今天发生了什么？"/><textarea value={growth.note} onChange={e=>setGrowth({...growth,note:e.target.value})} placeholder="写下一点细节…"/><label className="cat-photo-upload">＋ 照片<input type="file" accept="image/*" onChange={e=>readImage(e.target.files?.[0],photo=>setGrowth({...growth,photo}))}/></label><button>保存成长记录</button></form><div className="cat-timeline">{stories.map(item=><article key={item.id}>{item.photo&&<img src={item.photo} alt=""/>}<div><time>{displayDate(item.date)}</time><h3>{item.title}</h3>{item.note&&<p>{item.note}</p>}</div><button onClick={()=>patch(d=>({...d,catGrowth:d.catGrowth.filter(x=>x.id!==item.id)}))}>×</button></article>)}{!stories.length&&<Empty text="第一段成长故事，正在等你写下。" />}</div></section>
    </>}
    {showProfile&&<Modal title={creatingCat?"建立猫咪档案":"编辑猫咪档案"} onClose={()=>{setShowProfile(false);setCreatingCat(false)}}><form className="editor-form" onSubmit={saveProfile}><label className="cat-profile-photo">{profile.photo?<img src={profile.photo} alt="猫咪头像"/>:<span>🐱</span>}<b>选择头像</b><input type="file" accept="image/*" onChange={e=>readImage(e.target.files?.[0],photo=>setProfile({...profile,photo}))}/></label><div className="two-col"><label>名字<input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} required/></label><label>品种<input value={profile.breed} onChange={e=>setProfile({...profile,breed:e.target.value})} placeholder="例如：英短"/></label></div><div className="two-col"><label>生日<input type="date" value={profile.birthday} onChange={e=>setProfile({...profile,birthday:e.target.value})}/></label><label>到家日期<input type="date" value={profile.homeDate} onChange={e=>setProfile({...profile,homeDate:e.target.value})}/></label></div><div className="two-col"><label>性别<select value={profile.sex} onChange={e=>setProfile({...profile,sex:e.target.value as CatProfile["sex"]})}><option>妹妹</option><option>弟弟</option><option>未知</option></select></label><label className="check-label"><input type="checkbox" checked={profile.neutered} onChange={e=>setProfile({...profile,neutered:e.target.checked})}/> 已绝育</label></div><div className="modal-actions">{!creatingCat&&cat&&<button type="button" className="danger secondary" onClick={()=>{patch(d=>({...d,catProfiles:d.catProfiles.filter(x=>x.id!==cat.id),catCare:d.catCare.filter(x=>x.catId!==cat.id),catGrowth:d.catGrowth.filter(x=>x.catId!==cat.id),catHealth:d.catHealth.filter(x=>x.catId!==cat.id),catWeights:d.catWeights.filter(x=>x.catId!==cat.id)}));setCatId(data.catProfiles.find(x=>x.id!==cat.id)?.id||"");setShowProfile(false)}}>删除档案</button>}<button>保存档案</button></div></form></Modal>}
  </div>
}

function ComingSoon({view}:{view:View}) {
  const item=nav.find(n=>n.id===view)!;
  return <div className="page coming"><span className="eyebrow">NEXT CHAPTER</span><h1>{item.label}模块</h1><img src="/bears/v2/bear-flower.png" alt="拿着花朵的水彩小熊" /><h2>小熊正在认真搭建这里</h2><p>阶段一先把首页、日历与备忘照顾好。这个模块已经留好位置，会在后续阶段自然长出来。</p></div>;
}
