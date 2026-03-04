const sql = require('mssql');

const masterConfig = {
    user: "sa",
    password: "StrongPass123!",
    server: "localhost",
    database: "master",
    options: {
        trustServerCertificate: true,
        enableArithAbort: true,
    },
    port: 1433
};

const projectConfig = {
    user: "sa",
    password: "StrongPass123!",
    server: "localhost",
    database: "ProjectDB",
    options: {
        trustServerCertificate: true,
        enableArithAbort: true,
    },
    port: 1433
};

async function runBatch(pool, sqlText) {
    // Split on GO statements (case-insensitive, on their own line)
    const batches = sqlText.split(/^\s*GO\s*$/im).filter(b => b.trim());
    for (const batch of batches) {
        if (batch.trim()) {
            await pool.request().query(batch);
        }
    }
}

async function setup() {
    let pool;
    try {
        // Step 1: Connect to master and create the database
        console.log("1. Connecting to SQL Server...");
        pool = await sql.connect(masterConfig);
        console.log("   Connected to master database.");

        console.log("2. Creating ProjectDB...");
        await pool.request().query(`
            IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ProjectDB')
            BEGIN
                CREATE DATABASE ProjectDB
            END
        `);
        console.log("   ProjectDB created.");

        // Create login and user for the app
        console.log("3. Creating app login (ss)...");
        try {
            await pool.request().query(`
                IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'ss')
                BEGIN
                    CREATE LOGIN ss WITH PASSWORD = 'pass'
                END
            `);
        } catch (e) {
            console.log("   Login 'ss' may already exist, skipping.");
        }
        await pool.close();

        // Step 2: Connect to ProjectDB and run schema
        console.log("4. Connecting to ProjectDB...");
        pool = await sql.connect(projectConfig);

        // Create user for the login
        try {
            await pool.request().query(`
                IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'ss')
                BEGIN
                    CREATE USER ss FOR LOGIN ss
                END;
                ALTER ROLE db_owner ADD MEMBER ss;
            `);
            console.log("   User 'ss' created and granted db_owner.");
        } catch (e) {
            console.log("   User setup note:", e.message);
        }

        console.log("5. Creating tables (Schema.sql)...");
        const schemaSQL = `
            -- Admin table
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Admin')
            CREATE TABLE Admin (
                admin_id VARCHAR(10) PRIMARY KEY,
                password VARCHAR(255) NOT NULL
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Teachers')
            CREATE TABLE Teachers (
                teacher_id VARCHAR(10) PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(255) UNIQUE
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Department')
            CREATE TABLE Department (
                department_id VARCHAR(10) PRIMARY KEY,
                department_name VARCHAR(100) NOT NULL,
                HoD VARCHAR(10) UNIQUE,
                CONSTRAINT fk_teacher_id_HOD FOREIGN KEY (HoD) REFERENCES Teachers(teacher_id) ON DELETE SET NULL ON UPDATE CASCADE
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Students')
            CREATE TABLE Students (
                roll_no VARCHAR(10) PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                department_id VARCHAR(10),
                batch VARCHAR(20) NOT NULL,
                semester FLOAT NOT NULL CHECK (semester IN (1, 2, 2.5, 3, 4, 4.5, 5, 6, 6.5, 7, 8)),
                email VARCHAR(255) UNIQUE,
                CONSTRAINT fk_students_department FOREIGN KEY (department_id) REFERENCES Department(department_id) ON DELETE SET NULL ON UPDATE CASCADE
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Log_in')
            CREATE TABLE Log_in (
                roll_no VARCHAR(10) PRIMARY KEY,
                password VARCHAR(255) NOT NULL,
                CONSTRAINT fk_login_students FOREIGN KEY (roll_no) REFERENCES Students(roll_no) ON DELETE CASCADE ON UPDATE CASCADE
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Courses')
            CREATE TABLE Courses (
                course_code VARCHAR(20) PRIMARY KEY,
                course_name VARCHAR(255) NOT NULL,
                department_id VARCHAR(10),
                credit_hours INT NOT NULL CHECK (credit_hours BETWEEN 0 AND 3),
                prereq VARCHAR(20),
                course_type VARCHAR(10) CHECK (course_type IN ('Core', 'Elective', 'Non Credit')) NOT NULL,
                CONSTRAINT fk_courses_department FOREIGN KEY (department_id) REFERENCES Department(department_id) ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT fk_prereq FOREIGN KEY (prereq) REFERENCES Courses(course_code) ON DELETE NO ACTION ON UPDATE NO ACTION
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Course_Semester')
            CREATE TABLE Course_Semester (
                course_code VARCHAR(20) NOT NULL,
                semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
                PRIMARY KEY (course_code, semester),
                CONSTRAINT fk_course_semester FOREIGN KEY (course_code) REFERENCES Courses(course_code) ON DELETE CASCADE ON UPDATE CASCADE
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Teacher_Course')
            CREATE TABLE Teacher_Course (
                teacher_course_code VARCHAR(25) PRIMARY KEY,
                teacher_id VARCHAR(10),
                course_code VARCHAR(20) NOT NULL,
                available_seats INT NOT NULL DEFAULT 0 CHECK (available_seats >= 0),
                CONSTRAINT fk_teacher_course_teacher FOREIGN KEY (teacher_id) REFERENCES Teachers(teacher_id) ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT fk_teacher_course_course FOREIGN KEY (course_code) REFERENCES Courses(course_code) ON DELETE NO ACTION ON UPDATE NO ACTION
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Enrolled')
            CREATE TABLE Enrolled (
                SRN INT IDENTITY(1,1) PRIMARY KEY,
                roll_no VARCHAR(10) NOT NULL,
                teacher_course_code VARCHAR(25) NOT NULL,
                CONSTRAINT fk_enrolled_students FOREIGN KEY (roll_no) REFERENCES Students(roll_no) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT fk_enrolled_teacher_course FOREIGN KEY (teacher_course_code) REFERENCES Teacher_Course(teacher_course_code) ON DELETE NO ACTION ON UPDATE NO ACTION
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Grade')
            CREATE TABLE Grade (
                roll_no VARCHAR(10) NOT NULL,
                course_code VARCHAR(20) NOT NULL,
                grade CHAR(2) CHECK (grade IN ('A+','A','A-','B+','B','B-','C+','C','C-','D+','D','F', 'S')) NOT NULL,
                PRIMARY KEY (roll_no, course_code),
                CONSTRAINT fk_grade_students FOREIGN KEY (roll_no) REFERENCES Students(roll_no) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT fk_grade_course FOREIGN KEY (course_code) REFERENCES Courses(course_code) ON DELETE NO ACTION ON UPDATE NO ACTION
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Swapper')
            CREATE TABLE Swapper (
                SRN INT IDENTITY(1,1) PRIMARY KEY,
                roll_no VARCHAR(10) NOT NULL,
                drop_course VARCHAR(25) NOT NULL,
                add_course VARCHAR(25) NOT NULL,
                CONSTRAINT fk_swapper_students FOREIGN KEY (roll_no) REFERENCES Students(roll_no) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT fk_swapper_drop FOREIGN KEY (drop_course) REFERENCES Teacher_Course(teacher_course_code) ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT fk_swapper_add FOREIGN KEY (add_course) REFERENCES Teacher_Course(teacher_course_code) ON DELETE NO ACTION ON UPDATE NO ACTION
            );
        `;
        await pool.request().query(schemaSQL);
        console.log("   All tables created.");

        // Step 3: Insert sample data
        console.log("6. Inserting sample data...");

        // Teachers
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Teachers WHERE teacher_id = 'T001')
            BEGIN
                INSERT INTO Teachers (teacher_id, first_name, last_name, email) VALUES
                ('T001', 'Ayesha', 'Khan', 'ayesha.khan@university.edu'),
                ('T002', 'Zaid', 'Ahmed', 'zaid.ahmed@university.edu'),
                ('T003', 'Sana', 'Malik', 'sana.malik@university.edu'),
                ('T004', 'Raza', 'Siddiqui', 'raza.siddiqui@university.edu'),
                ('T005', 'Nida', 'Rafiq', 'nida.rafiq@university.edu'),
                ('T006', 'Bilal', 'Qureshi', 'bilal.qureshi@university.edu'),
                ('T007', 'Hamza', 'Ali', 'hamza.ali@university.edu'),
                ('T008', 'Mehwish', 'Javed', 'mehwish.javed@university.edu'),
                ('T009', 'Usman', 'Farooq', 'usman.farooq@university.edu'),
                ('T010', 'Rabia', 'Sheikh', 'rabia.sheikh@university.edu'),
                ('T011', 'Tariq', 'Iqbal', 'tariq.iqbal@university.edu'),
                ('T012', 'Hira', 'Zubair', 'hira.zubair@university.edu'),
                ('T013', 'Kamran', 'Khalid', 'kamran.khalid@university.edu'),
                ('T014', 'Maham', 'Aslam', 'maham.aslam@university.edu'),
                ('T015', 'Fahad', 'Naseer', 'fahad.naseer@university.edu'),
                ('T016', 'Noor', 'Fatima', 'noor.fatima@university.edu');
            END
        `);
        console.log("   Teachers inserted.");

        // Departments
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Department WHERE department_id = 'CS')
            BEGIN
                INSERT INTO Department (department_id, department_name, HoD) VALUES
                ('CS', 'Computer Science', 'T001'),
                ('EE', 'Electrical Engineering', 'T002'),
                ('MT', 'Mathematics', 'T004'),
                ('NS', 'Natural Sciences', 'T005'),
                ('SS', 'Social Sciences', 'T003');
            END
        `);
        console.log("   Departments inserted.");

        // Students
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Students WHERE roll_no = '23L-0885')
            BEGIN
                INSERT INTO Students (roll_no, first_name, last_name, department_id, batch, semester, email)
                VALUES ('23L-0885', 'Hamza', 'Iqbal', 'CS', '2023', 3, 'hamza.iqbal@university.edu');
            END
        `);
        console.log("   Students inserted.");

        // Log_in (password: fastnuces)
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('fastnuces', 10);
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Log_in WHERE roll_no = '23L-0885')
            BEGIN
                INSERT INTO Log_in (roll_no, password) VALUES ('23L-0885', '${hashedPassword}');
            END
        `);
        console.log("   Login credentials inserted (roll_no: 23L-0885, password: fastnuces).");

        // Admin
        const adminHash = await bcrypt.hash('admin123', 10);
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Admin WHERE admin_id = 'admin')
            BEGIN
                INSERT INTO Admin (admin_id, password) VALUES ('admin', '${adminHash}');
            END
        `);
        console.log("   Admin inserted (admin_id: admin, password: admin123).");

        // Courses - Semester 1
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Courses WHERE course_code = 'NS1001')
            BEGIN
                INSERT INTO Courses (course_code, department_id, credit_hours, prereq, course_type, course_name) VALUES
                ('NS1001', 'CS', 3, NULL, 'Core', 'Applied Physics'),
                ('MT1003', 'CS', 3, NULL, 'Core', 'Calculus and Analytical Geometry'),
                ('SS1012', 'SS', 2, NULL, 'Core', 'Functional English'),
                ('SS1012L', 'SS', 1, NULL, 'Core', 'Functional English Lab'),
                ('SS1013', 'SS', 2, NULL, 'Core', 'Ideology and Constitution of Pakistan'),
                ('CS1000', 'CS', 1, NULL, 'Core', 'Introduction to Information and Communication Technology'),
                ('CS1002', 'CS', 3, NULL, 'Core', 'Programming Fundamentals'),
                ('CS1002L', 'CS', 1, NULL, 'Core', 'Programming Fundamentals Lab');
            END
        `);

        // Courses - Semester 2
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Courses WHERE course_code = 'EE1005')
            BEGIN
                INSERT INTO Courses (course_code, department_id, credit_hours, prereq, course_type, course_name) VALUES
                ('EE1005', 'EE', 3, NULL, 'Core', 'Digital Logic Design'),
                ('EE1005L', 'EE', 1, NULL, 'Core', 'Digital Logic Design Lab'),
                ('SS1014', 'SS', 2, 'SS1012', 'Core', 'Expository Writing'),
                ('SS1014L', 'SS', 1, 'SS1012', 'Core', 'Expository Writing Lab'),
                ('SS1007', 'SS', 2, NULL, 'Core', 'Islamic Studies/Ethics'),
                ('MT1008', 'CS', 3, 'MT1003', 'Core', 'Multivariable Calculus'),
                ('CS1004', 'CS', 3, 'CS1002', 'Core', 'Object Oriented Programming'),
                ('CS1004L', 'CS', 1, 'CS1002L', 'Core', 'Object Oriented Programming Lab');
            END
        `);

        // Courses - Semester 3
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Courses WHERE course_code = 'SS2043')
            BEGIN
                INSERT INTO Courses (course_code, department_id, credit_hours, prereq, course_type, course_name) VALUES
                ('SS2043', 'SS', 2, NULL, 'Core', 'Civics and Community Engagement'),
                ('EE2003', 'EE', 3, NULL, 'Core', 'Computer Organization and Assembly Language'),
                ('EE2003L', 'EE', 1, NULL, 'Core', 'Computer Organization and Assembly Language Lab'),
                ('CS2001', 'CS', 3, 'CS1004', 'Core', 'Data Structures'),
                ('CS2001L', 'CS', 1, 'CS1004L', 'Core', 'Data Structures Lab'),
                ('CS1005', 'CS', 3, NULL, 'Core', 'Discrete Structures'),
                ('MT1004', 'CS', 3, 'MT1008', 'Core', 'Linear Algebra'),
                ('SS2101', 'SS', 2, NULL, 'Elective', 'Psychology'),
                ('SS2102', 'SS', 2, NULL, 'Elective', 'Mass Communication'),
                ('SS2103', 'SS', 2, NULL, 'Elective', 'Foreign Policy');
            END
        `);

        // Courses - Semester 4
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Courses WHERE course_code = 'CS2005')
            BEGIN
                INSERT INTO Courses (course_code, department_id, credit_hours, prereq, course_type, course_name) VALUES
                ('CS2005', 'CS', 3, NULL, 'Core', 'Database Systems'),
                ('CS2005L', 'CS', 1, NULL, 'Core', 'Database Systems Lab'),
                ('CS2006', 'CS', 3, NULL, 'Core', 'Operating Systems'),
                ('CS2006L', 'CS', 1, NULL, 'Core', 'Operating Systems Lab'),
                ('MT2005', 'CS', 3, NULL, 'Core', 'Probability and Statistics'),
                ('SS3201', 'SS', 3, NULL, 'Elective', 'French Language'),
                ('SS3202', 'SS', 3, NULL, 'Elective', 'Critical Thinking'),
                ('SS3203', 'SS', 3, NULL, 'Elective', 'Marketing Management'),
                ('SS3204', 'SS', 3, NULL, 'Elective', 'Brand Management'),
                ('SS2012', 'SS', 3, NULL, 'Core', 'Technical and Business Writing');
            END
        `);
        console.log("   Courses inserted.");

        // Course_Semester
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Course_Semester WHERE course_code = 'NS1001')
            BEGIN
                INSERT INTO Course_Semester (course_code, semester) VALUES
                ('NS1001', 1), ('MT1003', 1), ('SS1012', 1), ('SS1013', 1),
                ('CS1000', 1), ('CS1002', 1), ('CS1002L', 1),
                ('EE1005', 2), ('EE1005L', 2), ('SS1014', 2), ('SS1014L', 2),
                ('SS1007', 2), ('MT1008', 2), ('CS1004', 2), ('CS1004L', 2),
                ('SS2043', 3), ('EE2003', 3), ('EE2003L', 3), ('CS2001', 3),
                ('CS2001L', 3), ('CS1005', 3), ('MT1004', 3),
                ('SS2101', 3), ('SS2102', 3), ('SS2103', 3),
                ('CS2005', 4), ('CS2005L', 4), ('CS2006', 4), ('CS2006L', 4),
                ('MT2005', 4), ('SS3201', 4), ('SS3202', 4), ('SS3203', 4),
                ('SS3204', 4), ('SS2012', 4);
            END
        `);
        console.log("   Course_Semester inserted.");

        // Teacher_Course
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Teacher_Course WHERE teacher_course_code = 'CS1002-1')
            BEGIN
                INSERT INTO Teacher_Course VALUES
                ('CS1002-1', 'T001', 'CS1002', 50), ('CS1002-2', 'T006', 'CS1002', 50),
                ('CS1002L-1', 'T001', 'CS1002L', 50),
                ('CS1004-1', 'T001', 'CS1004', 50), ('CS1004-2', 'T006', 'CS1004', 50),
                ('CS1004L-1', 'T006', 'CS1004L', 50),
                ('CS2001-1', 'T001', 'CS2001', 50), ('CS2001-2', 'T007', 'CS2001', 50),
                ('CS2001L-1', 'T007', 'CS2001L', 50),
                ('CS2005-1', 'T001', 'CS2005', 50), ('CS2005L-1', 'T001', 'CS2005L', 50),
                ('CS2006-1', 'T001', 'CS2006', 50), ('CS2006L-1', 'T006', 'CS2006L', 50),
                ('CS1005-1', 'T001', 'CS1005', 50),
                ('MT1003-1', 'T003', 'MT1003', 50), ('MT1008-1', 'T003', 'MT1008', 50),
                ('MT2005-1', 'T003', 'MT2005', 50), ('MT1004-1', 'T010', 'MT1004', 50),
                ('CS1000-1', 'T001', 'CS1000', 50),
                ('EE1005-1', 'T002', 'EE1005', 50), ('EE1005-2', 'T008', 'EE1005', 50),
                ('EE1005L-1', 'T002', 'EE1005L', 50),
                ('EE2003-1', 'T002', 'EE2003', 50), ('EE2003-2', 'T009', 'EE2003', 50),
                ('EE2003L-1', 'T008', 'EE2003L', 50),
                ('NS1001-1', 'T004', 'NS1001', 50),
                ('SS1012-1', 'T005', 'SS1012', 50), ('SS1012L-1', 'T005', 'SS1012L', 50),
                ('SS1013-1', 'T005', 'SS1013', 50), ('SS1014-1', 'T005', 'SS1014', 50),
                ('SS1014L-1', 'T011', 'SS1014L', 50), ('SS1007-1', 'T005', 'SS1007', 50),
                ('SS2043-1', 'T005', 'SS2043', 50), ('SS2012-1', 'T005', 'SS2012', 50),
                ('SS2101-1', 'T005', 'SS2101', 50), ('SS2102-1', 'T005', 'SS2102', 50),
                ('SS2103-1', 'T011', 'SS2103', 50), ('SS3201-1', 'T005', 'SS3201', 50),
                ('SS3202-1', 'T005', 'SS3202', 50), ('SS3203-1', 'T012', 'SS3203', 50),
                ('SS3204-1', 'T012', 'SS3204', 50);
            END
        `);
        console.log("   Teacher_Course inserted.");

        // Grades
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Grade WHERE roll_no = '23L-0885')
            BEGIN
                INSERT INTO Grade (roll_no, course_code, grade) VALUES
                ('23L-0885', 'EE1005', 'B'),
                ('23L-0885', 'EE1005L', 'B+'),
                ('23L-0885', 'SS1014', 'A-'),
                ('23L-0885', 'SS1014L', 'B'),
                ('23L-0885', 'SS1007', 'A'),
                ('23L-0885', 'MT1008', 'B+'),
                ('23L-0885', 'CS1004', 'F'),
                ('23L-0885', 'CS1004L', 'D');
            END
        `);
        console.log("   Grades inserted.");

        // Step 4: Create Swapper trigger
        console.log("7. Creating Swapper trigger...");
        try {
            await pool.request().query(`
                IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_HandleSwapRequest')
                    DROP TRIGGER trg_HandleSwapRequest
            `);
            await pool.request().query(`
                CREATE TRIGGER trg_HandleSwapRequest
                ON Swapper
                AFTER INSERT
                AS
                BEGIN
                    SET NOCOUNT ON;
                    DECLARE @ReciprocalMatch TABLE (
                        Request1_SRN INT, Request2_SRN INT,
                        Student1 VARCHAR(10), Student2 VARCHAR(10),
                        DropCourse1 VARCHAR(25), AddCourse1 VARCHAR(25),
                        DropCourse2 VARCHAR(25), AddCourse2 VARCHAR(25)
                    );
                    INSERT INTO @ReciprocalMatch
                    SELECT i.SRN, s.SRN, i.roll_no, s.roll_no,
                        i.drop_course, i.add_course, s.drop_course, s.add_course
                    FROM inserted i
                    JOIN Swapper s ON i.add_course = s.drop_course
                        AND i.drop_course = s.add_course AND i.SRN <> s.SRN;

                    DECLARE @Request1_SRN INT, @Request2_SRN INT;
                    DECLARE @Student1 VARCHAR(10), @Student2 VARCHAR(10);
                    DECLARE @DropCourse1 VARCHAR(25), @AddCourse1 VARCHAR(25);
                    DECLARE @DropCourse2 VARCHAR(25), @AddCourse2 VARCHAR(25);

                    DECLARE match_cursor CURSOR FOR
                    SELECT Request1_SRN, Request2_SRN, Student1, Student2,
                        DropCourse1, AddCourse1, DropCourse2, AddCourse2
                    FROM @ReciprocalMatch;

                    OPEN match_cursor;
                    FETCH NEXT FROM match_cursor INTO
                        @Request1_SRN, @Request2_SRN, @Student1, @Student2,
                        @DropCourse1, @AddCourse1, @DropCourse2, @AddCourse2;

                    WHILE @@FETCH_STATUS = 0
                    BEGIN
                        BEGIN TRY
                            BEGIN TRANSACTION;
                            DELETE FROM Enrolled WHERE roll_no = @Student1 AND teacher_course_code = @DropCourse1;
                            INSERT INTO Enrolled (roll_no, teacher_course_code) VALUES (@Student1, @AddCourse1);
                            DELETE FROM Enrolled WHERE roll_no = @Student2 AND teacher_course_code = @DropCourse2;
                            INSERT INTO Enrolled (roll_no, teacher_course_code) VALUES (@Student2, @AddCourse2);
                            UPDATE Teacher_Course SET available_seats = available_seats + 1 WHERE teacher_course_code IN (@DropCourse1, @DropCourse2);
                            UPDATE Teacher_Course SET available_seats = available_seats - 1 WHERE teacher_course_code IN (@AddCourse1, @AddCourse2);
                            DELETE FROM Swapper WHERE SRN = @Request1_SRN;
                            DELETE FROM Swapper WHERE SRN = @Request2_SRN;
                            COMMIT TRANSACTION;
                        END TRY
                        BEGIN CATCH
                            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
                            PRINT 'Error processing swap: ' + ERROR_MESSAGE();
                        END CATCH
                        FETCH NEXT FROM match_cursor INTO
                            @Request1_SRN, @Request2_SRN, @Student1, @Student2,
                            @DropCourse1, @AddCourse1, @DropCourse2, @AddCourse2;
                    END
                    CLOSE match_cursor;
                    DEALLOCATE match_cursor;
                END
            `);
            console.log("   Swapper trigger created.");
        } catch (e) {
            console.log("   Trigger note:", e.message);
        }

        console.log("\n===================================");
        console.log("  DATABASE SETUP COMPLETE!");
        console.log("===================================");
        console.log("\nTest credentials:");
        console.log("  Student: roll_no=23L-0885, password=fastnuces");
        console.log("  Admin:   admin_id=admin, password=admin123");

    } catch (err) {
        console.error("Setup failed:", err.message);
    } finally {
        if (pool) await pool.close();
        process.exit(0);
    }
}

setup();
