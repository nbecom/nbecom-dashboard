'use client';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
async function authAPI(a,d={}){const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:a,...d})});return r.json()}

// ─── Basecost Database (giữ nguyên v4) ───
const BDB={'Phương Nhi':{'T-Shirt':{S:[16,19,21],M:[16.5,19.5,21.5],L:[17,20,23.5],XL:[17.5,21.5,24.5],'2XL':[18.5,22.5,26.5],'3XL':[19.5,24.5,26.5],'4XL':[21.5,25.5,27],'5XL':[22,26,27.5]},'Sweatshirt':{S:[24,29,31],M:[24,29,31.5],L:[24.5,29.5,32],XL:[26.5,31,35],'2XL':[28.5,32.5,36.5],'3XL':[29,34,37],'4XL':[29.5,35.5,37.5],'5XL':[30,36,38]},'Hoodie':{S:[29,33,36],M:[29,33,36.5],L:[29.5,33.5,37],XL:[30.5,34,37.5],'2XL':[31.5,37,39],'3XL':[32,37.5,40],'4XL':[33.5,38,40.5],'5XL':[33.5,38,41]},'Quarter Zip':{S:[26,31,33],M:[26,31,33.5],L:[26.5,31.5,34],XL:[28.5,33,37],'2XL':[30.5,34.5,38.5],'3XL':[31,36,39],'4XL':[31.5,37.5,39.5],'5XL':[32,38,40]},'Kid Sweatshirt':{S:[18,20,21],M:[18,20,21],L:[18,20,21],XL:[19,21,21.5],'2XL':[20,22.5,23]},'Kid Hoodie':{S:[19.5,20.5,21.5],M:[19.5,20.5,21.5],L:[20.5,22.5,23.5],XL:[20.5,22.5,23.5],'2XL':[21,23,24]},'Kid T-Shirt':{S:[14,15.5,16],M:[14,15.5,16],L:[14,15.5,16],XL:[15.5,16.5,17.5],'2XL':[15.5,16.5,17.5]},'Embroidered Cap':{'Free size':[14,19,19]},'Wash Hat':{'Free size':[14,19,19]},'Trucker Hat':{'Free size':[14,19,19]}},'Pet':{'T-Shirt':{S:[15.8,19,21],M:[15.8,19.5,21.5],L:[15.8,19.5,21.5],XL:[17,21.5,24.5],'2XL':[18,21.5,24.5],'3XL':[18.9,24.5,24.5],'4XL':[20.9,25,25.5],'5XL':[20.9,25,25.5]},'Sweatshirt':{S:[23.9,29,31.5],M:[23.9,29,31.5],L:[23.9,29,31.5],XL:[23.9,30,35.5],'2XL':[26.9,30,35.5],'3XL':[28.9,33,35.5],'4XL':[28.9,33,36.5],'5XL':[28.9,33,36.5]},'Hoodie':{S:[27.9,32,35.5],M:[27.9,32,35.5],L:[27.9,32,35.5],XL:[27.9,32,35.5],'2XL':[29.9,37,38.5],'3XL':[31.9,37,38.5],'4XL':[31.9,37,38.5],'5XL':[31.9,37,38.5]},'Quarter Zip':{S:[25.9,31,33.5],M:[25.9,31,33.5],L:[25.9,31,33.5],XL:[25.9,32,37.5],'2XL':[28.9,32,37.5],'3XL':[30.9,35,37.5],'4XL':[30.9,35,38.5],'5XL':[30.9,35,38.5]},'Baby Tee':{S:[15.8,19,21],M:[15.8,19.5,21.5],L:[15.8,19.5,21.5],XL:[17,21.5,24.5],'2XL':[18,21.5,24.5],'3XL':[18.9,24.5,24.5],'4XL':[20.9,25,25.5],'5XL':[20.9,25,25.5]},'Embroidered Cap':{'Free size':[15,20,20]},'Wash Hat':{'Free size':[15,20,20]},'Trucker Hat':{'Free size':[15,20,20]}},'Zootop Bear':{'Hawaiian Shirt':{_all:13.71},'Youth Hawaiian Shirt':{_all:12.02},'Beach Short':{_all:12.69},'Football Jersey':{_all:14.61},'Kid Football Jersey':{_all:11.47},'Linen Shirt':{_all:15.06},'Baseball Jacket':{_all:23.98},'Kid Baseball Jacket':{_all:23.30},'Baseball Shirt':{_all:13.33},'Kid Baseball Shirt':{_all:11.27},'Hoodie':{_all:21.44},'Zip Hoodie':{_all:21.68},'Sweatshirt':{_all:16.84},'Kid Hoodie':{_all:15.28}},'TRIO':{'Keychain 7cm':{_all:14},'Crochet 12cm':{_all:15.5},'Crochet 20cm':{_all:23},'Crochet 30cm':{_all:32}}};
const DEFAULT_SHOPS=[{name:'QuinnCreativeDesign',type:'Vật lý'},{name:'ThiHoaEmbroidery',type:'Vật lý'},{name:'Moyerpeters',type:'Vật lý'},{name:'NDAHandmadeEMB',type:'Vật lý'},{name:'EmbroideryTVT',type:'Vật lý'},{name:'TonyHungGift',type:'Vật lý'},{name:'EmbroideryAnhThu',type:'Digital'},{name:'EmbroideryTuanAnh',type:'Digital'},{name:'BumMachineEmbroidery',type:'Digital'},{name:'NINNEmbroidery',type:'Digital'},{name:'Linhcraftshop',type:'Digital'}];
const RATE=26500,ROLES={admin:'Admin',manager:'Manager',designer:'Designer',sale:'Sale',seller:'Seller'},RC={admin:'#ef4444',manager:'#3b82f6',designer:'#8b5cf6',sale:'#10b981',seller:'#f59e0b',pending:'#64748b'};
const ZP=['Hawaiian Shirt','Youth Hawaiian Shirt','Beach Short','Football Jersey','Kid Football Jersey','Linen Shirt','Baseball Jacket','Kid Baseball Jacket','Baseball Shirt','Kid Baseball Shirt','Zip Hoodie'];
const TP=['Keychain 7cm','Crochet 12cm','Crochet 20cm','Crochet 30cm'];
const ICONS={'T-Shirt':'👕','Sweatshirt':'🧥','Hoodie':'🧥','Quarter Zip':'🧥','Baby Tee':'👕','Kid Sweatshirt':'👶','Kid Hoodie':'👶','Kid T-Shirt':'👶','Embroidered Cap':'🧢','Wash Hat':'🧢','Trucker Hat':'🧢','Hawaiian Shirt':'🌺','Football Jersey':'⚽','Linen Shirt':'👔','Baseball Jacket':'🧥','Baseball Shirt':'⚾','Beach Short':'🩳','Zip Hoodie':'🧥','Kid Baseball Jacket':'👶','Kid Baseball Shirt':'👶','Kid Football Jersey':'👶','Youth Hawaiian Shirt':'👶','Keychain 7cm':'🔑','Crochet 12cm':'🧶','Crochet 20cm':'🧶','Crochet 30cm':'🧶'};
const MN=["","Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

// ─── Logic functions (giữ nguyên v4) ───
function aS(p){if(ZP.includes(p))return'Zootop Bear';if(TP.includes(p))return'TRIO';return null}
function parseCSV(t){const ls=[];let c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(ch==='"'){q=!q;c+=ch}else if((ch==='\n'||(ch==='\r'&&t[i+1]==='\n'))&&!q){if(ch==='\r')i++;ls.push(c);c=''}else c+=ch}if(c.trim())ls.push(c);return ls.map(l=>{const cols=[];let col='',q2=false;for(let i=0;i<l.length;i++){const ch=l[i];if(ch==='"')q2=!q2;else if(ch===','&&!q2){cols.push(col.trim());col=''}else col+=ch}cols.push(col.trim());return cols})}
function pV(v){let pt='Unknown',sz='M',cl='',ps='';if(!v)return{pt,sz,cl,ps};const parts=v.split(',');for(const p of parts){const t=p.trim();if(t.startsWith('Type:')||t.startsWith('type:')){let tv=t.substring(5).trim();if(tv==='Additional Fee'){pt='Additional Fee';continue}const dm=tv.match(/^(.+?)\s*-\s*(\w+)$/);const sm=tv.match(/^(.+?)\s+((?:6XL|5XL|4XL|3XL|2XL|XL|XS|L|M|S))$/i);if(dm){pt=dm[1].trim();sz=dm[2].trim().toUpperCase()}else if(sm){pt=sm[1].trim();sz=sm[2].trim().toUpperCase()}else pt=tv}if(t.startsWith('Color:')||t.startsWith('color:'))cl=t.substring(6).trim();if(t.startsWith('Personalization:'))ps=t.substring(16).trim()}return{pt,sz,cl,ps}}
function dP(n){const t=(n||'').toLowerCase();const m=[['kid baseball shirt','Kid Baseball Shirt'],['kid baseball jacket','Kid Baseball Jacket'],['kid football jersey','Kid Football Jersey'],['kid hoodie','Kid Hoodie'],['kid sweatshirt','Kid Sweatshirt'],['kid t-shirt','Kid T-Shirt'],['youth hawaiian','Youth Hawaiian Shirt'],['baby tee','Baby Tee'],['zip hoodie','Zip Hoodie'],['quarter zip','Quarter Zip'],['baseball jacket','Baseball Jacket'],['baseball shirt','Baseball Shirt'],['hawaiian shirt','Hawaiian Shirt'],['beach short','Beach Short'],['football jersey','Football Jersey'],['linen shirt','Linen Shirt'],['trucker hat','Trucker Hat'],['wash hat','Wash Hat'],['embroidered cap','Embroidered Cap'],['cap','Embroidered Cap'],['hoodie','Hoodie'],['sweatshirt','Sweatshirt'],['crewneck','Sweatshirt'],['t-shirt','T-Shirt'],['tee','T-Shirt'],['keychain','Keychain 7cm'],['crochet','Crochet 12cm']];for(const[k,v]of m)if(t.includes(k))return(k==='tee'&&!t.includes('baby tee'))?'T-Shirt':v;return'Unknown'}
function gBC(p,s,sup){const sd=BDB[sup];if(!sd)return 0;const pd=sd[p];if(!pd)return 0;if(pd._all!==undefined)return pd._all;const sz=pd[s]||pd[s?.toUpperCase()]||pd['M']||pd['Free size'];return sz?sz[0]:0}
function cF(c){const m={"United States":"🇺🇸",Canada:"🇨🇦",Germany:"🇩🇪",Australia:"🇦🇺",Taiwan:"🇹🇼",Poland:"🇵🇱",Ireland:"🇮🇪","United Kingdom":"🇬🇧"};return m[c]||"🌍"}
function gMY(d){if(!d)return{m:0,y:0};const p=d.split('/');if(p.length<3)return{m:0,y:0};return{m:parseInt(p[0]),y:parseInt(p[2])<100?2000+parseInt(p[2]):parseInt(p[2])}}

function processOI(rows,shop,ds){if(rows.length<2)return[];const h=rows[0].map(x=>x.toLowerCase().replace(/['"]/g,'').trim());const c={};h.forEach((v,i)=>{if(v==='sale date')c.d=i;if(v==='item name')c.it=i;if(v==='buyer')c.b=i;if(v==='quantity')c.q=i;if(v==='price')c.p=i;if(v==='item total')c.t=i;if(v==='discount amount')c.dc=i;if(v==='order shipping')c.sh=i;if(v==='order sales tax')c.tx=i;if(v==='vat paid by buyer')c.vt=i;if(v==='order id')c.oi=i;if(v==='transaction id')c.ti=i;if(v==='listing id')c.li=i;if(v==='variations')c.v=i;if(v==='ship name')c.sn=i;if(v==='ship address1')c.a1=i;if(v==='ship address2')c.a2=i;if(v==='ship city')c.ci=i;if(v==='ship state')c.st=i;if(v==='ship zipcode')c.zp=i;if(v==='ship country')c.co=i;if(v==='sku')c.sk=i;if(v==='date shipped')c.ds=i;if(v==='date paid')c.dp=i;if(v==='currency')c.cu=i;if(v==='coupon code')c.cp=i});const orders=[];for(let i=1;i<rows.length;i++){const r=rows[i];if(!r||r.length<3)continue;const date=r[c.d]||'';if(!date)continue;const vr=c.v!==undefined?r[c.v]:'';const iN=c.it!==undefined?r[c.it]:'';const pvr=pV(vr);let pt=pvr.pt;if(pt==='Unknown'||pt==='Additional Fee')pt=dP(iN);if(pvr.pt==='Additional Fee')continue;const sup=aS(pt)||ds||'Phương Nhi';const qty=parseInt(r[c.q]||'1')||1;const price=parseFloat(r[c.p]||r[c.t]||'0')||0;const disc=parseFloat(r[c.dc]||'0')||0;const rev=price-disc;const fee=rev*0.095+0.20;const bc=gBC(pt,pvr.sz,sup)*qty;const lid=c.li!==undefined?r[c.li]:'';orders.push({date,orderId:r[c.oi]||'',transactionId:r[c.ti]||'',listingId:lid,etsyLink:lid?'https://www.etsy.com/listing/'+lid:'',shop,itemName:(iN||'').substring(0,120),productType:pt,size:pvr.sz,color:pvr.cl,personalization:pvr.ps,quantity:qty,buyer:r[c.sn]||'',buyerId:r[c.b]||'',address:[r[c.a1],r[c.a2],r[c.ci],r[c.st],r[c.zp],r[c.co]].filter(Boolean).join(', '),city:r[c.ci]||'',country:r[c.co]||'',saleVND:0,feeVND:0,taxVND:0,vatVND:0,netVND:0,netUSD:0,revenue:rev,platformFee:fee,basecost:bc,profit:rev-fee-bc,supplier:sup,autoSup:!!aS(pt),sku:r[c.sk]||'',coupon:r[c.cp]||'',dateShipped:r[c.ds]||'',datePaid:r[c.dp]||'',status:r[c.ds]?'Shipped':r[c.dp]?'Paid':'Pending',hasStatement:false,icon:ICONS[pt]||'📦'})}return orders}

function parseStatement(text){const rows=parseCSV(text);if(rows.length<2)return{orderNet:{},totalAds:0,totalFees:0,totalTax:0,totalVAT:0,totalSales:0,typeBreakdown:{}};const h=rows[0].map(x=>x.toLowerCase().replace(/['"]/g,'').replace(/^\uFEFF/,'').trim());const c={};h.forEach((v,i)=>{if(v==='date')c.d=i;if(v==='type')c.t=i;if(v==='title')c.ti=i;if(v==='info')c.in=i;if(v==='amount')c.a=i;if(v==='fees & taxes')c.f=i;if(v==='net')c.n=i});
function pVND(s){if(!s||s==='--')return 0;s=s.replace(/₫/g,'').replace(/,/g,'').replace(/ /g,'').trim();if(!s||s==='--')return 0;try{return parseFloat(s)}catch{return 0}}
const data=[];for(let i=1;i<rows.length;i++){const r=rows[i];if(!r||r.length<3)continue;const rawType=(r[c.t]||'').trim();data.push({date:r[c.d]||'',type:rawType,typeN:rawType.toLowerCase(),title:r[c.ti]||'',info:r[c.in]||'',amount:pVND(r[c.a]),fee:pVND(r[c.f]),net:pVND(r[c.n])})}
// Debug: breakdown by type
const typeBreakdown={};data.forEach(r=>{const t=r.type||'(empty)';if(!typeBreakdown[t])typeBreakdown[t]={count:0,amount:0,fee:0,net:0};typeBreakdown[t].count++;typeBreakdown[t].amount+=r.amount;typeBreakdown[t].fee+=r.fee;typeBreakdown[t].net+=r.net});
// Extract order IDs from Sale + Refund rows
const orderIds=[];data.forEach(r=>{if(r.typeN==='sale'||r.typeN==='refund'){const m=r.title.match(/#(\d+)/);if(m&&!orderIds.includes(m[1]))orderIds.push(m[1])}});
const orderNet={};for(const oid of orderIds){const oRows=data.filter(r=>(r.info||'').includes(oid)||(r.title||'').includes(oid));const sale=oRows.filter(r=>r.typeN==='sale'||r.typeN==='refund').reduce((s,r)=>s+r.amount,0);const fees=oRows.filter(r=>r.typeN==='fee').reduce((s,r)=>s+r.fee,0);const tax=oRows.filter(r=>r.typeN==='tax').reduce((s,r)=>s+r.fee,0);const vat=oRows.filter(r=>r.typeN==='vat').reduce((s,r)=>s+r.fee,0);orderNet[oid]={saleVND:sale,feeVND:fees,taxVND:tax,vatVND:vat,netVND:sale+fees+tax+vat}}
const totalAds=data.filter(r=>r.typeN==='marketing').reduce((s,r)=>s+r.fee,0);const totalFees=data.filter(r=>r.typeN==='fee').reduce((s,r)=>s+r.fee,0);const totalTax=data.filter(r=>r.typeN==='tax').reduce((s,r)=>s+r.fee,0);const totalVAT=data.filter(r=>r.typeN==='vat').reduce((s,r)=>s+r.fee,0);const totalSales=data.filter(r=>r.typeN==='sale'||r.typeN==='refund').reduce((s,r)=>s+r.amount,0);
return{orderNet,totalAds,totalFees,totalTax,totalVAT,totalSales,typeBreakdown}}

function mergeAll(orders,stmt){return orders.map(o=>{const sData=stmt.orderNet[o.orderId];if(sData){const netUSD=sData.netVND/RATE;const bc=o.basecost;return{...o,hasStatement:true,saleVND:sData.saleVND,feeVND:sData.feeVND,taxVND:sData.taxVND,vatVND:sData.vatVND,netVND:sData.netVND,netUSD,profit:netUSD-bc}}return o})}

// ─── Format & Style helpers ───
const S={card:{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:24},btn:{padding:'10px 20px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:600,fontSize:14,fontFamily:'inherit'},input:{padding:'12px 16px',borderRadius:10,border:'1px solid var(--border)',background:'var(--bg)',color:'var(--text)',fontSize:14,fontFamily:'inherit',width:'100%',outline:'none'},select:{padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg)',color:'var(--text)',fontSize:14,fontFamily:'inherit'},th:{padding:'10px 12px',textAlign:'left',color:'var(--text-dim)',fontWeight:500,fontSize:11,textTransform:'uppercase',letterSpacing:0.5,borderBottom:'1px solid var(--border)'},td:{padding:'10px 12px',borderBottom:'1px solid rgba(30,41,59,0.2)',fontSize:13},mono:{fontFamily:"'Space Mono', monospace"},badge:c=>({padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,background:c+'18',color:c,display:'inline-block'})};
function fU(n){return'$'+n.toFixed(2)}function fV(n){if(Math.abs(n)>=1e9)return(n/1e9).toFixed(1)+' tỷ';if(Math.abs(n)>=1e6)return(n/1e6).toFixed(1)+'M';if(Math.abs(n)>=1e3)return Math.round(n/1e3)+'K';return n.toFixed(0)}function fVD(n){return new Intl.NumberFormat('vi-VN').format(Math.round(n))+'₫'}

// ─── Auth Pages (giữ nguyên v4) ───
function LoginPage({onLogin,onGoReg,error,loading}){const[u,setU]=useState('');const[p,setP]=useState('');return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:20}}><div style={{width:420,animation:'fadeSlideUp 0.5s ease'}}><div style={{textAlign:'center',marginBottom:40}}><div style={{width:64,height:64,borderRadius:16,background:'linear-gradient(135deg,var(--accent),var(--purple))',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700,color:'#fff',marginBottom:16}}>N</div><h1 style={{fontSize:28,fontWeight:700}}>NBECOM</h1><p style={{color:'var(--text-dim)',fontSize:14,marginTop:4}}>Management System v5.7</p></div><div style={{...S.card,padding:32}}><h2 style={{fontSize:18,fontWeight:600,marginBottom:24,textAlign:'center'}}>Đăng nhập</h2>{error&&<div style={{padding:12,borderRadius:8,background:'rgba(239,68,68,0.1)',color:'var(--red)',fontSize:13,marginBottom:16,animation:'shake 0.3s'}}>⚠️ {error}</div>}<div style={{marginBottom:16}}><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>USERNAME</label><input style={S.input} placeholder="Nhập username" value={u} onChange={e=>setU(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onLogin(u,p)}/></div><div style={{marginBottom:24}}><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>MẬT KHẨU</label><input style={S.input} type="password" placeholder="Nhập mật khẩu" value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onLogin(u,p)}/></div><button onClick={()=>onLogin(u,p)} disabled={loading} style={{...S.btn,background:'var(--accent)',color:'#fff',width:'100%',padding:14,fontSize:15,opacity:loading?0.6:1}}>{loading?'⏳...':'🔐 Đăng nhập'}</button><div style={{textAlign:'center',marginTop:20}}><span style={{color:'var(--text-dim)',fontSize:13}}>Chưa có tài khoản? </span><span onClick={onGoReg} style={{color:'var(--accent)',fontSize:13,cursor:'pointer',fontWeight:600}}>Đăng ký</span></div></div></div></div>)}
function RegPage({onReg,onGoLogin,error,loading,success}){const[u,setU]=useState('');const[p,setP]=useState('');const[p2,setP2]=useState('');const[fn,setFn]=useState('');const go=()=>{if(p!==p2){alert('Mật khẩu không khớp!');return}onReg(u,p,fn)};return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:20}}><div style={{width:420,animation:'fadeSlideUp 0.5s ease'}}><div style={{textAlign:'center',marginBottom:40}}><div style={{width:64,height:64,borderRadius:16,background:'linear-gradient(135deg,var(--accent),var(--purple))',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700,color:'#fff',marginBottom:16}}>N</div><h1 style={{fontSize:28,fontWeight:700}}>NBECOM</h1></div><div style={{...S.card,padding:32}}><h2 style={{fontSize:18,fontWeight:600,marginBottom:24,textAlign:'center'}}>Đăng ký tài khoản</h2>{error&&<div style={{padding:12,borderRadius:8,background:'rgba(239,68,68,0.1)',color:'var(--red)',fontSize:13,marginBottom:16}}>⚠️ {error}</div>}{success&&<div style={{padding:12,borderRadius:8,background:'rgba(16,185,129,0.1)',color:'var(--green)',fontSize:13,marginBottom:16}}>✅ {success}</div>}<div style={{marginBottom:14}}><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>HỌ TÊN</label><input style={S.input} placeholder="Họ tên đầy đủ" value={fn} onChange={e=>setFn(e.target.value)}/></div><div style={{marginBottom:14}}><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>USERNAME</label><input style={S.input} value={u} onChange={e=>setU(e.target.value)}/></div><div style={{marginBottom:14}}><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>MẬT KHẨU</label><input style={S.input} type="password" value={p} onChange={e=>setP(e.target.value)}/></div><div style={{marginBottom:24}}><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>XÁC NHẬN</label><input style={S.input} type="password" value={p2} onChange={e=>setP2(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()}/></div><button onClick={go} disabled={loading} style={{...S.btn,background:'var(--green)',color:'#fff',width:'100%',padding:14,fontSize:15}}>📝 Đăng ký</button><div style={{textAlign:'center',marginTop:20}}><span style={{color:'var(--text-dim)',fontSize:13}}>Đã có tài khoản? </span><span onClick={onGoLogin} style={{color:'var(--accent)',fontSize:13,cursor:'pointer',fontWeight:600}}>Đăng nhập</span></div></div></div></div>)}
function SetupPage({onSetup,error,loading}){const[u,setU]=useState('');const[p,setP]=useState('');const[fn,setFn]=useState('');return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:20}}><div style={{width:460,animation:'fadeSlideUp 0.5s ease'}}><div style={{textAlign:'center',marginBottom:40}}><div style={{fontSize:64,marginBottom:16}}>🚀</div><h1 style={{fontSize:28,fontWeight:700}}>Chào mừng đến NBECOM!</h1></div><div style={{...S.card,padding:32}}><h2 style={{fontSize:18,fontWeight:600,marginBottom:24,textAlign:'center'}}>⚙️ Tạo Admin</h2>{error&&<div style={{padding:12,borderRadius:8,background:'rgba(239,68,68,0.1)',color:'var(--red)',fontSize:13,marginBottom:16}}>⚠️ {error}</div>}<div style={{marginBottom:14}}><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>HỌ TÊN</label><input style={S.input} value={fn} onChange={e=>setFn(e.target.value)}/></div><div style={{marginBottom:14}}><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>USERNAME</label><input style={S.input} value={u} onChange={e=>setU(e.target.value)}/></div><div style={{marginBottom:24}}><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>MẬT KHẨU</label><input style={S.input} type="password" value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onSetup(u,p,fn)}/></div><button onClick={()=>onSetup(u,p,fn)} disabled={loading} style={{...S.btn,background:'linear-gradient(135deg,var(--accent),var(--purple))',color:'#fff',width:'100%',padding:14,fontSize:15}}>🔧 Tạo Admin</button></div></div></div>)}

// ─── User Management (giữ nguyên v4) ───
function UserMgmt({token,shops}){const SHOPS=shops||DEFAULT_SHOPS;const[users,setUsers]=useState([]);const[ld,setLd]=useState(true);const load=useCallback(async()=>{setLd(true);const r=await authAPI('getUsers',{token});if(r.success)setUsers(r.users);setLd(false)},[token]);useEffect(()=>{load()},[load]);const upd=async(u,role,status,shops)=>{await authAPI('updateUser',{token,targetUsername:u,newRole:role,newStatus:status,newShops:shops});load()};const del=async u=>{if(confirm('Xóa "'+u+'"?')){await authAPI('deleteUser',{token,targetUsername:u});load()}};const tog=(un,sn,cs)=>{const s=cs||[];upd(un,null,null,s.includes(sn)?s.filter(x=>x!==sn):[...s,sn])};const pend=users.filter(u=>u.status==='pending');const act=users.filter(u=>u.status!=='pending');return(<div style={{animation:'fadeSlideUp 0.4s ease'}}><h2 style={{fontSize:20,fontWeight:700,marginBottom:24}}>👥 Quản lý người dùng</h2>{pend.length>0&&<div style={{...S.card,marginBottom:20,borderColor:'var(--orange)'}}><h3 style={{fontSize:15,fontWeight:600,marginBottom:16,color:'var(--orange)'}}>⏳ Chờ duyệt ({pend.length})</h3>{pend.map(u=><div key={u.username} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid var(--border)'}}><div><div style={{fontWeight:600}}>{u.fullName}</div><div style={{fontSize:12,color:'var(--text-dim)'}}>@{u.username}</div></div><div style={{display:'flex',gap:8}}><select style={{...S.select,fontSize:12,padding:'6px 10px'}} defaultValue="seller" id={'r-'+u.username}><option value="manager">Manager</option><option value="seller">Seller</option><option value="designer">Designer</option></select><button onClick={()=>upd(u.username,document.getElementById('r-'+u.username).value,'active')} style={{...S.btn,background:'var(--green)',color:'#fff',fontSize:12,padding:'6px 14px'}}>✅</button><button onClick={()=>del(u.username)} style={{...S.btn,background:'rgba(239,68,68,0.1)',color:'var(--red)',fontSize:12,padding:'6px 14px'}}>❌</button></div></div>)}</div>}<div style={S.card}><h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>Thành viên ({act.length})</h3>{ld?<div style={{textAlign:'center',padding:40,color:'var(--text-dim)'}}>⏳</div>:<table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Họ tên','Username','Vai trò','Shop','TT',''].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>{act.map(u=><tr key={u.username}><td style={{...S.td,fontWeight:600}}>{u.fullName}</td><td style={{...S.td,...S.mono,color:'var(--text-dim)',fontSize:12}}>@{u.username}</td><td style={S.td}>{u.role==='admin'?<span style={S.badge(RC.admin)}>Admin</span>:<select style={{...S.select,fontSize:12,padding:'4px 8px'}} value={u.role} onChange={e=>upd(u.username,e.target.value,u.status)}><option value="manager">Manager</option><option value="seller">Seller</option><option value="designer">Designer</option></select>}</td><td style={S.td}>{u.role==='admin'?<span style={{fontSize:11,color:'var(--text-dim)'}}>Tất cả</span>:<div style={{display:'flex',flexWrap:'wrap',gap:4}}>{SHOPS.map(s=><label key={s.name} onClick={()=>tog(u.username,s.name,u.shops)} style={{padding:'3px 10px',borderRadius:8,fontSize:10,cursor:'pointer',fontWeight:600,display:'flex',alignItems:'center',gap:4,background:(u.shops||[]).includes(s.name)?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.05)',color:(u.shops||[]).includes(s.name)?'var(--green)':'var(--text-dim)',border:'1px solid '+((u.shops||[]).includes(s.name)?'var(--green)':'var(--border)')}}><span style={{fontSize:12}}>{(u.shops||[]).includes(s.name)?'✅':'⬜'}</span>{s.name.substring(0,12)}</label>)}</div>}</td><td style={S.td}><span style={S.badge(u.status==='active'?'var(--green)':'var(--red)')}>{u.status==='active'?'✅':'🚫'}</span></td><td style={S.td}>{u.role!=='admin'&&<div style={{display:'flex',gap:6}}>{u.status==='active'?<button onClick={()=>upd(u.username,u.role,'blocked')} style={{...S.btn,fontSize:11,padding:'4px 10px',background:'rgba(239,68,68,0.1)',color:'var(--red)'}}>Khóa</button>:<button onClick={()=>upd(u.username,u.role,'active')} style={{...S.btn,fontSize:11,padding:'4px 10px',background:'rgba(16,185,129,0.1)',color:'var(--green)'}}>Mở</button>}<button onClick={()=>del(u.username)} style={{...S.btn,fontSize:11,padding:'4px 10px',background:'rgba(239,68,68,0.05)',color:'var(--text-dim)'}}>Xóa</button></div>}</td></tr>)}</tbody></table>}</div></div>)}

// ─── CSV Upload (v4 + save to Redis) ───
function CSVUpload({onData,onStmt,token,shops}){const[shop,setShop]=useState('');const[es,setEs]=useState('Phương Nhi');const[mo,setMo]=useState('');const[drag,setDrag]=useState(false);const[proc,setProc]=useState(false);const[fns,setFns]=useState([]);const[err,setErr]=useState('');const[prev,setPrev]=useState(null);const[saving,setSaving]=useState(false);const fr=useRef(null);
const SHOPS=shops||DEFAULT_SHOPS;
const handle=useCallback(files=>{if(!shop){setErr('Chọn Shop trước');return}setErr('');setProc(true);const names=[];const fd={oi:null,st:null};let loaded=0;const total=files.length;for(const f of files){names.push(f.name);const reader=new FileReader();reader.onload=e=>{const txt=e.target.result;const fn=f.name.toLowerCase();if(fn.includes('orderitem')||fn.includes('soldorderitem'))fd.oi=txt;else if(fn.includes('statement')||fn.includes('activity'))fd.st=txt;else if(fn.includes('checkout')||fn.includes('payment'))fd.st=txt;else if(!fd.oi)fd.oi=txt;loaded++;if(loaded===total){try{
if(!fd.oi&&!fd.st){setErr('Cần ít nhất 1 file CSV');setProc(false);return}
// Statement-only upload: save statement without orders
if(!fd.oi&&fd.st){const stmtData=parseStatement(fd.st);setPrev({total:0,revenue:0,profit:0,basecost:0,matched:0,orders:[],stmtData,stmtOnly:true});setProc(false);return}
let orders=processOI(parseCSV(fd.oi),shop,es);if(!orders.length){setErr('Không tìm thấy đơn hàng');setProc(false);return}let stmtData=null;if(fd.st){stmtData=parseStatement(fd.st);orders=mergeAll(orders,stmtData)}const matched=orders.filter(o=>o.hasStatement).length;setPrev({total:orders.length,revenue:orders.reduce((s,o)=>s+(o.hasStatement?o.netUSD:o.revenue),0),profit:orders.reduce((s,o)=>s+o.profit,0),basecost:orders.reduce((s,o)=>s+o.basecost,0),matched,orders,stmtData});setProc(false)}catch(e){setErr('Lỗi: '+e.message);setProc(false)}}};reader.readAsText(f)}setFns(names)},[shop,es]);
const uSup=(idx,ns)=>{if(!prev)return;const u=[...prev.orders];const o={...u[idx]};o.supplier=ns;const bc=gBC(o.productType,o.size,ns)*o.quantity;o.basecost=bc;o.profit=o.hasStatement?o.netUSD-bc:o.revenue-o.platformFee-bc;u[idx]=o;setPrev({...prev,orders:u,basecost:u.reduce((s,o)=>s+o.basecost,0),profit:u.reduce((s,o)=>s+o.profit,0)})};
const confirmSave=async()=>{if(!prev)return;setSaving(true);
if(prev.stmtOnly){
// Statement-only: just save statement, no orders
if(prev.stmtData&&token&&mo){await authAPI('saveStatement',{token,stmtData:prev.stmtData,month:mo,shop})}
if(prev.stmtData)onStmt(prev.stmtData);
}else{
// Normal: save orders + statement
onData(prev2=>{const otherShop=prev2.filter(o=>o.shop!==shop);return[...otherShop,...prev.orders]});if(prev.stmtData)onStmt(prev.stmtData);
if(token&&mo){await authAPI('saveOrders',{token,orders:prev.orders,shop,month:mo});if(prev.stmtData)await authAPI('saveStatement',{token,stmtData:prev.stmtData,month:mo,shop})}
}
setSaving(false);setPrev(null);setFns([])};
return(<div style={{animation:'fadeSlideUp 0.4s ease'}}><h2 style={{fontSize:20,fontWeight:700,marginBottom:24}}>📤 Upload CSV</h2>
<div style={{...S.card,marginBottom:16,padding:16,background:'rgba(59,130,246,0.05)',borderColor:'var(--accent)'}}>
<div style={{fontSize:13,color:'var(--text)'}}>📋 <b>Hướng dẫn:</b> Vào Etsy → Shop Manager → Settings → Download Data</div>
<div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>File 1 (bắt buộc): <b>Order Items</b> | File 2 (nên có): <b>Statement CSV</b></div>
<div style={{fontSize:12,color:'var(--green)',marginTop:4}}>💾 Dữ liệu sẽ được lưu vào Redis Database trên server!</div>
</div>
<div style={{...S.card,marginBottom:20}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
<div><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>SHOP</label><select style={{...S.select,width:'100%'}} value={shop} onChange={e=>setShop(e.target.value)}><option value="">-- Chọn --</option>{SHOPS.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}</select></div>
<div><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>SUPPLIER THÊU</label><select style={{...S.select,width:'100%'}} value={es} onChange={e=>setEs(e.target.value)}><option value="Phương Nhi">Phương Nhi</option><option value="Pet">Pet</option></select><div style={{fontSize:10,color:'var(--text-dim)',marginTop:4}}>3D→Zootop Bear, Crochet→TRIO (tự động)</div></div>
<div><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>THÁNG</label><select style={{...S.select,width:'100%'}} value={mo} onChange={e=>setMo(e.target.value)}><option value="">-- Chọn --</option>{['01','02','03','04','05','06','07','08','09','10','11','12'].map(m=><option key={m} value={'2026-'+m}>Tháng {parseInt(m)}/2026</option>)}</select></div></div></div>
<div style={{...S.card,marginBottom:20}}><div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);handle(Array.from(e.dataTransfer.files))}} onClick={()=>fr.current?.click()} style={{border:'2px dashed '+(drag?'var(--accent)':'var(--border)'),borderRadius:12,padding:48,textAlign:'center',cursor:'pointer',background:drag?'rgba(59,130,246,0.05)':'transparent'}}><input ref={fr} type="file" accept=".csv" multiple style={{display:'none'}} onChange={e=>e.target.files?.length&&handle(Array.from(e.target.files))}/>{proc?<div>⏳ Đang xử lý...</div>:fns.length?<div><div style={{fontSize:36}}>📄</div>{fns.map((n,i)=><div key={i} style={{color:'var(--accent)',fontWeight:600,fontSize:13}}>{n}</div>)}</div>:<div><div style={{fontSize:48,marginBottom:8}}>📁</div><div style={{fontWeight:600}}>Kéo thả 1-2 file CSV vào đây</div></div>}</div>{err&&<div style={{marginTop:12,padding:12,borderRadius:8,background:'rgba(239,68,68,0.1)',color:'var(--red)',fontSize:13}}>⚠️ {err}</div>}</div>
{prev&&<div style={{...S.card,marginBottom:20,borderColor:'var(--accent)'}}>
{prev.stmtOnly?<div>
<h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>📊 Statement Only — Lưu dữ liệu tài chính</h3>
<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
<div style={{padding:14,borderRadius:10,background:'rgba(16,185,129,0.08)'}}><div style={{fontSize:11,color:'var(--text-dim)'}}>Doanh thu</div><div style={{fontSize:22,fontWeight:700,color:'var(--green)',...S.mono}}>{fVD(prev.stmtData.totalSales)}</div></div>
<div style={{padding:14,borderRadius:10,background:'rgba(239,68,68,0.08)'}}><div style={{fontSize:11,color:'var(--text-dim)'}}>Phí Etsy</div><div style={{fontSize:22,fontWeight:700,color:'var(--red)',...S.mono}}>{fVD(prev.stmtData.totalFees)}</div></div>
<div style={{padding:14,borderRadius:10,background:'rgba(245,158,11,0.08)'}}><div style={{fontSize:11,color:'var(--text-dim)'}}>Tax+VAT</div><div style={{fontSize:22,fontWeight:700,color:'var(--orange)',...S.mono}}>{fVD(prev.stmtData.totalTax+prev.stmtData.totalVAT)}</div></div>
</div>
<div style={{fontSize:12,color:'var(--text-muted)',marginBottom:16}}>💡 Statement sẽ được merge với orders đã có trong database để tính profit chính xác.</div>
<div style={{display:'flex',gap:12}}><button onClick={confirmSave} disabled={saving} style={{...S.btn,background:'var(--green)',color:'#fff',flex:1}}>{saving?'⏳ Đang lưu...':'✅ Lưu Statement vào Database'}</button><button onClick={()=>{setPrev(null);setFns([])}} style={{...S.btn,background:'var(--border)',color:'var(--text-muted)'}}>Hủy</button></div>
</div>:<div><h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>Xác nhận ({prev.total} đơn) {prev.matched>0&&<span style={{...S.badge('var(--green)'),marginLeft:8}}>✅ {prev.matched}/{prev.total} chính xác 100%</span>}{prev.matched===0&&<span style={{...S.badge('var(--orange)'),marginLeft:8}}>⚠️ Profit ước tính</span>}</h3>
<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
<div style={{padding:14,borderRadius:10,background:'rgba(16,185,129,0.08)'}}><div style={{fontSize:11,color:'var(--text-dim)'}}>Net</div><div style={{fontSize:22,fontWeight:700,color:'var(--green)',...S.mono}}>{fU(prev.revenue)}</div></div>
<div style={{padding:14,borderRadius:10,background:'rgba(245,158,11,0.08)'}}><div style={{fontSize:11,color:'var(--text-dim)'}}>Basecost</div><div style={{fontSize:22,fontWeight:700,color:'var(--orange)',...S.mono}}>{fU(prev.basecost)}</div></div>
<div style={{padding:14,borderRadius:10,background:prev.profit>=0?'rgba(16,185,129,0.08)':'rgba(239,68,68,0.08)'}}><div style={{fontSize:11,color:'var(--text-dim)'}}>PROFIT</div><div style={{fontSize:22,fontWeight:700,color:prev.profit>=0?'var(--green)':'var(--red)',...S.mono}}>{fU(prev.profit)}</div><div style={{fontSize:10,color:'var(--text-dim)'}}>{fVD(prev.profit*RATE)}</div></div>
</div>
<div style={{maxHeight:350,overflowY:'auto',overflowX:'auto',marginBottom:16}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}><thead style={{position:'sticky',top:0,background:'var(--card)',zIndex:2}}><tr>{['#','','Ngày','SP','Size','Màu','Buyer','Supplier','Net','BC','Profit','🔗'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>{prev.orders.map((o,i)=><tr key={i}><td style={{...S.td,...S.mono,color:'var(--text-dim)',fontSize:11}}>{i+1}</td><td style={{...S.td,fontSize:18,textAlign:'center'}}>{o.icon}</td><td style={{...S.td,fontSize:12}}>{o.date}</td><td style={{...S.td,fontWeight:600}}>{o.productType}</td><td style={{...S.td,...S.mono,textAlign:'center'}}>{o.size}</td><td style={{...S.td,fontSize:12}}>{o.color}</td><td style={{...S.td,fontSize:12,maxWidth:100,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.buyer}</td><td style={S.td}>{o.autoSup?<span style={S.badge('var(--green)')}>{o.supplier}</span>:<select style={{...S.select,fontSize:11,padding:'3px 6px'}} value={o.supplier} onChange={e=>uSup(i,e.target.value)}><option value="Phương Nhi">P.Nhi</option><option value="Pet">Pet</option></select>}</td><td style={{...S.td,...S.mono,color:'var(--accent-light)'}}>{o.hasStatement?<span title={'Net VND: '+fVD(o.netVND)}>{fU(o.netUSD)} ✓</span>:fU(o.revenue)}</td><td style={{...S.td,...S.mono,color:'var(--orange)'}}>{fU(o.basecost)}</td><td style={{...S.td,...S.mono,fontWeight:600,color:o.profit>=0?'var(--green)':'var(--red)'}}>{fU(o.profit)}</td><td style={S.td}>{o.etsyLink?<a href={o.etsyLink} target="_blank" rel="noopener noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>🔗</a>:''}</td></tr>)}</tbody></table></div>
<div style={{display:'flex',gap:12}}><button onClick={confirmSave} disabled={saving} style={{...S.btn,background:'var(--green)',color:'#fff',flex:1}}>{saving?'⏳ Đang lưu...':'✅ Xác nhận & Lưu vào Database ('+prev.total+' đơn)'}</button><button onClick={()=>{setPrev(null);setFns([])}} style={{...S.btn,background:'var(--border)',color:'var(--text-muted)'}}>Hủy</button></div></div>}</div>}</div>)}

// ─── Orders View (v4 + month filter + images) ───
function OrdersView({orders,userShops,isAdmin,images,shops}){const[df,setDf]=useState('all');const[sf,setSf]=useState('');const[mf,setMf]=useState('');const[q,setQ]=useState('');const[sel,setSel]=useState(null);const[page,setPage]=useState(1);const PER_PAGE=50;
const isDigitalShop=(name)=>(shops||[]).find(s=>s.name===name)?.type==='Digital';
const vis=isAdmin?orders:orders.filter(o=>(userShops||[]).includes(o.shop));
const ams=useMemo(()=>{const s=new Set();vis.forEach(o=>{const{m,y}=gMY(o.date);if(m&&y)s.add(`${y}-${String(m).padStart(2,'0')}`)});return Array.from(s).sort().reverse()},[vis]);
let fl=vis;
if(mf){const[fy,fm]=mf.split('-').map(Number);fl=fl.filter(o=>{const{m,y}=gMY(o.date);return m===fm&&y===fy})}
if(df!=='all'){const now=new Date(),td=new Date(now.getFullYear(),now.getMonth(),now.getDate());fl=fl.filter(o=>{const p=o.date.split('/');if(p.length<3)return true;const d=new Date(2000+parseInt(p[2]),parseInt(p[0])-1,parseInt(p[1]));if(df==='today')return d>=td;if(df==='yesterday'){const y=new Date(td);y.setDate(y.getDate()-1);return d>=y&&d<td}if(df==='7days'){const x=new Date(td);x.setDate(x.getDate()-7);return d>=x}if(df==='30days'){const x=new Date(td);x.setDate(x.getDate()-30);return d>=x}if(df==='1year'){const x=new Date(td);x.setFullYear(x.getFullYear()-1);return d>=x}return true})}
if(sf)fl=fl.filter(o=>o.shop===sf);if(q){const ql=q.toLowerCase();fl=fl.filter(o=>o.buyer.toLowerCase().includes(ql)||o.productType.toLowerCase().includes(ql)||o.orderId.includes(ql)||o.sku.toLowerCase().includes(ql)||(o.itemName||'').toLowerCase().includes(ql))}
const tN=fl.reduce((s,o)=>s+(o.hasStatement?o.netUSD:o.revenue),0);const tP=fl.reduce((s,o)=>s+o.profit,0);
return(<div style={{animation:'fadeSlideUp 0.4s ease'}}><h2 style={{fontSize:20,fontWeight:700,marginBottom:16}}>📦 Đơn hàng</h2>
<div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
{[['all','Tất cả'],['today','Hôm nay'],['yesterday','Hôm qua'],['7days','7 ngày'],['30days','30 ngày'],['1year','1 năm']].map(([k,l])=><button key={k} onClick={()=>{setDf(k);setPage(1)}} style={{...S.btn,fontSize:12,padding:'6px 16px',background:df===k?'var(--accent)':'var(--border)',color:df===k?'#fff':'var(--text-muted)'}}>{l}</button>)}
<select style={{...S.select,fontSize:12,padding:'6px 10px'}} value={mf} onChange={e=>setMf(e.target.value)}><option value="">📅 Tất cả tháng</option>{ams.map(m=>{const[y,mo]=m.split('-');return<option key={m} value={m}>{MN[parseInt(mo)]}/{y}</option>})}</select>
<select style={{...S.select,fontSize:12,padding:'6px 10px'}} value={sf} onChange={e=>setSf(e.target.value)}><option value="">Tất cả shop</option>{[...new Set(vis.map(o=>o.shop))].map(s=><option key={s} value={s}>{s}</option>)}</select>
<input placeholder="🔍 Tìm buyer, SP, SKU..." style={{...S.input,width:220,padding:'6px 12px',fontSize:12}} value={q} onChange={e=>setQ(e.target.value)}/></div>
{fl.length>0&&<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}><div style={{...S.card,padding:16}}><div style={{fontSize:11,color:'var(--text-dim)'}}>ĐƠN</div><div style={{fontSize:22,fontWeight:700,...S.mono}}>{fl.length}</div></div><div style={{...S.card,padding:16}}><div style={{fontSize:11,color:'var(--text-dim)'}}>NET</div><div style={{fontSize:22,fontWeight:700,color:'var(--green)',...S.mono}}>{fU(tN)}</div></div><div style={{...S.card,padding:16}}><div style={{fontSize:11,color:'var(--text-dim)'}}>PROFIT</div><div style={{fontSize:22,fontWeight:700,color:tP>=0?'var(--green)':'var(--red)',...S.mono}}>{fU(tP)}</div><div style={{fontSize:10,color:'var(--text-dim)'}}>{fVD(tP*RATE)}</div></div></div>}
{fl.length===0?<div style={{...S.card,textAlign:'center',padding:60}}><div style={{fontSize:48}}>📭</div><div style={{color:'var(--text-muted)',marginTop:12}}>Không có đơn</div></div>:
<div style={S.card}><div style={{maxHeight:600,overflowY:'auto',overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:1700}}>
<thead style={{position:'sticky',top:0,background:'var(--card)',zIndex:2}}><tr>{['#','','Ngày','Order','Shop','Sản phẩm','Size','Màu','SKU','Supplier','Buyer','Địa chỉ','🌍','Net','Basecost','Profit','TT','Etsy'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
<tbody>{fl.slice((page-1)*PER_PAGE,page*PER_PAGE).map((o,i)=><tr key={o.transactionId||i} onClick={()=>setSel(o)} style={{cursor:'pointer'}}>
<td style={{...S.td,...S.mono,color:'var(--text-dim)',fontSize:11}}>{(page-1)*PER_PAGE+i+1}</td>
<td style={{...S.td,textAlign:'center'}}>{images[o.listingId]?<img src={images[o.listingId]} style={{width:28,height:28,borderRadius:6,objectFit:'cover'}} alt="" onError={e=>{e.target.style.display='none'}}/>:<span style={{fontSize:18}}>{o.icon}</span>}</td>
<td style={{...S.td,fontSize:12,whiteSpace:'nowrap'}}>{o.date}</td>
<td style={{...S.td,...S.mono,color:'var(--accent)',fontSize:10}}>{o.orderId?.substring(0,10)}</td>
<td style={S.td}><span style={S.badge('var(--accent)')}>{o.shop?.substring(0,12)}</span></td>
<td style={{...S.td,fontWeight:600}} title={o.itemName}>{o.productType}</td>
<td style={{...S.td,...S.mono,textAlign:'center'}}>{isDigitalShop(o.shop)?'':o.size}</td>
<td style={{...S.td,fontSize:12}}>{isDigitalShop(o.shop)?'':o.color}</td>
<td style={{...S.td,...S.mono,fontSize:10,color:'var(--text-dim)'}}>{o.sku}</td>
<td style={S.td}><span style={S.badge(o.supplier==='Zootop Bear'?'var(--orange)':o.supplier==='TRIO'?'var(--purple)':'var(--green)')}>{o.supplier}</span></td>
<td style={{...S.td,fontSize:12,maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.buyer}</td>
<td style={{...S.td,fontSize:11,color:'var(--text-dim)',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={o.address}>{isDigitalShop(o.shop)?'—':o.address?.substring(0,40)}</td>
<td style={{...S.td,fontSize:12}}>{cF(o.country)}</td>
<td style={{...S.td,...S.mono,color:'var(--accent-light)'}} title={o.hasStatement?'Net VND: '+fVD(o.netVND):'Ước tính'}>{fU(o.hasStatement?o.netUSD:o.revenue)}{o.hasStatement&&' ✓'}</td>
<td style={{...S.td,...S.mono,color:'var(--orange)'}}>{fU(o.basecost)}</td>
<td style={{...S.td,...S.mono,fontWeight:600,color:o.profit>=0?'var(--green)':'var(--red)'}}>{fU(o.profit)}</td>
<td style={S.td}><span style={S.badge(o.status==='Shipped'?'var(--green)':o.status==='Paid'?'var(--accent)':'var(--orange)')}>{o.status==='Shipped'?'✓':'$'}</span></td>
<td style={S.td}>{o.etsyLink?<a href={o.etsyLink} target="_blank" rel="noopener noreferrer" style={{color:'var(--accent)',textDecoration:'none',fontSize:16}} onClick={e=>e.stopPropagation()}>🔗</a>:''}</td>
</tr>)}</tbody></table></div>
{/* Pagination */}
{fl.length>PER_PAGE&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',marginTop:8}}>
<div style={{fontSize:12,color:'var(--text-dim)'}}>Trang {page}/{Math.ceil(fl.length/PER_PAGE)} • {fl.length} đơn</div>
<div style={{display:'flex',gap:6}}>
<button onClick={()=>{setPage(Math.max(1,page-1))}} disabled={page===1} style={{...S.btn,fontSize:12,padding:'6px 14px',background:page===1?'var(--border)':'var(--accent)',color:page===1?'var(--text-dim)':'#fff'}}>← Trước</button>
{Array.from({length:Math.min(5,Math.ceil(fl.length/PER_PAGE))},(_,i)=>{const p=page<=3?i+1:page-2+i;if(p<1||p>Math.ceil(fl.length/PER_PAGE))return null;return<button key={p} onClick={()=>setPage(p)} style={{...S.btn,fontSize:12,padding:'6px 12px',background:p===page?'var(--accent)':'var(--border)',color:p===page?'#fff':'var(--text-muted)',minWidth:36}}>{p}</button>})}
<button onClick={()=>{setPage(Math.min(Math.ceil(fl.length/PER_PAGE),page+1))}} disabled={page>=Math.ceil(fl.length/PER_PAGE)} style={{...S.btn,fontSize:12,padding:'6px 14px',background:page>=Math.ceil(fl.length/PER_PAGE)?'var(--border)':'var(--accent)',color:page>=Math.ceil(fl.length/PER_PAGE)?'var(--text-dim)':'#fff'}}>Sau →</button>
</div></div>}
</div>}
{sel&&<div onClick={e=>{if(e.target===e.currentTarget)setSel(null)}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(6px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',animation:'fadeIn 0.2s'}}><div style={{...S.card,maxWidth:540,width:'90%',maxHeight:'85vh',overflowY:'auto',animation:'fadeSlideUp 0.25s'}}>
<div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}><div><div style={{fontSize:16,fontWeight:700}}>Đơn #{sel.orderId}</div><div style={{fontSize:12,color:'var(--text-dim)'}}>{sel.shop} • {sel.date}</div></div><button onClick={()=>setSel(null)} style={{...S.btn,padding:'4px 12px'}}>✕</button></div>
<div style={{display:'flex',gap:14,marginBottom:16,padding:14,background:'var(--bg)',borderRadius:12}}>{images[sel.listingId]?<img src={images[sel.listingId]} style={{width:72,height:72,borderRadius:10,objectFit:'cover'}} alt=""/>:<div style={{width:72,height:72,borderRadius:10,background:'var(--card-hover)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}}>{sel.icon}</div>}<div><div style={{fontWeight:600,lineHeight:1.4}}>{sel.itemName}</div><div style={{fontSize:12,color:'var(--text-dim)',marginTop:4}}>{sel.productType}{!isDigitalShop(sel.shop)&&(' • '+sel.size+' • '+sel.color)}</div><div style={{fontSize:11,color:'var(--text-dim)'}}>SKU: {sel.sku}</div></div></div>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:16}}><div style={{padding:12,background:'var(--bg)',borderRadius:8}}><div style={{fontSize:10,color:'var(--text-dim)'}}>Net</div><div style={{fontSize:16,fontWeight:700,color:'var(--green)',...S.mono}}>{fU(sel.hasStatement?sel.netUSD:sel.revenue)}</div></div><div style={{padding:12,background:'var(--bg)',borderRadius:8}}><div style={{fontSize:10,color:'var(--text-dim)'}}>Basecost</div><div style={{fontSize:16,fontWeight:700,color:'var(--orange)',...S.mono}}>{fU(sel.basecost)}</div></div><div style={{padding:12,background:'var(--bg)',borderRadius:8}}><div style={{fontSize:10,color:'var(--text-dim)'}}>Profit</div><div style={{fontSize:16,fontWeight:700,color:sel.profit>=0?'var(--green)':'var(--red)',...S.mono}}>{fU(sel.profit)}</div></div></div>
{!isDigitalShop(sel.shop)&&<div style={{padding:14,background:'var(--bg)',borderRadius:12,marginBottom:12}}><div style={{fontSize:12,fontWeight:600,marginBottom:8}}>📦 Ship đến</div><div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}><div><b>{sel.buyer}</b></div><div>{sel.address}</div><div>{cF(sel.country)} {sel.country}</div></div></div>}
{sel.personalization&&<div style={{padding:14,background:'var(--bg)',borderRadius:12}}><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>✏️ Personalization</div><div style={{fontSize:12,color:'var(--text-muted)',whiteSpace:'pre-wrap'}}>{sel.personalization}</div></div>}
</div></div>}
</div>)}

// ─── Reports (v5.2 + filters) ───
function Reports({orders:allOrders,stmtData,images,shops,perShopStmt}){
const[df,setDf]=useState('all');const[sf,setSf]=useState('');const[mf,setMf]=useState('');
const activeStmt=useMemo(()=>{if(sf&&perShopStmt&&perShopStmt[sf])return perShopStmt[sf];return stmtData},[sf,perShopStmt,stmtData]);
const ams=useMemo(()=>{const s=new Set();allOrders.forEach(o=>{const{m,y}=gMY(o.date);if(m&&y)s.add(`${y}-${String(m).padStart(2,'0')}`)});return Array.from(s).sort().reverse()},[allOrders]);
const orders=useMemo(()=>{let fl=allOrders;
if(mf){const[fy,fm]=mf.split('-').map(Number);fl=fl.filter(o=>{const{m,y}=gMY(o.date);return m===fm&&y===fy})}
if(df!=='all'){const now=new Date(),td=new Date(now.getFullYear(),now.getMonth(),now.getDate());fl=fl.filter(o=>{const p=o.date.split('/');if(p.length<3)return true;const d=new Date(2000+parseInt(p[2]),parseInt(p[0])-1,parseInt(p[1]));if(df==='today')return d>=td;if(df==='yesterday'){const y2=new Date(td);y2.setDate(y2.getDate()-1);return d>=y2&&d<td}if(df==='7days'){const x=new Date(td);x.setDate(x.getDate()-7);return d>=x}if(df==='30days'){const x=new Date(td);x.setDate(x.getDate()-30);return d>=x}if(df==='1year'){const x=new Date(td);x.setFullYear(x.getFullYear()-1);return d>=x}return true})}
if(sf)fl=fl.filter(o=>o.shop===sf);return fl},[allOrders,df,sf,mf]);
if(!allOrders.length)return<div style={{...S.card,textAlign:'center',padding:60}}><div style={{fontSize:48}}>📊</div><div style={{color:'var(--text-muted)',marginTop:12}}>Upload CSV để xem</div></div>;
const byShop={};orders.forEach(o=>{if(!byShop[o.shop])byShop[o.shop]={n:0,net:0,bc:0,prof:0};byShop[o.shop].n+=o.quantity;byShop[o.shop].net+=o.hasStatement?o.netUSD:o.revenue;byShop[o.shop].bc+=o.basecost;byShop[o.shop].prof+=o.profit});const byProd={};orders.forEach(o=>{if(!byProd[o.productType])byProd[o.productType]={n:0,rev:0,prof:0,icon:o.icon,lid:o.listingId};byProd[o.productType].n+=o.quantity;byProd[o.productType].rev+=o.hasStatement?o.netUSD:o.revenue;byProd[o.productType].prof+=o.profit});const tN=orders.reduce((s,o)=>s+(o.hasStatement?o.netUSD:o.revenue),0);const tP=orders.reduce((s,o)=>s+o.profit,0);const tBC=orders.reduce((s,o)=>s+o.basecost,0);
const stmtMatched=orders.filter(o=>o.hasStatement);
const displayStmt=activeStmt;
return(<div style={{animation:'fadeSlideUp 0.4s ease'}}><h2 style={{fontSize:20,fontWeight:700,marginBottom:16}}>📈 Báo cáo</h2>
<div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
{[['all','Tất cả'],['today','Hôm nay'],['yesterday','Hôm qua'],['7days','7 ngày'],['30days','30 ngày'],['1year','1 năm']].map(([k,l])=><button key={k} onClick={()=>setDf(k)} style={{...S.btn,fontSize:12,padding:'6px 16px',background:df===k?'var(--accent)':'var(--border)',color:df===k?'#fff':'var(--text-muted)'}}>{l}</button>)}
<select style={{...S.select,fontSize:12,padding:'6px 10px'}} value={mf} onChange={e=>setMf(e.target.value)}><option value="">📅 Tất cả tháng</option>{ams.map(m=>{const[y,mo]=m.split('-');return<option key={m} value={m}>{MN[parseInt(mo)]}/{y}</option>})}</select>
<select style={{...S.select,fontSize:12,padding:'6px 10px'}} value={sf} onChange={e=>setSf(e.target.value)}><option value="">🏪 Tất cả shop</option>{[...new Set(allOrders.map(o=>o.shop))].map(s=><option key={s} value={s}>{s}</option>)}</select>
</div>
{displayStmt&&<div style={{...S.card,marginBottom:20,borderColor:'var(--green)'}}>
<h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>💰 Tổng kết tài chính (Etsy Statement){sf&&<span style={{fontSize:11,fontWeight:400,color:'var(--green)',marginLeft:8}}>• {sf}</span>}</h3>
<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
<div style={{padding:14,borderRadius:10,background:'rgba(16,185,129,0.06)'}}><div style={{fontSize:10,color:'var(--text-dim)'}}>📦 Doanh thu</div><div style={{fontSize:20,fontWeight:700,color:'var(--green)',...S.mono}}>{fVD(displayStmt.totalSales)}</div></div>
<div style={{padding:14,borderRadius:10,background:'rgba(239,68,68,0.06)'}}><div style={{fontSize:10,color:'var(--text-dim)'}}>🏪 Phí Etsy</div><div style={{fontSize:20,fontWeight:700,color:'var(--red)',...S.mono}}>{fVD(displayStmt.totalFees)}</div></div>
<div style={{padding:14,borderRadius:10,background:'rgba(245,158,11,0.06)'}}><div style={{fontSize:10,color:'var(--text-dim)'}}>🏛️ Tax+VAT</div><div style={{fontSize:20,fontWeight:700,color:'var(--orange)',...S.mono}}>{fVD(displayStmt.totalTax+displayStmt.totalVAT)}</div></div>
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
<div style={{padding:14,borderRadius:10,background:'rgba(139,92,246,0.06)'}}><div style={{fontSize:10,color:'var(--text-dim)'}}>📢 Etsy Ads</div><div style={{fontSize:20,fontWeight:700,color:'var(--purple)',...S.mono}}>{fVD(displayStmt.totalAds)}</div></div>
<div style={{padding:14,borderRadius:10,background:'rgba(59,130,246,0.06)'}}><div style={{fontSize:10,color:'var(--text-dim)'}}>🏭 Basecost</div><div style={{fontSize:20,fontWeight:700,color:'var(--accent)',...S.mono}}>{fU(tBC)} ({fVD(tBC*RATE)})</div></div>
<div style={{padding:14,borderRadius:10,background:tP>=0?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',border:'2px solid '+(tP>=0?'var(--green)':'var(--red)')}}><div style={{fontSize:10,color:'var(--text-dim)'}}>💎 PROFIT THỰC</div><div style={{fontSize:22,fontWeight:700,color:tP>=0?'var(--green)':'var(--red)',...S.mono}}>{fU(tP)}</div><div style={{fontSize:12,fontWeight:600,color:tP>=0?'var(--green)':'var(--red)'}}>{fVD(tP*RATE)}</div></div>
</div></div>}
{displayStmt?.typeBreakdown&&<div style={{...S.card,marginBottom:20,borderColor:'var(--orange)',background:'rgba(245,158,11,0.03)'}}><details><summary style={{cursor:'pointer',fontSize:13,fontWeight:600,color:'var(--orange)'}}>🔍 Debug: Statement Type Breakdown (click để xem)</summary><div style={{marginTop:12}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Type','Rows','Amount','Fees & Taxes','Net'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>{Object.entries(displayStmt.typeBreakdown).sort((a,b)=>b[1].count-a[1].count).map(([t,d])=><tr key={t}><td style={{...S.td,fontWeight:600}}>{t}</td><td style={{...S.td,...S.mono}}>{d.count}</td><td style={{...S.td,...S.mono,color:d.amount>=0?'var(--green)':'var(--red)'}}>{fVD(d.amount)}</td><td style={{...S.td,...S.mono,color:d.fee>=0?'var(--green)':'var(--red)'}}>{fVD(d.fee)}</td><td style={{...S.td,...S.mono,color:d.net>=0?'var(--green)':'var(--red)'}}>{fVD(d.net)}</td></tr>)}</tbody></table></div></details></div>}
<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
<div style={S.card}><div style={{fontSize:12,color:'var(--text-dim)'}}>ĐƠN</div><div style={{fontSize:24,fontWeight:700,...S.mono}}>{orders.length}</div></div>
<div style={S.card}><div style={{fontSize:12,color:'var(--text-dim)'}}>NET</div><div style={{fontSize:24,fontWeight:700,color:'var(--green)',...S.mono}}>{fU(tN)}</div></div>
<div style={S.card}><div style={{fontSize:12,color:'var(--text-dim)'}}>PROFIT</div><div style={{fontSize:24,fontWeight:700,color:'var(--purple)',...S.mono}}>{fU(tP)}</div><div style={{fontSize:11,color:'var(--text-dim)'}}>{fVD(tP*RATE)}</div></div>
<div style={S.card}><div style={{fontSize:12,color:'var(--text-dim)'}}>MARGIN</div><div style={{fontSize:24,fontWeight:700,...S.mono}}>{tN>0?(tP/tN*100).toFixed(1)+'%':'-'}</div></div>
</div>
<div style={{...S.card,marginBottom:20}}><h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>Theo Sản phẩm</h3><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['','SP','SL','Net','Profit','Margin'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>{Object.entries(byProd).sort((a,b)=>b[1].rev-a[1].rev).map(([pt,d])=><tr key={pt}><td style={{...S.td,textAlign:'center'}}>{images[d.lid]?<img src={images[d.lid]} style={{width:24,height:24,borderRadius:5,objectFit:'cover'}} alt=""/>:<span>{d.icon}</span>}</td><td style={{...S.td,fontWeight:600}}>{pt}</td><td style={{...S.td,...S.mono}}>{d.n}</td><td style={{...S.td,...S.mono,color:'var(--accent-light)'}}>{fU(d.rev)}</td><td style={{...S.td,...S.mono,fontWeight:700,color:d.prof>=0?'var(--green)':'var(--red)'}}>{fU(d.prof)}</td><td style={{...S.td,...S.mono}}>{d.rev>0?(d.prof/d.rev*100).toFixed(1)+'%':'-'}</td></tr>)}</tbody></table></div>
<div style={S.card}><h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>Theo Shop</h3><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Shop','Đơn','Net','Basecost','Profit','Margin'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>{Object.entries(byShop).sort((a,b)=>b[1].net-a[1].net).map(([sh,d])=><tr key={sh}><td style={{...S.td,fontWeight:600}}>{sh}</td><td style={{...S.td,...S.mono}}>{d.n}</td><td style={{...S.td,...S.mono,color:'var(--accent-light)'}}>{fU(d.net)}</td><td style={{...S.td,...S.mono,color:'var(--orange)'}}>{fU(d.bc)}</td><td style={{...S.td,...S.mono,fontWeight:700,color:d.prof>=0?'var(--green)':'var(--red)'}}>{fU(d.prof)}</td><td style={{...S.td,...S.mono}}>{d.net>0?(d.prof/d.net*100).toFixed(1)+'%':'-'}</td></tr>)}</tbody></table></div></div>)}

// ─── Product Listings — Etsy Manager Style (v5.3) ───
function ProductImages({orders,images,token,onUpdateImages,shops}){
const isDigitalShop=(name)=>(shops||[]).find(s=>s.name===name)?.type==='Digital';
const[editId,setEditId]=useState(null);const[editUrl,setEditUrl]=useState('');const[sf,setSf]=useState('');const[viewMode,setViewMode]=useState('grid');const[showImport,setShowImport]=useState(false);const[importJson,setImportJson]=useState('');const[syncing,setSyncing]=useState(false);const[syncMsg,setSyncMsg]=useState('');
const syncShopImages=async(shopName)=>{setSyncing(true);setSyncMsg('Đang lấy ảnh từ Etsy...');try{const r=await authAPI('syncShopImages',{token,shopUrl:shopName});if(r.success){setSyncMsg('✅ '+r.message);const imgRes=await authAPI('loadImages',{token});if(imgRes.success)onUpdateImages(imgRes.images||{})}else{setSyncMsg('❌ '+r.error)}}catch(e){setSyncMsg('❌ Lỗi: '+e.message)}setSyncing(false);setTimeout(()=>setSyncMsg(''),8000)};
const filteredOrders=useMemo(()=>sf?orders.filter(o=>o.shop===sf):orders,[orders,sf]);
const listings=useMemo(()=>{const m={};filteredOrders.forEach(o=>{if(o.listingId&&!m[o.listingId])m[o.listingId]={name:o.itemName?.substring(0,120),pt:o.productType,icon:o.icon,n:0,rev:0,profit:0,sizes:new Set(),colors:new Set(),lid:o.listingId,link:o.etsyLink,shop:o.shop,sku:o.sku,prices:[],last30:0};if(o.listingId){m[o.listingId].n+=o.quantity;m[o.listingId].rev+=o.hasStatement?o.netUSD:o.revenue;m[o.listingId].profit+=o.profit;m[o.listingId].prices.push(parseFloat(o.revenue)||0);if(o.size)m[o.listingId].sizes.add(o.size);if(o.color)m[o.listingId].colors.add(o.color);
const p=o.date?.split('/');if(p&&p.length>=3){const d=new Date(2000+parseInt(p[2]),parseInt(p[0])-1,parseInt(p[1]));const ago30=new Date();ago30.setDate(ago30.getDate()-30);if(d>=ago30)m[o.listingId].last30+=o.quantity}}});return Object.entries(m).sort((a,b)=>b[1].n-a[1].n)},[filteredOrders]);
const setImg=async(lid,url)=>{const ni={...images,[lid]:url};onUpdateImages(ni);if(token)await authAPI('saveImages',{token,images:ni})};
const importFromExtension=async()=>{try{const parsed=JSON.parse(importJson);const count=Object.keys(parsed).length;if(count===0){alert('JSON rỗng!');return}const ni={...images,...parsed};onUpdateImages(ni);if(token)await authAPI('saveImages',{token,images:ni});setShowImport(false);setImportJson('');alert('Đã import '+count+' ảnh thành công!')}catch(e){alert('JSON không hợp lệ: '+e.message)}};
const totalWithImg=Object.keys(images).filter(k=>images[k]).length;
const totalListings=listings.length;const activeListings=listings.filter(([,d])=>d.n>0).length;
return(<div style={{animation:'fadeSlideUp 0.4s'}}>
{/* Header like Etsy */}
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
<div><h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Listings</h2>
<div style={{fontSize:12,color:'var(--text-dim)'}}>{totalWithImg} / {totalListings} có ảnh • {activeListings} active</div></div>
<div style={{display:'flex',gap:8,alignItems:'center'}}>
<select style={{...S.select,fontSize:12,padding:'6px 10px'}} value={sf} onChange={e=>setSf(e.target.value)}><option value="">🏪 Tất cả shop</option>{[...new Set(orders.map(o=>o.shop))].map(s=><option key={s} value={s}>{s}</option>)}</select>
<div style={{display:'flex',border:'1px solid var(--border)',borderRadius:6,overflow:'hidden'}}>
<button onClick={()=>setViewMode('grid')} style={{padding:'6px 10px',background:viewMode==='grid'?'var(--accent)':'transparent',color:viewMode==='grid'?'#fff':'var(--text-dim)',border:'none',cursor:'pointer',fontSize:14}}>⊞</button>
<button onClick={()=>setViewMode('list')} style={{padding:'6px 10px',background:viewMode==='list'?'var(--accent)':'transparent',color:viewMode==='list'?'#fff':'var(--text-dim)',border:'none',cursor:'pointer',fontSize:14}}>☰</button>
</div>
<button onClick={()=>setShowImport(true)} style={{...S.btn,fontSize:12,padding:'8px 14px',background:'var(--purple)',color:'#fff'}}>📥 Import JSON</button>
<button onClick={()=>{const shops=[...new Set(orders.map(o=>o.shop))];if(sf){syncShopImages(sf)}else if(shops.length>0){syncShopImages(shops[0])}else{setSyncMsg('Chọn shop trước')}}} disabled={syncing} style={{...S.btn,fontSize:12,padding:'8px 14px',background:syncing?'var(--border)':'var(--green)',color:syncing?'var(--text-dim)':'#fff'}}>{syncing?'⏳ Đang sync...':'🔄 Sync ảnh từ Etsy'}</button>
</div></div>
{syncMsg&&<div style={{padding:'10px 16px',borderRadius:8,marginBottom:16,fontSize:13,background:syncMsg.includes('✅')?'rgba(16,185,129,0.1)':syncMsg.includes('❌')?'rgba(239,68,68,0.1)':'rgba(59,130,246,0.1)',color:syncMsg.includes('✅')?'var(--green)':syncMsg.includes('❌')?'var(--red)':'var(--accent)'}}>{syncMsg}</div>}
{/* Stats bar */}
<div style={{display:'flex',gap:12,marginBottom:20}}>
<div style={{padding:'8px 16px',borderRadius:8,background:'rgba(16,185,129,0.08)',display:'flex',alignItems:'center',gap:6}}><span style={{width:8,height:8,borderRadius:'50%',background:'var(--green)'}}></span><span style={{fontSize:12,color:'var(--text)'}}>Active</span><span style={{fontSize:12,fontWeight:700,color:'var(--green)',...S.mono}}>{activeListings}</span></div>
<div style={{padding:'8px 16px',borderRadius:8,background:'rgba(245,158,11,0.08)',display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:12,color:'var(--text)'}}>Tổng bán</span><span style={{fontSize:12,fontWeight:700,color:'var(--orange)',...S.mono}}>{listings.reduce((s,[,d])=>s+d.n,0)}</span></div>
<div style={{padding:'8px 16px',borderRadius:8,background:'rgba(59,130,246,0.08)',display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:12,color:'var(--text)'}}>Revenue</span><span style={{fontSize:12,fontWeight:700,color:'var(--accent)',...S.mono}}>{fU(listings.reduce((s,[,d])=>s+d.rev,0))}</span></div>
</div>
{/* Grid View */}
{viewMode==='grid'?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
{listings.map(([lid,info])=>{const minP=Math.min(...info.prices);const maxP=Math.max(...info.prices);return<div key={lid} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',cursor:'pointer',transition:'border-color 0.2s'}} onClick={()=>{setEditId(lid);setEditUrl(images[lid]||'')}}>
{/* Image */}
<div style={{width:'100%',aspectRatio:'4/3',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',position:'relative'}}>
{images[lid]?<img src={images[lid]} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex'}}/>:null}
<div style={{display:images[lid]?'none':'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',fontSize:56,background:'var(--bg)'}}>{info.icon}</div>
</div>
{/* Info */}
<div style={{padding:'12px 14px'}}>
<div style={{fontSize:13,fontWeight:600,marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} title={info.name}>{info.name?.substring(0,45)}...</div>
<div style={{fontSize:11,color:'var(--text-dim)',marginBottom:4,...S.mono}}>{info.sku||'—'}</div>
<div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:8}}>{minP===maxP?fU(minP):`${fU(minP)} - ${fU(maxP)}`}</div>
{/* Last 30 days */}
<div style={{borderTop:'1px solid var(--border)',paddingTop:8,marginBottom:6}}>
<div style={{fontSize:10,color:'var(--text-dim)',fontWeight:600,marginBottom:4,textTransform:'uppercase',letterSpacing:0.5}}>Last 30 days</div>
<div style={{fontSize:12,color:'var(--text-muted)'}}>{info.last30} sales</div>
</div>
{/* All time */}
<div style={{borderTop:'1px solid var(--border)',paddingTop:8}}>
<div style={{fontSize:10,color:'var(--text-dim)',fontWeight:600,marginBottom:4,textTransform:'uppercase',letterSpacing:0.5}}>All time</div>
<div style={{fontSize:12,color:'var(--text-muted)'}}>{info.n} sales • {fU(info.rev)} revenue</div>
</div>
{/* Sizes & Colors */}
{!isDigitalShop(info.shop)&&(info.sizes.size>0||info.colors.size>0)&&<div style={{borderTop:'1px solid var(--border)',paddingTop:8,marginTop:6,display:'flex',gap:4,flexWrap:'wrap'}}>
{[...info.sizes].slice(0,5).map(sz=><span key={sz} style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:'var(--bg)',color:'var(--text-dim)'}}>{sz}</span>)}
{[...info.colors].slice(0,3).map(cl=><span key={cl} style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:'rgba(139,92,246,0.1)',color:'var(--purple)'}}>{cl}</span>)}
{info.colors.size>3?<span style={{fontSize:9,color:'var(--text-dim)'}}>+{info.colors.size-3}</span>:null}
</div>}
</div></div>})}
</div>:
/* List View */
<div style={S.card}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['','Sản phẩm','SKU','Giá','30 ngày','Tổng bán','Revenue','Profit'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
<tbody>{listings.map(([lid,info])=>{const minP=Math.min(...info.prices);const maxP=Math.max(...info.prices);return<tr key={lid} onClick={()=>{setEditId(lid);setEditUrl(images[lid]||'')}} style={{cursor:'pointer'}}>
<td style={{...S.td,width:48}}>{images[lid]?<img src={images[lid]} style={{width:40,height:40,borderRadius:6,objectFit:'cover'}} alt=""/>:<span style={{fontSize:24}}>{info.icon}</span>}</td>
<td style={{...S.td,fontWeight:600,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={info.name}>{info.name?.substring(0,50)}</td>
<td style={{...S.td,...S.mono,fontSize:11,color:'var(--text-dim)'}}>{info.sku||'—'}</td>
<td style={{...S.td,...S.mono,fontSize:12}}>{minP===maxP?fU(minP):`${fU(minP)}-${fU(maxP)}`}</td>
<td style={{...S.td,...S.mono,fontSize:12}}>{info.last30}</td>
<td style={{...S.td,...S.mono,fontSize:12,fontWeight:600}}>{info.n}</td>
<td style={{...S.td,...S.mono,color:'var(--accent-light)'}}>{fU(info.rev)}</td>
<td style={{...S.td,...S.mono,fontWeight:600,color:info.profit>=0?'var(--green)':'var(--red)'}}>{fU(info.profit)}</td>
</tr>})}</tbody></table></div>}
{/* Import from Extension Modal */}
{showImport&&<div onClick={e=>{if(e.target===e.currentTarget)setShowImport(false)}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(6px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',animation:'fadeIn 0.2s'}}>
<div style={{...S.card,maxWidth:560,width:'90%',animation:'fadeSlideUp 0.25s'}}>
<div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}><h3 style={{fontSize:16,fontWeight:700}}>📥 Import ảnh từ Extension</h3><button onClick={()=>setShowImport(false)} style={{...S.btn,padding:'4px 12px'}}>✕</button></div>
<div style={{fontSize:12,color:'var(--text-muted)',marginBottom:12,lineHeight:1.6}}>
<b>Hướng dẫn:</b><br/>
1. Cài Chrome Extension NBECOM<br/>
2. Mở Etsy → Listings Manager<br/>
3. Click icon Extension → "Scrape" → "Copy JSON"<br/>
4. Paste JSON vào ô bên dưới → Import
</div>
<textarea placeholder='Paste JSON từ Extension vào đây...\nVí dụ: {"4477958999":"https://i.etsystatic.com/...","4473305129":"https://..."}' value={importJson} onChange={e=>setImportJson(e.target.value)} style={{...S.input,height:140,resize:'vertical',fontFamily:"'Space Mono', monospace",fontSize:11}}/>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
<span style={{fontSize:11,color:'var(--text-dim)'}}>{importJson?`${Object.keys(JSON.parse(importJson||'{}')).length||0} ảnh`:''}</span>
<div style={{display:'flex',gap:8}}>
<button onClick={()=>setShowImport(false)} style={{...S.btn,background:'var(--border)',color:'var(--text-muted)',padding:'8px 16px'}}>Huỷ</button>
<button onClick={importFromExtension} disabled={!importJson.trim()} style={{...S.btn,background:'var(--green)',color:'#fff',padding:'8px 20px'}}>✅ Import</button>
</div></div>
</div></div>}
{/* Edit Modal */}
{editId&&<div onClick={e=>{if(e.target===e.currentTarget){setEditId(null)}}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(6px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',animation:'fadeIn 0.2s'}}>
<div style={{...S.card,maxWidth:480,width:'90%',animation:'fadeSlideUp 0.25s'}}>
<div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}><h3 style={{fontSize:16,fontWeight:700}}>Ảnh sản phẩm #{editId}</h3><button onClick={()=>setEditId(null)} style={{...S.btn,padding:'4px 12px'}}>✕</button></div>
{images[editId]&&<div style={{marginBottom:16,borderRadius:12,overflow:'hidden'}}><img src={images[editId]} style={{width:'100%',maxHeight:300,objectFit:'contain',background:'var(--bg)'}} alt=""/></div>}
<div style={{marginBottom:12}}>
<label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>IMAGE URL</label>
<input style={S.input} placeholder="Paste image URL từ Etsy..." value={editUrl} onChange={e=>setEditUrl(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){setImg(editId,editUrl);setEditId(null)}}}/>
</div>
<div style={{display:'flex',gap:8}}>
<button onClick={()=>{setImg(editId,editUrl);setEditId(null)}} style={{...S.btn,background:'var(--green)',color:'#fff',flex:1}}>💾 Lưu</button>
{listings.find(([l])=>l===editId)?.[1]?.link?<a href={listings.find(([l])=>l===editId)[1].link} target="_blank" rel="noopener noreferrer" style={{...S.btn,background:'var(--accent)',color:'#fff',textDecoration:'none',textAlign:'center',flex:1}}>🔗 Mở trên Etsy</a>:null}
</div>
</div></div>}
</div>)}

// ─── Shop Manager (MỚI v5.1) ───
function ShopManager({shops,token,onUpdateShops}){
const[newName,setNewName]=useState('');const[newType,setNewType]=useState('Vật lý');const[confirm2,setConfirm2]=useState(null);
const addShop=async()=>{if(!newName.trim())return;if(shops.find(s=>s.name.toLowerCase()===newName.trim().toLowerCase())){alert('Shop đã tồn tại!');return}const ns=[...shops,{name:newName.trim(),type:newType}];onUpdateShops(ns);if(token)await authAPI('saveShops',{token,shops:ns});setNewName('')};
const delShop=async(name)=>{const ns=shops.filter(s=>s.name!==name);onUpdateShops(ns);if(token)await authAPI('saveShops',{token,shops:ns});setConfirm2(null)};
return(<div style={{animation:'fadeSlideUp 0.4s'}}><h2 style={{fontSize:20,fontWeight:700,marginBottom:24}}>🏪 Quản lý Shop</h2>
<div style={{...S.card,marginBottom:20}}>
<h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>➕ Thêm Shop mới</h3>
<div style={{display:'flex',gap:12,alignItems:'flex-end'}}>
<div style={{flex:1}}><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>TÊN SHOP</label><input style={S.input} placeholder="Ví dụ: MinhAndBros" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addShop()}/></div>
<div style={{width:150}}><label style={{fontSize:12,color:'var(--text-dim)',display:'block',marginBottom:6}}>LOẠI</label><select style={{...S.select,width:'100%'}} value={newType} onChange={e=>setNewType(e.target.value)}><option value="Vật lý">Vật lý</option><option value="Digital">Digital</option></select></div>
<button onClick={addShop} style={{...S.btn,background:'var(--green)',color:'#fff',padding:'12px 24px',whiteSpace:'nowrap'}}>➕ Thêm</button>
</div></div>
<div style={S.card}><h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>Danh sách Shop ({shops.length})</h3>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:12}}>
{shops.map(s=><div key={s.name} style={{padding:'14px 16px',borderRadius:10,background:'var(--bg)',border:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<div><div style={{fontWeight:600,fontSize:14}}>{s.name}</div><div style={{fontSize:11,color:'var(--text-dim)',marginTop:2}}><span style={S.badge(s.type==='Digital'?'var(--purple)':'var(--accent)')}>{s.type}</span></div></div>
{confirm2===s.name?<div style={{display:'flex',gap:4}}><button onClick={()=>delShop(s.name)} style={{...S.btn,fontSize:11,padding:'4px 10px',background:'var(--red)',color:'#fff'}}>Xác nhận</button><button onClick={()=>setConfirm2(null)} style={{...S.btn,fontSize:11,padding:'4px 10px',background:'var(--border)',color:'var(--text-muted)'}}>Huỷ</button></div>:<button onClick={()=>setConfirm2(s.name)} style={{...S.btn,fontSize:11,padding:'4px 10px',background:'rgba(239,68,68,0.1)',color:'var(--red)'}}>🗑️</button>}
</div>)}
</div></div></div>)}

// ─── Bookmarklet Setup (v5.5 — auto fetch ALL pages) ───
function ExtGuide({token}){
const apiUrl=typeof window!=='undefined'?window.location.origin+'/api/auth':'';
const imgBookmarklet=`javascript:void(function(){
var D=document,W=window,A='${apiUrl}',T='${token}';
function P(h){var o={},d=(new DOMParser).parseFromString(h,'text/html');d.querySelectorAll('a[href*="/listing/"]').forEach(function(a){var m=a.href.match(/\\/listing\\/(\\d+)/);if(!m)return;var id=m[1];if(o[id])return;var p=a.closest('div,li,article,tr');var img=a.querySelector('img[src*=etsystatic]');if(!img&&p)img=p.querySelector('img[src*=etsystatic]');if(!img&&p)img=p.querySelector('img');if(img&&img.src&&img.src.indexOf('etsystatic')>-1)o[id]=img.src.replace(/il_\\d+x\\d+/,'il_570xN')});d.querySelectorAll('a[href*="/edit/"]').forEach(function(a){var m=a.href.match(/\\/edit\\/(\\d+)/);if(!m)return;var id=m[1];if(o[id])return;var p=a.closest('div,li,article,tr,td');if(p){var img=p.querySelector('img[src*=etsystatic]');if(!img)img=p.querySelector('img');if(img&&img.src&&img.src.indexOf('etsystatic')>-1)o[id]=img.src.replace(/il_\\d+x\\d+/,'il_570xN')}});d.querySelectorAll('[data-listing-id]').forEach(function(el){var id=el.getAttribute('data-listing-id');if(!id||o[id])return;var img=el.querySelector('img');if(img&&img.src&&img.src.indexOf('etsystatic')>-1)o[id]=img.src.replace(/il_\\d+x\\d+/,'il_570xN')});d.querySelectorAll('img[src*=etsystatic]').forEach(function(img){var p=img.closest('a[href*=listing],a[href*=edit],div,li,tr');if(p){var link=p.querySelector('a[href*="/listing/"]')||p.querySelector('a[href*="/edit/"]');if(link){var lm=link.href.match(/\\/(listing|edit)\\/(\\d+)/);if(lm&&!o[lm[2]])o[lm[2]]=img.src.replace(/il_\\d+x\\d+/,'il_570xN')}}});return o}
var box=D.createElement('div');box.id='nbecom-status';box.style.cssText='position:fixed;top:20px;right:20px;z-index:99999;background:#1e1b4b;color:#e0e7ff;padding:16px 24px;border-radius:12px;font-family:system-ui;font-size:14px;box-shadow:0 8px 32px rgba(0,0,0,0.4);min-width:280px';box.innerHTML='<div style=\"font-weight:700;font-size:16px;margin-bottom:8px\">📸 NBECOM Sync</div><div id=\"nbecom-msg\">Đang quét trang 1...</div><div style=\"margin-top:8px;height:4px;background:#312e81;border-radius:2px\"><div id=\"nbecom-bar\" style=\"height:100%;width:0;background:linear-gradient(90deg,#818cf8,#a78bfa);border-radius:2px;transition:width 0.3s\"></div></div>';D.body.appendChild(box);
var msg=D.getElementById('nbecom-msg'),bar=D.getElementById('nbecom-bar');
var all=P(D.documentElement.outerHTML);var total=Object.keys(all).length;
msg.textContent='Trang 1: '+total+' ảnh. Đang tìm thêm...';
var shop=W.location.pathname.match(/\\/shop\\/([^\\/?]+)/);
var isListing=W.location.pathname.indexOf('/tools/listings')>-1;
var base=shop?'https://www.etsy.com/shop/'+shop[1]:W.location.href.split('?')[0];
var pg=2,empty=0,maxPg=100;
function next(){if(pg>maxPg||empty>=3){done();return}
var sep=base.indexOf('?')>-1?'&':'?';var url=base+sep+'page='+pg;
bar.style.width=Math.min(90,pg*5)+'%';
msg.textContent='Đang quét trang '+pg+'... ('+Object.keys(all).length+' ảnh)';
fetch(url,{credentials:'include'}).then(function(r){if(!r.ok){done();return}return r.text()}).then(function(h){if(!h){done();return}
var imgs=P(h);var n=Object.keys(imgs).length;if(n===0){empty++}else{empty=0;for(var k in imgs)all[k]=imgs[k]}
pg++;setTimeout(next,400)}).catch(function(){done()})}
function done(){var n=Object.keys(all).length;bar.style.width='100%';
if(n===0){msg.innerHTML='❌ Không tìm thấy ảnh trên trang này.<br><small>Thử mở: etsy.com/shop/'+((shop&&shop[1])||'TênShop')+'</small>';setTimeout(function(){box.remove()},6000);return}
msg.textContent='Đang gửi '+n+' ảnh về NBECOM...';
fetch(A,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'bookmarkletImages',token:T,images:all})}).then(function(r){return r.json()}).then(function(d){if(d.success){msg.innerHTML='✅ Đã đồng bộ <b>'+n+'</b> ảnh!<br><small>'+d.message+'</small>';box.style.background='#064e3b'}else{msg.innerHTML='❌ Lỗi: '+d.error;box.style.background='#7f1d1d'}setTimeout(function(){box.remove()},5000)}).catch(function(e){msg.innerHTML='❌ Lỗi kết nối';box.style.background='#7f1d1d';setTimeout(function(){box.remove()},5000)})}
next()})()`.replace(/\n/g,'');
const[testResult,setTestResult]=useState(null);
const testSync=async()=>{setTestResult('testing');try{const r=await authAPI('bookmarkletImages',{token,images:{'test123':'https://test.com/test.jpg'}});setTestResult(r.success?'ok':'fail')}catch(e){setTestResult('fail')}};
return(<div style={{animation:'fadeSlideUp 0.4s'}}>
<h2 style={{fontSize:20,fontWeight:700,marginBottom:8}}>🔖 Bookmarklet — Tự động lấy ảnh</h2>
<p style={{color:'var(--text-muted)',fontSize:13,marginBottom:20}}>1 click lấy TẤT CẢ ảnh sản phẩm — tự động chạy qua mọi trang</p>

<div style={{...S.card,marginBottom:20,background:'rgba(16,185,129,0.04)',borderColor:'var(--green)'}}>
<h3 style={{fontSize:15,fontWeight:600,marginBottom:12,color:'var(--green)'}}>🛡️ An toàn tuyệt đối</h3>
<div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.8}}>
<div>✅ Chỉ ĐỌC ảnh hiển thị trên trang Etsy</div>
<div>✅ Gửi thẳng về nbecom.app — không qua server nào khác</div>
<div>✅ Không truy cập mật khẩu, cookie, session Etsy</div>
<div>✅ Không thay đổi gì trên tài khoản Etsy</div>
<div>✅ Chỉ chạy khi bạn click — không chạy ngầm</div>
</div></div>

<div style={{...S.card,marginBottom:20}}>
<h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>📸 Bookmark lấy ảnh sản phẩm</h3>
<div style={{textAlign:'center',padding:'20px 0',background:'var(--bg)',borderRadius:12,marginBottom:16}}>
<div style={{fontSize:12,color:'var(--text-dim)',marginBottom:12}}>⬇️ KÉO NÚT NÀY VÀO THANH BOOKMARK ⬇️</div>
<a href={imgBookmarklet} onClick={e=>e.preventDefault()} draggable="true" style={{display:'inline-block',padding:'14px 28px',borderRadius:10,background:'linear-gradient(135deg,var(--purple),var(--accent))',color:'#fff',fontSize:15,fontWeight:700,textDecoration:'none',cursor:'grab',userSelect:'none'}}>📸 NBECOM Sync Ảnh</a>
<div style={{fontSize:11,color:'var(--text-dim)',marginTop:8}}>Kéo giữ chuột → thả lên thanh Bookmark Bar</div>
</div>

<h3 style={{fontSize:14,fontWeight:600,marginBottom:12}}>Cách dùng (chỉ 2 bước):</h3>
<div style={{fontSize:13,color:'var(--text-muted)',lineHeight:2.2}}>
<div><span style={{...S.badge('var(--accent)'),marginRight:8}}>1</span> Mở Etsy → <b>Shop page</b> (etsy.com/shop/TênShop) hoặc <b>Listings Manager</b></div>
<div><span style={{...S.badge('var(--green)'),marginRight:8}}>2</span> Click bookmark → <b>Tự chạy qua TẤT CẢ trang</b> → Hiện progress → Đồng bộ về NBECOM! ✅</div>
</div>
<div style={{fontSize:11,color:'var(--text-dim)',marginTop:12,padding:'8px 12px',background:'var(--bg)',borderRadius:8}}>🚀 Bookmarklet tự fetch page 1, 2, 3... đến hết. Không cần mở từng trang thủ công. Popup hiện tiến trình realtime.</div>
</div>

<div style={{...S.card,marginBottom:20}}>
<h3 style={{fontSize:15,fontWeight:600,marginBottom:12}}>🧪 Test kết nối</h3>
<div style={{display:'flex',gap:12,alignItems:'center'}}>
<button onClick={testSync} style={{...S.btn,background:'var(--accent)',color:'#fff',padding:'10px 20px'}}>🧪 Test thử</button>
{testResult==='testing'&&<span style={{color:'var(--text-dim)',fontSize:13}}>⏳ Đang test...</span>}
{testResult==='ok'&&<span style={{color:'var(--green)',fontSize:13}}>✅ Kết nối OK! Bookmarklet sẽ hoạt động.</span>}
{testResult==='fail'&&<span style={{color:'var(--red)',fontSize:13}}>❌ Lỗi kết nối. Kiểm tra đăng nhập.</span>}
</div></div>

<div style={{...S.card,marginBottom:20}}>
<h3 style={{fontSize:15,fontWeight:600,marginBottom:12}}>📋 Setup cho Chrome profile khác</h3>
<div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.8,marginBottom:12}}>
Nếu dùng nhiều Chrome profile, mở link sau trên mỗi profile rồi kéo bookmark:
</div>
<div style={{padding:12,background:'var(--bg)',borderRadius:8,fontSize:11,...S.mono,color:'var(--accent)',wordBreak:'break-all',cursor:'pointer'}} onClick={()=>{navigator.clipboard.writeText(imgBookmarklet);alert('Đã copy bookmark code!')}}>
Click để copy bookmark code → Tạo bookmark mới → Paste vào URL
</div>
<div style={{fontSize:11,color:'var(--text-dim)',marginTop:8}}>
Hoặc: Chrome → Bookmark Manager → Add bookmark → Tên: "NBECOM Sync Ảnh" → URL: paste code trên
</div></div>

<div style={{...S.card,background:'rgba(245,158,11,0.04)',borderColor:'var(--orange)'}}>
<h3 style={{fontSize:14,fontWeight:600,marginBottom:8,color:'var(--orange)'}}>⚠️ Lưu ý</h3>
<div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.8}}>
<div>• Token được nhúng trong bookmark — nếu đổi mật khẩu hoặc hết session, cần tạo lại bookmark</div>
<div>• Bookmark này chỉ dành cho tài khoản <b>{token?.substring(0,8)}...</b></div>
<div>• Không chia sẻ bookmark cho người khác — nó chứa token đăng nhập của bạn</div>
</div></div>
</div>)}

// ─── Gmail Sync (v5.7) ───
function GmailSync({token}){
const[status,setStatus]=useState(null);const[loading,setLoading]=useState(true);const[emails,setEmails]=useState([]);const[testing,setTesting]=useState(false);const[query,setQuery]=useState('from:(@etsy.com)');const[maxR,setMaxR]=useState(10);const[toast,setToast]=useState(null);
const checkStatus=useCallback(async()=>{setLoading(true);const r=await authAPI('gmailStatus',{token});if(r.success)setStatus(r);else setStatus(null);setLoading(false)},[token]);
useEffect(()=>{checkStatus();
// Check URL params for OAuth callback result
if(typeof window!=='undefined'){const p=new URLSearchParams(window.location.search);if(p.get('gmail_status')==='connected'){setToast({type:'ok',msg:'✅ Kết nối Gmail thành công: '+(p.get('email')||'')});window.history.replaceState({},'',window.location.pathname);checkStatus()}else if(p.get('gmail_status')==='error'){setToast({type:'err',msg:'❌ Lỗi kết nối Gmail: '+(p.get('msg')||'unknown')});window.history.replaceState({},'',window.location.pathname)}}
},[checkStatus]);
const connect=()=>{window.location.href=`/api/auth/gmail/connect?token=${encodeURIComponent(token)}`};
const disconnect=async()=>{if(!confirm('Ngắt kết nối Gmail? Tất cả email sync sẽ dừng lại.'))return;const r=await authAPI('gmailDisconnect',{token});if(r.success){setToast({type:'ok',msg:'Đã ngắt kết nối'});checkStatus();setEmails([])}else setToast({type:'err',msg:r.error||'Lỗi'})};
const testFetch=async()=>{setTesting(true);const r=await authAPI('gmailTest',{token,maxResults:maxR,query});if(r.success){setEmails(r.emails||[]);setToast({type:'ok',msg:`Lấy được ${r.emails?.length||0}/${r.total||0} email`})}else{setEmails([]);setToast({type:'err',msg:r.error||'Lỗi'})}setTesting(false)};
const fmt=(ts)=>{if(!ts)return'—';const d=new Date(ts);return d.toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})};
const connected=status?.connected;const d=status?.data;
return(<div style={{animation:'fadeSlideUp 0.4s'}}>
<h2 style={{fontSize:20,fontWeight:700,marginBottom:8}}>📧 Gmail Sync</h2>
<p style={{color:'var(--text-muted)',fontSize:13,marginBottom:20}}>Kết nối Gmail master để tự động lấy email đơn hàng Etsy</p>

{toast&&<div onClick={()=>setToast(null)} style={{padding:'12px 16px',borderRadius:10,marginBottom:16,fontSize:13,cursor:'pointer',background:toast.type==='ok'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',color:toast.type==='ok'?'var(--green)':'var(--red)',border:'1px solid '+(toast.type==='ok'?'var(--green)':'var(--red)')}}>{toast.msg}</div>}

{loading?<div style={{...S.card,textAlign:'center',padding:40}}><div style={{width:32,height:32,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}/></div>:
<>
{/* Connection card */}
<div style={{...S.card,marginBottom:20,borderColor:connected?'var(--green)':'var(--orange)'}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
<div>
<h3 style={{fontSize:15,fontWeight:600,marginBottom:8,display:'flex',alignItems:'center',gap:8}}>
<span style={{width:10,height:10,borderRadius:'50%',background:connected?'var(--green)':'var(--text-dim)',boxShadow:connected?'0 0 8px var(--green)':'none',animation:connected?'pulse 2s infinite':'none'}}/>
{connected?'Đã kết nối':'Chưa kết nối'}
</h3>
{connected&&d&&<div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.8}}>
<div>📧 <b style={{color:'var(--text)'}}>{d.email}</b></div>
<div>📨 Tổng email: <span style={S.mono}>{d.messagesTotal?.toLocaleString()||0}</span> • Threads: <span style={S.mono}>{d.threadsTotal?.toLocaleString()||0}</span></div>
<div>🕐 Kết nối lúc: {fmt(d.connectedAt)} bởi <b>{d.connectedBy}</b></div>
<div>🔑 Token expire: {fmt(d.expiryDate)} {d.isExpired?<span style={{color:'var(--orange)'}}>(sẽ auto-refresh)</span>:<span style={{color:'var(--green)'}}>✓ còn hạn</span>}</div>
{!d.hasRefreshToken&&<div style={{color:'var(--red)'}}>⚠️ Không có refresh token — sẽ phải kết nối lại khi hết hạn</div>}
</div>}
</div>
<div>
{connected?<button onClick={disconnect} style={{...S.btn,background:'rgba(239,68,68,0.1)',color:'var(--red)',fontSize:13,padding:'8px 16px'}}>🔌 Ngắt kết nối</button>:<button onClick={connect} style={{...S.btn,background:'linear-gradient(135deg,var(--accent),var(--purple))',color:'#fff',fontSize:14,padding:'10px 20px',fontWeight:700}}>🔗 Kết nối Gmail</button>}
</div>
</div>
{!connected&&<div style={{padding:14,background:'var(--bg)',borderRadius:10,fontSize:12,color:'var(--text-muted)',lineHeight:1.8}}>
<b style={{color:'var(--text)'}}>Trước khi kết nối, đảm bảo:</b>
<div>1. Google Cloud đã enable Gmail API ✓</div>
<div>2. Vercel env vars đã add: <span style={S.mono}>GOOGLE_CLIENT_ID</span>, <span style={S.mono}>GOOGLE_CLIENT_SECRET</span>, <span style={S.mono}>GMAIL_REDIRECT_URI</span></div>
<div>3. Redirect URI trong Google Cloud đã đúng: <span style={S.mono}>https://nbecom.app/api/auth/gmail/callback</span></div>
<div>4. Gmail Bin dùng phải nằm trong <b>Test Users</b> list của OAuth consent screen</div>
</div>}
</div>

{/* Test fetch section */}
{connected&&<div style={{...S.card,marginBottom:20}}>
<h3 style={{fontSize:15,fontWeight:600,marginBottom:12}}>🧪 Test lấy email</h3>
<div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:12,marginBottom:12}}>
<div><label style={{fontSize:11,color:'var(--text-dim)',display:'block',marginBottom:4}}>GMAIL QUERY</label><input style={{...S.input,fontFamily:"'Space Mono',monospace",fontSize:12}} placeholder='from:(@etsy.com) newer_than:7d' value={query} onChange={e=>setQuery(e.target.value)}/></div>
<div><label style={{fontSize:11,color:'var(--text-dim)',display:'block',marginBottom:4}}>SỐ EMAIL</label><select style={{...S.select,width:80}} value={maxR} onChange={e=>setMaxR(parseInt(e.target.value))}><option value="5">5</option><option value="10">10</option><option value="25">25</option><option value="50">50</option></select></div>
<div style={{display:'flex',alignItems:'flex-end'}}><button onClick={testFetch} disabled={testing} style={{...S.btn,background:'var(--accent)',color:'#fff',padding:'10px 20px'}}>{testing?'⏳ Đang lấy...':'🔍 Fetch'}</button></div>
</div>
<div style={{fontSize:11,color:'var(--text-dim)'}}>Ví dụ query: <span style={S.mono}>from:(@etsy.com)</span> • <span style={S.mono}>subject:(new order)</span> • <span style={S.mono}>newer_than:7d</span> • <span style={S.mono}>label:inbox</span></div>
</div>}

{/* Email list */}
{emails.length>0&&<div style={S.card}>
<h3 style={{fontSize:15,fontWeight:600,marginBottom:12}}>📬 {emails.length} Email gần nhất</h3>
<div style={{maxHeight:500,overflowY:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
<thead style={{position:'sticky',top:0,background:'var(--card)',zIndex:2}}><tr>{['#','Từ','Subject','Ngày','Message ID','Snippet'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
<tbody>{emails.map((e,i)=><tr key={e.id}>
<td style={{...S.td,...S.mono,color:'var(--text-dim)',fontSize:11}}>{i+1}</td>
<td style={{...S.td,fontSize:12,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={e.from}>{e.from}</td>
<td style={{...S.td,fontSize:12,fontWeight:600,maxWidth:280,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={e.subject}>{e.subject}</td>
<td style={{...S.td,fontSize:11,whiteSpace:'nowrap',color:'var(--text-dim)'}}>{fmt(parseInt(e.internalDate))}</td>
<td style={{...S.td,...S.mono,fontSize:10,color:'var(--text-dim)'}}>{e.id?.substring(0,12)}</td>
<td style={{...S.td,fontSize:11,color:'var(--text-dim)',maxWidth:300,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={e.snippet}>{e.snippet?.substring(0,100)}</td>
</tr>)}</tbody></table></div>
</div>}

{/* Future features placeholder */}
{connected&&<div style={{...S.card,marginTop:20,background:'rgba(59,130,246,0.03)',borderColor:'var(--accent)'}}>
<h3 style={{fontSize:14,fontWeight:600,marginBottom:8,color:'var(--accent)'}}>🚧 Tính năng sắp có (Phase 2-4)</h3>
<div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.8}}>
<div>• <b>Parser</b> — tự động phân tích email Etsy → extract SKU, Type, Address, Profit...</div>
<div>• <b>Auto import orders</b> — email mới → tự động tạo đơn hàng trong NBECOM</div>
<div>• <b>Cron job</b> — quét Gmail mỗi 5 phút, chống trùng đơn</div>
<div>• <b>Re-sync</b> — sync lại email theo date range</div>
<div>• <b>Parse failed review</b> — sửa tay email không parse được</div>
</div>
</div>}
</>}
</div>)}

export default function Home(){const[as,setAs]=useState('loading');const[cu,setCu]=useState(null);const[tk,setTk]=useState(null);const[ae,setAe]=useState('');const[al,setAl]=useState(false);const[rs,setRs]=useState('');const[am,setAm]=useState('dashboard');const[so,setSo]=useState(true);const[ao,setAo]=useState([]);const[sd,setSd]=useState(null);const[pss,setPss]=useState({});const[images,setImages]=useState({});const[shops,setShops]=useState(DEFAULT_SHOPS);

// Auth + Load saved data
useEffect(()=>{(async()=>{const s=typeof window!=='undefined'?localStorage.getItem('nbecom_token'):null;if(s){const r=await authAPI('verify',{token:s});if(r.success){setCu(r.user);setTk(s);setAs('app');
const[ordRes,stmtRes,imgRes,shopRes]=await Promise.all([authAPI('loadOrders',{token:s}),authAPI('loadStatements',{token:s}),authAPI('loadImages',{token:s}),authAPI('loadShops',{token:s})]);
if(ordRes.success&&ordRes.orders?.length)setAo(ordRes.orders);
if(stmtRes.success&&stmtRes.stmtData?.totalSales){setSd(stmtRes.stmtData);if(stmtRes.perShopStmt)setPss(stmtRes.perShopStmt)}
if(imgRes.success)setImages(imgRes.images||{});
if(shopRes.success&&shopRes.shops?.length)setShops(shopRes.shops);
return}localStorage.removeItem('nbecom_token')}const c=await authAPI('checkSetup');setAs(c.adminExists?'login':'setup')})()},[]);

const hSetup=async(u,p,fn)=>{setAl(true);setAe('');const r=await authAPI('setup',{username:u,password:p,fullName:fn});if(r.success){localStorage.setItem('nbecom_token',r.token);setCu(r.user);setTk(r.token);setAs('app')}else setAe(r.error);setAl(false)};
const hLogin=async(u,p)=>{setAl(true);setAe('');const r=await authAPI('login',{username:u,password:p});if(r.success){localStorage.setItem('nbecom_token',r.token);setCu(r.user);setTk(r.token);setAs('app');
const[ordRes,stmtRes,imgRes,shopRes]=await Promise.all([authAPI('loadOrders',{token:r.token}),authAPI('loadStatements',{token:r.token}),authAPI('loadImages',{token:r.token}),authAPI('loadShops',{token:r.token})]);
if(ordRes.success&&ordRes.orders?.length)setAo(ordRes.orders);
if(stmtRes.success&&stmtRes.stmtData?.totalSales){setSd(stmtRes.stmtData);if(stmtRes.perShopStmt)setPss(stmtRes.perShopStmt)}
if(imgRes.success)setImages(imgRes.images||{});
if(shopRes.success&&shopRes.shops?.length)setShops(shopRes.shops);
}else setAe(r.error);setAl(false)};
const hReg=async(u,p,fn)=>{setAl(true);setAe('');setRs('');const r=await authAPI('register',{username:u,password:p,fullName:fn});if(r.success)setRs(r.message);else setAe(r.error);setAl(false)};
const hLogout=async()=>{await authAPI('logout',{token:tk});localStorage.removeItem('nbecom_token');setCu(null);setTk(null);setAs('login');setAo([]);setSd(null);setImages({})};

if(as==='loading')return<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:48,height:48,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>;
if(as==='setup')return<SetupPage onSetup={hSetup} error={ae} loading={al}/>;
if(as==='register')return<RegPage onReg={hReg} onGoLogin={()=>{setAs('login');setAe('');setRs('')}} error={ae} loading={al} success={rs}/>;
if(as==='login')return<LoginPage onLogin={hLogin} onGoReg={()=>{setAs('register');setAe('')}} error={ae} loading={al}/>;

const isA=cu?.role==='admin',isM=cu?.role==='manager'||isA,uS=cu?.shops||[];
const mi=[{id:'dashboard',icon:'📊',label:'Dashboard',show:true},{id:'upload',icon:'📤',label:'Upload CSV',show:isM},{id:'orders',icon:'📦',label:'Đơn hàng',show:true},{id:'reports',icon:'📈',label:'Báo cáo',show:isM},{id:'images',icon:'🖼️',label:'Sản phẩm',show:isM},{id:'shops',icon:'🏪',label:'Quản lý Shop',show:isA},{id:'basecost',icon:'💰',label:'Basecost',show:isA},{id:'gmail',icon:'📧',label:'Gmail Sync',show:isA},{id:'extension',icon:'🔖',label:'Bookmarklet',show:isA},{id:'users',icon:'👥',label:'Người dùng',show:isA}].filter(m=>m.show);

const rc=()=>{switch(am){
case'upload':return<CSVUpload onData={setAo} onStmt={setSd} token={tk} shops={shops}/>;
case'orders':return<OrdersView orders={ao} userShops={uS} isAdmin={isA} images={images} shops={shops}/>;
case'reports':return<div style={{animation:'fadeSlideUp 0.4s'}}><Reports orders={ao} stmtData={sd} images={images} shops={shops} perShopStmt={pss}/></div>;
case'images':return<ProductImages orders={ao} images={images} token={tk} onUpdateImages={setImages} shops={shops}/>;
case'shops':return<ShopManager shops={shops} token={tk} onUpdateShops={setShops}/>;
case'users':return<UserMgmt token={tk} shops={shops}/>;
case'extension':return<ExtGuide token={tk}/>;
case'gmail':return<GmailSync token={tk}/>;
case'basecost':return<div style={{animation:'fadeSlideUp 0.4s'}}><h2 style={{fontSize:20,fontWeight:700,marginBottom:24}}>💰 Basecost</h2>{Object.entries(BDB).map(([sup,products])=><div key={sup} style={{...S.card,marginBottom:16}}><h3 style={{fontSize:15,fontWeight:600,marginBottom:12}}>{sup}</h3><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Sản phẩm','Giá'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>{Object.entries(products).map(([p,sizes])=>sizes._all!==undefined?<tr key={p}><td style={{...S.td,fontWeight:500}}>{ICONS[p]||'📦'} {p}</td><td style={{...S.td,...S.mono,color:'var(--accent-light)'}}>${sizes._all}</td></tr>:Object.entries(sizes).map(([sz,pr])=><tr key={p+sz}><td style={{...S.td,fontWeight:500}}>{ICONS[p]||'📦'} {p}—{sz}</td><td style={{...S.td,...S.mono,color:'var(--accent-light)'}}>${pr[0]}</td></tr>))}</tbody></table></div>)}</div>;
default:return<div style={{animation:'fadeSlideUp 0.4s'}}>{ao.length===0?<div style={{...S.card,textAlign:'center',padding:60}}><div style={{fontSize:64,marginBottom:16}}>👋</div><div style={{fontSize:20,fontWeight:600,marginBottom:8}}>Xin chào, {cu?.fullName}!</div><div style={{color:'var(--text-muted)',marginBottom:24}}><span style={S.badge(RC[cu?.role]||'var(--text-dim)')}>{ROLES[cu?.role]||cu?.role}</span></div>{isM&&<button onClick={()=>setAm('upload')} style={{...S.btn,background:'var(--accent)',color:'#fff',fontSize:16,padding:'14px 32px'}}>📤 Upload CSV</button>}</div>:<Reports orders={ao} stmtData={sd} images={images} shops={shops} perShopStmt={pss}/>}</div>}};

return(<div style={{display:'flex',minHeight:'100vh'}}><aside style={{width:so?240:68,background:'var(--card)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',transition:'width 0.3s',flexShrink:0}}><div style={{padding:so?'20px 16px':'20px 14px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10}}><div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,var(--accent),var(--purple))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,color:'#fff',flexShrink:0}}>N</div>{so&&<div><div style={{fontWeight:700,fontSize:14}}>NBECOM</div><div style={{fontSize:10,color:"var(--text-dim)"}}>v5.7</div></div>}</div><nav style={{padding:'10px 8px',flex:1}}>{mi.map(item=><div key={item.id} onClick={()=>setAm(item.id)} style={{display:'flex',alignItems:'center',gap:10,padding:so?'9px 12px':'9px',borderRadius:8,marginBottom:2,cursor:'pointer',background:am===item.id?'rgba(59,130,246,0.1)':'transparent',borderLeft:am===item.id?'3px solid var(--accent)':'3px solid transparent',justifyContent:so?'flex-start':'center'}}><span style={{fontSize:15}}>{item.icon}</span>{so&&<span style={{fontSize:13,fontWeight:am===item.id?600:400,color:am===item.id?'var(--accent)':'var(--text-muted)'}}>{item.label}</span>}</div>)}</nav>{so&&<div style={{padding:'12px 16px',borderTop:'1px solid var(--border)'}}><div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{cu?.fullName}</div><div style={{fontSize:11,color:'var(--text-dim)',marginBottom:4}}><span style={S.badge(RC[cu?.role]||'#666')}>{ROLES[cu?.role]||cu?.role}</span></div><div style={{fontSize:10,color:'var(--text-dim)',marginBottom:8}}>📦 {ao.length} đơn • 🖼️ {Object.keys(images).filter(k=>images[k]).length} ảnh</div><button onClick={hLogout} style={{...S.btn,fontSize:12,padding:'6px 12px',background:'rgba(239,68,68,0.1)',color:'var(--red)',width:'100%'}}>🚪 Đăng xuất</button></div>}<div onClick={()=>setSo(!so)} style={{padding:12,borderTop:'1px solid var(--border)',cursor:'pointer',textAlign:'center',color:'var(--text-dim)',fontSize:14}}>{so?'◀':'▶'}</div></aside><main style={{flex:1,overflowY:'auto'}}><header style={{padding:'14px 24px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(17,24,39,0.8)',backdropFilter:'blur(12px)',position:'sticky',top:0,zIndex:10}}><h1 style={{fontSize:16,fontWeight:700}}>{mi.find(m=>m.id===am)?.icon} {mi.find(m=>m.id===am)?.label}</h1><div style={{display:'flex',alignItems:'center',gap:10}}>{ao.length>0&&<div style={{fontSize:12,color:'var(--text-dim)',...S.mono}}>{ao.length} đơn</div>}<div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--purple))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff'}}>{cu?.fullName?.charAt(0)}</div></div></header><div style={{padding:'20px 24px'}}>{rc()}<div style={{textAlign:'center',padding:'20px 0 8px',color:'var(--text-dim)',fontSize:11}}>NBECOM v5.7 • Powered by Lisa AI 💙</div></div></main></div>)}
