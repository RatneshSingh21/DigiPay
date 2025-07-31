import React from 'react'
import AttendanceForm from '../Attendance/AttendanceForm'

const Attendance = () => {
  return (
   <>
      <div className="px-4 py-3 shadow mb-5 sticky top-14 bg-white z-10">
        <h2 className="font-semibold text-xl">Attendance</h2>
      </div>
      <div>
        <AttendanceForm/>
      </div>
    </>
  )
}

export default Attendance