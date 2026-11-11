(function(root){
 'use strict';
 const Nutrition=typeof module!=='undefined'?require('./nutrition-expansion.js'):root.FLNutritionExpansion;
 // Planning examples per 100 g, not current shop prices. Positive catalog edits win.
 const EXAMPLE_PRICES={turkey:65,beef:85,salmon:120,hake:55,tuna:95,'egg-raw':18,'egg-white':25,'cottage-2':38,'greek-yogurt':32,kefir:12,cheese:95,pasta:9,bulgur:12,bread:14,lavash:18,lentils:16,beans:18,chickpeas:20,corn:24,'peanut-butter':55,honey:60,avocado:65,broccoli:28,cabbage:8,zucchini:16,spinach:55,pepper:28,'tomato-puree':20,berries:65,flour:7,onion:6,garlic:35,lemon:22,tofu:55};
 const MEALS={breakfast:'Завтрак',lunch:'Обед',dinner:'Ужин',snack:'Перекус'};
 const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 function priceFor(food){
  if(finite(food?.price,0.000001,10000))return {value:food.price,estimated:false,source:'Цена из редактируемого справочника'};
  if(food?.price===0&&Object.hasOwn(EXAMPLE_PRICES,food.id))return {value:EXAMPLE_PRICES[food.id],estimated:true,source:'Плановый учебный пример; цена магазина не проверена'};
  return null;
 }
 function optionsValid(o){return o&&finite(o.budget,1,10000)&&[3,4].includes(o.slots??3)&&finite(o.maxMinutes??30,5,120)&&['economy','protein','energy','light'].includes(o.priority||'economy')&&Array.isArray(o.exclude||[])&&(o.exclude||[]).length<=1000&&(o.exclude||[]).every(id=>typeof id==='string'&&id.length<=90)&&((o.kcal??null)===null||finite(o.kcal,1000,6000))&&((o.protein??null)===null||finite(o.protein,10,700));}
 function recipeOption(recipe,foods,portion){
  const data=Nutrition.calculate(recipe,foods,portion);if(!data)return null;
  const ingredients=[];let cost=0;
  for(const food of data.ingredients){const price=priceFor(food);if(!price||!['kcal','p','f','c'].every(k=>finite(food[k],0,k==='kcal'?1000:100)))return null;const line=food.grams*price.value/100;cost+=line;ingredients.push({...food,unitPrice:price.value,cost:line,estimatedPrice:price.estimated,priceSource:price.source});}
  return {recipeId:recipe.id,title:recipe.title,meal:recipe.meal,minutes:recipe.minutes,portion,ingredients,totals:data.totals,grams:data.grams,waterMl:(recipe.water||0)*portion,cost,allergens:recipe.allergens||'Проверь состав продуктов.',note:recipe.note||'',steps:recipe.steps||[]};
 }
 function score(t,cost,o){
  let s=0;
  if(o.kcal)s+=Math.abs(t.kcal-o.kcal)/o.kcal*4;
  if(o.protein)s+=Math.abs(t.p-o.protein)/o.protein*3;
  if(o.priority==='protein')s-=Math.min(.7,t.p/Math.max(1,cost)*.15);
  else if(o.priority==='energy')s-=Math.min(.7,t.kcal/Math.max(1,cost)*.012);
  else if(o.priority==='light')s+=t.kcal/6000*.25;
  else s+=cost/o.budget*.25;
  return s;
 }
 function build(recipes,foods,options){
  if(!optionsValid(options))throw new Error('Проверь бюджет, время, количество приёмов пищи и ручные ориентиры КБЖУ.');
  const o={...options,slots:options.slots??3,maxMinutes:options.maxMinutes??30,priority:options.priority||'economy',exclude:options.exclude||[],kcal:options.kcal??null,protein:options.protein??null},excluded=new Set(o.exclude),mealKeys=o.slots===4?['breakfast','lunch','dinner','snack']:['breakfast','lunch','dinner'];
  const unique=new Set(),missingPriceIds=new Set(),groups=Object.fromEntries(mealKeys.map(k=>[k,[]]));
  for(const r of recipes){
   if(!r||unique.has(r.id)||!groups[r.meal]||!Array.isArray(r.items)||!r.items.length||r.minutes>o.maxMinutes||r.items.some(([id])=>excluded.has(id)))continue;
   unique.add(r.id);
   for(const [id]of r.items){const f=foods.find(f=>f.id===id);if(f&&!priceFor(f))missingPriceIds.add(id);}
   for(const portion of [.5,1,1.5,2]){const item=recipeOption(r,foods,portion);if(item)groups[r.meal].push(item);}
  }
  const absent=mealKeys.filter(k=>!groups[k].length);
  if(absent.length)return {ok:false,reason:'Для выбранных условий нет блюда на '+absent.map(k=>MEALS[k].toLocaleLowerCase('ru')).join(', ')+'. Измени исключения, время или заполни цены продуктов.',missingMeals:absent,minCost:null,unknownPrices:[...missingPriceIds]};
  const minSuffix=Array(mealKeys.length+1).fill(0);for(let i=mealKeys.length-1;i>=0;i--)minSuffix[i]=minSuffix[i+1]+Math.min(...groups[mealKeys[i]].map(r=>r.cost));
  if(minSuffix[0]>o.budget+1e-8)return {ok:false,reason:'В пределах бюджета собрать выбранные приёмы пищи не получилось. Минимальная стоимость доступного сочетания — примерно '+minSuffix[0].toFixed(2)+' ₽.',minCost:minSuffix[0],missingMeals:[],unknownPrices:[...missingPriceIds]};
  let best=null,bestScore=Infinity,examined=0;
  function visit(index,picked,cost,t){
   if(cost+minSuffix[index]>o.budget+1e-8)return;
   if(index===mealKeys.length){examined++;const value=score(t,cost,o);if(value<bestScore-1e-10){bestScore=value;best={meals:picked.slice(),cost,totals:{...t}};}return;}
   for(const item of groups[mealKeys[index]]){const nextCost=cost+item.cost;if(nextCost+minSuffix[index+1]>o.budget+1e-8)continue;const next={};for(const k of ['kcal','p','f','c'])next[k]=t[k]+item.totals[k];picked.push(item);visit(index+1,picked,nextCost,next);picked.pop();}
  }
  visit(0,[],0,{kcal:0,p:0,f:0,c:0});
  if(!best)return {ok:false,reason:'Не удалось собрать подходящее сочетание.',minCost:minSuffix[0],missingMeals:[],unknownPrices:[...missingPriceIds]};
  const shopping=new Map();for(const meal of best.meals)for(const f of meal.ingredients){const current=shopping.get(f.id);if(current){current.grams+=f.grams;current.cost+=f.cost;}else shopping.set(f.id,{id:f.id,name:f.name,grams:f.grams,unitPrice:f.unitPrice,cost:f.cost,estimatedPrice:f.estimatedPrice,priceSource:f.priceSource});}
  const warnings=['Цены учебные, не цены магазина. Проверь стоимость и состав своих продуктов.','Это пример набора блюд, а не персональное назначение питания.'];
  const estimatedIds=[...shopping.values()].filter(f=>f.estimatedPrice).map(f=>f.id);if(estimatedIds.length)warnings.push('Для '+estimatedIds.length+' продуктов без заполненной цены использованы явно отмеченные плановые примеры. Справочник не изменён.');
  if(o.kcal&&Math.abs(best.totals.kcal-o.kcal)/o.kcal>.1)warnings.push('Сочетание заметно отличается от твоего ручного ориентира калорий. Оно не выдаётся за готовый полный рацион.');
  if(o.protein&&best.totals.p<o.protein*.9)warnings.push('В этом сочетании меньше белка, чем указано в твоём ручном ориентире.');
  const result={ok:true,...best,options:o,minCost:minSuffix[0],shopping:[...shopping.values()].sort((a,b)=>a.name.localeCompare(b.name,'ru')),waterMl:best.meals.reduce((n,m)=>n+m.waterMl,0),warnings,estimatedIds,unknownPrices:[...missingPriceIds],gaps:{kcal:o.kcal===null?null:best.totals.kcal-o.kcal,protein:o.protein===null?null:best.totals.p-o.protein},examined};
  result.fingerprint=JSON.stringify({meals:result.meals.map(m=>({recipeId:m.recipeId,meal:m.meal,portion:m.portion,ingredients:m.ingredients.map(f=>({id:f.id,name:f.name,grams:f.grams,kcal:f.kcal,p:f.p,f:f.f,c:f.c,unitPrice:f.unitPrice,estimatedPrice:f.estimatedPrice}))})),cost:result.cost,totals:result.totals});
  return result;
 }
 const value={build,priceFor,recipeOption,MEALS,EXAMPLE_PRICES};root.FLMealBuilder=value;if(typeof module!=='undefined')module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
