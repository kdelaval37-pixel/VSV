import {record} from './shared/command-context.js';
import {remaining} from './purchase-model.js';
import {validateSupplierSnapshot} from './supplier-model.js';
const roundedRatio=(amount,num,den)=>{const value=(BigInt(amount)*BigInt(num)+BigInt(den)/2n)/BigInt(den);if(value>BigInt(Number.MAX_SAFE_INTEGER))throw Error('Montant trop élevé.');return Number(value);};
export function remainingEstimate(need){return need.estimate===null?null:roundedRatio(need.estimate,remaining(need),need.planned||1);}
export function orderLine(data,n){
 const a=data.repositories.articles.find(a=>a.id===n.articleId);if(!a)throw Error('Article introuvable.');if(n.validationError)throw Error('Corrigez le besoin de '+n.name+' avant de générer un bon.');
 const qty=remaining(n),plan=structuredClone(n.plan);let total=remainingEstimate(n),priceLabel='Estimation du besoin',priceDate='',priceNote='';
 // Un prix historique sert uniquement d’indication. Le montant réel n’est jamais réécrit.
 if(total===null){const last=a.lastPurchase;if(last){total=roundedRatio(last.total,qty,last.quantity);priceLabel='Prix indicatif du dernier achat';priceDate=last.date;priceNote=last.note||'';}else{const old=[...(data.operations.movements??[])].reverse().find(m=>m.articleId===a.id&&m.kind==='entry'&&m.cost!==null);if(old){total=roundedRatio(old.cost,qty,old.quantity);priceLabel='Prix indicatif du dernier achat';priceDate=old.date;priceNote=old.note||'';}}}
 const divisor=['weight','volume'].includes(n.tracking)?1000:1;
 return {needId:n.id,articleId:a.id,name:n.name,projectId:n.projectId,projectName:n.projectName,supplierId:n.supplierId||'',supplierSnapshot:structuredClone((data.repositories.suppliers??[]).find(s=>s.id===n.supplierId)??n.supplierSnapshot??null),quantity:qty,tracking:n.tracking,unit:n.tracking==='weight'?'kg':n.tracking==='volume'?'l':a.unit||'pièce',plan,total,unitPrice:total===null?null:roundedRatio(total,divisor,qty),priceLabel,priceDate,priceNote};
}
export function orderTotals(lines){let total=0n;for(const l of lines)if(l.total!==null)total+=BigInt(l.total);if(total>BigInt(Number.MAX_SAFE_INTEGER))throw Error('Total trop élevé.');return {total:Number(total),partial:lines.some(l=>l.total===null)};}
function impl_createOrder(data,{scope='global',supplierId='',groupSuppliers=false,observations='',token=crypto.randomUUID()}={}){
 data.operations.purchaseOrders??=[];const existing=data.operations.purchaseOrders.find(o=>o.id===token);if(existing)return existing;
 if(!['global','supplier'].includes(scope))throw Error('Périmètre invalide.');const needs=data.operations.shoppingNeeds.filter(n=>remaining(n)>0&&(scope==='global'||(n.supplierId||'')===supplierId));if(!needs.length)throw Error('Aucun article restant dans ce périmètre.');
 const date=new Date().toISOString(),lines=needs.map(n=>orderLine(data,n));const order={id:token,reference:'VSV-BC-'+date.slice(0,10).replaceAll('-','')+'-'+token.toUpperCase(),date,scope,supplierId:scope==='supplier'?supplierId:'',supplierSnapshot:scope==='supplier'?structuredClone(lines[0].supplierSnapshot):null,groupSuppliers:scope==='global'&&!!groupSuppliers,observations,lines,...orderTotals(lines)};
 validateOrders([order]);data.operations.purchaseOrders.push(order);return order;
}
export function validateOrders(orders){
 if(!Array.isArray(orders)||orders.length>20000)throw Error('Liste de bons invalide.');const ids=new Set(),references=new Set();const text=v=>typeof v==='string'&&v.length<=100000;
 for(const o of orders){if(!o||!text(o.id)||!o.id||ids.has(o.id)||!text(o.reference)||!o.reference||references.has(o.reference)||!Number.isFinite(Date.parse(o.date))||!['global','supplier'].includes(o.scope)||!text(o.supplierId)||typeof o.groupSuppliers!=='boolean'||!text(o.observations)||!Array.isArray(o.lines)||!o.lines.length||o.lines.length>50000)throw Error('Bon de commande invalide.');ids.add(o.id);references.add(o.reference);validateSupplierSnapshot(o.supplierSnapshot);
  for(const l of o.lines){if(!l||!['needId','articleId','name','projectId','projectName','supplierId','unit','priceLabel','priceDate','priceNote'].every(k=>text(l[k]))||!l.name.trim()||!Number.isSafeInteger(l.quantity)||l.quantity<=0||!['unit','weight','volume'].includes(l.tracking)||!l.plan||typeof l.plan!=='object'||Array.isArray(l.plan)||l.total!==null&&(!Number.isSafeInteger(l.total)||l.total<0)||l.unitPrice!==null&&(!Number.isSafeInteger(l.unitPrice)||l.unitPrice<0))throw Error('Ligne de bon invalide.');validateSupplierSnapshot(l.supplierSnapshot);if(l.supplierId!==(l.supplierSnapshot?.id||''))throw Error('Fournisseur de ligne incohérent.');if(o.scope==='supplier'&&l.supplierId!==o.supplierId)throw Error('Périmètre du bon incohérent.');}
  const t=orderTotals(o.lines);if(t.total!==o.total||t.partial!==o.partial)throw Error('Total du bon incohérent.');
 }return orders;
}

export const createOrder=(...args)=>record('createOrder',args,()=>impl_createOrder(...args));
