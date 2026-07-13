const welcome = document.getElementById("username");
const timeElement = document.getElementById("time");
const dateElement = document.getElementById("date");
const addNoteButton =document.getElementById("addNote");


addNoteButton.addEventListener(
    "click",
    ()=>{

        window.location.href =
            "../addNote/addNote.html";

    }
);

function updateClock(){


    const now = new Date();



    const hours =
        String(now.getHours())
        .padStart(2,"0");


    const minutes =
        String(now.getMinutes())
        .padStart(2,"0");



    timeElement.textContent =
        `${hours}:${minutes}`;



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



    const day =
        now.getDate();


    const month =
        months[now.getMonth()];


    const year =
        now.getFullYear();


    const weekday =
        days[now.getDay()];



    dateElement.textContent =
        `${weekday}, ${day} ${month} ${year}`;

}
async function loadUser(){


    const token =
        localStorage.getItem("token");



    if(!token){

        window.location.href =
            "../login/login.html";

        return;

    }



    try {


        const response =
            await fetch(
                "http://localhost:3000/user",
                {

                    method:"GET",

                    headers:{

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );



        const data =
            await response.json();



        if(data.success){


            welcome.textContent =
                `${data.name}`;


        }else{


            console.log(data.message);


        }



    }catch(error){


        console.error(error);


    }


}


loadUser();
updateClock();


setInterval(
    updateClock,
    1000
);