import React from "react";
import MainMenu from "./menu/MainMenu";
import SubMenu from "./menu/SubMenu";
import { Outlet, useParams } from "react-router-dom";

export default function Statistic() {
  const { parent = "dashboard" } = useParams();
  return (
    <div className="w-full min-h-screen p-2">
      <div className="mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Hệ Thống Thống Kê
        </h1>
        <MainMenu />
        {/* <SubMenu parent={parent} /> */}
        <Outlet />
      </div>
    </div>
  );
}
