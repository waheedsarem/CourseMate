import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './EnrolledCourses.css';

function EnrolledCourses() {
  const { state } = useLocation();
  const rollNumber = state?.rollNo;

  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await fetch(`http://localhost:5000/enrolled-courses/${rollNumber}`);
        const data = await response.json();

        if (response.ok) {
          setCourses(Array.isArray(data) ? data : []);
        } else {
          setError(data.error || "Failed to fetch courses");
        }
      } catch (error) {
        setError("Network error. Please try again.");
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (rollNumber) {
      fetchEnrolledCourses();
    }
  }, [rollNumber]);

  const handleCheckboxChange = (e, code) => {
    if (e.target.checked) {
      setSelectedCourses((prev) => [...prev, code]);
    } else {
      setSelectedCourses((prev) => prev.filter((c) => c !== code));
    }
  };

  const handleDrop = async () => {
    if (selectedCourses.length === 0) return;

    try {
      const response = await fetch('http://localhost:5000/drop-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber,
          courses: selectedCourses,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Courses dropped successfully!");
        // Refresh the course list
        setCourses(courses.filter(course => !selectedCourses.includes(course.teacher_course_code)));
        setSelectedCourses([]);
      } else {
        alert(data.error || "Failed to drop courses.");
      }
    } catch (error) {
      console.error("Error dropping courses:", error);
      alert("Server error while dropping courses.");
    }
  };

  if (loading) {
    return (
      <div className="enrolled-courses-container">
        <h2 className="enrolled-courses-header">Your Enrolled Courses</h2>
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enrolled-courses-container">
        <h2 className="enrolled-courses-header">Your Enrolled Courses</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="enrolled-courses-container">
      <h2 className="enrolled-courses-header">Your Enrolled Courses</h2>
      
      {courses.length > 0 ? (
        <>
          <table className="courses-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.teacher_course_code}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.teacher_course_code)}
                      onChange={(e) => handleCheckboxChange(e, course.teacher_course_code)}
                    />
                  </td>
                  <td>{course.Course_code}</td>
                  <td>{course.Course_name}</td>
                  <td>{course.Type}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleDrop}
            className="drop-button"
            disabled={selectedCourses.length === 0}
          >
            Drop Selected Courses
          </button>
        </>
      ) : (
        <div className="no-courses-message">
          You are not currently enrolled in any courses.
        </div>
      )}
    </div>
  );
}

export default EnrolledCourses;