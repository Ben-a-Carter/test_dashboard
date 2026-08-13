const YEARS=[2022,2023,2024,2025,2026];let activeTab='student',activeData=[],filteredData=[];const dropdownState={},plotFilters={},tableState={sortField:null,sortDirection:'asc'};const colors={navy:'#1f3864',blue:'#2e75b6',green:'#548235',orange:'#d98c31',red:'#c94c4c',purple:'#7665a8',gray:'#73726c'};const plotConfig={responsive:true,displaylogo:false};
function rngFactory(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}function normal(r,m=0,s=1){let u=0,v=0;while(!u)u=r();while(!v)v=r();return m+s*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}function pick(r,a){return a[Math.floor(r()*a.length)]}function clamp(x,a,b){return Math.max(a,Math.min(b,x))}function logit(x){return 1/(1+Math.exp(-x))}function round(x,d=1){let f=10**d;return Math.round(x*f)/f}function sum(d,f){return d.reduce((s,r)=>s+Number(r[f]||0),0)}function avgRaw(d,f){return d.length?sum(d,f)/d.length:0}function avg(d,f,p=1){return avgRaw(d,f).toFixed(p)}function pct(d,f,v){return d.length?`${(d.filter(r=>String(r[f])===String(v)).length/d.length*100).toFixed(1)}%`:'—'}function currency(v){return Math.abs(v)>=1e6?`$${(v/1e6).toFixed(1)}M`:Math.abs(v)>=1e3?`$${(v/1e3).toFixed(1)}K`:`$${Math.round(v).toLocaleString()}`}function uniq(d,f){return[...new Set(d.map(r=>r[f]).filter(v=>v!==null&&v!==undefined&&v!==''))].sort((a,b)=>typeof a==='number'&&typeof b==='number'?a-b:String(a).localeCompare(String(b)))}
function simStudent(n=3500,seed=101){const r=rngFactory(seed),deps=['Public Health','Social Work','Nutrition','Health Administration','Data Science'],types=['Undergraduate','Graduate'],rows=[];for(let i=1;i<=n;i++){const department=pick(r,deps),student_type=pick(r,types),year=pick(r,YEARS),term=pick(r,['Fall','Spring']),attendance=clamp(normal(r,83,10),42,100),advising=Math.round(clamp(normal(r,2.3,1.6),0,8)),engagement=clamp(normal(r,66,15)+advising*1.8+(attendance-80)*.3,10,100),gpa=clamp(normal(r,student_type==='Graduate'?3.32:3.02,.44)+(attendance-80)*.012+advising*.02,.8,4),credits_attempted=student_type==='Graduate'?pick(r,[18,21,24,27]):pick(r,[24,27,30,31,32]),completion=clamp(.55+gpa*.095+attendance*.0013+engagement*.0007+normal(r,0,.07),.35,1),credits_completed=Math.round(credits_attempted*completion),unmet_financial_need=clamp(normal(r,5600,3100),0,20000);let rs=0;if(gpa<2.4)rs+=2.2;else if(gpa<2.9)rs+=1;if(attendance<70)rs+=2;else if(attendance<80)rs+=1;if(completion<.7)rs+=1.8;if(advising===0)rs+=1;if(unmet_financial_need>9500)rs+=.7;const risk_level=rs>=3.3?'High':rs>=1.6?'Medium':'Low',rp=clamp(logit(-1.7+.65*gpa+.022*(attendance-70)+.014*(engagement-50)-.65*(risk_level==='High')),.04,.98),retained=r()<rp?'Yes':'No',gp=clamp(logit(-4.4+1.08*gpa+.025*(attendance-70)+.022*credits_completed),.01,.92),graduated=r()<gp?'Yes':'No';rows.push({id:`S${String(i).padStart(5,'0')}`,year,term,department,student_type,attendance_rate:round(attendance,1),engagement_score:round(engagement,1),advising_visits:advising,gpa:round(gpa,2),credits_attempted,credits_completed,completion_rate:round(completion*100,1),unmet_financial_need:Math.round(unmet_financial_need),risk_level,retained,graduated})}return rows}
function simEnrollment(n=2600,seed=202){const r=rngFactory(seed),regions=['Northeast','Mid-Atlantic','Southeast','Midwest','West','International'],channels=['Organic','Paid Search','Campus Event','Counselor','Alumni Referral','Social Media'],programs=['Public Health','Social Work','Nutrition','Health Administration','Data Science'],rows=[];for(let i=1;i<=n;i++){const year=pick(r,YEARS),term=pick(r,['Fall','Spring']),region=pick(r,regions),channel=pick(r,channels),program=pick(r,programs),applicant_type=pick(r,['First-time','Transfer']),inquiry_score=clamp(normal(r,64,17),5,100),academic_index=clamp(normal(r,78,11),40,100),contact_count=Math.round(clamp(normal(r,3.6,2),0,10)),aid_offer=clamp(normal(r,9200,4200),0,22000),admitP=clamp(logit(-3.2+.045*academic_index+.012*inquiry_score),.05,.98),admitted=r()<admitP?'Yes':'No',yield_probability=admitted==='Yes'?clamp(logit(-2.8+.02*inquiry_score+.11*contact_count+.00005*aid_offer),.03,.95):0,enrolled=admitted==='Yes'&&r()<yield_probability?'Yes':'No',forecast_index=clamp(70+.03*inquiry_score+.02*academic_index+normal(r,0,5),45,100);rows.push({id:`A${String(i).padStart(5,'0')}`,year,term,region,channel,program,applicant_type,inquiry_score:round(inquiry_score,1),academic_index:round(academic_index,1),contact_count,aid_offer:Math.round(aid_offer),admitted,enrolled,forecast_index:round(forecast_index,1)})}return rows}
function simWorkforce(n=1300,seed=303){const r=rngFactory(seed),divisions=['Academic Affairs','Student Affairs','Finance','Advancement','IT','Operations'],roles=['Faculty','Professional Staff','Manager','Executive','Support Staff'],locations=['Main Campus','Downtown','Remote','Regional Site'],rows=[];for(let i=1;i<=n;i++){const year=pick(r,YEARS),division=pick(r,divisions),role=pick(r,roles),location=pick(r,locations),tenure_years=clamp(normal(r,6.8,5.4),0,32),base={Faculty:86000,'Professional Staff':69000,Manager:97000,Executive:168000,'Support Staff':49000}[role],salary=clamp(normal(r,base+tenure_years*1100,base*.14),35000,240000),workload_index=clamp(normal(r,82,12)+(role==='Faculty'?4:0),45,125),engagement_score=clamp(normal(r,72,14)-Math.max(0,workload_index-90)*.35,15,100),retirement_risk=tenure_years>18&&r()<.24?'High':tenure_years>10?'Medium':'Low',vacancy_risk=clamp(logit(-3+.035*workload_index-.025*engagement_score+(retirement_risk==='High'?.8:0)),.02,.88),employment_outcome=r()<(1-vacancy_risk)?'Retained':'Exited';rows.push({id:`E${String(i).padStart(5,'0')}`,year,division,role,location,tenure_years:round(tenure_years,1),salary:Math.round(salary),workload_index:round(workload_index,1),engagement_score:round(engagement_score,1),retirement_risk,employment_outcome})}return rows}
function simBudget(n=1800,seed=404){const r=rngFactory(seed),divisions=['Academic Affairs','Student Affairs','Finance','Advancement','IT','Operations'],cats=['Personnel','Technology','Facilities','Student Support','Research','Marketing'],funds=['Operating','Restricted','Grant','Auxiliary'],rows=[];for(let i=1;i<=n;i++){const year=pick(r,YEARS),division=pick(r,divisions),category=pick(r,cats),fund=pick(r,funds),budget=clamp(normal(r,category==='Personnel'?520000:260000,category==='Personnel'?190000:120000),25000,1200000),variance=clamp(normal(r,0,.085),-.28,.30),actual=budget*(1+variance),utilization_pct=actual/budget*100,impact_score=clamp(normal(r,72,14)-Math.abs(variance)*35,20,100),budget_status=variance>.1?'Over budget':variance<-.1?'Under budget':'On target',strategic_priority=impact_score>78?'High':impact_score>60?'Medium':'Low';rows.push({id:`B${String(i).padStart(5,'0')}`,year,division,category,fund,budget:Math.round(budget),actual:Math.round(actual),variance_pct:round(variance*100,1),utilization_pct:round(utilization_pct,1),impact_score:round(impact_score,1),budget_status,strategic_priority})}return rows}
function simDonor(n=2800,seed=505){const r=rngFactory(seed),segments=['Alumni','Parents','Corporate','Foundation','Friend'],regions=['Northeast','Mid-Atlantic','Southeast','Midwest','West','International'],channels=['Email','Event','Major Gift Officer','Direct Mail','Digital','Peer Referral'],rows=[];for(let i=1;i<=n;i++){const year=pick(r,YEARS),segment=pick(r,segments),region=pick(r,regions),channel=pick(r,channels),engagement_score=clamp(normal(r,63,19),1,100),estimated_capacity=clamp(Math.exp(normal(r,9.4,.85)),1000,500000),contact_touches=Math.round(clamp(normal(r,3.2,2.1),0,12)),giving_propensity=clamp(logit(-4+.035*engagement_score+.14*contact_touches+.000004*estimated_capacity),.01,.97),donated=r()<giving_propensity?'Yes':'No',gift_amount=donated==='Yes'?clamp(estimated_capacity*(.01+r()*.06),25,75000):0,pipeline_stage=donated==='Yes'?'Donor':giving_propensity>.55?'Solicitation':giving_propensity>.3?'Cultivation':'Prospect';rows.push({id:`D${String(i).padStart(5,'0')}`,year,segment,region,channel,engagement_score:round(engagement_score,1),estimated_capacity:Math.round(estimated_capacity),contact_touches,giving_propensity:round(giving_propensity,3),pipeline_stage,donated,gift_amount:Math.round(gift_amount)})}return rows}
function simQuality(n=2200,seed=606){const r=rngFactory(seed),schools=['Health Sciences','Social Sciences','Business','Arts & Sciences','Data & Technology'],standards=['Learning Outcomes','Faculty Credentials','Assessment','Student Support','Continuous Improvement'],levels=['Undergraduate','Graduate','Certificate'],rows=[];for(let i=1;i<=n;i++){const year=pick(r,YEARS),school=pick(r,schools),standard=pick(r,standards),program_level=pick(r,levels),benchmark=clamp(normal(r,82,7),65,96),observed_score=clamp(normal(r,benchmark,8),45,100),evidence_score=clamp(normal(r,80,10),45,100),gap_to_benchmark=observed_score-benchmark,compliance_status=gap_to_benchmark>=2&&evidence_score>=75?'Exceeds':gap_to_benchmark>=-5&&evidence_score>=65?'Meets':'Needs attention',action_status=compliance_status==='Needs attention'?pick(r,['Open','In progress']):pick(r,['Closed','Monitoring']);rows.push({id:`Q${String(i).padStart(5,'0')}`,year,school,standard,program_level,benchmark:round(benchmark,1),observed_score:round(observed_score,1),gap_to_benchmark:round(gap_to_benchmark,1),evidence_score:round(evidence_score,1),compliance_status,action_status})}return rows}
function simCommunication(n=2400,seed=707){const r=rngFactory(seed),audiences=['Students','Faculty/Staff','Alumni','Community','Prospective Students'],channels=['Email','Website','Social Media','Town Hall','Press','SMS'],topics=['Student Success','Research','Finance','Campus Life','Strategic Plan','Community Impact'],rows=[];for(let i=1;i<=n;i++){const year=pick(r,YEARS),audience=pick(r,audiences),channel=pick(r,channels),topic=pick(r,topics),reach=clamp(Math.exp(normal(r,8.1,.8)),250,45000),engagement_rate=clamp(normal(r,channel==='Social Media'?7.5:18,7),1,65),sentiment_score=clamp(normal(r,71,14)+engagement_rate*.15,20,100),trust_score=clamp(normal(r,68,13)+sentiment_score*.12,20,100),transparency_score=clamp(normal(r,73,11)+(channel==='Town Hall'?5:0),30,100),response_tone=sentiment_score>=78?'Positive':sentiment_score>=58?'Neutral':'Negative';rows.push({id:`C${String(i).padStart(5,'0')}`,year,audience,channel,topic,reach:Math.round(reach),engagement_rate:round(engagement_rate,1),sentiment_score:round(sentiment_score,1),trust_score:round(trust_score,1),transparency_score:round(transparency_score,1),response_tone})}return rows}
const configs={student:{title:'Student success and early intervention',description:'Monitor academic engagement, student risk, retention, graduation, and early-intervention indicators.',data:simStudent(),filters:[['year','Academic year'],['term','Term'],['department','Department'],['student_type','Student type'],['risk_level','Risk level']],metrics:[['Students',d=>d.length.toLocaleString()],['Retention',d=>pct(d,'retained','Yes')],['Average GPA',d=>avg(d,'gpa',2)],['High risk',d=>pct(d,'risk_level','High')]],trend:{x:'year',lineField:'retained',lineValue:'Yes',title:'Enrollment and retention trend',help:'Click a year to filter the other views.'},category:{field:'department',stack:'student_type',title:'Students by department',help:'Click a department to cross-filter.'},status:{field:'risk_level',title:'Risk profile',help:'Click a risk category to cross-filter.'},scatter:{x:'attendance_rate',y:'gpa',color:'risk_level',size:'advising_visits',title:'GPA vs. attendance',help:'Use lasso or box select to filter selected students.'},heatmap:{row:'department',col:'year',outcome:'retained',success:'Yes',title:'Retention heatmap',help:'Click a cell to filter department and year.'},distribution:{category:'department',value:'gpa',title:'GPA distribution',help:'Click a department box to cross-filter.'},flow:{first:'risk_level',second:'retained',third:'graduated',title:'Student outcomes flow',help:'Click nodes to filter.'}},
enrollment:{title:'Enrollment forecasting and recruitment analytics',description:'Track applicant pipelines, inquiry strength, admissions, yield, channels, and forecast indicators.',data:simEnrollment(),filters:[['year','Recruitment year'],['term','Entry term'],['region','Region'],['channel','Recruitment channel'],['program','Program'],['applicant_type','Applicant type']],metrics:[['Applicants',d=>d.length.toLocaleString()],['Admit rate',d=>pct(d,'admitted','Yes')],['Yield rate',d=>pct(d.filter(r=>r.admitted==='Yes'),'enrolled','Yes')],['Avg forecast',d=>avg(d,'forecast_index',1)]],trend:{x:'year',lineField:'enrolled',lineValue:'Yes',title:'Applicant volume and enrollment conversion',help:'Click a year to cross-filter.'},category:{field:'region',stack:'applicant_type',title:'Applicants by region',help:'Click a region to cross-filter.'},status:{field:'channel',title:'Recruitment channel mix',help:'Click a channel to cross-filter.'},scatter:{x:'inquiry_score',y:'academic_index',color:'enrolled',size:'contact_count',title:'Inquiry strength vs. academic index',help:'Lasso prospects to filter other views.'},heatmap:{row:'program',col:'year',outcome:'enrolled',success:'Yes',title:'Enrollment conversion heatmap',help:'Click a program-year cell to filter.'},distribution:{category:'region',value:'aid_offer',title:'Aid offer distribution',help:'Click a region box to cross-filter.'},flow:{first:'channel',second:'admitted',third:'enrolled',title:'Recruitment funnel flow',help:'Click nodes to filter.'}},
workforce:{title:'Faculty and staff workforce planning',description:'Analyze staffing, workload, compensation, engagement, retention, retirement exposure, and vacancy risk.',data:simWorkforce(),filters:[['year','Planning year'],['division','Division'],['role','Role'],['location','Location'],['retirement_risk','Retirement risk'],['employment_outcome','Employment outcome']],metrics:[['Employees',d=>d.length.toLocaleString()],['Avg salary',d=>currency(avgRaw(d,'salary'))],['Avg engagement',d=>avg(d,'engagement_score',1)],['Exit rate',d=>pct(d,'employment_outcome','Exited')]],trend:{x:'year',lineField:'employment_outcome',lineValue:'Retained',title:'Workforce size and retention',help:'Click a year to cross-filter.'},category:{field:'division',stack:'role',title:'Employees by division',help:'Click a division to cross-filter.'},status:{field:'retirement_risk',title:'Retirement risk profile',help:'Click a risk level to cross-filter.'},scatter:{x:'workload_index',y:'engagement_score',color:'employment_outcome',size:'tenure_years',title:'Workload vs. engagement',help:'Lasso employees to filter other views.'},heatmap:{row:'division',col:'year',outcome:'employment_outcome',success:'Retained',title:'Retention heatmap',help:'Click a division-year cell to filter.'},distribution:{category:'role',value:'salary',title:'Salary distribution',help:'Click a role box to cross-filter.'},flow:{first:'role',second:'retirement_risk',third:'employment_outcome',title:'Workforce risk flow',help:'Click nodes to filter.'}},
budget:{title:'Budget and resource optimization',description:'Evaluate utilization, variance, impact, resource allocation, and corrective-action opportunities.',data:simBudget(),filters:[['year','Fiscal year'],['division','Division'],['category','Expense category'],['fund','Fund type'],['budget_status','Budget status'],['strategic_priority','Strategic priority']],metrics:[['Budget lines',d=>d.length.toLocaleString()],['Budget',d=>currency(sum(d,'budget'))],['Actual',d=>currency(sum(d,'actual'))],['Avg impact',d=>avg(d,'impact_score',1)]],trend:{x:'year',valueField:'actual',lineNumeric:'budget',title:'Actual spending vs. budget',help:'Click a fiscal year to cross-filter.'},category:{field:'division',stack:'category',valueField:'actual',title:'Spending by division',help:'Click a division to cross-filter.'},status:{field:'budget_status',title:'Budget status',help:'Click a status to cross-filter.'},scatter:{x:'utilization_pct',y:'impact_score',color:'strategic_priority',size:'budget',title:'Utilization vs. strategic impact',help:'Lasso allocations to filter other views.'},heatmap:{row:'division',col:'year',numeric:'variance_pct',title:'Budget variance heatmap',help:'Click a division-year cell to filter.'},distribution:{category:'category',value:'actual',title:'Actual spending distribution',help:'Click a category box to cross-filter.'},flow:{first:'fund',second:'budget_status',third:'strategic_priority',title:'Resource allocation flow',help:'Click nodes to filter.'}},
donor:{title:'Donor development and fundraising',description:'Monitor engagement, capacity, giving propensity, pipeline stage, channel effectiveness, and gift outcomes.',data:simDonor(),filters:[['year','Fiscal year'],['segment','Donor segment'],['region','Region'],['channel','Engagement channel'],['pipeline_stage','Pipeline stage'],['donated','Gift status']],metrics:[['Constituents',d=>d.length.toLocaleString()],['Donor rate',d=>pct(d,'donated','Yes')],['Gift total',d=>currency(sum(d,'gift_amount'))],['Avg propensity',d=>`${(avgRaw(d,'giving_propensity')*100).toFixed(1)}%`]],trend:{x:'year',valueField:'gift_amount',lineField:'donated',lineValue:'Yes',title:'Giving and donor participation',help:'Click a year to cross-filter.'},category:{field:'segment',stack:'channel',valueField:'gift_amount',title:'Giving by donor segment',help:'Click a segment to cross-filter.'},status:{field:'pipeline_stage',title:'Development pipeline',help:'Click a stage to cross-filter.'},scatter:{x:'engagement_score',y:'giving_propensity',color:'donated',size:'estimated_capacity',title:'Engagement vs. giving propensity',help:'Lasso constituents to filter other views.'},heatmap:{row:'segment',col:'year',outcome:'donated',success:'Yes',title:'Donor participation heatmap',help:'Click a segment-year cell to filter.'},distribution:{category:'segment',value:'gift_amount',title:'Gift distribution',help:'Click a segment box to cross-filter.'},flow:{first:'segment',second:'pipeline_stage',third:'donated',title:'Development pipeline flow',help:'Click nodes to filter.'}},
quality:{title:'Accreditation and program quality monitoring',description:'Track benchmark performance, evidence strength, compliance status, continuous improvement, and action items.',data:simQuality(),filters:[['year','Review year'],['school','School'],['standard','Standard'],['program_level','Program level'],['compliance_status','Compliance status'],['action_status','Action status']],metrics:[['Measures',d=>d.length.toLocaleString()],['Meets/exceeds',d=>`${(d.filter(r=>r.compliance_status!=='Needs attention').length/Math.max(d.length,1)*100).toFixed(1)}%`],['Avg observed',d=>avg(d,'observed_score',1)],['Avg benchmark gap',d=>avg(d,'gap_to_benchmark',1)]],trend:{x:'year',lineField:'compliance_status',lineValue:'Exceeds',title:'Quality measures and exceedance rate',help:'Click a review year to cross-filter.'},category:{field:'school',stack:'program_level',title:'Measures by school',help:'Click a school to cross-filter.'},status:{field:'compliance_status',title:'Compliance profile',help:'Click a category to cross-filter.'},scatter:{x:'benchmark',y:'observed_score',color:'compliance_status',size:'evidence_score',title:'Observed performance vs. benchmark',help:'Lasso measures to filter other views.'},heatmap:{row:'standard',col:'year',numeric:'gap_to_benchmark',title:'Benchmark gap heatmap',help:'Click a standard-year cell to filter.'},distribution:{category:'school',value:'evidence_score',title:'Evidence strength distribution',help:'Click a school box to cross-filter.'},flow:{first:'standard',second:'compliance_status',third:'action_status',title:'Quality action flow',help:'Click nodes to filter.'}},
communication:{title:'Strategic communication and transparency',description:'Assess reach, engagement, sentiment, trust, transparency, audience response, and channel effectiveness.',data:simCommunication(),filters:[['year','Year'],['audience','Audience'],['channel','Channel'],['topic','Topic'],['response_tone','Response tone']],metrics:[['Messages',d=>d.length.toLocaleString()],['Total reach',d=>sum(d,'reach').toLocaleString()],['Avg engagement',d=>`${avg(d,'engagement_rate',1)}%`],['Avg trust',d=>avg(d,'trust_score',1)]],trend:{x:'year',valueField:'reach',lineNumeric:'engagement_rate',title:'Reach and engagement trend',help:'Click a year to cross-filter.'},category:{field:'audience',stack:'channel',valueField:'reach',title:'Reach by audience',help:'Click an audience to cross-filter.'},status:{field:'response_tone',title:'Response tone',help:'Click a tone to cross-filter.'},scatter:{x:'engagement_rate',y:'trust_score',color:'response_tone',size:'reach',title:'Engagement vs. trust',help:'Lasso messages to filter other views.'},heatmap:{row:'topic',col:'year',numeric:'transparency_score',title:'Transparency heatmap',help:'Click a topic-year cell to filter.'},distribution:{category:'channel',value:'sentiment_score',title:'Sentiment distribution',help:'Click a channel box to cross-filter.'},flow:{first:'audience',second:'channel',third:'response_tone',title:'Communication response flow',help:'Click nodes to filter.'}}};
const themeState={mode:'system'};function getTheme(){return document.documentElement.getAttribute('data-theme')||'light'}function resolvedTheme(){if(themeState.mode==='light'||themeState.mode==='dark')return themeState.mode;return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}function pTheme(){const d=getTheme()==='dark';return{bg:d?'#1a1e24':'#fff',text:d?'#edf1f5':'#3d3d3a',grid:d?'#30363d':'#e2e0db'}}function themedLayout(l={}){const t=pTheme();return{...l,paper_bgcolor:t.bg,plot_bgcolor:t.bg,font:{color:t.text,...(l.font||{})},xaxis:{gridcolor:t.grid,zerolinecolor:t.grid,...(l.xaxis||{})},yaxis:{gridcolor:t.grid,zerolinecolor:t.grid,...(l.yaxis||{})}}}
function initTheme(){themeState.mode='system';localStorage.removeItem('analytics-theme-mode');const media=window.matchMedia('(prefers-color-scheme: dark)');const apply=()=>{document.documentElement.setAttribute('data-theme',resolvedTheme());updateThemeButton();if(activeData.length)renderDashboard()};document.getElementById('themeToggle').addEventListener('click',()=>{themeState.mode=themeState.mode==='system'?'light':themeState.mode==='light'?'dark':'light';apply()});media.addEventListener('change',()=>{if(themeState.mode==='system')apply()});apply()}function updateThemeButton(){const b=document.getElementById('themeToggle'),i=document.getElementById('themeIcon'),l=document.getElementById('themeLabel');if(themeState.mode==='system'){i.textContent='◐';l.textContent='System'}else if(themeState.mode==='light'){i.textContent='☀︎';l.textContent='Light'}else{i.textContent='☾';l.textContent='Dark'}b.setAttribute('aria-label',`Change appearance. Current setting: ${l.textContent}`);b.title=themeState.mode==='system'?'System. Click to switch to Light.':`${l.textContent}. Click to switch to ${themeState.mode==='light'?'Dark':'Light'}.`}
function resetState(){Object.keys(dropdownState).forEach(k=>delete dropdownState[k]);['trend','category','status','scatter','heatmap','distribution','flow'].forEach(k=>plotFilters[k]={});tableState.sortField='id';tableState.sortDirection='asc'}function applyDropdowns(d){return d.filter(r=>Object.entries(dropdownState).every(([f,v])=>v==='all'||String(r[f])===String(v)))}function applyPlots(d,exclude=null){return d.filter(r=>{for(const[source,filters]of Object.entries(plotFilters)){if(source===exclude)continue;for(const[f,v]of Object.entries(filters)){if(f==='ids'){if(!v.includes(r.id))return false}else if(String(r[f])!==String(v))return false}}return true})}function dataFor(source=null){return applyPlots(applyDropdowns(activeData),source)}
function switchTab(key){activeTab=key;activeData=configs[key].data;resetState();buildUI();renderDashboard();document.querySelectorAll('.tab-button').forEach(b=>b.classList.toggle('active',b.dataset.tab===key))}
function buildUI(){const c=configs[activeTab];document.getElementById('filterTitle').textContent=c.title;document.getElementById('dashboardKicker').textContent=c.title;document.getElementById('dashboardTitle').textContent=c.title;document.getElementById('dashboardDescription').textContent=c.description;const fc=document.getElementById('filterControls');fc.innerHTML='';c.filters.forEach(([f,label])=>{dropdownState[f]='all';const g=document.createElement('div');g.className='filter-group';const l=document.createElement('label');l.htmlFor=`filter-${f}`;l.textContent=label;const s=document.createElement('select');s.id=`filter-${f}`;const a=document.createElement('option');a.value='all';a.textContent=`All ${label.toLowerCase()}`;s.appendChild(a);uniq(activeData,f).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;s.appendChild(o)});s.addEventListener('change',e=>{dropdownState[f]=e.target.value;renderDashboard()});g.append(l,s);fc.appendChild(g)});[['trend','trendTitle','trendHelp'],['category','categoryTitle','categoryHelp'],['status','statusTitle','statusHelp'],['scatter','scatterTitle','scatterHelp'],['heatmap','heatmapTitle','heatmapHelp'],['distribution','distributionTitle','distributionHelp'],['flow','flowTitle','flowHelp']].forEach(([k,t,h])=>{document.getElementById(t).textContent=c[k].title;document.getElementById(h).textContent=c[k].help});document.getElementById('tableTitle').textContent=`${c.title} records`}
function renderDashboard(){filteredData=dataFor();renderMetrics();renderActive();renderResets();renderTrend();renderCategory();renderStatus();renderScatter();renderHeatmap();renderDistribution();renderFlow();renderTable()}
function renderMetrics(){const m=document.getElementById('metrics');m.innerHTML='';configs[activeTab].metrics.forEach(([l,fn])=>{const c=document.createElement('article');c.className='metric-card';c.innerHTML=`<div class="metric-label">${l}</div><div class="metric-value">${fn(filteredData)}</div>`;m.appendChild(c)})}function renderActive(){const c=document.getElementById('activeFilters');c.innerHTML='';let n=0;const chip=t=>{const s=document.createElement('span');s.className='filter-chip';s.textContent=t;c.appendChild(s);n++};Object.entries(dropdownState).forEach(([f,v])=>{if(v!=='all')chip(`${f}: ${v}`)});Object.entries(plotFilters).forEach(([src,fs])=>Object.entries(fs).forEach(([f,v])=>chip(`${src}: ${f==='ids'?`${v.length} selected`:v}`)));if(!n){const s=document.createElement('span');s.className='no-filter';s.textContent='No filters applied';c.appendChild(s)}}
function formatFilterPart(
  field,
  value
) {

  if (
    field === "ids"
  ) {

    return `${value.length.toLocaleString()} selected records`;

  }


  return `${prettify(field)}: ${value}`;

}


function getFiltersAffectingPlot(
  targetSource
) {

  const filters =
    [];


  /*
    Dropdown filters apply to every plot.
  */

  Object.entries(
    dropdownState
  )
  .forEach(
    (
      [
        field,
        value
      ]
    ) => {

      if (
        value !== "all"
      ) {

        filters.push({

          kind:
            "dropdown",

          source:
            field,

          label:
            formatFilterPart(
              field,
              value
            )

        });

      }

    }
  );


  /*
    A plot's own action is deliberately excluded from that
    plot's data in getDataForView(source), so its chip should
    also be excluded from that plot header.

    Every OTHER plot action is affecting this plot and should
    therefore be shown here.
  */

  Object.entries(
    plotFilters
  )
  .forEach(
    (
      [
        source,
        sourceFilters
      ]
    ) => {

      if (
        source ===
        targetSource
      ) {

        return;

      }


      const entries =
        Object.entries(
          sourceFilters
        );


      if (
        entries.length ===
        0
      ) {

        return;

      }


      filters.push({

        kind:
          "plot",

        source,

        label:
          entries
            .map(
              (
                [
                  field,
                  value
                ]
              ) =>
                formatFilterPart(
                  field,
                  value
                )
            )
            .join(
              " + "
            )

      });

    }
  );


  return filters;

}


function clearAppliedFilter(
  filter
) {

  if (
    filter.kind ===
    "dropdown"
  ) {

    dropdownState[
      filter.source
    ] =
      "all";


    const select =
      document.getElementById(
        `filter-${filter.source}`
      );


    if (
      select
    ) {

      select.value =
        "all";

    }

  }

  else if (
    filter.kind ===
    "plot"
  ) {

    /*
      Clear the entire originating plot action.

      This preserves the previous "Reset this plot" semantics.
      Example:
      a heatmap action containing Department + Year is removed
      as one action.
    */

    plotFilters[
      filter.source
    ] =
      {};

  }


  renderDashboard();

}


function renderPlotFilterChips() {

  document
    .querySelectorAll(
      "[data-filter-chips]"
    )
    .forEach(
      container => {

        const targetSource =
          container.dataset.filterChips;


        const filters =
          getFiltersAffectingPlot(
            targetSource
          );


        container.innerHTML =
          "";


        if (
          filters.length ===
          0
        ) {

          const empty =
            document.createElement(
              "span"
            );


          empty.className =
            "plot-filter-empty";


          empty.textContent =
            "No active filters";


          container.appendChild(
            empty
          );


          return;

        }


        filters.forEach(
          filter => {

            const chip =
              document.createElement(
                "span"
              );


            chip.className =
              "plot-filter-chip";


            const text =
              document.createElement(
                "span"
              );


            text.className =
              "plot-filter-chip-text";


            text.textContent =
              filter.label;


            const close =
              document.createElement(
                "button"
              );


            close.type =
              "button";


            close.className =
              "plot-filter-chip-close";


            close.setAttribute(
              "aria-label",
              `Remove filter ${filter.label}`
            );


            close.title =
              `Remove ${filter.label}`;


            close.textContent =
              "×";


            close.addEventListener(
              "click",
              event => {

                event.preventDefault();

                event.stopPropagation();


                clearAppliedFilter(
                  filter
                );

              }
            );


            chip.append(
              text,
              close
            );


            container.appendChild(
              chip
            );

          }
        );

      }
    );

}


function renderResets(){renderPlotFilterChips()}
function renderTrend(){const c=configs[activeTab].trend,d=dataFor('trend'),xs=uniq(d,c.x),bars=xs.map(x=>{const s=d.filter(r=>String(r[c.x])===String(x));return c.valueField?sum(s,c.valueField):s.length}),tr=[{x:xs,y:bars,type:'bar',name:c.valueField||'Count',marker:{color:colors.blue}}];if(c.lineNumeric)tr.push({x:xs,y:xs.map(x=>avgRaw(d.filter(r=>String(r[c.x])===String(x)),c.lineNumeric)),type:'scatter',mode:'lines+markers',name:c.lineNumeric,yaxis:'y2',line:{color:colors.green,width:3}});else if(c.lineField)tr.push({x:xs,y:xs.map(x=>{const s=d.filter(r=>String(r[c.x])===String(x));return s.length?s.filter(r=>String(r[c.lineField])===String(c.lineValue)).length/s.length*100:0}),type:'scatter',mode:'lines+markers',name:c.lineField,yaxis:'y2',line:{color:colors.green,width:3}});Plotly.react('trendChart',tr,themedLayout({margin:{t:15,r:65,b:55,l:60},xaxis:{title:c.x},yaxis:{title:c.valueField||'Count'},yaxis2:{overlaying:'y',side:'right',ticksuffix:c.lineField&&!c.lineNumeric?'%':''},legend:{orientation:'h',y:1.12}}),plotConfig).then(()=>attachCat('trendChart','trend',c.x,p=>p.x))}
function renderCategory(){const c=configs[activeTab].category,d=dataFor('category'),cats=uniq(d,c.field),stacks=uniq(d,c.stack),tr=stacks.map((sv,i)=>({x:cats,y:cats.map(cat=>{const s=d.filter(r=>String(r[c.field])===String(cat)&&String(r[c.stack])===String(sv));return c.valueField?sum(s,c.valueField):s.length}),type:'bar',name:sv,marker:{color:[colors.blue,colors.navy,colors.purple,colors.green,colors.orange][i%5]}}));Plotly.react('categoryChart',tr,themedLayout({barmode:'stack',margin:{t:15,r:15,b:100,l:55},xaxis:{tickangle:-25},yaxis:{title:c.valueField||'Count'},legend:{orientation:'h',y:1.13}}),plotConfig).then(()=>attachCat('categoryChart','category',c.field,p=>p.x))}
function renderStatus(){const c=configs[activeTab].status,d=dataFor('status'),labels=uniq(d,c.field),values=labels.map(v=>d.filter(r=>String(r[c.field])===String(v)).length);Plotly.react('statusChart',[{labels,values,type:'pie',hole:.58,textinfo:'percent'}],themedLayout({margin:{t:20,r:20,b:30,l:20},legend:{orientation:'h',y:-.1}}),plotConfig).then(()=>attachCat('statusChart','status',c.field,p=>p.label))}
function renderScatter(){const c=configs[activeTab].scatter,d=dataFor('scatter'),groups=uniq(d,c.color),tr=groups.map((g,i)=>{const rows=d.filter(r=>String(r[c.color])===String(g));return{x:rows.map(r=>Number(r[c.x])),y:rows.map(r=>Number(r[c.y])),customdata:rows.map(r=>[r.id]),mode:'markers',type:'scattergl',name:g,marker:{size:rows.map(r=>6+Math.min(Math.sqrt(Math.max(Number(r[c.size]||1),1))/8,14)),color:[colors.blue,colors.green,colors.orange,colors.red,colors.purple][i%5],opacity:.65}}});Plotly.react('scatterChart',tr,themedLayout({dragmode:'lasso',margin:{t:15,r:30,b:60,l:60},xaxis:{title:c.x},yaxis:{title:c.y},legend:{orientation:'h',y:1.12}}),plotConfig).then(()=>{const p=document.getElementById('scatterChart');clearListeners(p);p.on('plotly_selected',e=>{if(!e?.points?.length)return;plotFilters.scatter={ids:e.points.map(x=>x.customdata?.[0]).filter(Boolean)};renderDashboard()})})}
function renderHeatmap(){const c=configs[activeTab].heatmap,d=dataFor('heatmap'),rows=uniq(d,c.row),cols=uniq(d,c.col),z=rows.map(rv=>cols.map(cv=>{const s=d.filter(r=>String(r[c.row])===String(rv)&&String(r[c.col])===String(cv));if(!s.length)return null;return c.numeric?avgRaw(s,c.numeric):s.filter(r=>String(r[c.outcome])===String(c.success)).length/s.length*100}));Plotly.react('heatmapChart',[{type:'heatmap',x:cols,y:rows,z,colorscale:[[0,'#d98686'],[.5,'#efcf8c'],[1,'#8abb7c']]}],themedLayout({margin:{t:20,r:70,b:55,l:150},xaxis:{title:c.col}}),plotConfig).then(()=>{const p=document.getElementById('heatmapChart');clearListeners(p);p.on('plotly_click',e=>{const pt=e.points?.[0];if(!pt)return;plotFilters.heatmap={[c.row]:pt.y,[c.col]:pt.x};renderDashboard()})})}
function renderDistribution(){const c=configs[activeTab].distribution,d=dataFor('distribution'),cats=uniq(d,c.category),tr=cats.map((cat,i)=>({y:d.filter(r=>String(r[c.category])===String(cat)).map(r=>Number(r[c.value])),type:'box',name:cat,boxpoints:'outliers',marker:{color:[colors.blue,colors.green,colors.orange,colors.purple,colors.navy][i%5]}}));Plotly.react('distributionChart',tr,themedLayout({margin:{t:20,r:20,b:100,l:55},yaxis:{title:c.value},xaxis:{tickangle:-25},showlegend:false}),plotConfig).then(()=>{const p=document.getElementById('distributionChart');clearListeners(p);p.on('plotly_click',e=>{const v=e.points?.[0]?.data?.name;if(!v)return;plotFilters.distribution={[c.category]:v};renderDashboard()})})}
function renderFlow(){const c=configs[activeTab].flow,d=dataFor('flow'),a=uniq(d,c.first),b=uniq(d,c.second),cc=uniq(d,c.third),labels=[...a,...b,...cc],source=[],target=[],value=[];a.forEach((x,i)=>b.forEach((y,j)=>{const n=d.filter(r=>String(r[c.first])===String(x)&&String(r[c.second])===String(y)).length;if(n){source.push(i);target.push(a.length+j);value.push(n)}}));b.forEach((x,i)=>cc.forEach((y,j)=>{const n=d.filter(r=>String(r[c.second])===String(x)&&String(r[c.third])===String(y)).length;if(n){source.push(a.length+i);target.push(a.length+b.length+j);value.push(n)}}));Plotly.react('flowChart',[{type:'sankey',node:{pad:16,thickness:17,label:labels},link:{source,target,value}}],themedLayout({margin:{t:20,r:20,b:20,l:20}}),plotConfig).then(()=>{const p=document.getElementById('flowChart');clearListeners(p);p.on('plotly_click',e=>{const label=e.points?.[0]?.label;if(!label)return;let f=a.includes(label)?c.first:b.includes(label)?c.second:cc.includes(label)?c.third:null;if(!f)return;plotFilters.flow={[f]:label};renderDashboard()})})}
function attachCat(id,source,field,getter){const p=document.getElementById(id);clearListeners(p);p.on('plotly_click',e=>{const pt=e.points?.[0];if(!pt)return;plotFilters[source]={[field]:getter(pt)};renderDashboard()});p.on('plotly_hover',e=>{const pt=e.points?.[0];if(!pt)return;const v=getter(pt);document.getElementById('hoverStatus').textContent=`Highlighting ${field}: ${v}`;highlightTable(field,v)});p.on('plotly_unhover',()=>{document.getElementById('hoverStatus').textContent='Hover over a categorical mark to highlight related records. Click it to filter the other views.';highlightTable(null,null)})}function clearListeners(p){if(!p?.removeAllListeners)return;['plotly_click','plotly_hover','plotly_unhover','plotly_selected'].forEach(n=>p.removeAllListeners(n))}
function renderTable(){const h=document.getElementById('tableHeader'),tb=document.querySelector('#dataTable tbody');h.innerHTML='';tb.innerHTML='';const fields=Object.keys(activeData[0]||{});if(!tableState.sortField||!fields.includes(tableState.sortField))tableState.sortField=fields[0];fields.forEach(f=>{const th=document.createElement('th'),b=document.createElement('button');b.className='sort-button';b.type='button';b.textContent=prettify(f);if(tableState.sortField===f){const s=document.createElement('span');s.className='sort-indicator';s.textContent=tableState.sortDirection==='asc'?' ▲':' ▼';b.appendChild(s)}b.addEventListener('click',()=>{if(tableState.sortField===f)tableState.sortDirection=tableState.sortDirection==='asc'?'desc':'asc';else{tableState.sortField=f;tableState.sortDirection='asc'}renderTable()});th.appendChild(b);h.appendChild(th)});const sorted=[...filteredData].sort((a,b)=>compare(a[tableState.sortField],b[tableState.sortField],tableState.sortDirection)),shown=sorted.slice(0,250),ranges=numRanges(filteredData,fields);shown.forEach(row=>{const tr=document.createElement('tr');tr.dataset.recordId=row.id;fields.forEach(f=>{const td=document.createElement('td');td.textContent=formatVal(f,row[f]);if(ranges[f]&&Number.isFinite(Number(row[f])))td.style.background=numColor(Number(row[f]),ranges[f]);tr.appendChild(td)});tb.appendChild(tr)});document.getElementById('tableCount').textContent=`${shown.length.toLocaleString()} shown of ${filteredData.length.toLocaleString()}`}
function compare(a,b,d){const f=d==='asc'?1:-1,an=Number(a),bn=Number(b);return Number.isFinite(an)&&Number.isFinite(bn)?(an-bn)*f:String(a??'').localeCompare(String(b??''))*f}function prettify(f){return f.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}function formatVal(f,v){if(v===null||v===undefined)return'';if(f.includes('propensity'))return`${(Number(v)*100).toFixed(1)}%`;if(/salary|budget|actual|amount|capacity|aid_offer|financial_need/.test(f))return`$${Math.round(Number(v)).toLocaleString()}`;if(typeof v==='number'&&!Number.isInteger(v))return v.toFixed(1);return String(v)}function numRanges(d,fields){const o={};fields.forEach(f=>{const v=d.map(r=>Number(r[f])).filter(Number.isFinite);if(v.length)o[f]={min:Math.min(...v),max:Math.max(...v)}});return o}function numColor(v,r){const t=clamp((v-r.min)/((r.max-r.min)||1),0,1),h=210-t*105;return getTheme()==='dark'?`hsl(${h} 38% ${18+t*7}%)`:`hsl(${h} 55% ${96-t*14}%)`}function highlightTable(f,v){document.querySelectorAll('#dataTable tbody tr').forEach(row=>{if(!f){row.style.opacity='1';return}const rec=filteredData.find(x=>x.id===row.dataset.recordId);if(rec)row.style.opacity=String(rec[f])===String(v)?'1':'.22'})}
document.querySelectorAll('.tab-button').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));document.getElementById('resetAll').addEventListener('click',()=>{resetState();buildUI();renderDashboard()});initTheme();switchTab('student');
