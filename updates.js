(function(){
 'use strict';
 const CURRENT='8.1.0';let checked=0;
 function newer(a,b){const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]>y[i];}return false;}
 async function check(){if(typeof fetch!=='function'||!['http:','https:'].includes(location.protocol)||Date.now()-checked<300000)return;checked=Date.now();try{const r=await fetch('./version.json?check='+Date.now(),{cache:'no-store'});if(!r.ok||r.redirected)return;const data=await r.json();if(!/^\d+\.\d+\.\d+$/.test(data.version)||!newer(data.version,CURRENT)||document.querySelector('#app-update'))return;const bar=document.createElement('div');bar.id='app-update';bar.className='update-bar';bar.setAttribute('role','status');const label=document.createElement('span');label.textContent='Есть обновление FitnessLegend. Сохрани незаконченные изменения и обнови страницу.';const button=document.createElement('button');button.type='button';button.className='btn';button.textContent='Обновить';button.addEventListener('click',()=>location.reload());bar.append(label,button);document.body.appendChild(bar);}catch{}}
 check();document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
})();
