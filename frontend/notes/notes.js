const container = document.getElementById("notes-container");

const addNoteButton = document.getElementById("addNote");

const modal = document.getElementById("delete-modal");

const deleteText = document.getElementById("delete-text");

const cancelButton = document.getElementById("cancel-delete");

const confirmButton = document.getElementById("confirm-delete");

let noteToDelete = null;

function openDeleteModal(id,title){

    noteToDelete=id;

    deleteText.textContent =
        `Czy na pewno chcesz usunąć notatkę "${title}"?`;

    modal.classList.add("show");

}

cancelButton.addEventListener(
    "click",
    ()=>{

        modal.classList.remove("show");

        noteToDelete=null;

    }
);

confirmButton.addEventListener(
    "click",
    async()=>{

        await deleteNote(noteToDelete);

        modal.classList.remove("show");

    }
);
addNoteButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "../addNote/addNote.html";

    }
);

async function loadNotes() {

    const token =
        localStorage.getItem("token");

    if (!token) {

        window.location.href =
            "../login/login.html";

        return;

    }

    try {

        const response =
            await fetch(
                "http://localhost:3000/notes",
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );

        const data =
            await response.json();

        if (data.success) {

            displayNotes(data.notes);

        } else {

            console.log(data.message);

        }

    } catch (error) {

        console.error(error);

    }

}

function displayNotes(notes) {

    container.innerHTML = "";

    if(notes.length === 0){

        container.innerHTML = `
            <p id="no-notes">
                Brak dostępnych notatek
            </p>
        `;

        return;
    }

    notes.forEach(note => {

        const card = document.createElement("div");

        card.className = "note-card";

        card.innerHTML = `

            <button
                class="delete-note"
                data-id="${note.id}"
                data-title="${note.title}">
                ✕
            </button>

            <h3>
                ${note.title}
            </h3>

            <p>
                ${note.content}
            </p>

            <span>
                ${formatDate(note.created_at)}
            </span>

            <button
                class="edit-note"
                data-id="${note.id}">
                Edytuj
            </button>

        `;

        container.appendChild(card);

    });

    document.querySelectorAll(".delete-note")
        .forEach(button => {

            button.addEventListener("click", () => {

                openDeleteModal(
                    button.dataset.id,
                    button.dataset.title
                );

            });

        });

}
async function deleteNote(id){

    const token =
        localStorage.getItem("token");

    try{

        const response =
            await fetch(
                `http://localhost:3000/notes/${id}`,
                {

                    method:"DELETE",

                    headers:{

                        "Authorization":
                        `Bearer ${token}`

                    }

                }
            );

        const data =
            await response.json();

        if(data.success){

            loadNotes();

        }else{

            alert(data.message);

        }

    }catch(error){

        console.error(error);

    }

}
function formatDate(date) {

    const noteDate = new Date(date);

    const days = [

        "niedziela",
        "poniedziałek",
        "wtorek",
        "środa",
        "czwartek",
        "piątek",
        "sobota"

    ];

    const months = [

        "stycznia",
        "lutego",
        "marca",
        "kwietnia",
        "maja",
        "czerwca",
        "lipca",
        "sierpnia",
        "września",
        "października",
        "listopada",
        "grudnia"

    ];

    const weekday =
        days[noteDate.getDay()];

    const day =
        noteDate.getDate();

    const month =
        months[noteDate.getMonth()];

    const year =
        noteDate.getFullYear();

    const hours =
        String(noteDate.getHours())
            .padStart(2, "0");

    const minutes =
        String(noteDate.getMinutes())
            .padStart(2, "0");

    return `${weekday}, ${day} ${month} ${year} • ${hours}:${minutes}`;

}

loadNotes();