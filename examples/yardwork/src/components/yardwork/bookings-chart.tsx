"use client";
import { useRememberedState } from "./page-memory";
import { useId,useMemo,useState,type PointerEvent } from 'react';
import { AreaClosed,LinePath } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';
import { Button } from './shared';
import { bookingOutlook } from '../../lib/yardwork/booking-series';
import { dateLabel,type Job } from '../../lib/yardwork/yardwork';
import { cad } from '../../lib/yardwork/business-documents';
import './bookings-chart.css';
const ranges=[7,14,30] as const;
type Row=ReturnType<typeof bookingOutlook>[number];
const describe=(row:Row)=>`${dateLabel(row.date,{month:'long',day:'numeric'})}: ${cad(row.amount)} ${row.projected?'projected':'booked'}, ${row.count} ${row.count===1?'job':'jobs'}`;

export default function BookingsChart({jobs}:{jobs:Job[]}) {
 const [days,setDays]=useRememberedState<7|14|30>("money.chartRange",7);
 const rows=useMemo(()=>bookingOutlook(jobs,days),[jobs,days]);
 return <section className="yw-bookings-chart" aria-label="Booked work and scheduled revenue projection">
  <div className="yw-bookings-chart-heading">
   <div className="yw-bookings-chart-ranges" aria-label="Chart period">{ranges.map(range=><Button key={range} size="sm" variant={days===range?'secondary':'ghost'} aria-pressed={days===range} onClick={()=>setDays(range)}>{range} days</Button>)}</div>
  </div>
  <div className="yw-bookings-chart-frame"><ParentSize debounceTime={0}>{({width,height})=>width>0&&height>0?<Plot key={days} rows={rows} days={days} width={width} height={height}/>:null}</ParentSize></div>
  <div className="yw-bookings-chart-dates" aria-hidden="true">{[0,Math.floor((rows.length-1)/2),rows.length-1].map(index=><span key={index}>{dateLabel(rows[index].date,{month:'short',day:'numeric'})}</span>)}</div>
 </section>;
}

function Plot({rows,days,width,height}:{rows:Row[];days:number;width:number;height:number}) {
 const id=useId().replace(/:/g,''),[selected,setSelected]=useState<number|null>(null),[keyboard,setKeyboard]=useState(false);
 const data=useMemo(()=>rows.map((row,index)=>({...row,index})),[rows]);
 const x=useMemo(()=>scaleLinear({domain:[0,rows.length-1],range:[6,width-6],clamp:true}),[rows.length,width]);
 const y=useMemo(()=>scaleLinear({domain:[0,Math.max(100,...rows.map(row=>row.amount))*1.15],range:[height-8,24]}),[rows,height]);
 const history=data.slice(0,days),future=data.slice(days-1),todayX=x(days-1),active=selected===null?null:data[selected];
 const hasBookings=rows.some(row=>row.count>0),tooltipWidth=Math.min(184,width-16);
 function track(event:PointerEvent<HTMLDivElement>){if(!event.isPrimary)return;const rect=event.currentTarget.getBoundingClientRect();setKeyboard(false);setSelected(Math.round(x.invert((event.clientX-rect.left)*width/rect.width)));}
 return <div className="yw-bookings-chart-canvas" role="slider" tabIndex={0} aria-label="Explore daily bookings" aria-orientation="horizontal" aria-valuemin={0} aria-valuemax={rows.length-1} aria-valuenow={selected??days-1} aria-valuetext={describe(data[selected??days-1])} aria-describedby={`${id}-help`}
  onPointerMove={track} onPointerDown={event=>{track(event);if(event.isPrimary&&event.pointerType==='touch')event.currentTarget.setPointerCapture(event.pointerId);}}
  onPointerLeave={()=>{if(!keyboard)setSelected(null);}} onPointerCancel={()=>setSelected(null)}
  onFocus={event=>{if(event.currentTarget.matches(':focus-visible')){setKeyboard(true);setSelected(days-1);}}} onBlur={()=>{setSelected(null);setKeyboard(false);}}
  onKeyDown={event=>{const index=selected??days-1;const next=event.key==='ArrowRight'?Math.min(rows.length-1,index+1):event.key==='ArrowLeft'?Math.max(0,index-1):event.key==='Home'?0:event.key==='End'?rows.length-1:null;if(event.key==='Escape'){setSelected(null);return;}if(next!==null){event.preventDefault();setKeyboard(true);setSelected(next);}}}>
  <span id={`${id}-help`} className="sr-only">Use left and right arrow keys to explore days, Home and End to jump, and Escape to hide details. Amounts are before tax. Projections use scheduled jobs through month-end.</span>
  <svg width={width} height={height} aria-hidden="true">
   <defs><linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity="0.6"/><stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02"/></linearGradient></defs>
   <g className="yw-bookings-chart-fade">
    {future.length>1&&<><AreaClosed data={future} x={d=>x(d.index)} y={d=>y(d.amount)} yScale={y} curve={curveMonotoneX} fill={`url(#${id}-fill)`} opacity="0.4"/><LinePath data={future} x={d=>x(d.index)} y={d=>y(d.amount)} curve={curveMonotoneX} className="yw-bookings-chart-line yw-bookings-chart-projection"/></>}
    <AreaClosed data={history} x={d=>x(d.index)} y={d=>y(d.amount)} yScale={y} curve={curveMonotoneX} fill={`url(#${id}-fill)`}/>
    <LinePath data={history} x={d=>x(d.index)} y={d=>y(d.amount)} curve={curveMonotoneX} className="yw-bookings-chart-line"/>
   </g>
   <line x1={todayX} x2={todayX} y1="20" y2={height-8} className="yw-bookings-chart-boundary"/>
   {active&&<><line x1={x(active.index)} x2={x(active.index)} y1="20" y2={height-8} className="yw-bookings-chart-guide"/><circle cx={x(active.index)} cy={y(active.amount)} r="9" className="yw-bookings-chart-halo"/><circle cx={x(active.index)} cy={y(active.amount)} r="4" className="yw-bookings-chart-dot"/></>}
  </svg>
  <span className="yw-bookings-chart-today" style={{left:Math.max(24,Math.min(width-24,todayX))}}>Today</span>
  {!hasBookings&&<p className="yw-bookings-chart-empty">Your booked work will appear here.</p>}
  {active&&<div className="yw-bookings-chart-tooltip" role="tooltip" style={{width:tooltipWidth,left:Math.max(8,Math.min(width-tooltipWidth-8,x(active.index)-tooltipWidth/2)),top:Math.max(28,y(active.amount)-110)}}>
   <span>{dateLabel(active.date,{weekday:'short',month:'short',day:'numeric'})}</span><strong>{cad(active.amount)}</strong><span>{active.projected?'Projected':'Booked'} · {active.count} {active.count===1?'job':'jobs'}</span>
  </div>}
 </div>;
}
