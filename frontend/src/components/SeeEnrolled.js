import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SeeEnrolled.css';

const SeeEnrolled = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/fetchteachercoursecode')
      .then(response => {
        setCourses(response.data);
      })
      .catch(error => {
        console.error('Error fetching teacher course codes:', error);
      });
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      axios.get(`http://localhost:5000/api/enrolledstudents/${selectedCourse}`)
        .then(response => {
          setStudents(response.data);
        })
        .catch(error => {
          console.error('Error fetching enrolled students:', error);
        });
    } else {
      setStudents([]);
    }
  }, [selectedCourse]);

  const handleSelectChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  return (
    <div className="enrolled-students-container">
      <h1 className="enrolled-students-header">Enrolled Students</h1>

      <label htmlFor="courseSelect" className="select-course-label">Select Course:</label>
      <select
        id="courseSelect"
        className="select-course-dropdown"
        onChange={handleSelectChange}
        value={selectedCourse}
      >
        <option value="">-- Select a course --</option>
        {courses.map((course, index) => (
          <option key={index} value={course.teacher_course_code}>
            {course.teacher_course_code}
          </option>
        ))}
      </select>

      {students.length > 0 && (
        <>
          <p className="total-students">Total Students Enrolled: {students.length}</p>
          <table className="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Roll No</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Batch</th>
                <th>Semester</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.roll_no}>
                  <td>{index + 1}</td>
                  <td>{student.roll_no}</td>
                  <td>{student.first_name}</td>
                  <td>{student.last_name}</td>
                  <td>{student.batch}</td>
                  <td>{student.semester}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default SeeEnrolled;
