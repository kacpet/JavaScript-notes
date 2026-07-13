require("dotenv").config();
const authenticateToken = require("./middleware/auth");
const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());




app.post("/register", async (req, res) => {

    try {

        const { email, password } = req.body;


        const passwordHash = await bcrypt.hash(
            password,
            10
        );


        const result = await db.query(
            `
            INSERT INTO users(email,password_hash)
            VALUES($1,$2)
            RETURNING id
            `,
            [
                email,
                passwordHash
            ]
        );


        const user = result.rows[0];


        const token = jwt.sign(
            {
                id: user.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );


        res.json({

            success: true,

            token

        });


    } catch(error) {

        console.log(error);


        if(error.code === "23505") {

            return res.status(400).json({

                success:false,

                message:"Konto z tym adresem e-mail już istnieje."

            });

        }

        res.status(500).json({
            success:false,
            message:"Błąd serwera."

        });

    }

});

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const result = await db.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (result.rows.length === 0) {

            return res.json({
                success: false
            });

        }

        const user = result.rows[0];

        const correctPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!correctPassword) {

            return res.json({
                success: false
            });

        }

        const token = jwt.sign(
            {
                id: user.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            success: true,
            hasDetails: user.has_details,
            token
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});
app.post("/addDetails", authenticateToken, async (req, res) => {

    try {

        const { name, gender } = req.body;

        const userId = req.user.id;

        const result = await db.query(
            `
            UPDATE users
            SET
                name = $1,
                gender = $2,
                has_details = true
            WHERE id = $3
            RETURNING *
            `,
            [
                name,
                gender,
                userId
            ]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Nie znaleziono użytkownika"
            });

        }

        res.json({
            success: true,
            message: "Dane zapisane"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});
app.get("/user", authenticateToken, async (req, res) => {

    try {


        const userId = req.user.id;


        const result = await db.query(
            `
            SELECT name
            FROM users
            WHERE id = $1
            `,
            [
                userId
            ]
        );


        if(result.rows.length === 0){

            return res.status(404).json({

                success:false,

                message:"Nie znaleziono użytkownika"

            });

        }


        res.json({

            success:true,

            name: result.rows[0].name

        });



    } catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

});
app.get("/notes",authenticateToken,async(req,res)=>{


    try{


        const userId =
            req.user.id;



        const result =
            await db.query(
                
                `
                SELECT *
                FROM notes
                WHERE id_user = $1
                ORDER BY id DESC
                `,

                [
                    userId
                ]

            );



        res.json({

            success:true,

            notes:result.rows

        });



    }catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:"Błąd serwera"

        });


    }


});
app.post("/addNote",authenticateToken,async(req,res)=>{


    try{


        const userId =
            req.user.id;



        const {
            title,
            content
        } = req.body;




        const result =
            await db.query(

            `
            INSERT INTO notes
            (
                id_user,
                title,
                content
            )

            VALUES
            (
                $1,
                $2,
                $3
            )

            RETURNING *
            `,

            [
                userId,
                title,
                content
            ]

        );




        res.json({

            success:true,

            note:result.rows[0]

        });



    }catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:"Błąd serwera"

        });


    }


});
app.delete(
    "/notes/:id",
    authenticateToken,
    async(req,res)=>{

        try{

            const noteId =
                req.params.id;

            const userId =
                req.user.id;

            const result =
                await db.query(

                    `
                    DELETE FROM notes
                    WHERE id=$1
                    AND id_user=$2
                    RETURNING *
                    `,

                    [
                        noteId,
                        userId
                    ]

                );

            if(result.rows.length===0){

                return res.status(404).json({

                    success:false,

                    message:"Nie znaleziono notatki"

                });

            }

            res.json({

                success:true

            });

        }catch(error){

            console.log(error);

            res.status(500).json({

                success:false,

                message:"Błąd serwera"

            });

        }

    }
);
app.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});