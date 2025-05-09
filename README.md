# CourseMate  
MADE BY: Sarem Waheed, Bilal Kashif, M. Hamza Iqbal  

## Overview  
CourseMate is a full-stack Course Registration Management System designed to simplify and streamline the process of course registration for students and administrators. It ensures accurate validation, secure student authentication, and dynamic course offerings using a robust relational database schema.

Built using **React.js** for the frontend, **Node.js with Express** for the backend, and **Microsoft SQL Server** as the database, the system is developed to provide flexibility, security, and administrative control over course registration processes.

## Features  
- **Student Registration & Login**  
  - Secure login with authentication and password reset option  
  - All user data stored in a secure relational database  

- **Course Registration**  
  - Register for courses based on prerequisites, seat availability, and credit hour limits  
  - Automated checks for schedule conflicts and preconditions  

- **Admin Course Management**  
  - Add, edit, or delete courses and sections  
  - Define prerequisites, instructors, and maximum slots  

- **Smart Query-Driven Features**  
  - Search available courses, check seats, and validate prerequisites  
  - Add/Drop functionality with validation  
  - Check previous course attempts and grades to restrict re-enrollment  
  - Restrict summer registrations to previously attempted courses only  
  - Enforce that repeated courses require at least 20 overall failures to be re-offered  

## Files in the Repository  
1. **`frontend/`**  
   - Contains all React components and pages for the user interface  

2. **`Backend/`**  
   - Node.js and Express API routes handling all server-side logic and database queries  

3. **`Schema.sql`**
   - The complete SQL schema to set up the database structure including tables like `Students`, `Courses`, `Enrolled`, `Grade`, etc.  

4. **`Swapper Trigger and Sample Inserts.sql`**  
   - Contains sample `INSERT` values and a trigger for the `Swapper` table  
   - Automatically swaps courses of students who submit reciprocal swap requests  

## Prerequisites  
To run or modify this project, ensure you have the following installed:  
- **Node.js** and **npm** (for the backend server)  
- **Microsoft SQL Server** (for the database)  
- **React.js** (for the frontend, via `npm install`)  
- **SQL Server Management Studio (SSMS)** (recommended for managing the database)  

## How to Use  

1. **Setup Database**  
   - Run `schema.sql` using SSMS or a similar tool to create the required database schema.  

2. **Start Backend Server**  
   ```bash
   cd backend
   node server.js

3. **Start Frontend Server**  
   ```bash
    cd frontend
    npm start

## Acknowledgments  
- Designed to solve real-world course registration issues with a strong focus on validation and usability.
- Inspired by academic registration systems and tailored for educational institutions.git 