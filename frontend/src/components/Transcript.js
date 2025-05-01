import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Transcript.css';

function Transcript() {
  const { state } = useLocation();
  const rollNo = state?.rollNo;
  const [queryresult, setResult] = useState([]);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const response = await fetch('http://localhost:5000/Transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roll_no: rollNo }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.log("❌ Error: ", data.error || "Unknown error");
        } else {
          setResult(data);
          console.log("✅ Fetched Transcript:", data);
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err);
      }
    };

    if (rollNo) fetchTranscript();
  }, [rollNo]);

  const grade_key = {
    "A+": 4.00, "A ": 4.00, "A-": 3.666667,
    "B+": 3.333333, "B ": 3.00, "B-": 2.666667,
    "C+": 2.333333, "C ": 2.00, "C-": 1.666667,
    "D+": 1.333333, "D": 1.00,
    "F": 0, "S": "no_grade"
  };

  // Organize results by semester
  const queryResultArr = [];

  for (let i = 1; i <= 8; i++) {
    const semesterCourses = queryresult.filter(row => parseInt(row.semester) === i);
    const credit_hours = semesterCourses.reduce((sum, curr) => sum + (curr.credit_hours || 0), 0);

    let grade_point = 0, non_credit = 0;

    semesterCourses.forEach(course => {
      const grade = grade_key[course.grade];
      if (grade === "no_grade") {
        non_credit += course.credit_hours || 0;
      } else {
        grade_point += (grade || 0) * (course.credit_hours || 0);
      }
    });

    const effective_credits = credit_hours - non_credit;
    const gpa1 = effective_credits > 0 ? (grade_point / effective_credits).toFixed(2) : "N/A";

    if (semesterCourses.length > 0) {
      queryResultArr.push({
        semester: i,
        courses: semesterCourses,
        gpa: gpa1,
        credit_hourss: credit_hours,
      });
    }
  }

  return (
    <div className="Transcript-container">
      <h2 className="Transcript-header">Transcript for: <strong>{rollNo}</strong></h2>

      {queryResultArr.length > 0 ? (
        queryResultArr.map((semesterData, index) => (
          <div key={index} className="Semester-card">
            <div className="Semester-header">
              <span>Semester {semesterData.semester}</span>
              <div className="Semester-info">
                <span className="GPA-badge">GPA: {semesterData.gpa}</span>
                <span className="Credit-hours">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2L3 7l9 5 9-5-9-5z"></path>
                    <path d="M3 7l9 5 9-5M3 7v10l9 5 9-5V7"></path>
                  </svg>
                  {semesterData.credit_hourss} Credits
                </span>
              </div>
            </div>

            <table className="Transcript-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Credit Hours</th>
                  <th>Grade</th>
                  <th>Course Type</th>
                </tr>
              </thead>
              <tbody>
                {semesterData.courses.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.course_code}</td>
                    <td>{row.credit_hours}</td>
                    <td>{row.grade}</td>
                    <td>{row.course_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <div className="No-records">
          <p>No transcript records found.</p>
        </div>
      )}
    </div>
  );
}

export default Transcript;
