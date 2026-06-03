import { Outlet } from "react-router";

export const ScholarshipsLayout = () => {
  return (
    <>
      <div className="relative w-full mx-auto bg-card rounded-lg shadow-sm">
        <Outlet />
      </div>
    </>
  )
}

export default ScholarshipsLayout;
