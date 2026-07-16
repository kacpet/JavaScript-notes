import{i as e,n as t,r as n}from"./firebase-CZxFrQus.js";/* empty css               */import{collection as r,getDocs as i}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";e((()=>{n();var e=document.getElementById(`dayContainer`),a=document.getElementById(`day-title`),o=document.querySelector(`.hours-layer`),s=document.querySelector(`.events-layer`),c=new Date;(!e||!o||!s)&&console.error(`Brak wymaganych elementów kalendarza`);var l=[`niedziela`,`poniedziałek`,`wtorek`,`środa`,`czwartek`,`piątek`,`sobota`],u=[`stycznia`,`lutego`,`marca`,`kwietnia`,`maja`,`czerwca`,`lipca`,`sierpnia`,`września`,`października`,`listopada`,`grudnia`],d=[];a.textContent=`${l[c.getDay()]}, ${c.getDate()} ${u[c.getMonth()]}`;async function f(){let e=localStorage.getItem(`token`);try{let t=await(await fetch(`http://localhost:3000/events`,{headers:{Authorization:`Bearer ${e}`}})).json();if(t.events){d=t.events,x();return}}catch{console.log(`Backend offline - Firebase`)}await p()}async function p(){try{let e=localStorage.getItem(`firebaseUID`);if(!e){console.log(`Brak Firebase UID`);return}let n=await i(r(t,`users`,e,`events`));d=[],n.forEach(e=>{d.push({id:e.id,...e.data()})}),console.log(`Firebase events:`,d),x()}catch(e){console.error(`Firebase events error:`,e)}}function m(){return`${c.getFullYear()}-${String(c.getMonth()+1).padStart(2,`0`)}-${String(c.getDate()).padStart(2,`0`)}`}function h(){let e=m();return d.filter(t=>t.event_date?t.event_date.substring(0,10)===e:!1)}function g(e){return e.all_day===!0||e.all_day===1||e.all_day===`true`}function _(e){if(!e)return 0;let t=e.substring(0,5).split(`:`).map(Number);return t[0]*60+t[1]}function v(e){let t=_(e.start_time),n=e.end_time?_(e.end_time):t+60;return n<=t&&(n=t+60),{start:t,end:Math.min(n,1440)}}function y(e,t){let n=v(e),r=v(t);return n.start<r.end&&n.end>r.start}function b(e){let t=document.createElement(`div`);return t.className=`day-event`,t.style.background=e.color||`#7c5cff`,t.innerHTML=`

      <strong>
          ${e.title}
      </strong>


      ${e.location?`

          <small>
              ${e.location}
          </small>

        `:``}

  `,t}function x(){o.innerHTML=``,s.innerHTML=``;let e=h();for(let e=0;e<24;e++){let t=document.createElement(`div`);t.className=`hour`,e===c.getHours()&&t.classList.add(`current`),t.innerHTML=`

        <div class="time">

            ${String(e).padStart(2,`0`)}:00

        </div>

    `,o.appendChild(t)}let t=e.map(e=>g(e)?{...e,start_time:`00:00`,end_time:`24:00`,all_day:!0}:e);t.sort((e,t)=>v(e).start-v(t).start);let n=[];t.forEach(e=>{let t=!1;for(let r=0;r<n.length;r++)if(!n[r].some(t=>y(t,e))){n[r].push(e),e.column=r,t=!0;break}t||(e.column=n.length,n.push([e]))}),t.forEach(e=>{let n=t.filter(t=>y(t,e));e.totalColumns=Math.max(...n.map(e=>e.column+1))}),t.forEach(e=>{let t=b(e),{start:n,end:r}=v(e);t.style.top=`${n/60*100}px`,t.style.height=`${(r-n)/60*100}px`;let i=100/e.totalColumns;t.style.width=`calc(${i}% - 10px)`,t.style.left=`calc(${e.column*i}% + 5px)`,t.style.right=`auto`,e.all_day?t.style.zIndex=`2`:t.style.zIndex=`10`,s.appendChild(t)})}window.addEventListener(`load`,()=>{f(),setTimeout(()=>{let e=document.querySelector(`.current`);e&&e.scrollIntoView({behavior:`smooth`,block:`center`})},500)})}))();