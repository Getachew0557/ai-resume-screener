import AttendanceTable from "../../components/Attendance/AttendanceTable";
import AttendanceForm from "../../components/Attendance/AttendanceForm";


const Attendance = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Attendance</h1>
      <div className="w- full grid grid-cols-1 md:grid-cols-2 gap-6">
        <AttendanceForm profile={{ id: 103, name: "Abe" }} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <AttendanceTable />
      </div>
    </div>
  );
};

export default Attendance;