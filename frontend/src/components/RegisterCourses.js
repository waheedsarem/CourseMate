import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './RegisterCourses.css';

function RegisterCourses() {
  const { state } = useLocation();
  const rollNo = state?.rollNo;

  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`http://localhost:5000/courses/${rollNo}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          console.error("Unexpected response format:", data);
          setCourses([]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const fetchEnrolledCourses = async () => {
      try {
        const response = await fetch(`http://localhost:5000/enrolledCourses/${rollNo}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setEnrolledCourses(data);
        } else {
          console.error("Unexpected response format for enrolled courses:", data);
          setEnrolledCourses([]);
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      }
    };

    if (rollNo) {
      fetchCourses();
      fetchEnrolledCourses();
    }
  }, [rollNo]);

  const handleCheckboxChange = (e, code) => {
    if (e.target.checked) {
      setSelected((prev) => [...prev, code]);
    } else {
      setSelected((prev) => prev.filter((c) => c !== code));
    }
  };

  const handleEnroll = async () => {
    const selectedCourseDetails = courses.filter((course) =>
      selected.includes(course.teacher_course_code)
    );
  
    const selectedCourseCodes = selectedCourseDetails.map((c) => c.course_code);
  
    // Check for multiple instances of the same course
    const uniqueCourses = new Set(selectedCourseCodes);
    if (uniqueCourses.size !== selectedCourseCodes.length) {
      const msg = "You cannot enroll in multiple sections of the same course.";
      alert(msg);
      setMessage(msg);
      return;
    }
  
    // Ensure student enrolls in both the course and its lab
    for (const code of selectedCourseCodes) {
      const isLab = code.endsWith("L");
      const baseCode = isLab ? code.slice(0, -1) : code + "L";
  
      const pairExists = courses.some((c) => c.course_code === baseCode);
      const pairSelected = selectedCourseCodes.includes(baseCode);
  
      if (pairExists && !pairSelected) {
        const msg = `You must enroll in both the course and its lab for ${code}.`;
        alert(msg);
        setMessage(msg);
        return;
      }
    }
  
    // Check total credit hours
    const alreadyEnrolledCredits = courses
      .filter((course) => course.already_enrolled === 1)
      .reduce((total, course) => total + course.credit_hours, 0);
  
    const selectedCredits = selectedCourseDetails.reduce(
      (total, course) => total + course.credit_hours,
      0
    );
  
    const totalCredits = alreadyEnrolledCredits + selectedCredits;
    if (totalCredits > 18) {
      const msg = `Credit hour limit exceeded. You're trying to register ${totalCredits} hours (limit: 18).`;
      alert(msg);
      setMessage(msg);
      return;
    }
  
    // Submit enrollment request
    try {
      const response = await fetch("http://localhost:5000/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll_no: rollNo, selectedCourses: selected }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Enrollment successful!");
        setMessage("Enrollment successful!");
        setSelected([]);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert(data.error || "Enrollment failed.");
        setMessage(data.error || "Enrollment failed.");
      }
    } catch (error) {
      console.error("Error during enrollment:", error);
      alert("Server error during enrollment.");
      setMessage("Server error during enrollment.");
    }
  };

  if (!Array.isArray(courses) || courses.length === 0) {
    return (
      <div className="register-container">
        <div className="no-courses">No courses found for your semester.</div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <h2 className="register-header">Courses for Your Semester</h2>

      {message && (
        <div className={`message ${message.includes("success") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      <table className="courses-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Type</th>
            <th>Credits</th>
            <th>Teacher</th>
            <th>Seats</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const isAlreadyEnrolled = enrolledCourses.some(
              (enrolled) => enrolled.course_code === course.course_code
            );
            const statusClass = isAlreadyEnrolled 
              ? "status-enrolled" 
              : course.available_seats <= 0 
                ? "status-full" 
                : "status-available";
            
            return (
              <tr key={course.teacher_course_code}>
                <td>
                  <input
                    type="checkbox"
                    checked={
                      course.already_enrolled === 1 ||
                      selected.includes(course.teacher_course_code)
                    }
                    onChange={(e) => handleCheckboxChange(e, course.teacher_course_code)}
                    disabled={isAlreadyEnrolled || course.available_seats <= 0}
                  />
                </td>
                <td>{course.course_code}</td>
                <td>{course.course_name}</td>
                <td>{course.course_type}</td>
                <td>{course.credit_hours}</td>
                <td>{course.teacher_name}</td>
                <td>{course.available_seats}</td>
                <td className={statusClass}>
                  {isAlreadyEnrolled
                    ? "Enrolled"
                    : course.available_seats <= 0
                    ? "Full"
                    : "Available"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        className="enroll-button"
        onClick={handleEnroll}
        disabled={selected.length === 0}
      >
        Enroll Selected Courses
      </button>
    </div>
  );
}

export default RegisterCourses;