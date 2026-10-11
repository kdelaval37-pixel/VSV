export function supplierSnapshot(data,id=''){
 if(!id)return null;const supplier=data.repositories.suppliers?.find(s=>s.id===id);if(!supplier)throw Error('Fournisseur introuvable.');return structuredClone(supplier);
}
export function assignSupplier(data,need,id){need.supplierId=id||'';need.supplierSnapshot=supplierSnapshot(data,id);return need;}
export function validateSupplierSnapshot(snapshot){
 if(snapshot===null||snapshot===undefined)return;if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot))throw Error('Fournisseur enregistré invalide.');
 for(const key of ['id','name','address','contact','email','phone','notes'])if(typeof snapshot[key]!=='string'||snapshot[key].length>100000)throw Error('Coordonnées de fournisseur invalides.');if(!snapshot.id||!snapshot.name.trim())throw Error('Fournisseur enregistré sans identifiant ou nom.');
}
