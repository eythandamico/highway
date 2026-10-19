import { appConfig } from "@/config/app";
export function Brand({symbolOnly=false}:{symbolOnly?:boolean}) {return <span className="brand"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M4 5h20v6H10v6h11v6H4V5Z" fill="currentColor"/></svg>{!symbolOnly&&<span>{appConfig.name}</span>}</span>;}
