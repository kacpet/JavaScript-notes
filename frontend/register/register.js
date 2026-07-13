const form = document.querySelector("form");


const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");



function addError(input) {

    input.classList.add("error");

}



function removeError(input) {

    input.classList.remove("error");

}





// Komponent błędów

const errorBox = document.getElementById("errorBox");
const errorMessage = document.getElementById("errorMessage");
const errorButton = document.getElementById("errorButton");



function showError(message) {

    errorMessage.innerHTML =
        message.replace(/\n/g, "<br>");

    errorBox.classList.add("show");

}



function hideError() {

    errorBox.classList.remove("show");

}



errorButton.addEventListener(
    "click",
    hideError
);






// Obsługa formularza

form.addEventListener(
"submit",
async (e)=>{


    e.preventDefault();



    const email =
        emailInput.value.trim();


    const password =
        passwordInput.value;


    const confirmPassword =
        confirmPasswordInput.value;





    // Usuwanie poprzednich błędów

    [
        emailInput,
        passwordInput,
        confirmPasswordInput

    ].forEach(input => removeError(input));





    let errors = [];





    // Walidacja email

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



    if(!emailRegex.test(email)){


        addError(emailInput);


        errors.push(
            "• Podaj poprawny adres e-mail."
        );


    }







    // Walidacja hasła

    if(password.length < 8){


        addError(passwordInput);


        errors.push(
            "• Hasło musi posiadać minimum 8 znaków."
        );


    }







    // Sprawdzanie zgodności haseł

    if(password !== confirmPassword){


        addError(passwordInput);

        addError(confirmPasswordInput);


        errors.push(
            "• Hasła nie są takie same."
        );


    }








    // Jeżeli błędy lokalne

    if(errors.length > 0){


        showError(
            errors.join("\n")
        );


        return;

    }








    // Rejestracja użytkownika

    try {


        const response = await fetch(
            "http://localhost:3000/register",
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







        const data =
            await response.json();







      // Błąd z serwera

    if(!response.ok){

        if(data.message &&
        data.message.includes("users_email_key")){


            showError(
                "• Konto z tym adresem e-mail już istnieje."
            );
            addError(emailInput);


        }else{


            showError(
                data.message ||
                "• Rejestracja nie powiodła się."
            );


    }


    return;


}









        // Zapis JWT

        localStorage.setItem(
            "token",
            data.token
        );








        // Przejście do uzupełniania danych

        window.location.href =
            "../addDetails/addDetails.html";






    }catch(error){


        console.error(error);


        showError(
            "Błąd połączenia z serwerem."
        );


    }



});