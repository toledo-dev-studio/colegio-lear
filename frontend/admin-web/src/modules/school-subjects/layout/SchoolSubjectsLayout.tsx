import { Outlet } from "react-router";

export const SchoolSubjectsLayout = () => {
  return (
    <>
      <div className="relative w-full mx-auto bg-white rounded-lg shadow-sm">
        <Outlet />
      </div>
    </>
  )
}

export default SchoolSubjectsLayout;