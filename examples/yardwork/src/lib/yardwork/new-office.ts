import { seed } from './yardwork.ts';
/** A real account starts with no demo people, prices or assumed tax settings. */
export function newOffice(owner = '') {
  const state = seed(true);
  state.business = {name:'My business',owner,city:'',tax:0,crew1:'Service team',crew2:'Projects team'};
  state.rates = [];
  state.onboarding = {completed:false};
  return state;
}
