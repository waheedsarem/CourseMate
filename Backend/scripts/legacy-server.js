const express = require('express');
const sql = require('mssql');
const cors = require('cors');

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

//------------------------------------------------------------------------------------------
//--------------------------------------------GET FROM TABLES------------------------------
//------------------------------------------------------------------------------------------

// Get all Views
app.get("/views", async (req, res) => {
    try {
        const tables = ["Admin", "Teachers", "Department", "Students", "Log_in", "Courses", "Course_Semester", "Teacher_Course", "Enrolled", "Grade", "Swapper"];
        let resultData = {};

        for (const table of tables) {
            const result = await sql.query(`SELECT * FROM ${table}`);
            resultData[table] = result.recordset; // Store each table's data in an object
        }

        res.status(200).json(resultData);
    } catch (err) {
        console.error("❌ Failed to fetch data:", err.message);
        res.status(500).send("Failed to fetch data");
    }
});


//------------------------------------------------------------------------------------------
//--------------------------------------------POST INTO TABLES------------------------------
//------------------------------------------------------------------------------------------


// // Post a admin
app.post("/admin", async (req, res) => {
    const { admin_id, password } = req.body;
    
    try {
        if (!admin_id || !password) {
            return res.status(400).send("Inputs are required");
        }

        // Insert into Users table
        const result = await sql.query`
            INSERT INTO Admin (admin_id, password) 
            VALUES (${admin_id}, ${password});
        `;
        
        res.status(201).send("Admin ID added successfully");
    } catch (err) {
        console.error("❌ Failed to insert user:", err.message);
        res.status(500).send("Failed to insert user");
    }
});


// Post a Teacher
app.post("/teachers", async (req, res) => {
    const { teacher_id, first_name, last_name, email } = req.body;
    
    try {
        if (!teacher_id || !first_name || !last_name || !email) {
            return res.status(400).send("All fields (teacher_id, first_name, last_name, email) are required");
        }

        // Insert into Teachers table
        const result = await sql.query`
            INSERT INTO Teachers (teacher_id, first_name, last_name, email) 
            VALUES (${teacher_id}, ${first_name}, ${last_name}, ${email});
        `;
        
        res.status(201).send("Teacher added successfully");
    } catch (err) {
        console.error("❌ Failed to insert teacher:", err.message);
        res.status(500).send("Failed to insert teacher");
    }
});


//Post a Department 
app.post("/departments", async (req, res) => {
    const { department_id, department_name, HoD } = req.body;

    try {
        if (!department_id || !department_name) {
            return res.status(400).send("All fields (department_id, department_name) are required except HoD");
        }

        await sql.query`
            INSERT INTO Department (department_id, department_name, HoD) 
            VALUES (${department_id}, ${department_name}, ${HoD});
        `;
        
        res.status(201).send("Department added successfully");
    } catch (err) {
        console.error("❌ Failed to insert department:", err.message);
        res.status(500).send("Failed to insert department");
    }
});


// Post a students 
app.post("/students", async (req, res) => {
    const { roll_no, first_name, last_name, department_id, batch, semester, email } = req.body;
    try {
        if (!roll_no || !first_name || !last_name || !department_id || !batch || !semester || !email) {
            return res.status(400).send("All fields are required");
        }
        await sql.query`INSERT INTO Students (roll_no, first_name, last_name, department_id, batch, semester, email) VALUES (${roll_no}, ${first_name}, ${last_name}, ${department_id}, ${batch}, ${semester}, ${email});`;
        res.status(201).send("Student added successfully");
    } catch (err) {
        console.error("❌ Failed to insert student:", err.message);
        res.status(500).send("Failed to insert student");
    }
});


// // Post a courses 
app.post("/courses", async (req, res) => {
    const { course_code, department_id, credit_hours, prereq, course_type } = req.body;
    try {
        if (!course_code || !department_id || credit_hours === undefined || !course_type) {
            return res.status(400).send("All fields except prereq are required");
        }
        await sql.query`INSERT INTO Courses (course_code, department_id, credit_hours, prereq, course_type) VALUES (${course_code}, ${department_id}, ${credit_hours}, ${prereq}, ${course_type});`;
        res.status(201).send("Course added successfully");
    } catch (err) {
        console.error("❌ Failed to insert course:", err.message);
        res.status(500).send("Failed to insert course");
    }
});


// // Post a course_semester 
app.post("/course_semester", async (req, res) => {
    const { course_code, semester } = req.body;
    try {
        if (!course_code || !semester) {
            return res.status(400).send("All fields are required");
        }
        await sql.query`INSERT INTO Course_Semester (course_code, semester) VALUES (${course_code}, ${semester});`;
        res.status(201).send("Course semester added successfully");
    } catch (err) {
        console.error("❌ Failed to insert course semester:", err.message);
        res.status(500).send("Failed to insert course semester");
    }
});

// // Post a Teacher_Course  
app.post("/teacher_course", async (req, res) => {
    const { teacher_course_code, teacher_id, course_code, available_seats } = req.body;
    try {
        if (!teacher_course_code || !teacher_id || !course_code || !available_seats) {
            return res.status(400).send("All fields are required");
        }
        await sql.query`INSERT INTO Teacher_Course (teacher_course_code, teacher_id, course_code, available_seats) VALUES (${teacher_course_code}, ${teacher_id}, ${course_code}, ${available_seats});`;
        res.status(201).send("Teacher-Course assigned successfully");
    } catch (err) {
        console.error("❌ Failed to assign Teacher-Course:", err.message);
        res.status(500).send("Failed to assign Teacher-Course");
    }
});

// // Post an Enrollment  
app.post("/enrolled", async (req, res) => {
    const { roll_no, teacher_course_code } = req.body;
    try {
        if (!roll_no || !teacher_course_code) {
            return res.status(400).send("All fields are required");
        }
        await sql.query`INSERT INTO Enrolled (roll_no, teacher_course_code) VALUES (${roll_no}, ${teacher_course_code});`;
        res.status(201).send("Enrollment successful");
    } catch (err) {
        console.error("❌ Failed to enroll student:", err.message);
        res.status(500).send("Failed to enroll student");
    }
});

// // Post a Grade  
app.post("/grade", async (req, res) => {
    const { roll_no, course_code, grade } = req.body;
    try {
        if (!roll_no || !course_code || !grade) {
            return res.status(400).send("All fields are required");
        }
        await sql.query`INSERT INTO Grade (roll_no, course_code, grade) VALUES (${roll_no}, ${course_code}, ${grade});`;
        res.status(201).send("Grade recorded successfully");
    } catch (err) {
        console.error("❌ Failed to record grade:", err.message);
        res.status(500).send("Failed to record grade");
    }
});

// // Post a Swapper  
app.post("/swapper", async (req, res) => {
    const { roll_no, drop_course, add_course } = req.body;
    try {
        if (!roll_no || !drop_course || !add_course) {
            return res.status(400).send("All fields are required");
        }
        await sql.query`INSERT INTO Swapper (roll_no, drop_course, add_course) VALUES (${roll_no}, ${drop_course}, ${add_course});`;
        res.status(201).send("Course swap request submitted");
    } catch (err) {
        console.error("❌ Failed to submit course swap request:", err.message);
        res.status(500).send("Failed to submit course swap request");
    }
});



//--------------------------------------------------------------------------------------------
//--------------------------------------------DELETE FROM TABLES------------------------------
//--------------------------------------------------------------------------------------------

// Delete an Admin
app.delete("/admins/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`
            DELETE FROM Admin WHERE admin_id = ${id}
        `;
        if (result.rowsAffected[0] === 0) return res.status(404).send("Admin not found");
        res.status(200).send("Admin deleted successfully");
    } catch (err) {
        console.error("❌ Failed to delete admin:", err.message);
        res.status(500).send("Failed to delete admin");
    }
});

// Delete a Teacher
app.delete("/teachers/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`
            DELETE FROM Teachers WHERE teacher_id = ${id}
        `;
        if (result.rowsAffected[0] === 0) return res.status(404).send("Teacher not found");
        res.status(200).send("Teacher deleted successfully");
    } catch (err) {
        console.error("❌ Failed to delete teacher:", err.message);
        res.status(500).send("Failed to delete teacher");
    }
});

// Delete a Department
app.delete("/departments/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`
            DELETE FROM Department WHERE department_id = ${id}
        `;
        if (result.rowsAffected[0] === 0) return res.status(404).send("Department not found");
        res.status(200).send("Department deleted successfully");
    } catch (err) {
        console.error("❌ Failed to delete department:", err.message);
        res.status(500).send("Failed to delete department");
    }
});

// Delete a Student
app.delete("/students/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`
            DELETE FROM Students WHERE student_id = ${id}
        `;
        if (result.rowsAffected[0] === 0) return res.status(404).send("Student not found");
        res.status(200).send("Student deleted successfully");
    } catch (err) {
        console.error("❌ Failed to delete student:", err.message);
        res.status(500).send("Failed to delete student");
    }
});

// Delete a Course
app.delete("/courses/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`
            DELETE FROM Courses WHERE course_code = ${id}
        `;
        if (result.rowsAffected[0] === 0) return res.status(404).send("Course not found");
        res.status(200).send("Course deleted successfully");
    } catch (err) {
        console.error("❌ Failed to delete course:", err.message);
        res.status(500).send("Failed to delete course");
    }
});

// Delete a Course Semester
app.delete("/course_semester/:course_code/:semester", async (req, res) => {
    const { course_code, semester } = req.params;
    try {
        const result = await sql.query`
            DELETE FROM Course_Semester WHERE course_code = ${course_code} AND semester = ${semester}
        `;
        if (result.rowsAffected[0] === 0) return res.status(404).send("Course semester record not found");
        res.status(200).send("Course semester record deleted successfully");
    } catch (err) {
        console.error("❌ Failed to delete course semester record:", err.message);
        res.status(500).send("Failed to delete course semester record");
    }
});

// Delete a Teacher Course
app.delete("/teacher_course/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`
            DELETE FROM Teacher_Course WHERE teacher_course_code = ${id}
        `;
        if (result.rowsAffected[0] === 0) return res.status(404).send("Teacher course record not found");
        res.status(200).send("Teacher course record deleted successfully");
    } catch (err) {
        console.error("❌ Failed to delete teacher course record:", err.message);
        res.status(500).send("Failed to delete teacher course record");
    }
});

// Delete an Enrollment
app.delete("/enrollments/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`
            DELETE FROM Enrollment WHERE SRN = ${id}
        `;
        if (result.rowsAffected[0] === 0) return res.status(404).send("Enrollment not found");
        res.status(200).send("Enrollment deleted successfully");
    } catch (err) {
        console.error("❌ Failed to delete enrollment:", err.message);
        res.status(500).send("Failed to delete enrollment");
    }
});

// Delete a Grade
app.delete("/grades/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`
            DELETE FROM Grade WHERE SRN = ${id}
        `;
        if (result.rowsAffected[0] === 0) return res.status(404).send("Grade record not found");
        res.status(200).send("Grade record deleted successfully");
    } catch (err) {
        console.error("❌ Failed to delete grade record:", err.message);
        res.status(500).send("Failed to delete grade record");
    }
});

// Delete a Swapper Record
app.delete("/swapper/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`
            DELETE FROM Swapper WHERE SRN = ${id}
        `;
        if (result.rowsAffected[0] === 0) return res.status(404).send("Swapper record not found");
        res.status(200).send("Swapper record deleted successfully");
    } catch (err) {
        console.error("❌ Failed to delete swapper record:", err.message);
        res.status(500).send("Failed to delete swapper record");
    }
});

//--------------------------------------------------------------------------------------------
//--------------------------------------------UPDATE TABLES------------------------------
//--------------------------------------------------------------------------------------------

// Update an Admin
app.put("/admin/:id", async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    
    try {
        if (!password) {
            return res.status(400).send("Password is required to update the admin");
        }
        
        // Update the Admin based on admin_id
        const result = await sql.query`
            UPDATE Admin 
            SET password = ${password}
            WHERE admin_id = ${id}
        `;
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send("Admin not found");
        }
        
        res.status(200).send("Admin updated successfully");
    } catch (err) {
        console.error("❌ Failed to update admin:", err.message);
        res.status(500).send("Failed to update admin");
    }
});

// Update a Teacher
app.put("/teachers/:id", async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email } = req.body;

    try {
        if (!first_name || !last_name || !email) {
            return res.status(400).send("All fields are required to update the teacher");
        }

        const result = await sql.query`
            UPDATE Teachers 
            SET first_name = ${first_name}, last_name = ${last_name}, email = ${email} 
            WHERE teacher_id = ${id}
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send("Teacher not found");
        }

        res.status(200).send("Teacher updated successfully");
    } catch (err) {
        console.error("❌ Failed to update teacher:", err.message);
        res.status(500).send("Failed to update teacher");
    }
});

// Update a Student
app.put("/students/:id", async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, department_id, batch, semester, email } = req.body;

    try {
        if (!first_name || !last_name || !department_id || !batch || !semester || !email) {
            return res.status(400).send("All fields are required to update the student");
        }

        const result = await sql.query`
            UPDATE Students 
            SET first_name = ${first_name}, last_name = ${last_name}, department_id = ${department_id}, 
                batch = ${batch}, semester = ${semester}, email = ${email}
            WHERE roll_no = ${id}
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send("Student not found");
        }

        res.status(200).send("Student updated successfully");
    } catch (err) {
        console.error("❌ Failed to update student:", err.message);
        res.status(500).send("Failed to update student");
    }
});

// Update Student Login
app.put("/login/:id", async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    try {
        if (!password) {
            return res.status(400).send("All fields are required to update the login");
        }

        const result = await sql.query`
            UPDATE Log_in 
            SET password = ${password} 
            WHERE roll_no = ${id}
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send("Login entry not found");
        }

        res.status(200).send("Login updated successfully");
    } catch (err) {
        console.error("❌ Failed to update login:", err.message);
        res.status(500).send("Failed to update login");
    }
});

// Update a Course
app.put("/courses/:id", async (req, res) => {
    const { id } = req.params;
    const { department_id, credit_hours, prereq, course_type } = req.body;

    try {
        if (!department_id || !credit_hours || !course_type) {
            return res.status(400).send("All fields are required to update the course");
        }

        const result = await sql.query`
            UPDATE Courses 
            SET department_id = ${department_id}, credit_hours = ${credit_hours}, 
                prereq = ${prereq}, course_type = ${course_type}
            WHERE course_code = ${id}
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send("Course not found");
        }

        res.status(200).send("Course updated successfully");
    } catch (err) {
        console.error("❌ Failed to update course:", err.message);
        res.status(500).send("Failed to update course");
    }
});

// Update a Course_Semester
app.put("/course_semester/:course_code/:semester", async (req, res) => {
    const { course_code, semester } = req.params;
    const { new_semester } = req.body;

    try {
        if (!new_semester) {
            return res.status(400).send("New semester value is required to update");
        }

        const result = await sql.query`
            UPDATE Course_Semester 
            SET semester = ${new_semester} 
            WHERE course_code = ${course_code} AND semester = ${semester}
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send("Course semester entry not found");
        }

        res.status(200).send("Course semester updated successfully");
    } catch (err) {
        console.error("❌ Failed to update course semester:", err.message);
        res.status(500).send("Failed to update course semester");
    }
});

// Update a Teacher_Course
app.put("/teacher_course/:id", async (req, res) => {
    const { id } = req.params;
    const { teacher_id, course_code, available_seats } = req.body;

    try {
        if (!teacher_id || !course_code || !available_seats) {
            return res.status(400).send("All fields are required to update the teacher_course");
        }

        const result = await sql.query`
            UPDATE Teacher_Course 
            SET teacher_id = ${teacher_id}, course_code = ${course_code}, 
                available_seats = ${available_seats}
            WHERE teacher_course_code = ${id}
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send("Teacher_Course not found");
        }

        res.status(200).send("Teacher_Course updated successfully");
    } catch (err) {
        console.error("❌ Failed to update teacher_course:", err.message);
        res.status(500).send("Failed to update teacher_course");
    }
});

// Update an Enrollment
app.put("/enrolled/:id", async (req, res) => {
    const { id } = req.params;
    const { roll_no, teacher_course_code } = req.body;

    try {
        if (!roll_no || !teacher_course_code) {
            return res.status(400).send("All fields are required to update the enrollment");
        }

        const result = await sql.query`
            UPDATE Enrolled 
            SET roll_no = ${roll_no}, teacher_course_code = ${teacher_course_code} 
            WHERE SRN = ${id}
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send("Enrollment not found");
        }

        res.status(200).send("Enrollment updated successfully");
    } catch (err) {
        console.error("❌ Failed to update enrollment:", err.message);
        res.status(500).send("Failed to update enrollment");
    }
});

// Update a Grade
app.put("/grade/:id", async (req, res) => {
    const { id } = req.params;
    const { roll_no, course_code, grade } = req.body;

    try {
        if (!roll_no || !course_code || !grade) {
            return res.status(400).send("All fields are required to update the grade");
        }

        const result = await sql.query`
            UPDATE Grade 
            SET roll_no = ${roll_no}, course_code = ${course_code}, grade = ${grade}
            WHERE SRN = ${id}
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send("Grade entry not found");
        }

        res.status(200).send("Grade updated successfully");
    } catch (err) {
        console.error("❌ Failed to update grade:", err.message);
        res.status(500).send("Failed to update grade");
    }
});

// Update a Swapper Entry
app.put("/swapper/:id", async (req, res) => {
    const { id } = req.params;
    const { roll_no, drop_course, add_course } = req.body;

    try {
        if (!roll_no || !drop_course || !add_course) {
            return res.status(400).send("All fields are required to update the swapper entry");
        }

        const result = await sql.query`
            UPDATE Swapper 
            SET roll_no = ${roll_no}, drop_course = ${drop_course}, add_course = ${add_course}
            WHERE SRN = ${id}
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send("Swapper entry not found");
        }

        res.status(200).send("Swapper entry updated successfully");
    } catch (err) {
        console.error("❌ Failed to update swapper entry:", err.message);
        res.status(500).send("Failed to update swapper entry");
    }
});

app.get('/', (req, res) => {
    return res.json('Message from Backend');
});

// Start Server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});