const DB_NAME="bear-workbench-storage";
const DB_VERSION=1;
const STORE="documents";
const PRIMARY_ID="workbench-v1";

type StoredDocument={id:string;value:unknown;updatedAt:number};

const openDatabase=()=>new Promise<IDBDatabase>((resolve,reject)=>{
  const request=indexedDB.open(DB_NAME,DB_VERSION);
  request.onupgradeneeded=()=>{
    const db=request.result;
    if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"id"});
  };
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error("无法打开本地数据库"));
});

export async function readPrimaryData<T>():Promise<T|null>{
  if(typeof indexedDB==="undefined")return null;
  try{
    const db=await openDatabase();
    const value=await new Promise<StoredDocument|undefined>((resolve,reject)=>{
      const request=db.transaction(STORE,"readonly").objectStore(STORE).get(PRIMARY_ID);
      request.onsuccess=()=>resolve(request.result as StoredDocument|undefined);
      request.onerror=()=>reject(request.error);
    });
    db.close();
    return (value?.value as T)||null;
  }catch{return null}
}

export async function writePrimaryData(value:unknown):Promise<void>{
  if(typeof indexedDB==="undefined")throw new Error("当前浏览器不支持 IndexedDB");
  const db=await openDatabase();
  await new Promise<void>((resolve,reject)=>{
    const transaction=db.transaction(STORE,"readwrite");
    transaction.objectStore(STORE).put({id:PRIMARY_ID,value,updatedAt:Date.now()} satisfies StoredDocument);
    transaction.oncomplete=()=>resolve();
    transaction.onerror=()=>reject(transaction.error||new Error("本地数据库写入失败"));
    transaction.onabort=()=>reject(transaction.error||new Error("本地数据库写入中止"));
  });
  db.close();
}

const itemTime=(item:any)=>Math.max(Number(item?.updatedAt)||0,Number(item?.createdAt)||0);
const mergeArray=(left:any[],right:any[])=>{
  const map=new Map<string,any>();
  [...left,...right].forEach((item,index)=>{
    const id=String(item?.id||`legacy-${index}-${JSON.stringify(item)}`);
    const old=map.get(id);
    if(!old||itemTime(item)>=itemTime(old))map.set(id,item);
  });
  return [...map.values()];
};

/** Combines two complete exports without dropping records that exist in either copy. */
export function mergeStoredData<T extends Record<string,any>>(left:T|null,right:T|null):T|null{
  if(!left)return right;
  if(!right)return left;
  const newer=(Number(right.modifiedAt)||0)>=(Number(left.modifiedAt)||0)?right:left;
  const older=newer===right?left:right;
  const merged:{[key:string]:any}={...older,...newer};
  new Set([...Object.keys(left),...Object.keys(right)]).forEach(key=>{
    const a=left[key],b=right[key];
    if(Array.isArray(a)||Array.isArray(b))merged[key]=mergeArray(Array.isArray(a)?a:[],Array.isArray(b)?b:[]);
  });
  merged.modifiedAt=Math.max(Number(left.modifiedAt)||0,Number(right.modifiedAt)||0);
  return merged as T;
}
