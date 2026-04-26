import { Outlet } from "react-router";

export const SystemUsersLayout = () => {
  return (
    <>
      <div className="max-w-7xl mx-auto">
        <Outlet />
      </div>
    </>
  )
}

export default SystemUsersLayout;
