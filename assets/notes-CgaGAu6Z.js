import{i as e,n as t,r as n}from"./firebase-CZxFrQus.js";/* empty css               */import{collection as r,deleteDoc as i,doc as a,getDocs as o}from"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";e((()=>{n();var e=document.getElementById(`notes-container`),s=document.getElementById(`addNote`),c=document.getElementById(`delete-modal`),l=document.getElementById(`delete-text`),u=document.getElementById(`cancel-delete`),d=document.getElementById(`confirm-delete`),f=null,p=document.getElementById(`preview-modal`),m=document.getElementById(`preview-title`),h=document.getElementById(`preview-text`),g=document.getElementById(`preview-date`);document.getElementById(`close-preview`).addEventListener(`click`,()=>{p.classList.remove(`show`)}),p.addEventListener(`click`,e=>{e.target===p&&p.classList.remove(`show`)});function _(e,t){f=e,l.textContent=`Czy na pewno chcesz usunąć notatkę "${t}"?`,c.classList.add(`show`)}u.addEventListener(`click`,()=>{c.classList.remove(`show`),f=null}),d.addEventListener(`click`,async()=>{await x(f),c.classList.remove(`show`),f=null}),s.addEventListener(`click`,()=>{window.location.href=`../addNote/addNote.html`});async function v(){let e=localStorage.getItem(`token`);if(!e){window.location.href=`../login/login.html`;return}try{let t=await(await fetch(`http://localhost:3000/notes`,{method:`GET`,headers:{Authorization:`Bearer ${e}`}})).json();if(t.success){b(t.notes);return}}catch{console.log(`Backend offline - Firebase`)}await y()}async function y(){try{let e=localStorage.getItem(`firebaseUID`);if(!e){console.log(`Brak Firebase UID`);return}let n=await o(r(t,`users`,e,`notes`)),i=[];n.forEach(e=>{i.push({id:e.id,...e.data()})}),i.sort((e,t)=>t.createdAt.toMillis()-e.createdAt.toMillis()),b(i)}catch(e){console.error(`Firebase notes error`,e)}}function b(t){if(e.innerHTML=``,t.length===0){e.innerHTML=`

<p id="no-notes">
    Brak dostępnych notatek
</p>

`;return}t.forEach(t=>{let n=document.createElement(`div`);n.className=`note-card`,n.innerHTML=`

<button

class="delete-note"

data-id="${t.id}"

data-title="${T(t.title)}"

>

✕

</button>



<h3>

${T(t.title)}

</h3>



<div class="note-content">

${S(t.content)}

</div>



<span>

${w(t.createdAt)}

</span>



<button

class="edit-note"

data-id="${t.id}"

>

Edytuj

</button>


`,e.appendChild(n),n.addEventListener(`dblclick`,()=>{C(t)})}),document.querySelectorAll(`.delete-note`).forEach(e=>{e.addEventListener(`click`,()=>{_(e.dataset.id,e.dataset.title)})}),document.querySelectorAll(`.edit-note`).forEach(e=>{e.addEventListener(`click`,()=>{window.location.href=`../addNote/addNote.html?id=${e.dataset.id}`})})}async function x(e){let n=localStorage.getItem(`token`);try{if((await(await fetch(`http://localhost:3000/notes/${e}`,{method:`DELETE`,headers:{Authorization:`Bearer ${n}`}})).json()).success){v();return}}catch{console.log(`Backend offline`)}try{let n=localStorage.getItem(`firebaseUID`);if(!n)return;await i(a(t,`users`,n,`notes`,e)),await y()}catch(e){console.error(`Firebase delete error`,e)}}function S(e){return e.replace(/<\/span>\s*<\/p>\s*<p>/g,`</span> `).replace(/<p><br><\/p>/g,``)}function C(e){m.textContent=e.title,h.innerHTML=S(e.content),g.textContent=w(e.createdAt),p.classList.add(`show`)}function w(e){let t;return t=e&&e.toDate?e.toDate():new Date(e),`${[`niedziela`,`poniedziałek`,`wtorek`,`środa`,`czwartek`,`piątek`,`sobota`][t.getDay()]}, ${t.getDate()} ${[`stycznia`,`lutego`,`marca`,`kwietnia`,`maja`,`czerwca`,`lipca`,`sierpnia`,`września`,`października`,`listopada`,`grudnia`][t.getMonth()]} ${t.getFullYear()} • ${String(t.getHours()).padStart(2,`0`)}:${String(t.getMinutes()).padStart(2,`0`)}`}function T(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}v()}))();