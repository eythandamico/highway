import { seed,today,plusDay,type Workspace } from './yardwork.ts';
import { newOffice } from './new-office.ts';
/** Synthetic fixtures only. Never persist or merge these into a customer's workspace. */
export function demoSuite(empty=false):Workspace {
  if(empty){const s=newOffice('');s.sample=true;delete s.onboarding;return s;}
  const s=seed(),day=today();
  const names=['Avery Morgan','Riley Park','Casey Adams','Jamie Ellis','Robin Walsh','Drew Carter','Skyler Reed','Quinn Taylor','Harper Brooks','Cameron Bell','Rowan Scott','Morgan Hayes'];
  names.forEach((name,index)=>{
    const customerId=`demo-c${index+7}`;
    s.customers.push({id:customerId,name,email:`customer${index+7}@example.test`,phone:`416-555-${String(130+index).padStart(4,'0')}`,address:`${index+10} Example Lane, Toronto`,area:['The Beaches','Leslieville','Riverdale'][index%3],notes:index%2?'Confirm access with the customer before arrival.':'Prefers afternoon appointments.',recurring:index%3?'As needed':'Every 2 weeks'});
    const rate=s.rates[index%s.rates.length],date=plusDay(day,index-5),jobId=`demo-j${index}`;
    s.jobs.push({id:jobId,customerId,service:rate.service,date,time:'14:00',duration:rate.duration,crew:index%2?s.business.crew2:s.business.crew1,amount:rate.price,status:index<5?'complete':'scheduled',notes:'Synthetic demo visit.',employeeIds:index%2?['e3','e4']:['e1','e2']});
    if(index<5)s.invoices.push({id:`demo-i${index}`,jobId,customerId,service:rate.service,amount:rate.price,tax:Math.round(rate.price*13)/100,due:plusDay(day,index-3),status:index%2?'paid':'unpaid'});
  });
  // Complete the original fixture's historical invoice references.
  for(const invoice of s.invoices.filter(i=>i.jobId&&!s.jobs.some(j=>j.id===i.jobId)))s.jobs.push({id:invoice.jobId!,customerId:invoice.customerId,service:invoice.service,date:plusDay(day,-10),time:invoice.jobId==='past1'?'08:00':'13:00',duration:60,crew:s.business.crew1,amount:invoice.amount,status:'complete',notes:'Completed demo visit.'});
  // A rolling, deterministic month of synthetic activity, with quieter weekends.
  const remaining=new Date(Number(day.slice(0,4)),Number(day.slice(5,7)),0).getDate()-Number(day.slice(8));
  for(let offset=-29;offset<=remaining;offset++){
    const date=plusDay(day,offset),weekday=new Date(`${date}T12:00:00`).getDay();
    const visits=weekday===0?0:weekday===6?1:2+(offset+30)%3;
    for(let visit=0;visit<visits;visit++){
      const index=(offset+30)*4+visit,customer=s.customers[index%s.customers.length],rate=s.rates[(index+Math.floor(index/5))%s.rates.length];
      const jobId=`demo-history-${offset}-${visit}`,amount=rate.price+(index%3)*15;
      s.jobs.push({id:jobId,customerId:customer.id,service:rate.service,date,time:['08:00','10:30','13:00','15:30'][visit],duration:rate.duration,crew:visit%2?s.business.crew2:s.business.crew1,amount,status:offset<0?'complete':'scheduled',notes:'Synthetic demo visit.',employeeIds:visit%2?['e3','e4']:['e1','e2']});
      if(offset<0)s.invoices.push({id:`demo-history-invoice-${offset}-${visit}`,jobId,customerId:customer.id,service:rate.service,amount,tax:Math.round(amount*13)/100,due:plusDay(date,7),status:'paid'});
    }
  }
  for(let i=0;i<3;i++){
    const customer=s.customers[i+6],rate=s.rates[i],leadId=`demo-lead${i}`;
    s.leads.push({id:leadId,customerId:customer.id,service:rate.service,message:'Could you prepare a quote for next week?',status:'quoted',messages:[{from:'customer',text:'Could you prepare a quote for next week?'}]});
    s.quotes.push({id:`demo-quote${i}`,leadId,customerId:customer.id,service:rate.service,amount:rate.price,duration:rate.duration,status:'draft'});
  }
  s.chat=[{id:'demo-chat-user',role:'user',text:'What should I review today?'},{id:'demo-chat-answer',role:'assistant',text:'Review the new requests, the overdue invoices, and the open team issue. These are sample records you can safely edit.'}];
  return s;
}
