import type { PortfolioCase } from '../game/planets';
export type ReaderEntry={item:PortfolioCase;category:string;planetId?:string};
export type ReaderContext={entries:ReaderEntry[];initialCaseId:string;directoryLabel:string;onDirectory:()=>void;onCaseChanged?:(entry:ReaderEntry)=>void;onCaseRead?:(entry:ReaderEntry)=>void;progress?:(entry:ReaderEntry)=>{explored:boolean;read:number;total:number;caseRead:boolean}};
export type ReadingPosition={caseIndex:number;pageIndex:number};
/** Traverse images continuously, retaining sensible stops at the archive edges. */
export function moveReading(position:ReadingPosition,delta:number,counts:number[]):ReadingPosition {
  const {caseIndex,pageIndex}=position,next=pageIndex+delta;
  if(next>=0&&next<counts[caseIndex])return {caseIndex,pageIndex:next};
  const adjacent=caseIndex+delta;
  if(adjacent<0||adjacent>=counts.length)return position;
  return {caseIndex:adjacent,pageIndex:delta>0?0:counts[adjacent]-1};
}
