const express=require('express'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const app=express(),PORT=4177;
// Les données sont stockées EN DEHORS du dossier de version : remplacez le jeu sans toucher aux comptes.
const DIR=process.env.EMPIRE_HOTEL_DATA_DIR ? path.resolve(process.env.EMPIRE_HOTEL_DATA_DIR) : path.join(path.dirname(__dirname),'EMPIRE_HOTEL_SAUVEGARDES');
const DB=path.join(DIR,'players.json');fs.mkdirSync(DIR,{recursive:true});
// Protection applicative locale : limiteur, en-têtes, contrôle des origines et sessions.
const hits=new Map(), loginFailures=new Map();
const MAX_BODY='32kb';
app.disable('x-powered-by');
app.use((req,res,next)=>{
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('X-Frame-Options','DENY');
 res.setHeader('Referrer-Policy','no-referrer');
 res.setHeader('Cross-Origin-Resource-Policy','same-origin');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
 res.setHeader('Cache-Control','no-store');
 const now=Date.now(), key=req.socket.remoteAddress||'local';
 let item=hits.get(key);if(!item||now-item.since>60000)item={since:now,count:0};
 item.count++;hits.set(key,item);
 if(item.count>240){res.setHeader('Retry-After','60');return res.status(429).json({error:'Trop de requêtes, réessayez dans une minute.'})}
 if(req.method!=='GET'&&req.method!=='HEAD'&&req.method!=='OPTIONS'){
  const origin=req.headers.origin;
  if(origin){let parsed;try{parsed=new URL(origin)}catch{return res.status(403).json({error:'Origine refusée'})}
   if(!['localhost','127.0.0.1'].includes(parsed.hostname)||parsed.port!==String(PORT)||parsed.protocol!=='http:')return res.status(403).json({error:'Origine refusée'});
  }
  if(req.path.startsWith('/api/')&&req.headers['content-type']?.split(';')[0]!=='application/json')return res.status(415).json({error:'Contenu JSON requis'});
 }
 next();
});
app.use(express.json({limit:MAX_BODY,strict:true}));
app.use((err,req,res,next)=>{if(err&&('status' in err||err instanceof SyntaxError))return res.status(err.status||400).json({error:'Requête invalide ou trop volumineuse'});next(err)});
setInterval(()=>{const now=Date.now();for(const [k,v] of hits)if(now-v.since>120000)hits.delete(k);for(const [k,v] of loginFailures)if(now-v.since>900000)loginFailures.delete(k)},60000).unref();
function loadFile(file){const value=JSON.parse(fs.readFileSync(file,'utf8'));if(!value||typeof value.users!=='object'||Array.isArray(value.users)||value.users===null)throw Error('Format de sauvegarde invalide : '+file);return value}
function discoverOldSaves(){
 const parent=path.dirname(__dirname),results=[];
 function walk(folder,depth){if(depth>3)return;let items=[];try{items=fs.readdirSync(folder,{withFileTypes:true})}catch{return}
 for(const item of items){if(!item.isDirectory()||item.isSymbolicLink()||['node_modules','.git','EMPIRE_HOTEL_SAUVEGARDES'].includes(item.name))continue;
 const p=path.join(folder,item.name);if(item.name==='data'){
  for(const filename of ['players.json','players.json.bak']){const candidate=path.join(p,filename);if(fs.existsSync(candidate))results.push(candidate)}
 }else if(depth<3&&(/hotel|empire|v1[_\d.-]/i.test(item.name)||p===__dirname))walk(p,depth+1);
 }}walk(parent,0);return results;
}
let db={users:{}};
if(fs.existsSync(DB)){
 try{db=loadFile(DB)}catch(e){
  const backup=DB+'.bak';if(fs.existsSync(backup)){try{db=loadFile(backup);console.warn('Sauvegarde principale corrompue ; récupération de la copie de secours.')}catch(e2){console.error('Sauvegardes illisibles. Aucune donnée écrasée.',e2);process.exit(1)}}
  else{console.error('Sauvegarde illisible. Aucune donnée écrasée.',e);process.exit(1)}
 }
}else{
 const candidates=discoverOldSaves().sort((a,b)=>fs.statSync(a).mtimeMs-fs.statSync(b).mtimeMs);
 let imported=0;
 for(const candidate of candidates){try{const legacy=loadFile(candidate);for(const [id,user] of Object.entries(legacy.users)){if(!db.users[id]){db.users[id]=user;imported++}}}catch(e){console.warn('Ancienne sauvegarde ignorée :',candidate,e.message)}}
 if(imported){fs.writeFileSync(DB,JSON.stringify(db,null,2));console.log('Migration :',imported,'compte(s) retrouvé(s) dans les anciennes versions.')}else console.log('Aucune ancienne sauvegarde trouvée : les nouveaux comptes seront conservés ici.');
}
console.log('Dossier de sauvegarde permanent :',DIR);

function persist(){const tmp=DB+'.tmp';fs.writeFileSync(tmp,JSON.stringify(db,null,2));if(fs.existsSync(DB))fs.copyFileSync(DB,DB+'.bak');fs.renameSync(tmp,DB)}
const sessions=new Map();const clean=x=>typeof x==='string'?x.trim():'';const forbidden=/\b(?:pute|connard|fdp|nazi|hitler|nique|encul|salope|racist|fuck|merde)\b/i;
function validName(x){return x.length>=2&&x.length<=45&&!forbidden.test(x)&&/^[\p{L}\p{N} '’._-]+$/u.test(x)}
const types={Classique:[25000,90],Supérieure:[45000,160],VIP:[110000,390],Suite:[240000,850]};const amenities={Piscine:[180000,1600],Bowling:[140000,1300],Billard:[18000,240],Spa:[120000,1000],Restaurant:[95000,1100],Bar:[50000,550],Parking:[35000,320],Sport:[65000,650]};const rates={Tiers:.0015,'Tiers Plus':.0019,'Tiers Étendu':.0025,'Tous Risques':.0045,Premium:.0035};
const cents=n=>Math.round(n*100)/100;function worth(h){return 250000+h.floors*90000+Object.entries(h.rooms).reduce((a,[k,v])=>a+v*(types[k]?.[0]||0),0)+Object.entries(h.amenities).reduce((a,[k,v])=>a+v*(amenities[k]?.[0]||0),0)}
function hotel(name){return {id:crypto.randomUUID(),name,rooms:{Classique:8,Supérieure:0,VIP:0,Suite:0},floors:1,amenities:{},staff:{Ménage:2,Réception:1,Sécurité:0},contracts:{},insurance:'Tiers',salaryPercent:10,lastRevenue:0,lastSalary:0,reservations:[]}}
function txn(u,label,amount,day){u.balance=cents(u.balance+amount);u.transactions.unshift({date:new Date().toISOString(),day,label,amount:cents(amount),balance:u.balance});u.transactions=u.transactions.slice(0,10000)}
// A new game day begins at 19:00 in metropolitan France, including daylight saving time.
function gameDay(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date());const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));let d=`${p.year}-${p.month}-${p.day}`;if(Number(p.hour)<19){const t=new Date(`${d}T12:00:00Z`);t.setUTCDate(t.getUTCDate()-1);d=t.toISOString().slice(0,10)}return d}
function daily(u,day){for(const h of u.hotels){const rooms=Object.entries(h.rooms).reduce((s,[k,v])=>s+v*(types[k]?.[1]||0),0);const extras=Object.entries(h.amenities).reduce((s,[k,v])=>s+v*(amenities[k]?.[1]||0),0);const revenue=cents((rooms+extras)*.72);const salary=cents(revenue*h.salaryPercent/100);const staff=cents((h.staff.Ménage*75+h.staff.Réception*95+h.staff.Sécurité*115));const insurance=cents(worth(h)*(rates[h.insurance]||rates.Tiers)/30);const upkeep=cents(worth(h)*.00004);h.lastRevenue=revenue;h.lastSalary=salary;txn(u,`CA ${h.name}`,revenue,day);txn(u,`Salaire dirigeant ${h.name} (${h.salaryPercent} %)`, -salary,day);u.personalBalance=cents(u.personalBalance+salary);u.personalTransactions.unshift({day,label:`Salaire ${h.name}`,amount:salary,balance:u.personalBalance});txn(u,`Personnel ${h.name}`,-staff,day);txn(u,`Assurance ${h.name}`,-insurance,day);txn(u,`Entretien ${h.name}`,-upkeep,day);u.history.unshift({day,hotel:h.name,revenue,salary,staff,insurance,upkeep})}
// Échéances quotidiennes : mensualité contractuelle / 30, avec ajustement final.
for(const loan of (u.loans||[])){if(loan.remaining<=0)continue;
const due=cents(Math.min(loan.remaining,loan.monthlyPayment/30));
if(u.balance>=due){txn(u,`Remboursement prêt ${loan.id}`,-due,day);loan.remaining=cents(Math.max(0,loan.remaining-due));loan.paid=cents((loan.paid||0)+due);loan.arrears=0;}
else {loan.arrears=(loan.arrears||0)+1;u.history.unshift({day,loan:loan.id,incident:'Échéance impayée',due});}
}}
function update(){const day=gameDay();let changed=false;for(const u of Object.values(db.users)){if(!u.lastDay){u.lastDay=day;changed=true;continue}let d=new Date(u.lastDay+'T12:00:00Z'),end=new Date(day+'T12:00:00Z'),count=0;while(d<end&&count<3660){d.setUTCDate(d.getUTCDate()+1);daily(u,d.toISOString().slice(0,10));count++;changed=true}u.lastDay=day}if(changed)persist()}
function auth(req,res,next){const token=(req.headers.authorization||'').replace(/^Bearer /,'');const session=sessions.get(token);const id=session?.id;if(!session||Date.now()-session.created>86400000||!db.users[id])return res.status(401).json({error:'Connexion requise'});req.user=db.users[id];req.id=id;next()}
function fail(res,message,code=400){return res.status(code).json({error:message})}
app.post('/api/register',(req,res)=>{const key=(req.socket.remoteAddress||'local')+':register';let attempt=loginFailures.get(key);if(!attempt||Date.now()-attempt.since>900000)attempt={since:Date.now(),count:0};if(attempt.count>=5)return fail(res,'Trop de créations de comptes. Réessayez plus tard.',429);attempt.count++;loginFailures.set(key,attempt);const pseudo=clean(req.body?.pseudo),password=typeof req.body?.password==='string'?req.body.password:'',name=clean(req.body?.hotel);if(!validName(pseudo)||!validName(name))return fail(res,'Pseudo ou nom d’hôtel invalide (2 à 45 caractères, sans termes offensants).');if(password.length<8||password.length>128)return fail(res,'Mot de passe : 8 caractères minimum.');const id=pseudo.toLocaleLowerCase('fr');if(db.users[id])return fail(res,'Ce pseudo est déjà pris.');const salt=crypto.randomBytes(16).toString('hex');db.users[id]={pseudo,salt,hash:crypto.scryptSync(password,salt,64).toString('hex'),balance:10000000,personalBalance:0,personalTransactions:[],hotels:[hotel(name)],transactions:[],history:[],lastDay:gameDay(),premium:false};persist();return loginSuccess(res,id)});
function loginSuccess(res,id){for(const [token,session] of sessions)if(Date.now()-session.created>86400000)sessions.delete(token);const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{id,created:Date.now()});res.json({token})}
app.post('/api/login',(req,res)=>{const id=clean(req.body?.pseudo).toLocaleLowerCase('fr'),key=(req.socket.remoteAddress||'local')+':'+id,now=Date.now();let attempts=loginFailures.get(key);if(!attempts||now-attempts.since>900000)attempts={since:now,count:0};if(attempts.count>=8)return fail(res,'Trop de tentatives : réessayez dans 15 minutes.',429);
 const u=db.users[id],password=String(req.body?.password||'');let valid=false;
 if(u&&typeof u.hash==='string'&&/^[0-9a-f]{128}$/i.test(u.hash)&&typeof u.salt==='string'&&password.length<=1024){const hash=crypto.scryptSync(password,u.salt,64);valid=crypto.timingSafeEqual(hash,Buffer.from(u.hash,'hex'))}
 if(!valid){attempts.count++;loginFailures.set(key,attempts);return fail(res,'Identifiants incorrects',401)}loginFailures.delete(key);loginSuccess(res,id)});
app.post('/api/logout',auth,(req,res)=>{sessions.delete(req.headers.authorization.replace(/^Bearer /,''));res.json({ok:true})});
app.get('/api/state',auth,(req,res)=>{update();const {salt,hash,...state}=req.user;res.json({...state,loans:state.loans||[],loanMetrics:loanMetrics(req.user),gameDay:gameDay(),nextUpdate:'19:00 (heure de Paris)'})});
app.post('/api/action',auth,(req,res)=>{update();const u=req.user,a=req.body||{},h=u.hotels.find(x=>x.id===a.hotelId);if(a.type==='buyHotel'){const name=clean(a.name),price=1500000;if(!validName(name))return fail(res,'Nom d’hôtel invalide ou offensant.');if(u.hotels.some(x=>x.name.toLowerCase()===name.toLowerCase()))return fail(res,'Ce nom est déjà utilisé.');if(u.balance<price)return fail(res,'Fonds insuffisants.');txn(u,`Achat hôtel ${name}`,-price,gameDay());u.hotels.push(hotel(name))}
else if(a.type==='rename'){const name=clean(a.name);if(!h||!validName(name))return fail(res,'Nom invalide.');if(u.hotels.some(x=>x!==h&&x.name.toLowerCase()===name.toLowerCase()))return fail(res,'Nom déjà utilisé.');h.name=name}
else if(a.type==='salary'){if(!h||!Number.isInteger(a.percent)||a.percent<10||a.percent>15)return fail(res,'Pourcentage entre 10 et 15 uniquement.');h.salaryPercent=a.percent}
else if(a.type==='build'){if(!h)return fail(res,'Hôtel introuvable.');const category=a.category,key=a.key;let price;if(category==='room'&&types[key])price=types[key][0];else if(category==='amenity'&&amenities[key])price=amenities[key][0];else if(category==='floor')price=300000;else return fail(res,'Construction inconnue.');if(u.balance<price)return fail(res,'Fonds insuffisants.');txn(u,`Construction ${key||'étage'} — ${h.name}`,-price,gameDay());if(category==='room')h.rooms[key]++;else if(category==='amenity')h.amenities[key]=(h.amenities[key]||0)+1;else h.floors++}
else if(a.type==='reservation'){
 if(!h)return fail(res,'Hôtel introuvable.');
 const first=clean(a.firstName),last=clean(a.lastName),people=Number(a.people),nights=Number(a.nights),arrival=clean(a.arrival),departure=clean(a.departure),accepted=a.contractAccepted;
 const dateOk=x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T12:00:00Z'));
 if(first.length<2||first.length>50||last.length<2||last.length>50||!/^[\p{L}\p{M} '’-]+$/u.test(first+' '+last))return fail(res,'Nom ou prénom client invalide.');
 if(!Number.isInteger(people)||people<1||people>20||!Number.isInteger(nights)||nights<1||nights>365)return fail(res,'Nombre de personnes (1–20) ou de nuitées (1–365) invalide.');
 if(!dateOk(arrival)||!dateOk(departure)||Date.parse(departure+'T12:00:00Z')-Date.parse(arrival+'T12:00:00Z')!==nights*86400000)return fail(res,'Les dates doivent correspondre exactement au nombre de nuitées.');
 const ranges={tax:[a.taxMin,a.taxMax,0,50],room:[a.roomMin,a.roomMax,0,100000],cleaning:[a.cleaningMin,a.cleaningMax,0,10000]};
 for(const [label,[min,max,lo,hi]] of Object.entries(ranges)){if(!Number.isFinite(Number(min))||!Number.isFinite(Number(max))||Number(min)<lo||Number(max)>hi||Number(min)>Number(max))return fail(res,'Fourchette de prix invalide : '+label+'.')}
 if(typeof accepted!=='boolean')return fail(res,'Indiquez si le contrat est accepté ou non.');
 let roomNumber=null;
 if(accepted){const totalRooms=Object.values(h.rooms||{}).reduce((n,v)=>n+Number(v||0),0);if(totalRooms<1)return fail(res,'Aucune chambre disponible dans cet hôtel.');
  const occupied=(h.reservations||[]).filter(r=>r.contractAccepted&&r.roomNumber&&r.arrival<departure&&arrival<r.departure).map(r=>String(r.roomNumber));
  for(let n=101;n<101+totalRooms;n++){if(!occupied.includes(String(n))){roomNumber=String(n);break}}
  if(!roomNumber)return fail(res,'Aucune chambre libre sur ces dates.');
 }
 h.reservations||=[];const reservation={id:'RES-'+crypto.randomBytes(4).toString('hex').toUpperCase(),createdAt:new Date().toISOString(),firstName:first,lastName:last,people,nights,arrival,departure,taxMin:Number(a.taxMin),taxMax:Number(a.taxMax),roomMin:Number(a.roomMin),roomMax:Number(a.roomMax),cleaningMin:Number(a.cleaningMin),cleaningMax:Number(a.cleaningMax),contractAccepted:accepted,roomNumber};
 h.reservations.unshift(reservation);h.reservations=h.reservations.slice(0,1000);
}
else if(a.type==='insurance'){if(!h||!rates[a.name])return fail(res,'Assurance inconnue.');if(a.name==='Premium')return fail(res,'Assurance Premium verrouillée : paiement réel non configuré.');h.insurance=a.name}
else return fail(res,'Action inconnue.');persist();res.json({ok:true})});
// Banque fictive du jeu : virements internes instantanés, aucun argent réel.
function bankEntry(u,account,label,amount,reference){
 const isPersonal=account==='personal';const field=isPersonal?'personalBalance':'balance';
 const list=isPersonal?'personalTransactions':'transactions';
 u[field]=cents(u[field]+amount);
 u[list] ||= [];
 const entry={id:crypto.randomUUID(),date:new Date().toISOString(),day:gameDay(),label,amount:cents(amount),balance:u[field],reference};
 u[list].unshift(entry);u[list]=u[list].slice(0,10000);return entry;
}
// Crédit bancaire fictif. Le plafond d'endettement est basé sur le CA mensuel
// de référence (30 x le dernier CA journalier clôturé), pas sur le solde bancaire.
const loanMonthly=(principal,months,annualRate=.06)=>{const r=annualRate/12;return cents(principal*r/(1-Math.pow(1+r,-months)))};
function loanMetrics(u){const dailyCA=u.hotels.reduce((sum,h)=>sum+(Number(h.lastRevenue)||0),0);
 const monthlyCA=cents(dailyCA*30),limit=cents(monthlyCA*.5);
 const committed=cents((u.loans||[]).filter(l=>l.remaining>0).reduce((sum,l)=>sum+l.monthlyPayment,0));
 return {dailyCA,monthlyCA,limit,committed,available:cents(Math.max(0,limit-committed))};}
app.post('/api/bank/loan',auth,(req,res)=>{update();const u=req.user;
 const principal=Number(req.body?.amount),months=Number(req.body?.months);
 if(!Number.isSafeInteger(principal)||principal<1000||principal>100000000||!Number.isInteger(months)||months<6||months>120)return fail(res,'Montant (1 000 à 100 000 000 €) ou durée (6 à 120 mois) invalide.');
 const metrics=loanMetrics(u);if(metrics.monthlyCA<=0)return fail(res,'Aucun CA journalier clôturé : demande possible après la première clôture de 19 h.');
 const monthlyPayment=loanMonthly(principal,months);
 if(cents(metrics.committed+monthlyPayment)>metrics.limit)return fail(res,`Prêt refusé : les mensualités cumulées dépasseraient 50 % du CA mensuel de référence (${metrics.limit.toFixed(2)} €).`);
 const id='PRET-'+crypto.randomBytes(5).toString('hex').toUpperCase();
 u.loans||=[];u.loans.push({id,principal,months,annualRate:.06,monthlyPayment,remaining:cents(monthlyPayment*months),paid:0,createdAt:new Date().toISOString(),arrears:0});
 bankEntry(u,'business',`Versement prêt ${id}`,principal,id);persist();res.json({ok:true,id,monthlyPayment,metrics:loanMetrics(u)});
});
app.post('/api/bank/transfer',auth,(req,res)=>{
 update();const u=req.user,source=req.body?.source,destination=req.body?.destination;
 const amount=Number(req.body?.amount),note=clean(req.body?.note).slice(0,100);
 if(!['personal','business'].includes(source)||!['personal','business'].includes(destination)||source===destination)return fail(res,'Comptes source et destination invalides.');
 if(!Number.isFinite(amount)||amount<=0||Math.round(amount*100)!==amount*100&&Math.abs(Math.round(amount*100)-amount*100)>1e-7||amount>1000000000)return fail(res,'Montant invalide (maximum deux décimales).');
 const value=Math.round(amount*100)/100,available=source==='personal'?u.personalBalance:u.balance;
 if(available<value)return fail(res,'Solde insuffisant : découvert interdit.');
 const ref='VIR-'+crypto.randomBytes(5).toString('hex').toUpperCase();
 bankEntry(u,source,`Virement vers ${destination==='personal'?'compte personnel':'compte entreprise'}${note?' — '+note:''}`,-value,ref);
 bankEntry(u,destination,`Virement depuis ${source==='personal'?'compte personnel':'compte entreprise'}${note?' — '+note:''}`,value,ref);
 persist();res.json({ok:true,reference:ref});
});
app.get('/api/bank/statement',auth,(req,res)=>{
 update();const account=req.query.account;
 if(!['personal','business'].includes(account))return fail(res,'Compte invalide.');
 const entries=account==='personal'?(req.user.personalTransactions||[]):(req.user.transactions||[]);
 const from=String(req.query.from||''),to=String(req.query.to||'');
 if((from&&!/^\d{4}-\d{2}-\d{2}$/.test(from))||(to&&!/^\d{4}-\d{2}-\d{2}$/.test(to)))return fail(res,'Dates invalides.');
 const selected=entries.filter(e=>(!from||e.day>=from)&&(!to||e.day<=to));
 const quote=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
 const rows=[['Date','Référence','Libellé','Débit (€)','Crédit (€)','Solde après (€)'],...selected.map(e=>[e.date||e.day,e.reference||e.id||'',e.label,e.amount<0?(-e.amount).toFixed(2):'',e.amount>=0?e.amount.toFixed(2):'',Number(e.balance).toFixed(2)])];
 res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition',`attachment; filename="releve-${account}.csv"`);
 res.send('\ufeff'+rows.map(r=>r.map(quote).join(';')).join('\r\n'));
});
app.get('/api/identity',(q,r)=>r.json({game:'EMPIRE HÔTEL',version:'1.8',port:PORT}));app.use(express.static(path.join(__dirname,'public'),{dotfiles:'deny',index:'index.html'}));app.listen(PORT,'127.0.0.1',()=>console.log('EMPIRE HÔTEL V1.8 : http://localhost:'+PORT));setInterval(update,60000);
