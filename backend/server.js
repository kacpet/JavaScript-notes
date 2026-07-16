require('dotenv').config();
const authenticateToken = require('./middleware/auth');
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `
            INSERT INTO users(email,password_hash)
            VALUES($1,$2)
            RETURNING id
            `,
      [email, passwordHash],
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      },
    );

    res.json({
      success: true,

      token,
    });
  } catch (error) {
    console.log(error);

    if (error.code === '23505') {
      return res.status(400).json({
        success: false,

        message: 'Konto z tym adresem e-mail już istnieje.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Błąd serwera.',
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query('SELECT * FROM users WHERE email=$1', [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.json({
        success: false,
      });
    }

    const user = result.rows[0];

    const correctPassword = await bcrypt.compare(password, user.password_hash);

    if (!correctPassword) {
      return res.json({
        success: false,
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      },
    );

    res.json({
      success: true,
      hasDetails: user.has_details,
      token,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
app.post('/addDetails', authenticateToken, async (req, res) => {
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
      [name, gender, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono użytkownika',
      });
    }

    res.json({
      success: true,
      message: 'Dane zapisane',
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
app.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
            SELECT name
            FROM users
            WHERE id = $1
            `,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,

        message: 'Nie znaleziono użytkownika',
      });
    }

    res.json({
      success: true,

      name: result.rows[0].name,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});
app.get('/notes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
                SELECT *
                FROM notes
                WHERE id_user = $1
                ORDER BY id DESC
                `,

      [userId],
    );

    res.json({
      success: true,

      notes: result.rows,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: 'Błąd serwera',
    });
  }
});
app.post('/addNote', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { title, content } = req.body;

    const result = await db.query(
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

      [userId, title, content],
    );

    res.json({
      success: true,

      note: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: 'Błąd serwera',
    });
  }
});
app.get('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const noteId = req.params.id;

    const userId = req.user.id;

    const result = await db.query(
      `
                SELECT *
                FROM notes
                WHERE id = $1
                AND id_user = $2
                `,

      [noteId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,

        message: 'Nie znaleziono notatki',
      });
    }

    res.json({
      success: true,

      note: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: 'Błąd serwera',
    });
  }
});
app.put('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const noteId = req.params.id;

    const userId = req.user.id;

    const { title, content } = req.body;

    const result = await db.query(
      `
                UPDATE notes

                SET
                    title = $1,
                    content = $2

                WHERE id = $3
                AND id_user = $4

                RETURNING *
                `,

      [title, content, noteId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,

        message: 'Nie znaleziono notatki',
      });
    }

    res.json({
      success: true,

      note: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: 'Błąd serwera',
    });
  }
});
app.delete('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const noteId = req.params.id;

    const userId = req.user.id;

    const result = await db.query(
      `
                    DELETE FROM notes
                    WHERE id=$1
                    AND id_user=$2
                    RETURNING *
                    `,

      [noteId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,

        message: 'Nie znaleziono notatki',
      });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: 'Błąd serwera',
    });
  }
});
app.post('/events', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      title,
      description,
      date,
      location,
      allDay,
      startTime,
      endTime,
      repeat,
      repeatType,
      repeatEvery,
      repeatDays,
      repeatUntil,

      color,
    } = req.body;

    const result = await db.query(
      `
      INSERT INTO events
      (
        id_user,
        title,
        description,
        event_date,
        location,
        all_day,
        start_time,
        end_time,
        is_repeat,
        repeat_type,
        repeat_every,
        repeat_days,
        repeat_until,

        color
      )

      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14
      )

      RETURNING *
      `,
      [
        userId,
        title,
        description,
        date,
        location,
        allDay,
        startTime || null,
        endTime || null,
        repeat,
        repeatType || null,
        repeatEvery || null,
        JSON.stringify(repeatDays || []),
        repeatUntil || null,
        color,
      ],
    );

    res.json({
      success: true,
      event: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: 'Błąd serwera',
    });
  }
});
app.get('/events', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
      SELECT
        id,
        id_user,
        title,
        description,
        event_date::text,
        location,
        all_day,
        start_time,
        end_time,
        is_repeat,
        repeat_type,
        repeat_every,
        repeat_days,
        repeat_until::text,
        color,
        created_at
      FROM events
      WHERE id_user = $1
      ORDER BY event_date ASC
      `,
      [userId],
    );

    res.json({
      success: true,
      events: result.rows,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: 'Błąd serwera',
    });
  }
});
app.post('/finances', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { title, type, amount, category, description, date } = req.body;

    if (!title || !type || !amount || !date) {
      return res.status(400).json({
        success: false,

        message: 'Brak wymaganych danych',
      });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({
        success: false,

        message: 'Niepoprawny typ finansów',
      });
    }

    const result = await db.query(
      `
        INSERT INTO finances
        (
            id_user,
            title,
            type,
            amount,
            category,
            description,
            finance_date
        )

        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
        )

        RETURNING *

        `,

      [
        userId,
        title,
        type,
        amount,
        category || null,
        description || null,
        date,
      ],
    );

    res.json({
      success: true,

      finance: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: 'Błąd serwera',
    });
  }
});
app.get('/finances', authenticateToken, async(req,res)=>{


    try{


        const userId =
        req.user.id;



        const result =
        await db.query(

        `
        SELECT *

        FROM finances

        WHERE id_user=$1

        ORDER BY finance_date DESC

        `,

        [
            userId
        ]

        );




        const finances =
        result.rows;



        let income = 0;

        let expense = 0;



        finances.forEach(item=>{


            const amount =
            Number(item.amount);



            if(item.type === 'income'){

                income += amount;

            }
            else{

                expense += amount;

            }


        });




        res.json({

            success:true,


            finances,


            summary:{


                income,


                expense,


                balance:
                income-expense


            }


        });



    }
    catch(error){


        console.log(error);



        res.status(500).json({

            success:false,

            message:
            'Błąd serwera'

        });


    }


});
app.post('/finance/limits', authenticateToken, async(req,res)=>{

    try{

        const userId = req.user.id;


        const {
            category,
            limitAmount,
            month,
            year
        } = req.body;



        if(
            !category ||
            !limitAmount ||
            !month ||
            !year
        ){

            return res.status(400).json({

                success:false,

                message:
                "Brak wymaganych danych"

            });

        }



        const result =
        await db.query(

        `
        INSERT INTO finance_limits
        (
            id_user,
            category,
            limit_amount,
            month,
            year
        )

        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5
        )

        RETURNING *

        `,

        [
            userId,
            category,
            limitAmount,
            month,
            year
        ]

        );



        res.json({

            success:true,

            limit:
            result.rows[0]

        });



    }
    catch(error){

        console.log(error);


        res.status(500).json({

            success:false,

            message:
            "Błąd serwera"

        });

    }

});
app.get('/finance/limits', authenticateToken, async(req,res)=>{


    try{


        const userId =
        req.user.id;



        const result =
        await db.query(

        `
        SELECT *

        FROM finance_limits

        WHERE id_user=$1

        ORDER BY year DESC, month DESC

        `,

        [
            userId
        ]

        );



        res.json({

            success:true,

            limits:
            result.rows

        });



    }
    catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:
            "Błąd serwera"

        });


    }


});
app.post('/finance/goals', authenticateToken, async(req,res)=>{


    try{


        const userId =
        req.user.id;



        const {
            title,
            targetAmount,
            deadline
        } = req.body;



        if(
            !title ||
            !targetAmount
        ){

            return res.status(400).json({

                success:false,

                message:
                "Brak wymaganych danych"

            });

        }



        const result =
        await db.query(

        `
        INSERT INTO finance_goals
        (
            id_user,
            title,
            target_amount,
            deadline
        )


        VALUES
        (
            $1,
            $2,
            $3,
            $4
        )


        RETURNING *

        `,


        [
            userId,
            title,
            targetAmount,
            deadline || null
        ]

        );



        res.json({

            success:true,

            goal:
            result.rows[0]

        });



    }
    catch(error){


        console.log(error);



        res.status(500).json({

            success:false,

            message:
            "Błąd serwera"

        });


    }


});
app.get('/finance/goals', authenticateToken, async(req,res)=>{


    try{


        const userId =
        req.user.id;



        const result =
        await db.query(

        `
        SELECT *

        FROM finance_goals

        WHERE id_user=$1

        ORDER BY created_at DESC

        `,

        [
            userId
        ]

        );



        res.json({

            success:true,

            goals:
            result.rows

        });



    }
    catch(error){


        console.log(error);



        res.status(500).json({

            success:false,

            message:
            "Błąd serwera"

        });


    }


});
app.put('/finance/goals/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const goalId = req.params.id;

    const {
      amount
    } = req.body;


    if (!amount || amount <= 0) {

      return res.status(400).json({
        success:false,
        message:'Niepoprawna kwota'
      });

    }


    const result = await db.query(
      `
      UPDATE finance_goals

      SET
        saved_amount = saved_amount + $1

      WHERE id = $2
      AND id_user = $3

      RETURNING *
      `,
      [
        amount,
        goalId,
        userId
      ]
    );


    if(result.rows.length === 0){

      return res.status(404).json({
        success:false,
        message:'Nie znaleziono celu'
      });

    }


    res.json({

      success:true,

      goal: result.rows[0]

    });


  } catch(error){

    console.log(error);


    res.status(500).json({

      success:false,

      message:'Błąd serwera'

    });

  }

});
app.delete('/finance/:id', authenticateToken, async (req,res)=>{

  try{

    const userId = req.user.id;

    const financeId = req.params.id;



    const result = await db.query(
      `
      DELETE FROM finances

      WHERE id = $1

      AND id_user = $2

      RETURNING *
      `,
      [
        financeId,
        userId
      ]
    );



    if(result.rows.length === 0){

      return res.status(404).json({

        success:false,

        message:'Nie znaleziono transakcji'

      });

    }



    res.json({

      success:true,

      message:'Usunięto transakcję',

      finance: result.rows[0]

    });



  }catch(error){


    console.log(error);



    res.status(500).json({

      success:false,

      message:'Błąd serwera'

    });


  }


});
app.listen(3000, () => {
  console.log('Serwer działa na porcie 3000');
});
