import{i as e,n as t,r as n}from"./firebase-CZxFrQus.js";/* empty css               */import{collection as r,doc as i,getDoc as a,getDocs as o,limit as s,orderBy as c,query as l,where as u}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";e((()=>{n();var e=document.getElementById(`username`),d=document.getElementById(`time`),f=document.getElementById(`date`),p=document.getElementById(`addNote`),m=document.getElementById(`latest-note`);p.addEventListener(`click`,()=>{window.location.href=`../addNote/addNote.html`});function h(){let e=new Date;d.textContent=`${String(e.getHours()).padStart(2,`0`)}:${String(e.getMinutes()).padStart(2,`0`)}`,f.textContent=`${[`niedziela`,`poniedziałek`,`wtorek`,`środa`,`czwartek`,`piątek`,`sobota`][e.getDay()]}, ${e.getDate()} ${[`stycznia`,`lutego`,`marca`,`kwietnia`,`maja`,`czerwca`,`lipca`,`sierpnia`,`września`,`października`,`listopada`,`grudnia`][e.getMonth()]} ${e.getFullYear()}`}function g(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function _(e){return e.replace(/<\/span>\s*<\/p>\s*<p>/g,`</span> `).replace(/<p><br><\/p>/g,``)}function v(e){return new Date(e).toLocaleDateString(`pl-PL`,{day:`numeric`,month:`long`,year:`numeric`})}async function y(){let n=localStorage.getItem(`firebaseUID`);if(!n)return!1;let r=await a(i(t,`users`,n));return r.exists()?(e.textContent=r.data().name||`Użytkowniku`,!0):!1}async function b(){let e=localStorage.getItem(`firebaseUID`);if(!e)return;let n=await o(l(r(t,`notes`),u(`id_user`,`==`,e),c(`created_at`,`desc`),s(1)));if(n.empty){m.innerHTML=`<p>Brak notatek</p>`;return}let i=n.docs[0].data();m.innerHTML=`

        <h4>
            ${g(i.title)}
        </h4>


        <div class="latest-content">

            ${_(i.content)}

        </div>


        <span>

            ${v(i.created_at)}

        </span>

    `}async function x(){let t=localStorage.getItem(`token`),n=await(await fetch(`http://localhost:3000/user`,{headers:{Authorization:`Bearer ${t}`}})).json();return n.success?(e.textContent=n.name,!0):!1}async function S(){let e=localStorage.getItem(`token`),t=await(await fetch(`http://localhost:3000/notes`,{headers:{Authorization:`Bearer ${e}`}})).json();if(t.success&&t.notes.length){let e=t.notes[0];m.innerHTML=`

            <h4>
                ${g(e.title)}
            </h4>


            <div class="latest-content">

                ${_(e.content)}

            </div>


            <span>
                ${v(e.created_at)}
            </span>

        `}else m.innerHTML=`<p>Brak notatek</p>`}async function C(){if(!localStorage.getItem(`token`)){window.location.href=`../login/login.html`;return}try{await x(),await S(),console.log(`Backend działa`)}catch{console.log(`Backend offline, Firebase`),await y(),await b()}}C(),h(),setInterval(h,1e3)}))();