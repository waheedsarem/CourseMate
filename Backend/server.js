const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./auth'); // Import the auth middleware

const app = express();
app.use(cors());
app.use(express.json());

// Database Configuration
const config = {
    user: "ss",
    password: "pass",
    server: "HP_ENVY_X360\\SQLEXPRESS",
    database: "ProjectDB",
    options: {
        trustServerCertificate: true,
        trustedConnection: false,
        enableArithAbort: true,
        instancename: "SQLEXPRESS"
    },
    port: 1433
};

// Connect to DB
sql.connect(config)
    .then(() => console.log("✅ Connected to the database"))
    .catch((err) => console.error("❌ DB connection failed:", err));

// ------------------------------------------------------------------------------------------
// GET all tables
// ------------------------------------------------------------------------------------------
app.get("/views", async (req, res) => {
    try {
        const tables = ["Admin", "Teachers", "Department", "Students", "Log_in", "Courses", "Course_Semester", "Teacher_Course", "Enrolled", "Grade", "Swapper"];
        const pool = await sql.connect(config);
        let resultData = {};

        for (const table of tables) {
            const result = await pool.request().query(`SELECT * FROM ${table}`);
            resultData[table] = result.recordset;
        }

        res.status(200).json(resultData);
    } catch (err) {
        console.error("❌ Failed to fetch data:", err.message);
        res.status(500).send("Failed to fetch data");
    }
});

// ------------------------------------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------------------------------------
app.post('/login', async (req, res) => {
  const { roll_no, password } = req.body;

  if (!roll_no || !password) {
    return res.status(400).json({ error: 'Roll number and password are required.' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('roll_no', sql.VarChar(10), roll_no)
      .query(`SELECT * FROM Log_in WHERE roll_no = @roll_no`);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password' });
      }

      // ✅ Create JWT token
      const token = jwt.sign(
        { roll_no: user.roll_no },
        'yourSecretKey', // 👉 Replace with a strong secret stored in .env later
        { expiresIn: '2h' }
      );

      res.status(200).json({ message: 'Login successful', token });

    } else {
      res.status(404).json({ error: 'User not found' });
    }

  } catch (err) {
    console.error('❌ Login failed:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// ------------------------------------------------------------------------------------------
// DASHBOARD
// ------------------------------------------------------------------------------------------

//-------GET STUDENT INFORMATION----------------
app.get('/student/:roll_no', async (req, res) => {
    const { roll_no } = req.params;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('roll_no', sql.VarChar(10), roll_no)
            .query(`SELECT * FROM Students WHERE roll_no = @roll_no`);

        if (result.recordset.length > 0) {
            res.status(200).json(result.recordset[0]);
        } else {
            res.status(404).json({ error: 'Student not found' });
        }
    } catch (err) {
        console.error('❌ Failed to fetch student:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// ------------------------------------------------------------------------------------------
// COURSE REGISTRATION
// ------------------------------------------------------------------------------------------

//-------GET COURSES FROM TABLE----------------
app.get('/courses/:rollNo', async (req, res) => {
  const { rollNo } = req.params;

  try {
    // Step 1: Fetch the student's current semester
    const studentResult = await sql.query`
      SELECT semester FROM Students WHERE roll_no = ${rollNo}
    `;
    if (studentResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const currentSemester = studentResult.recordset[0].semester;

    // Step 3: Fetch courses for the current semester
    const coursesResult = await sql.query`
      SELECT 
        tc.teacher_course_code,
        c.course_code,
        c.course_name,
        c.course_type,
        c.credit_hours,
        t.first_name + ' ' + t.last_name AS teacher_name,
        tc.available_seats,
        CASE 
          WHEN e.teacher_course_code IS NOT NULL THEN 1 
          ELSE 0 
        END AS already_enrolled
      FROM Course_Semester cs
      JOIN Courses c ON cs.course_code = c.course_code
      JOIN Teacher_Course tc ON tc.course_code = c.course_code
      LEFT JOIN Teachers t ON tc.teacher_id = t.teacher_id
      LEFT JOIN Enrolled e ON e.teacher_course_code = tc.teacher_course_code AND e.roll_no = ${rollNo} 
      WHERE cs.semester = ${currentSemester}
        AND (
          c.prereq IS NULL
          OR NOT EXISTS (
            SELECT 1 FROM Grade g
            WHERE g.roll_no = ${rollNo} 
              AND g.course_code = c.prereq 
              AND g.grade = 'F'
          )
        )
        AND NOT (
          c.course_code LIKE '%L' AND EXISTS (
            SELECT 1 FROM Grade g
            WHERE g.roll_no = ${rollNo}
              AND g.course_code = LEFT(c.prereq, LEN(c.prereq) - 1)
              AND g.grade = 'F'
          )
        )
        AND NOT EXISTS (
          SELECT 1 FROM Grade g
          WHERE g.roll_no = ${rollNo}
            AND g.course_code = c.course_code
            AND g.grade != 'F'
        )
        AND NOT (
          c.course_type = 'Elective'
          AND EXISTS (
            SELECT 1 
            FROM Grade g2
            WHERE g2.course_code = c.course_code
              AND g2.grade = 'F'
            GROUP BY g2.course_code
            HAVING COUNT(g2.grade) > 20
          )
        )
    `;

    // Step 4: Fetch courses that the student failed in the previous semester
    const failedCoursesResult = await sql.query`
      SELECT 
        tc.teacher_course_code,
        c.course_code,
        c.course_name + ' (Failed)' AS course_name,
        c.course_type,
        c.credit_hours,
        t.first_name + ' ' + t.last_name AS teacher_name,
        tc.available_seats
      FROM Grade g
      JOIN Courses c ON g.course_code = c.course_code
      JOIN Teacher_Course tc ON tc.course_code = c.course_code
      JOIN Teachers t ON tc.teacher_id = t.teacher_id
      WHERE g.roll_no = ${rollNo}
        AND g.grade = 'F'
        AND (
          c.course_type != 'Elective'  -- Include all non-elective courses
          OR (
            c.course_type = 'Elective'  -- For electives, check if more than 20 students have failed
            AND (
              SELECT COUNT(*) 
              FROM Grade g2
              WHERE g2.course_code = c.course_code
              AND g2.grade = 'F'
            ) > 20
          )
        )

      UNION

      SELECT 
        tc.teacher_course_code,
        c.course_code,
        c.course_name + ' (Failed Lab)' AS course_name,
        c.course_type,
        c.credit_hours,
        t.first_name + ' ' + t.last_name AS teacher_name,
        tc.available_seats
      FROM Courses c
      JOIN Teacher_Course tc ON tc.course_code = c.course_code
      JOIN Teachers t ON tc.teacher_id = t.teacher_id
      WHERE c.course_code LIKE '%L'
        AND EXISTS (
          SELECT 1 
          FROM Grade g
          WHERE g.roll_no = ${rollNo}
            AND g.course_code = LEFT(c.course_code, LEN(c.course_code) - 1)
            AND g.grade = 'F'
        )
        AND (
          c.course_type != 'Elective'  -- Include all non-elective courses
          OR (
            c.course_type = 'Elective'  -- For electives, check if more than 20 students have failed
            AND (
              SELECT COUNT(*) 
              FROM Grade g2
              WHERE g2.course_code = LEFT(c.course_code, LEN(c.course_code) - 1)
              AND g2.grade = 'F'
            ) > 20
          )
        )
    `;


    // Step 5: Fetch courses that the student can improve in
    const improvableCoursesResult = await sql.query`
     SELECT 
        tc.teacher_course_code,
        c.course_code,
        c.course_name + ' (Improvement)' AS course_name,
        c.course_type,
        c.credit_hours,
        t.first_name + ' ' + t.last_name AS teacher_name,
        tc.available_seats
      FROM Grade g
      JOIN Courses c ON g.course_code = c.course_code
      JOIN Teacher_Course tc ON tc.course_code = c.course_code
      JOIN Teachers t ON tc.teacher_id = t.teacher_id
      WHERE g.roll_no = ${rollNo}
        AND g.grade NOT IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'F', 'S')
        AND NOT EXISTS ( -- as to lab courses dont appear twice
        SELECT 1 FROM Grade g2
        WHERE g2.roll_no = ${rollNo}
        AND g2.course_code = LEFT(c.course_code, LEN(c.course_code) - 1)
        AND g2.grade = 'F'
    )
    `;

    // Step 6: Combine both results
    const combinedCourses = [
      ...coursesResult.recordset,  // Current semester available courses
      ...failedCoursesResult.recordset,  // Failed courses from the previous semester
      ...improvableCoursesResult.recordset // Improvement courses from the previous semester
    ];

    res.status(200).json(combinedCourses);

  } catch (err) {
    console.error('❌ Error fetching courses:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

//-------ENROLL IN SELECTED COURSES--------------
app.get('/enrolledCourses/:rollNo', async (req, res) => {
  const { rollNo } = req.params;

  try {
      const pool = await sql.connect(config);
      const result = await pool.request()
          .input('rollNo', sql.VarChar(10), rollNo)
          .query(`
              SELECT c.course_code
              FROM Enrolled e
              JOIN Teacher_Course tc ON e.teacher_course_code = tc.teacher_course_code
              JOIN Courses c ON tc.course_code = c.course_code
              WHERE e.roll_no = @rollNo
          `);

      res.status(200).json(result.recordset);
  } catch (err) {
      console.error("Error fetching enrolled courses:", err.message);
      res.status(500).json({ error: "Server error" });
  }
});

//-------ENROLL IN SELECTED COURSES--------------
app.post('/enroll', async (req, res) => {
  const { roll_no, selectedCourses } = req.body;

  if (!roll_no || !Array.isArray(selectedCourses) || selectedCourses.length === 0) {
      return res.status(400).json({ error: 'roll_no and selectedCourses are required' });
  }

  const transaction = new sql.Transaction();

  try {
      await transaction.begin();
      const request = new sql.Request(transaction);

      for (const teacher_course_code of selectedCourses) {
        const insertRequest = new sql.Request(transaction);
        await insertRequest
            .input('roll_no', sql.VarChar(10), roll_no)
            .input('teacher_course_code', sql.VarChar(20), teacher_course_code)
            .query(`
                INSERT INTO Enrolled (roll_no, teacher_course_code)
                VALUES (@roll_no, @teacher_course_code)
            `);
    
        const updateRequest = new sql.Request(transaction);
        await updateRequest
            .input('teacher_course_code', sql.VarChar(20), teacher_course_code)
            .query(`
                UPDATE Teacher_Course
                SET available_seats = available_seats - 1
                WHERE teacher_course_code = @teacher_course_code AND available_seats > 0
            `);
    }

      await transaction.commit();
      res.status(200).json({ message: 'Enrollment successful' });
  } catch (err) {
      await transaction.rollback();
      console.error('❌ Enrollment failed:', err.message);
      res.status(500).json({ error: 'Enrollment failed' });
  }
});



// ------------------------------------------------------------------------------------------
// TRANSCRIPT
// ------------------------------------------------------------------------------------------

//----------GET TRANSCRIPT TABLES-----------------
app.post('/Transcript', async (req, res) => {
    const { roll_no } = req.body;

    if (!roll_no ) {
        return res.status(400).json({ error: 'Roll number is required.' });
    }

    try {
        const result = await sql.query`
            select Courses.course_code as course_code, courses.credit_hours as credit_hours, 
            Grade.grade as grade, courses.course_type as course_type,semester as semester
            from Grade join Courses on Grade.course_code=Courses.course_code
            join Course_Semester on Course_Semester.course_code=courses.course_code
            where Grade.roll_no=${roll_no} 
            order by semester;
        `;

        // if (result.recordset.length > 0) {
        //     res.status(200).json({ message: 'Login successful', user: result.recordset[0] });
        // } else {
        //     res.status(401).json({ error: 'Incorrect roll number or password' });
        // }
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('❌ Login failed:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// ------------------------------------------------------------------------------------------
// SWAP SECTION
// ------------------------------------------------------------------------------------------

//---------------PENDING REQUEST--------------------------
app.post('/SwapSection/Pending', async (req, res) => {
    const { roll_no } = req.body;

    if (!roll_no ) {
        return res.status(400).json({ error: 'Roll number is required.' });
    }

    try {
        const result = await sql.query`           
        select Swapper.add_course as courseToBeAdded, Swapper.drop_course as courseToBeDropped 
        from Swapper where swapper.roll_no=${roll_no}
        `;

        // if (result.recordset.length > 0) {
        //     res.status(200).json({ message: 'Login successful', user: result.recordset[0] });
        // } else {
        //     res.status(401).json({ error: 'Incorrect roll number or password' });
        // }
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('❌ request for pending swap failed:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//---------------ENROLLMENTS--------------------------
app.post('/SwapSection/Enrollments', async (req, res) => {
    const { roll_no } = req.body;

    if (!roll_no ) {
        return res.status(400).json({ error: 'Roll number is required.' });
    }

    try {
        const result = await sql.query`           
        select Enrolled.teacher_course_code as teacherCourseCode,
    teachers.first_name+' ' +teachers.last_name as teacherName,
    course_code as courseCode
from
    Enrolled join Teacher_Course on Enrolled.teacher_course_code=Teacher_Course.teacher_course_code
    join Teachers on Teachers.teacher_id=teacher_course.teacher_id
where roll_no=${roll_no}
        `;

        // if (result.recordset.length > 0) {
        //     res.status(200).json({ message: 'Login successful', user: result.recordset[0] });
        // } else {
        //     res.status(401).json({ error: 'Incorrect roll number or password' });
        // }
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('❌ request for showing enrolment failed:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//---------------AVALIABLE--------------------------
app.post('/SwapSection/Available', async (req, res) => {
    const { roll_no } = req.body;

    if (!roll_no ) {
        return res.status(400).json({ error: 'Roll number is required.' });
    }

    try {
        const result = await sql.query`           
       
select teacher_course_code as teacherCourseCode, courses.course_code as courseCode,
 Teachers.first_name+' ' +Teachers.last_name as teacherName from teacher_course
 join courses on teacher_course.course_code=courses.course_code
 join teachers on Teacher_Course.teacher_id=teachers.teacher_id
 join Course_Semester on Course_Semester.course_code=Courses.course_code
 where teacher_course_code not in (
select Enrolled.teacher_course_code as teacherCourseCode
from
    Enrolled join Teacher_Course on Enrolled.teacher_course_code=Teacher_Course.teacher_course_code
    join Teachers on Teachers.teacher_id=teacher_course.teacher_id
where roll_no=${roll_no})
AND Course_Semester.semester=(select semester from Students where roll_no=${roll_no})
        `;

        // if (result.recordset.length > 0) {
        //     res.status(200).json({ message: 'Login successful', user: result.recordset[0] });
        // } else {
        //     res.status(401).json({ error: 'Incorrect roll number or password' });
        // }
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('❌ request for showing enrolment failed:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//---------------LODGE REQUEST--------------------------
app.post('/SwapSection/lodgeRequest', async (req, res) => {
    const { roll_no, course_add,course_drop } = req.body;

    if (!roll_no ) {
        return res.status(400).json({ error: 'Roll number is required.' });
    }

    try {
        const result = await sql.query`           
        
        INSERT into Swapper(roll_no,add_course,drop_course)
        values(${roll_no},${course_add},${course_drop})
        `;

        // if (result.recordset.length > 0) {
        //     res.status(200).json({ message: 'Login successful', user: result.recordset[0] });
        // } else {
        //     res.status(401).json({ error: 'Incorrect roll number or password' });
        // }
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('❌ request for showing enrolment failed:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// ------------------------------------------------------------------------------------------
// ENROLLED COURSES
// ------------------------------------------------------------------------------------------

//---------------ENROLLED COURSES OF STUDENT--------------------------
app.get('/enrolled-courses/:rollNumber', async (req, res) => {
  const { rollNumber } = req.params;
  try {
    console.log(`Fetching enrolled courses for roll number: ${rollNumber}`); // Log the roll number
    const result = await sql.query`
      SELECT 
          c.Course_code,
          c.Course_name,
          c.course_type AS Type,
          c.credit_hours AS Credit_Hours,
          t.first_name + ' ' + t.last_name AS Teacher,
          e.teacher_course_code
      FROM Enrolled e
      JOIN Teacher_Course tc ON e.teacher_course_code = tc.teacher_course_code
      JOIN Courses c ON tc.course_code = c.course_code
      JOIN Teachers t ON tc.teacher_id = t.teacher_id
      WHERE e.roll_no = ${rollNumber};
    `;
    console.log('Enrolled Courses:', result.recordset); // Log the result
    res.json(result.recordset);
  } catch (err) {
    console.error('Error executing query:', err); // Log any error from the query
    res.status(500).send('Error fetching enrolled courses');
  }
});

//---------------DROP THE COURSES SELECTED--------------------------
app.post('/drop-courses', async (req, res) => {
  console.log("📦 Received drop request:", req.body); // ✅ Debug log
  const { rollNumber, courses } = req.body;

  if (!rollNumber || !Array.isArray(courses) || courses.length === 0) {
    return res.status(400).json({ error: 'rollNumber and courses are required' });
  }

  const transaction = new sql.Transaction();

  try {
    await transaction.begin();

    for (const teacher_course_code of courses) {
      // Request for DELETE
      const deleteRequest = new sql.Request(transaction);
      await deleteRequest
        .input('roll_no', sql.VarChar(10), rollNumber)
        .input('teacher_course_code', sql.VarChar(25), teacher_course_code)
        .query(`
          DELETE FROM Enrolled 
          WHERE roll_no = @roll_no AND teacher_course_code = @teacher_course_code
        `);

      // Request for UPDATE (separate request to avoid duplicate param name)
      const updateRequest = new sql.Request(transaction);
      await updateRequest
        .input('teacher_course_code', sql.VarChar(25), teacher_course_code)
        .query(`
          UPDATE Teacher_Course 
          SET available_seats = available_seats + 1 
          WHERE teacher_course_code = @teacher_course_code
        `);
    }

    await transaction.commit();
    res.status(200).json({ message: 'Courses dropped successfully' });
  } catch (err) {
    await transaction.rollback();
    console.error('❌ Error in /drop-courses:', err.message);
    res.status(500).json({ error: 'Server error while dropping courses' });
  }
});



// ------------------------------------------------------------------------------------------
// RESET PASSWORD
// ------------------------------------------------------------------------------------------

//---------------PASSWORD RESET--------------------------
app.post('/reset-password', async (req, res) => {
  const { roll_no, old_password, new_password } = req.body;

  if (!roll_no || !old_password || !new_password) {
    return res.status(400).json({ error: 'Roll number, old password, and new password are required.' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('roll_no', sql.VarChar(10), roll_no)
      .query(`SELECT * FROM Log_in WHERE roll_no = @roll_no`);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      // Compare hashed password using bcrypt
      const isMatch = await bcrypt.compare(old_password, user.password);

      if (isMatch) {
        // Hash the new password before storing
        const hashedNewPassword = await bcrypt.hash(new_password, 10);

        await pool.request()
          .input('new_password', sql.VarChar(255), hashedNewPassword)
          .input('roll_no', sql.VarChar(10), roll_no)
          .query(`UPDATE Log_in SET password = @new_password WHERE roll_no = @roll_no`);

        res.status(200).json({ message: 'Password updated successfully!' });
      } else {
        res.status(401).json({ error: 'Old password is incorrect.' });
      }
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('❌ Error updating password:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});



// ------------------------------------------------------------------------------------------
// ADMIN
// ------------------------------------------------------------------------------------------
app.post('/Admin', async (req, res) => {
  const { roll_no, password } = req.body;

  if (!roll_no || !password) {
    return res.status(400).json({ error: 'Roll number and password are required.' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('roll_no', sql.VarChar(10), roll_no)
      .query(`SELECT * FROM admin WHERE admin_id = @roll_no`);

    if (result.recordset.length > 0) {
      const admin = result.recordset[0];

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password' });
      }

      // ✅ Create JWT token
      const token = jwt.sign(
        { admin_id: admin.admin_id },
        'yourSecretKey', // 👉 Move this to process.env.SECRET later
        { expiresIn: '2h' }
      );

      res.status(200).json({ message: 'Admin login successful', token });
    } else {
      res.status(404).json({ error: 'Admin not found' });
    }

  } catch (err) {
    console.error('❌ Admin login failed:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/changecourse/add', async (req, res) => {
  const { courseCode,courseName,
      courseType,creditHours,department,preReq } = req.body;

  if (!courseCode || !courseName ||
      !courseType || !creditHours || !department ) {
    return res.status(400).json({ error: 'courseCode,courseName,coursetype,creditHours,department,preReq  are required. '});
  }
  let result;
  try {
      if(preReq){
          result = await sql.query`           
          
          insert into courses(course_code,course_name,course_type,prereq,credit_hours,department_id)
          VALUES(${courseCode},${courseName},${courseType},${preReq},${creditHours},${department})
          `;      
      }else{
          result = await sql.query`           
          
          insert into courses(course_code,course_name,course_type,credit_hours,department_id)
          VALUES(${courseCode},${courseName},${courseType},${creditHours},${department})
          `;  
      }


      res.status(200).json(result.recordset);
  } catch (err) {
      console.error('❌ addition of courses failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
    
});

app.post('/changecourse/update', async (req, res) => {
  const { courseCode,courseName,
      courseType,creditHours,department,preReq } = req.body;

  if (!courseCode  ) {
    return res.status(400).json({ error: 'courseCode'});
  }
  let result;
  try {
      if(courseName){
          result = await sql.query`           
          
          UPDATE COURSES SET course_name=${courseName} where course_code=${courseCode} 
          `;      
      } 
      if(courseType){
          result = await sql.query`           
          
          UPDATE COURSES SET course_Type=${courseType} where course_code=${courseCode} 
          `;      
      }  
      if(preReq){
          result = await sql.query`           
          
          UPDATE COURSES SET preReq=${preReq} where course_code=${courseCode} 
          `;      
      } 
      if(creditHours){
          result = await sql.query`           
          
          UPDATE COURSES SET credit_hours=${creditHours} where course_code=${courseCode} 
          `;      
      }
      if(department){
          result = await sql.query`           
          
          UPDATE COURSES SET department_id=${department} where course_code=${courseCode} 
          `;      
      }   
      


      res.status(200).json(result.recordset);
  } catch (err) {
      console.error('❌ addition of courses failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
    
});

app.post('/changecourse/delete', async (req, res) => {
  const { courseCode,courseName,
      courseType,creditHours,department,preReq } = req.body;

  if (!courseCode  ) {
    return res.status(400).json({ error: 'courseCode'});
  }
  let result;
  try {
      
          result = await sql.query`           
          
          Delete from COURSES where course_code=${courseCode} 
          `;      
      
      


      res.status(200).json(result.recordset);
  } catch (err) {
      console.error('❌ addition of courses failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
    
});

app.post('/changesection/add', async (req, res) => {
  const {   teacherCourseCode,
      courseCode,
      teacherCode,
      availableSeats } = req.body;

  if (!teacherCourseCode  ) {
    return res.status(400).json({ error: 'teacherCourseCode'});
  }
  let result;
  try {
      
          result = await sql.query`           
          
          insert into teacher_course(course_code,teacher_course_code,teacher_id,available_seats)
          VALUES(${courseCode},${teacherCourseCode},${teacherCode},${availableSeats})
          `;  
      


      res.status(200).json(result.recordset);
  } catch (err) {
      console.error('❌ addition of section failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
    
});

app.post('/changesection/update', async (req, res) => {
  const {   teacherCourseCode,
      courseCode,
      teacherCode,
      availableSeats } = req.body;

  if (!teacherCourseCode  ) {
    return res.status(400).json({ error: 'teacherCourseCode'});
  }
  
  let result;
  try {
      if(courseCode){
          result = await sql.query`           
          
          UPDATE TEACHER_COURSE SET course_code=${courseCode} where teacher_course_code=${teacherCourseCode} 
          `;      
      } 
      if(teacherCode){
          result = await sql.query`           
          
          UPDATE TEACHER_COURSE SET teacher_id=${teacherCode} where teacher_course_code=${teacherCourseCode} 
          `;      
      }  
      if(availableSeats){
          result = await sql.query`           
          
          UPDATE TEACHER_COURSE SET available_seats=${availableSeats} where teacher_course_code=${teacherCourseCode} 
          `;      
      }  
      


      res.status(200).json(result.recordset);
  } catch (err) {
      console.error('❌ updation of sections failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
    
});

app.post('/changesection/delete', async (req, res) => {
  const {   teacherCourseCode,
      courseCode,
      teacherCode,
      availableSeats } = req.body;

  if (!teacherCourseCode  ) {
    return res.status(400).json({ error: 'teacherCourseCode'});
  }
  let result;
  try {
      
          result = await sql.query`           
          
          Delete from TEACHER_COURSE where teacher_course_code=${teacherCourseCode} 
          `;      
      
      


      res.status(200).json(result.recordset);
  } catch (err) {
      console.error('❌ deletion of sections failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
    
});

app.post('/changeteacher/add', async (req, res) => {
  const {   firstName,
      lastName,
      teacherId,
      email} = req.body;

  if (!teacherId  ) {
    return res.status(400).json({ error: 'teacherId missing'});
  }
  let result;
  try {
      
          result = await sql.query`           
          
          insert into teachers(teacher_id,first_name,last_name,email)
          VALUES(${teacherId},${firstName},${lastName},${email})
          `;  
      


      res.status(200).json(result.recordset);
  } catch (err) {
      console.error('❌ addition of teacher failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
    
});

app.post('/changeteacher/update', async (req, res) => {
  const {   firstName,
      lastName,
      teacherId,
      email} = req.body;

  if (!teacherId  ) {
    return res.status(400).json({ error: 'teacherId missing'});
  }
  
  let result;
  try {
      if(firstName){
          result = await sql.query`           
          
          UPDATE TEACHERS SET first_name=${firstName} where teacher_id=${teacherId} 
          `;      
      } 
      if(lastName){
          result = await sql.query`           
          
          UPDATE TEACHERS SET last_name=${lastName} where teacher_id=${teacherId} 
          `;      
      }  
      if(email){
          result = await sql.query`           
          
          UPDATE TEACHERS SET email=${email} where teacher_id=${teacherId} 
          `;      
      }  
      


      res.status(200).json(result.recordset);
  } catch (err) {
      console.error('❌ updation of teachers failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
    
});

app.post('/changeteacher/delete', async (req, res) => {
  const {   firstName,
      lastName,
      teacherId,
      email} = req.body;

  if (!teacherId  ) {
    return res.status(400).json({ error: 'teacherId missing'});
  }
  let result;
  try {
      
          result = await sql.query`           
          
          Delete from TEACHERS where teacher_id=${teacherId} 
          `;      
      
      


      res.status(200).json(result.recordset);
  } catch (err) {
      console.error('❌ deletion of teachers failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
    
});

app.post('/changestudent/add', async (req, res) => {
  const {    firstName,lastName,
      rollNumber,departmentId,
      batch, semester,email} = req.body;

  if (!rollNumber  ) {
    return res.status(400).json({ error: 'rollNumber missing'});
  }
  let result;
  try {
      
          result = await sql.query`           
          
          INSERT INTO Students
  (roll_no, first_name, last_name, department_id, batch, semester, email)
  VALUES(${rollNumber},${firstName},${lastName},${departmentId},${batch},${semester},${email})
          `;  
      


      res.status(200).json(result.recordset);
  } catch (err) {
      console.error('❌ addition of Student failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
    
});

app.post('/changestudent/update', async (req, res) => {
  const {    firstName,lastName,
      rollNumber,departmentId,
      batch, semester,email} = req.body;

  if (!rollNumber  ) {
      console.log("no roll no");
      return res.status(400).json({ error: 'rollNumber missing'});
 
  }
  
  let result;
  try {
      if(firstName){
          result = await sql.query`           
          
          UPDATE STUDENTS SET first_name=${firstName} where roll_no=${rollNumber} 
          `;      
      } 
      if(lastName){
          result = await sql.query`           
          
          UPDATE STUDENTS SET last_name=${lastName} where roll_no=${rollNumber} 
          `;      
      }
      if(departmentId){
          result = await sql.query`           
          
          UPDATE STUDENTS SET department_id=${departmentId} where roll_no=${rollNumber} 
          `;      
      }
      if(batch){
          result = await sql.query`           
          
          UPDATE STUDENTS SET batch=${batch} where roll_no=${rollNumber} 
          `;      
      }  
      if(semester){
          result = await sql.query`           
          
          UPDATE STUDENTS SET semester=${semester} where roll_no=${rollNumber}  
          `;      
      }      
      if(email){
          result = await sql.query`           
          
          UPDATE STUDENTS SET email=${email} where roll_no=${rollNumber} 
          `;      
      }  
      


      res.status(200).json(result.recordset);
  } catch (err) {
      console.error('❌ updation of Students failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
    
});

app.post('/changestudent/delete', async (req, res) => {
   const {    firstName,lastName,
      rollNumber,departmentId,
      batch, semester,email} = req.body;

  if (!rollNumber  ) {
      console.log("ghalat");
    return res.status(400).json({ error: 'rollNumber missing'});
  }
  let result;
  try {
      
          result = await sql.query`           
          
          Delete from STUDENTS where roll_no=${rollNumber} 
          `;      
      
      


      res.status(200).json(result.recordset);
  } catch (err) {
      console.error('❌ deletion of Student failed:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
    
});

app.post('/changeadmin/update', async (req, res) => {
  const { adminId, newPassword } = req.body;

  if (!adminId || !newPassword) {
      return res.status(400).json({ error: 'adminId and newPassword are required.' });
  }

  try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const pool = await sql.connect(config);

      const result = await pool.request()
          .input('admin_id', sql.VarChar(10), adminId)
          .input('password', sql.VarChar(255), hashedPassword)
          .query('UPDATE admin SET password = @password WHERE admin_id = @admin_id');

      if (result.rowsAffected[0] === 0) {
          return res.status(404).json({ error: 'Admin not found.' });
      }

      res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
      console.error('❌ Error updating password:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/changeadmin/add', async (req, res) => {
const { adminId, newPassword } = req.body;

if (!adminId || !newPassword) {
    return res.status(400).json({ error: 'adminId and password are required.' });
}

try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const pool = await sql.connect(config);

    await pool.request()
        .input('admin_id', sql.VarChar(10), adminId)
        .input('password', sql.VarChar(255), hashedPassword)
        .query('INSERT INTO admin (admin_id, password) VALUES (@admin_id, @password)');

    res.status(201).json({ message: 'New admin added successfully.' });
} catch (err) {
    console.error('❌ Error adding admin:', err.message);

    // If the error is due to duplicate admin_id
    if (err.message.includes('Violation of PRIMARY KEY')) {
        return res.status(409).json({ error: 'Admin ID already exists.' });
    }

    res.status(500).json({ error: 'Internal server error.' });
}
});

app.post('/changeadmin/delete', async (req, res) => {
const {  adminId,newPassword} = req.body;

if (!adminId  ) {
   console.log("ghalat");
 return res.status(400).json({ error: 'adminId missing'});
}
let result;
try {
   
       result = await sql.query`           
       
       Delete from admin where admin_id=${adminId} 
       `;      
   
   


   res.status(200).json(result.recordset);
} catch (err) {
   console.error('❌ deletion of admin failed:', err.message);
   res.status(500).json({ error: 'Internal server error' });
}
 
});

app.post('/changegrade/add', async (req, res) => {
const { courseCode,
  rollNumber,
  grade   } = req.body;

if (!rollNumber || !courseCode || !grade ) {
  return res.status(400).json({ error: 'rollNumber or course code or grade missing'});
}
let result;
try {
    
        result = await sql.query`           
        
        INSERT INTO Grade
(roll_no, course_code,grade)
VALUES(${rollNumber},${courseCode},${grade})
        `;  
    


    res.status(200).json(result.recordset);
} catch (err) {
    console.error('❌ addition of grade entry failed:', err.message);
    res.status(500).json({ error: 'Internal server error' });
}
  
});

app.post('/changegrade/update', async (req, res) => {
const { courseCode,
  rollNumber,
  grade   } = req.body;

if (!rollNumber || !courseCode || !grade ) {
  return res.status(400).json({ error: 'rollNumber or course code or grade missing'});
}

let result;
try {
    
      result = await sql.query`           
      
      UPDATE GRADE SET grade=${grade} where roll_no=${rollNumber} AND course_code=${courseCode}
      `;      
      
    


    res.status(200).json(result.recordset);
} catch (err) {
    console.error('❌ updation of Grades failed:', err.message);
    res.status(500).json({ error: 'Internal server error' });
}
  
});

app.post('/changegrade/delete', async (req, res) => {
const { courseCode,
  rollNumber,
  grade   } = req.body;

//if (!rollNumber || !courseCode ) {
//  return res.status(400).json({ error: 'rollNumber or course code or grade missing'});
//}\
let result;
try {   
        if(!rollNumber && !courseCode)
        {
          return res.status(400).json({ error: 'rollNumber or course code or grade missing'});
        }
        else if(!rollNumber){
          result = await sql.query`           
        
          Delete from Grade where course_code=${courseCode} 
          `;   
        }
        else if(!courseCode){
          result = await sql.query`           
        
          Delete from Grade where roll_no=${rollNumber} 
          `;   
        }else{
          result = await sql.query`           
        
        Delete from Grade where roll_no=${rollNumber} AND course_code=${courseCode} 
        `;   
        }
 
    
    


    res.status(200).json(result.recordset);
} catch (err) {
    console.error('❌ deletion of Student failed:', err.message);
    res.status(500).json({ error: 'Internal server error' });
}
  
});

app.post('/changeenrolled/delete', async (req, res) => {
const { teacherCourseCode,
  rollNumber   } = req.body;

//if (!rollNumber || !courseCode ) {
//  return res.status(400).json({ error: 'rollNumber or course code or grade missing'});
//}\
let result;
try {   
        if(!rollNumber && !teacherCourseCode)
        {
          return res.status(400).json({ error: 'rollNumber or course code or grade missing'});
        }
        else if(!rollNumber){
          result = await sql.query`           
        
          Delete from Enrolled where teacher_course_code=${teacherCourseCode} 
          `;   
        }
        else if(!teacherCourseCode){
          result = await sql.query`           
        
          Delete from Enrolled where roll_no=${rollNumber} 
          `;   
        }else{
          result = await sql.query`           
        
        Delete from Enrolled where roll_no=${rollNumber} AND teacher_course_code=${teacher_courseCode} 
        `;   
        }
 
    
    


    res.status(200).json(result.recordset);
} catch (err) {
    console.error('❌ deletion of enrollment failed:', err.message);
    res.status(500).json({ error: 'Internal server error' });
}
  
});

app.post('/changeenrolled/add', async (req, res) => {
const { teacherCourseCode,
  rollNumber   } = req.body;

if (!rollNumber || !teacherCourseCode) {
  return res.status(400).json({ error: 'rollNumber or teacher course code or  missing'});
}
let result;
try {
    
        result = await sql.query`           
        
        INSERT INTO Enrolled
(roll_no, teacher_course_code)
VALUES(${rollNumber},${teacherCourseCode})
        `;  
    


    res.status(200).json(result.recordset);
} catch (err) {
    console.error('❌ addition of enrollment entry failed:', err.message);
    res.status(500).json({ error: 'Internal server error' });
}
  
});

app.post('/changelogin', async (req, res) => {
const { rollNumber,newPassword } = req.body;

if (!rollNumber || !newPassword) {
  return res.status(400).json({ error: 'Roll number, old password, and new password are required.' });
}

try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const pool = await sql.connect(config);

    const result = await pool.request()
        .input('roll_no', sql.VarChar(10), rollNumber)
        .input('password', sql.VarChar(255), hashedPassword)
        .query('UPDATE log_in SET password = @password WHERE roll_no = @roll_no');

    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'roll_no not found.' });
    }

    res.status(200).json({ message: 'Password updated successfully.' });
} catch (err) {
    console.error('❌ Error updating password:', err.message);
    res.status(500).json({ error: 'Internal server error.' });
}
});

app.get('/api/fetchteachercoursecode', async (req, res) => {
  try {
    const pool = await sql.connect(config);  // Initialize the pool here
    const result = await pool.request().query(`
      SELECT DISTINCT teacher_course_code FROM Enrolled
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching teacher course codes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch all students enrolled in a specific course
app.get('/api/enrolledstudents/:teacherCourseCode', async (req, res) => {
  const { teacherCourseCode } = req.params;

  try {
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('teachercourseCode', sql.VarChar(50), teacherCourseCode)
      .query(`
        SELECT s.roll_no, s.first_name, s.last_name, s.batch, s.semester
        FROM Students s
        JOIN Enrolled e ON e.roll_no = s.roll_no
        WHERE e.teacher_course_code = @teachercourseCode
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching students:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/viewstudentinfo', async (req, res) => {
  const { semester } = req.body;

  if (!semester) {
    return res.status(400).json({ error: 'Semester is required.' });
  }

  try {
    const result = await sql.query`
      SELECT 
        s.roll_no AS rollNumber,
        s.first_name + ' ' + s.last_name AS name,
        CAST(SUM(
          CASE g.grade
            WHEN 'A+' THEN 4.0
            WHEN 'A'  THEN 4.0
            WHEN 'A-' THEN 3.7
            WHEN 'B+' THEN 3.3
            WHEN 'B'  THEN 3.0
            WHEN 'B-' THEN 2.7
            WHEN 'C+' THEN 2.3
            WHEN 'C'  THEN 2.0
            WHEN 'C-' THEN 1.7
            WHEN 'D+' THEN 1.3
            WHEN 'D'  THEN 1.0
            WHEN 'F'  THEN 0.0
            ELSE NULL
          END * c.credit_hours
        ) AS DECIMAL(5,2)) / 
        SUM(CASE 
              WHEN g.grade <> 'S' AND c.course_type <> 'non-credit' 
              THEN c.credit_hours 
              ELSE 0 
            END) AS cgpa
      FROM Students s
      JOIN Grade g ON s.roll_no = g.roll_no
      JOIN Courses c ON g.course_code = c.course_code
      WHERE s.semester = ${semester} AND c.course_type <> 'non-credit'
      GROUP BY s.roll_no, s.first_name, s.last_name;
    `;
    console.log("here");
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('❌ CGPA calculation failed:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  


// ------------------------------------------------------------------------------------------
// TEST route
// ------------------------------------------------------------------------------------------
app.get('/test', (req, res) => {
    return res.json('Message from Backend');
});



// ------------------------------------------------------------------------------------------
// Start Server
// ------------------------------------------------------------------------------------------
app.listen(5000, () => {
    console.log('🚀 Server running on http://localhost:5000');
});