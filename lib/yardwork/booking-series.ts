import { today,plusDay,type Job } from './yardwork.ts';
export function bookingSeries(jobs:Job[],days:7|14|30,end=today()) {
 const rows=Array.from({length:days},(_,index)=>({date:plusDay(end,index-days+1),amount:0,count:0}));
 const byDate=new Map(rows.map(row=>[row.date,row]));
 for(const job of jobs){const row=byDate.get(job.date);if(row&&Number.isFinite(job.amount)&&job.amount>=0){row.amount+=Math.round(job.amount*100);row.count++;}}
 return rows.map(row=>({...row,amount:row.amount/100}));
}

/** Historical bookings plus the remaining calendar month, projected from scheduled work only. */
export function bookingOutlook(jobs:Job[],days:7|14|30,end=today()) {
 const [year,month]=end.split('-').map(Number);
 const monthEnd=`${year}-${String(month).padStart(2,'0')}-${new Date(Date.UTC(year,month,0)).getUTCDate()}`;
 const futureDays=Number(monthEnd.slice(-2))-Number(end.slice(-2));
 const history=bookingSeries(jobs,days,end).map(row=>({...row,projected:false}));
 const future=Array.from({length:futureDays},(_,index)=>({date:plusDay(end,index+1),amount:0,count:0,projected:true}));
 const byDate=new Map(future.map(row=>[row.date,row]));
 for(const job of jobs){const row=byDate.get(job.date);if(row&&job.status==='scheduled'&&Number.isFinite(job.amount)&&job.amount>=0){row.amount+=Math.round(job.amount*100);row.count++;}}
 return [...history,...future.map(row=>({...row,amount:row.amount/100}))];
}
