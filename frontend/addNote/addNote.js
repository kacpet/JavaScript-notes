const titleInput =
    document.getElementById("title");


const contentInput =
    document.getElementById("content");


const saveButton =
    document.getElementById("save-note");


document.querySelectorAll(".toolbar button")
.forEach(button=>{

    button.addEventListener("click",()=>{

        const command =
            button.dataset.command;

        const value =
            button.dataset.value;

        document.execCommand(
            command,
            false,
            value
        );

    });

});

saveButton.addEventListener(
    "click",
    async()=>{

        console.log("Kliknięto zapis");
        const title = titleInput.value.trim();
        const content = contentInput.innerHTML.trim();

        if(title === "" || content === ""){
            alert("Uzupełnij wszystkie pola");
            return;
        }



        const token =
            localStorage.getItem("token");



        if(!token){

            window.location.href =
                "../login/login.html";

            return;

        }




        try{


            const response =
                await fetch(
                    "http://localhost:3000/addNote",
                    {

                        method:"POST",

                        headers:{


                            "Content-Type":
                            "application/json",


                            "Authorization":
                            `Bearer ${token}`


                        },


                        body:JSON.stringify({

                            title:title,

                            content:content

                        })

                    }
                );




            const data =
                await response.json();




            if(data.success){


                alert("Dodano notatkę");


                window.location.href =
                    "../notes/notes.html";


            }else{


                alert(data.message);


            }



        }catch(error){


            console.log(error);


        }



    }
);