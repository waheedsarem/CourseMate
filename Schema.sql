Use ProjectDB;

-- Admin table
CREATE TABLE Admin (
    admin_id VARCHAR(10) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);

-- Teachers table
CREATE TABLE Teachers (
    teacher_id VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE
);
SELECT * FROM Teachers
-- Department table
CREATE TABLE Department (
    department_id VARCHAR(10) PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    HoD VARCHAR(10) UNIQUE, ------------CHANGE-----------
    CONSTRAINT fk_teacher_id_HOD FOREIGN KEY (HoD) REFERENCES Teachers(teacher_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Students table
CREATE TABLE Students (
    roll_no VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department_id VARCHAR(10),
    batch VARCHAR(20) NOT NULL,
    semester FLOAT NOT NULL CHECK (semester IN (1, 2, 2.5, 3, 4, 4.5, 5, 6, 6.5, 7, 8)), ---------------CHANGE----------------
    email VARCHAR(255) UNIQUE,
    CONSTRAINT fk_students_department FOREIGN KEY (department_id) REFERENCES Department(department_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Students login credentials
CREATE TABLE Log_in (
    roll_no VARCHAR(10) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    CONSTRAINT fk_login_students FOREIGN KEY (roll_no) REFERENCES Students(roll_no) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Courses table (Stores course details)
CREATE TABLE Courses (
    course_code VARCHAR(20) PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL, ------------CHANGE-----------
    department_id VARCHAR(10),
    credit_hours INT NOT NULL CHECK (credit_hours BETWEEN 0 AND 3),
    prereq VARCHAR(20),
	course_type VARCHAR(10) CHECK (course_type IN ('Core', 'Elective', 'Non Credit')) NOT NULL,
    CONSTRAINT fk_courses_department FOREIGN KEY (department_id) REFERENCES Department(department_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_prereq FOREIGN KEY (prereq) REFERENCES Courses(course_code) ON DELETE NO ACTION ON UPDATE  NO ACTION
);


-- Course Semester (Stores which semester a course is offerd in & its type (Core/Elective))
CREATE TABLE Course_Semester (
    course_code VARCHAR(20) NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    PRIMARY KEY (course_code, semester),
    CONSTRAINT fk_course_semester FOREIGN KEY (course_code) REFERENCES Courses(course_code) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Teacher_Course table (Associates a teacher with a course and a unique teacher_course_code)
CREATE TABLE Teacher_Course (
    teacher_course_code VARCHAR(25) PRIMARY KEY,
    teacher_id VARCHAR(10),
    course_code VARCHAR(20) NOT NULL,
    available_seats INT NOT NULL DEFAULT 0 CHECK (available_seats >= 0),
    CONSTRAINT fk_teacher_course_teacher FOREIGN KEY (teacher_id) REFERENCES Teachers(teacher_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_teacher_course_course FOREIGN KEY (course_code) REFERENCES Courses(course_code) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Enrolled table (Students enroll in a specific teacher's course)
CREATE TABLE Enrolled (
    SRN INT IDENTITY(1,1) PRIMARY KEY,
    roll_no VARCHAR(10) NOT NULL,
    teacher_course_code VARCHAR(25) NOT NULL,
    CONSTRAINT fk_enrolled_students FOREIGN KEY (roll_no) REFERENCES Students(roll_no) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_enrolled_teacher_course FOREIGN KEY (teacher_course_code) REFERENCES Teacher_Course(teacher_course_code) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Grade table (Stores historical grades of students)
CREATE TABLE Grade (
    --SRN INT IDENTITY(1,1) PRIMARY KEY, --------CHANGED-------
    roll_no VARCHAR(10) NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    grade CHAR(2) CHECK (grade IN ('A+','A','A-','B+','B','B-','C+','C','C-','D+','D','F', 'S')) NOT NULL,
    PRIMARY KEY (roll_no, course_code), --------CHANGED-------
    CONSTRAINT fk_grade_students FOREIGN KEY (roll_no) REFERENCES Students(roll_no) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_grade_course FOREIGN KEY (course_code) REFERENCES Courses(course_code) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Swapper Table (For swapping courses)
CREATE TABLE Swapper (
    SRN INT IDENTITY(1,1) PRIMARY KEY,
    roll_no VARCHAR(10) NOT NULL,
    drop_course VARCHAR(25) NOT NULL,
    add_course VARCHAR(25) NOT NULL,
    CONSTRAINT fk_swapper_students FOREIGN KEY (roll_no) REFERENCES Students(roll_no) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_swapper_drop FOREIGN KEY (drop_course) REFERENCES Teacher_Course(teacher_course_code) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_swapper_add FOREIGN KEY (add_course) REFERENCES Teacher_Course(teacher_course_code) ON DELETE NO ACTION ON UPDATE NO ACTION
);
