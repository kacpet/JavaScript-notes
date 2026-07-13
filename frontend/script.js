const form = document.querySelector("form");


// komponent błędów

const errorBox = document.getElementById("errorBox");
const errorMessage = document.getElementById("errorMessage");

const errorButton = document.getElementById("errorButton");

const registerButton = document.getElementById("registerButton");



function showError(message){

    errorMessage.innerHTML =
        message.replace(/\n/g,"<br>");

    errorBox.classList.add("show");

}



function hideError(){

    errorBox.classList.remove("show");

}



errorButton.addEventListener(
    "click",
    hideError
);



registerButton.addEventListener(
    "click",
    ()=>{

        window.location.href =
            "register/register.html";

    }
);





form.addEventListener("submit", async (e)=>{

    e.preventDefault();



    const email =
        document.getElementById("email").value.trim();


    const password =
        document.getElementById("password").value;




    try {


        const response = await fetch(
            "http://localhost:3000/login",
            {
                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },


                body:JSON.stringify({
                    email,
                    password
                })

            }
        );



        const data = await response.json();



        if(data.success){


            localStorage.setItem(
                "token",
                data.token
            );



            if(data.hasDetails){


                window.location.href =
                    "home/home.html";


            }else{


                window.location.href =
                    "addDetails/addDetails.html";


            }



        }else{


            showError(
                "Logowanie nie powiodło się.<br><br>Czy chcesz utworzyć nowe konto?"
            );


        }



    }catch(error){


        console.error(error);


        showError(
            "Nie można połączyć się z serwerem."
        );


    }


});