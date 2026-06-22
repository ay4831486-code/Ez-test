import React from 'react';
import { Student } from '../../types';

interface StudentRowProps {
  student: Student;
  setSelectedStudent: (student: Student | null) => void;
  handleApproveStudent: (id: string) => void;
  handleRejectStudent: (id: string) => void;
  handleToggleBlock: (id: string) => void;
  handleResetPassword: (id: string) => void;
}

const StudentRow = React.memo(function StudentRow({
  student,
  setSelectedStudent,
  handleApproveStudent,
  handleRejectStudent,
  handleToggleBlock,
  handleResetPassword
}: StudentRowProps) {
  return (
    <tr className="hover:bg-slate-50/50 transition cursor-pointer border-b border-slate-100 sm:border-none block sm:table-row py-2 sm:py-0" onClick={() => setSelectedStudent(student)}>
      <td className="py-1 sm:py-3.5 font-bold text-slate-800 px-3 block sm:table-cell">
        <span className="sm:hidden text-[10px] text-slate-400 font-normal mr-2">Name:</span>
        {student.name}
      </td>
      <td className="py-1 sm:py-3.5 font-mono text-[11px] text-indigo-600 font-bold px-3 block sm:table-cell">
        <span className="sm:hidden text-[10px] text-slate-400 font-normal font-sans mr-2">ID:</span>
        {student.studentId ? (
          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
            {student.studentId}
          </span>
        ) : (
          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 italic">
            Pending ID
          </span>
        )}
      </td>
      <td className="py-1 sm:py-3.5 text-slate-655 font-sans px-3 block sm:table-cell">
        <span className="sm:hidden text-[10px] text-slate-400 font-normal mr-2">Class:</span>
        <span className="font-semibold">{student.classVal}</span>
      </td>
      <td className="py-1 sm:py-3.5 sm:text-right px-3 block sm:table-cell mt-2 sm:mt-0">
        {student.status === 'Pending' ? (
          <div className="flex gap-2 sm:justify-end" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleApproveStudent(student.id)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => handleRejectStudent(student.id)}
              className="bg-rose-50 border border-rose-250 text-rose-600 hover:bg-rose-100 px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition"
            >
              Reject
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="text-indigo-600 hover:text-indigo-750 border border-slate-200 px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition hover:bg-slate-50"
          >
            View Profile
          </button>
        )}
      </td>
    </tr>
  );
});

export default StudentRow;
