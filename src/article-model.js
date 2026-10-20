import {record} from './shared/command-context.js';
import {place} from './references-model.js';
import {cents} from './pack.js';
import {addStock} from './operations-model.js';
import {addNeed,changeStockMode,purchaseCalc} from './purchase-model.js';
const localTime=()=>new Date().toISOString();
function stockPlace(data,p){if(p.placeId)return p.placeId;let general=data.repositories.places.find(p=>p.id==='vsv-stock-general');if(!general){general={...place(),id:'vsv-stock-general',name:'Stock général (sans lieu précisé)'};data.repositories.places.push(general);}return general.id;}
function impl_saveArticle(data,id,p,f,photo){
 const a=data.repositories.articles.find(x=>x.id===id);if(!p.name.trim())throw Error('Le nom est obligatoire.');if(!['consumable','reusable'].includes(p.nature))throw Error('Choisissez explicitement la nature.');
 if((a.stockMode||'tracked')!==p.stockMode)changeStockMode(data,id,p.stockMode,{inventoryConfirmed:f.elements.inventoryConfirmed?.checked||false,quantity:p.modeInventory,placeId:p.placeId||stockPlace(data,p)});
 const tracking=p.stockMode==='untracked'?'unit':['weight','volume'].includes(p.purchaseMode)?p.purchaseMode:'unit';
 if(tracking!==(a.tracking||'unit')&&(data.operations.movements.some(m=>m.articleId===id)||data.operations.reservations.some(r=>r.articleId===id)||data.operations.shoppingNeeds?.some(n=>n.articleId===id)))throw Error('Le passage unités / poids / volume est impossible avec un historique existant. Créez une référence distincte.');
 const cost=p.stockMode==='tracked'&&!f.elements.unknownCost.checked?purchaseCalc(p):null;
 const ingredient=f.elements.ingredient.checked,excluded=f.elements.excludeSale.checked||ingredient||tracking!=='unit';
 Object.assign(a,{defaultSupplierId:p.defaultSupplierId||'',name:p.name.trim(),description:p.description,categoryId:p.categoryId,nature:p.nature,stockMode:p.stockMode,purchaseMode:p.stockMode==='untracked'?'unit':p.purchaseMode,tracking,unit:p.stockMode==='untracked'?(a.unit||'pièce'):tracking==='weight'?'kg':tracking==='volume'?'l':p.unit||'pièce',unitsPerPack:p.purchaseMode==='pack'?p.unitsPerPack:'',purchaseUnitPrice:cost?.unitCost?String(cost.unitCost.cents/100):a.purchaseUnitPrice||'',costQuantity:p.quantity,costQuantityUnit:p.quantityUnit,costPacks:p.packs,packPrice:cost?.packCost?String(cost.packCost.cents/100):a.packPrice,costSource:p.priceSource,costPrice:f.elements.unknownCost.checked?'':p.knownPrice,salePrice:p.salePrice,estimatedCost:p.estimatedCost,ingredient:ingredient?'yes':'no',forSale:excluded?'no':'yes',preferredPlaceId:p.placeId||'',photo});
 if(f.elements.needPurchase.checked&&p.stockMode==='tracked')addNeed(data,{...p,articleId:id,unknownCost:f.elements.unknownCost.checked});return a;
}
function impl_createArticle(data,a,p,f,photo){
 if(data.repositories.articles.some(x=>x.id===a.id))throw Error('Article déjà enregistré.');data.repositories.articles.push({...a,stockMode:p.stockMode,tracking:p.stockMode==='tracked'&&['weight','volume'].includes(p.purchaseMode)?p.purchaseMode:'unit'});
 const saved=saveArticle(data,a.id,p,f,photo);
 if(p.stockMode==='tracked'&&p.initialQuantity?.trim()){const m=addStock(data,{articleId:a.id,placeId:stockPlace(data,p),purchaseMode:saved.tracking==='unit'?'unit':saved.tracking,quantity:p.initialQuantity,quantityUnit:saved.tracking==='volume'?'l':'kg',unknownCost:true,origin:'Stock initial',date:localTime(),note:'Stock déjà possédé à la création'});m.cost=p.initialCost.trim()===''?null:cents(p.initialCost);}
 return saved;
}

export const createArticle=(...args)=>record('createArticle',args,()=>impl_createArticle(...args));
export const saveArticle=(...args)=>record('saveArticle',args,()=>impl_saveArticle(...args));
