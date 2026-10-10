import {readAll,writeAll} from './storage.js';
import {operations} from './operations-model.js';
export const cashLock='vsv-cash-operator';
// Relire sous verrou, modifier une copie, valider puis effectuer UNE écriture atomique.
export async function transact(change,{financialRestore=false}={}){
 if(!navigator.locks)throw Error('Cette opération nécessite la protection entre onglets : utilisez une version récente de Chrome, Edge ou Firefox.');
 const run=()=>navigator.locks.request('vsv-data-transaction',()=>{const data=structuredClone(readAll());if(data.repositories&&data.preferences)data.operations??=operations();const result=change(data);data.operations??=operations();writeAll(data);window.dispatchEvent(new CustomEvent('vsv-data-updated'));return {data,result};});
 if(!financialRestore)return run();return navigator.locks.request(cashLock,{ifAvailable:true},lock=>{if(!lock)throw Error('Restauration impossible pendant qu’un autre onglet utilise la caisse.');return run();});
}
