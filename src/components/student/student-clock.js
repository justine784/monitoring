'use client';

import TeacherClock from '@/components/teacher/teacher-clock';

// Simple wrapper so employees/students can use the same DTR logic as teachers.
// Uses schoolId as the underlying teacherId key in the DTR collection so admin
// monitoring can see all roles in one place.
export default function StudentClock({ schoolId }) {
  if (!schoolId) return null;
  return <TeacherClock teacherId={schoolId} />;
}


