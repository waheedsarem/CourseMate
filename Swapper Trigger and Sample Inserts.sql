use ProjectDB;

INSERT INTO Students (roll_no, first_name, last_name, department_id, batch, semester, email) 
VALUES ('s01', 'Sarem', 'Waheed', NULL, 2024, 2, 'dawds@gmail.com');

INSERT INTO Log_in(roll_no, password)
VALUES ('23L-0885', 'fastnuces');

INSERT INTO Teachers (teacher_id, first_name, last_name, email) VALUES
('T001', 'Ayesha', 'Khan', 'ayesha.khan@university.edu'),  -- CS HoD
('T002', 'Zaid', 'Ahmed', 'zaid.ahmed@university.edu'),    -- EE HoD
('T003', 'Sana', 'Malik', 'sana.malik@university.edu'),    -- SS HoD
('T004', 'Raza', 'Siddiqui', 'raza.siddiqui@university.edu'),  -- MT HoD
('T005', 'Nida', 'Rafiq', 'nida.rafiq@university.edu'),    -- NS HoD
('T006', 'Bilal', 'Qureshi', 'bilal.qureshi@university.edu'); 

INSERT INTO Teachers (teacher_id, first_name, last_name, email) VALUES
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

INSERT INTO Department (department_id, department_name, HoD) 
VALUES 
('CS', 'Computer Science', 'T001'),
('EE', 'Electrical Engineering', 'T002'),
('MT', 'Mathematics', 'T004'),
('NS', 'Natural Sciences', 'T005'),
('SS', 'Social Sciences', 'T003');

ALTER TABLE Courses
ADD course_name VARCHAR(255) NOT NULL;

-- Semester 1 (Fall 2023)
INSERT INTO Courses (course_code, department_id, credit_hours, prereq, course_type, course_name) VALUES 
('NS1001', 'CS', 3, NULL, 'Core', 'Applied Physics'),  
('MT1003', 'CS', 3, NULL, 'Core', 'Calculus and Analytical Geometry'),  
('SS1012', 'SS', 2, NULL, 'Core', 'Functional English'),  
('SS1012L', 'SS', 1, NULL, 'Core', 'Functional English Lab'), 
('SS1013', 'SS', 2, NULL, 'Core', 'Ideology and Constitution of Pakistan'),  
('CS1000', 'CS', 1, NULL, 'Core', 'Introduction to Information and Communication Technology'),  
('CS1002', 'CS', 3, NULL, 'Core', 'Programming Fundamentals'),  
('CS1002L', 'CS', 1, NULL, 'Core', 'Programming Fundamentals Lab');

DELETE FROM Courses
WHERE course_code = 'SS1014L';
INSERT INTO Courses (course_code, department_id, credit_hours, prereq, course_type, course_name) VALUES 
('SS1014L', 'SS', 1, 'SS1012', 'Core', 'Expository Writing Lab');

-- Semester 2 (Spring 2024)
INSERT INTO Courses (course_code, department_id, credit_hours, prereq, course_type, course_name) VALUES 
('EE1005', 'EE', 3, NULL, 'Core', 'Digital Logic Design'),  
('EE1005L', 'EE', 1, NULL, 'Core', 'Digital Logic Design Lab'),
('SS1014', 'SS', 2, 'SS1012', 'Core', 'Expository Writing'),  
('SS1014L', 'SS', 1, 'SS1012', 'Core', 'Expository Writing Lab'),  -- Expository Writing Lab → prereq: Functional English
('SS1007', 'SS', 2, NULL, 'Core', 'Islamic Studies/Ethics'),  
('MT1008', 'CS', 3, 'MT1003', 'Core', 'Multivariable Calculus'),  
('CS1004', 'CS', 3, 'CS1002', 'Core', 'Object Oriented Programming'),  
('CS1004L', 'CS', 1, 'CS1002L', 'Core', 'Object Oriented Programming Lab');  -- OOP Lab → prereq: Programming Lab

UPDATE Courses
SET prereq = 'CS1004L'
WHERE course_code = 'CS2001L'
-- Semester 3 (Fall 2024)
INSERT INTO Courses (course_code, department_id, credit_hours, prereq, course_type, course_name) VALUES 
('SS2043', 'SS', 2, NULL, 'Core', 'Civics and Community Engagement'),  
('EE2003', 'EE', 3, NULL, 'Core', 'Computer Organization and Assembly Language'),  
('EE2003L', 'EE', 1, NULL, 'Core', 'Computer Organization and Assembly Language Lab'),  -- COAL Lab → prereq: DLD Lab
('CS2001', 'CS', 3, 'CS1004', 'Core', 'Data Structures'),  
('CS2001L', 'CS', 1, 'CS1004L', 'Core', 'Data Structures Lab'),  -- DS Lab → prereq: OOP Lab
('CS1005', 'CS', 3, NULL, 'Core', 'Discrete Structures'),  
('MT1004', 'CS', 3, 'MT1008', 'Core', 'Linear Algebra'),  
('SS2101', 'SS', 2, NULL, 'Elective', 'Psychology'),  
('SS2102', 'SS', 2, NULL, 'Elective', 'Mass Communication'),  
('SS2103', 'SS', 2, NULL, 'Elective', 'Foreign Policy');  

-- Semester 4 (Spring 2025)
INSERT INTO Courses (course_code, department_id, credit_hours, prereq, course_type, course_name) VALUES 
('CS2005', 'CS', 3, NULL, 'Core', 'Database Systems'),  
('CS2005L', 'CS', 1, NULL, 'Core', 'Database Systems Lab'),  -- DB Lab → prereq: DS Lab
('CS2006', 'CS', 3, NULL, 'Core', 'Operating Systems'),  
('CS2006L', 'CS', 1, NULL, 'Core', 'Operating Systems Lab'),  -- OS Lab → prereq: DS Lab
('MT2005', 'CS', 3, NULL, 'Core', 'Probability and Statistics'),  
('SS3201', 'SS', 3, NULL, 'Elective', 'French Language'),  
('SS3202', 'SS', 3, NULL, 'Elective', 'Critical Thinking'),  
('SS3203', 'SS', 3, NULL, 'Elective', 'Marketing Management'),  
('SS3204', 'SS', 3, NULL, 'Elective', 'Brand Management'),  
('SS2012', 'SS', 3, NULL, 'Core', 'Technical and Business Writing');

-- Semester 1 (Fall 2023)
INSERT INTO Course_Semester (course_code, semester) VALUES
('NS1001', 1),  
('MT1003', 1),  
('SS1012', 1),  
('SS1013', 1),  
('CS1000', 1),  
('CS1002', 1),  
('CS1002L', 1);  -- Adding "L" to indicate the lab course

-- Semester 2 (Spring 2024)
INSERT INTO Course_Semester (course_code, semester) VALUES
('EE1005', 2),  
('EE1005L', 2),  
('SS1014', 2),  
('SS1014L', 2),  -- Expository Writing Lab course with "L" added
('SS1007', 2),  
('MT1008', 2),  
('CS1004', 2),  
('CS1004L', 2);  -- Object Oriented Programming Lab with "L" added

-- Semester 3 (Fall 2024)
INSERT INTO Course_Semester (course_code, semester) VALUES
('SS2043', 3),  
('EE2003', 3),  
('EE2003L', 3), 
('CS2001', 3),  
('CS2001L', 3),  -- Data Structures Lab with "L" added
('CS1005', 3),  
('MT1004', 3),  
('SS2101', 3),  
('SS2102', 3),  
('SS2103', 3);

-- Semester 4 (Spring 2025)
INSERT INTO Course_Semester (course_code, semester) VALUES
('CS2005', 4),  
('CS2005L', 4),  -- Database Systems Lab with "L" added
('CS2006', 4),  
('CS2006L', 4),  -- Operating Systems Lab with "L" added
('MT2005', 4),  
('SS3201', 4),  
('SS3202', 4),  
('SS3203', 4),  
('SS3204', 4),  
('SS2012', 4);

-- CS Department (T001 is HOD)
INSERT INTO Teacher_Course VALUES
('CS1002-1', 'T001', 'CS1002', 50),
('CS1002-2', 'T006', 'CS1002', 50),
('CS1002L-1', 'T001', 'CS1002L', 50),

('CS1004-1', 'T001', 'CS1004', 50),
('CS1004-2', 'T006', 'CS1004', 50),
('CS1004L-1', 'T006', 'CS1004L', 50),

('CS2001-1', 'T001', 'CS2001', 50),
('CS2001-2', 'T007', 'CS2001', 50),
('CS2001L-1', 'T007', 'CS2001L', 50),

('CS2005-1', 'T001', 'CS2005', 50),
('CS2005L-1', 'T001', 'CS2005L', 50),

('CS2006-1', 'T001', 'CS2006', 50),
('CS2006L-1', 'T006', 'CS2006L', 50),

('CS1005-1', 'T001', 'CS1005', 50),
('MT1003-1', 'T003', 'MT1003', 50),
('MT1008-1', 'T003', 'MT1008', 50),
('MT2005-1', 'T003', 'MT2005', 50),
('MT1004-1', 'T010', 'MT1004', 50),

('CS1000-1', 'T001', 'CS1000', 50); -- this is a regular theory course, not lab

-- EE Department (T002 is HOD)
INSERT INTO Teacher_Course VALUES
('EE1005-1', 'T002', 'EE1005', 50),
('EE1005-2', 'T008', 'EE1005', 50),
('EE1005L-1', 'T002', 'EE1005L', 50),

('EE2003-1', 'T002', 'EE2003', 50),
('EE2003-2', 'T009', 'EE2003', 50),
('EE2003L-1', 'T008', 'EE2003L', 50);

-- NS Department (T004 is HOD)
INSERT INTO Teacher_Course VALUES
('NS1001-1', 'T004', 'NS1001', 50);

-- SS Department (T005 is HOD)
INSERT INTO Teacher_Course VALUES
('SS1012-1', 'T005', 'SS1012', 50),
('SS1012L-1', 'T005', 'SS1012L', 50),
('SS1013-1', 'T005', 'SS1013', 50),
('SS1014-1', 'T005', 'SS1014', 50),
('SS1014L-1', 'T011', 'SS1014L', 50),
('SS1007-1', 'T005', 'SS1007', 50),
('SS2043-1', 'T005', 'SS2043', 50),
('SS2012-1', 'T005', 'SS2012', 50),
('SS2101-1', 'T005', 'SS2101', 50),
('SS2102-1', 'T005', 'SS2102', 50),
('SS2103-1', 'T011', 'SS2103', 50),
('SS3201-1', 'T005', 'SS3201', 50),
('SS3202-1', 'T005', 'SS3202', 50),
('SS3203-1', 'T012', 'SS3203', 50),
('SS3204-1', 'T012', 'SS3204', 50);

INSERT INTO Grade (roll_no, course_code, grade) VALUES
('23L-0885', 'EE1005', 'B'),
('23L-0885', 'EE1005L', 'B+'),
('23L-0885', 'SS1014', 'A-'),
('23L-0885', 'SS1014L', 'B'),
('23L-0885', 'SS1007', 'A'),
('23L-0885', 'MT1008', 'B+'),
('23L-0885', 'CS1004', 'F'),
('23L-0885', 'CS1004L', 'D');

DELETE FROM Grade 
WHERE roll_no = '23L-0885';

SELECT course_code, prereq FROM Courses 
WHERE prereq IS NOT NULL;


----------------------TRIGGER TO HANDLE SWAPPER----------------------------------------

-- Need to run the trigger to automatically swap courses of students with reciprocal request
GO
CREATE TRIGGER trg_HandleSwapRequest
ON Swapper
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check for reciprocal swaps
    DECLARE @ReciprocalMatch TABLE (
        Request1_SRN INT,
        Request2_SRN INT,
        Student1 VARCHAR(10),
        Student2 VARCHAR(10),
        DropCourse1 VARCHAR(25),
        AddCourse1 VARCHAR(25),
        DropCourse2 VARCHAR(25),
        AddCourse2 VARCHAR(25)
    );

    -- Find matching reciprocal requests
    INSERT INTO @ReciprocalMatch
    SELECT
        i.SRN AS Request1_SRN,
        s.SRN AS Request2_SRN,
        i.roll_no AS Student1,
        s.roll_no AS Student2,
        i.drop_course AS DropCourse1,
        i.add_course AS AddCourse1,
        s.drop_course AS DropCourse2,
        s.add_course AS AddCourse2
    FROM inserted i
        JOIN Swapper s ON 
        i.add_course = s.drop_course AND
            i.drop_course = s.add_course AND
            i.SRN <> s.SRN;

    -- Process each reciprocal match
    DECLARE @Request1_SRN INT, @Request2_SRN INT;
    DECLARE @Student1 VARCHAR(10), @Student2 VARCHAR(10);
    DECLARE @DropCourse1 VARCHAR(25), @AddCourse1 VARCHAR(25);
    DECLARE @DropCourse2 VARCHAR(25), @AddCourse2 VARCHAR(25);

    DECLARE match_cursor CURSOR FOR
    SELECT
        Request1_SRN, Request2_SRN,
        Student1, Student2,
        DropCourse1, AddCourse1,
        DropCourse2, AddCourse2
    FROM @ReciprocalMatch;

    OPEN match_cursor;
    FETCH NEXT FROM match_cursor INTO 
        @Request1_SRN, @Request2_SRN,
        @Student1, @Student2,
        @DropCourse1, @AddCourse1,
        @DropCourse2, @AddCourse2;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        BEGIN TRY
            BEGIN TRANSACTION;
            
            -- First student: drop DropCourse1 and add AddCourse1
            DELETE FROM Enrolled 
            WHERE roll_no = @Student1 AND teacher_course_code = @DropCourse1;
            
            INSERT INTO Enrolled
            (roll_no, teacher_course_code)
        VALUES
            (@Student1, @AddCourse1);
            
            -- Second student: drop DropCourse2 and add AddCourse2
            DELETE FROM Enrolled 
            WHERE roll_no = @Student2 AND teacher_course_code = @DropCourse2;
            
            INSERT INTO Enrolled
            (roll_no, teacher_course_code)
        VALUES
            (@Student2, @AddCourse2);
            
            -- Update available seats in Teacher_Course table
            -- For the dropped courses (increase seats)
            UPDATE Teacher_Course 
            SET available_seats = available_seats + 1 
            WHERE teacher_course_code IN (@DropCourse1, @DropCourse2);
            
            -- For the added courses (decrease seats)
            UPDATE Teacher_Course 
            SET available_seats = available_seats - 1 
            WHERE teacher_course_code IN (@AddCourse1, @AddCourse2);
            
            -- Remove the matched swap requests
            DELETE FROM Swapper WHERE SRN = @Request1_SRN;
            DELETE FROM Swapper WHERE SRN = @Request2_SRN;
            
            COMMIT TRANSACTION;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0
                ROLLBACK TRANSACTION;
                
            -- Log the error (you might want to create an error log table)
            -- For now, just print the error
            PRINT 'Error processing swap: ' + ERROR_MESSAGE();
        END CATCH

        FETCH NEXT FROM match_cursor INTO 
            @Request1_SRN, @Request2_SRN,
            @Student1, @Student2,
            @DropCourse1, @AddCourse1,
            @DropCourse2, @AddCourse2;
    END

    CLOSE match_cursor;
    DEALLOCATE match_cursor;
END;