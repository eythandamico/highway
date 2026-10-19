export class ApiError extends Error {constructor(message:string,public status:number){super(message);}}
export async function api<T>(path:string, options:RequestInit={}) : Promise<T> {
 const controller=new AbortController(); const onAbort=()=>controller.abort();
 if(options.signal?.aborted)controller.abort();else options.signal?.addEventListener("abort",onAbort,{once:true});
 const timer=setTimeout(()=>controller.abort(),20000);
 try {const response=await fetch(`/api/${path}`,{...options,signal:controller.signal,cache:"no-store"});
 const data=await response.json().catch(()=>({error:"The server returned an unreadable response."}));
 if(!response.ok)throw new ApiError(data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : "The request failed. Try again.",response.status);return data as T;
 } catch(error) {if(error instanceof ApiError)throw error;if(controller.signal.aborted)throw new Error("The request was interrupted or took too long. Please try again.");throw new Error("Could not connect. Check your connection and try again.");}
 finally {clearTimeout(timer);options.signal?.removeEventListener("abort",onAbort);}
}
export function jsonOptions(method:string,body:unknown):RequestInit {return {method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)};}
