const form = document.getElementById("detailsForm");

const genderButtons = document.querySelectorAll(".gender-btn");
const genderInput = document.getElementById("gender");



// wybór płci

genderButtons.forEach(button => {

    button.addEventListener("click", () => {


        genderButtons.forEach(btn => {

            btn.classList.remove("active");

        });


        button.classList.add("active");


        genderInput.value =
            button.dataset.gender;


    });

});




// wysłanie formularza

form.addEventListener(
"submit",
async (e) => {


    e.preventDefault();



    const name =
        document.getElementById("name")
        .value
        .trim();



    const gender =
        genderInput.value;





    // sprawdzenie imienia

    if(!name){


        alert("Podaj imię.");

        return;

    }





    // sprawdzenie płci

    if(!gender){


        alert("Wybierz płeć.");

        return;

    }





    // pobranie JWT

    const token =
        localStorage.getItem("token");



    console.log(
        "Token:",
        token
    );





    // brak tokena

    if(!token){


        alert(
            "Sesja wygasła. Zaloguj się ponownie."
        );


        window.location.href =
            "../login/login.html";


        return;

    }







    try {


        const response =
            await fetch(
                "http://localhost:3000/addDetails",
                {

                    method:"POST",


                    headers:{

                        "Content-Type":
                            "application/json",


                        "Authorization":
                            `Bearer ${token}`

                    },


                    body:JSON.stringify({

                        name,

                        gender

                    })

                }
            );







        const data =
            await response.json();



        console.log(
            "Odpowiedź serwera:",
            data
        );








        if(response.ok && data.success){



            window.location.href =
                "../home/home.html";



        }else{



            alert(
                data.message ||
                "Nie udało się zapisać danych."
            );



        }





    }catch(error){



        console.error(
            error
        );


        alert(
            "Błąd połączenia z serwerem."
        );



    }



});