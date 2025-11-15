import React from "react";
import SubMenu from "../../menu/SubMenu";
import { Outlet, useParams } from "react-router-dom";

export default function UserStatistic() {
  const { parent = "users" } = useParams();
  return (
    <div>
      <SubMenu parent={parent} /> {/* Hiện submenu cho statistic */}
      <Outlet />
    </div>
  );
}
