import React, { useEffect, useState } from "react";
import Chart from "./Chart";
import Table from "./Table";
import SummaryCards from "./SummaryCards";
export default function DashboardStatistic() {
  const [data7Day, setData7Day] = useState([]);

  useEffect(() => {
    const fakeDate = [
      {
        date: "",
        orders: 25,
        revenue: 1200000,
        cost: 8000000,
        benefit: -400000,
        topProduct: "iPhone 15 Pro"
      },
      {
        date: "2025-10-30",
        orders: 25,
        revenue: 950000,
        cost: 700000,
        benefit: 250000,
        topProduct: "iPhone 15 Pro"
      },
      {
        date: "2025-10-31",
        orders: 25,
        revenue: 1800000,
        cost: 1200000,
        benefit: 600000,
        topProduct: "iPhone 15 Pro"
      },
      {
        date: "2025-11-01",
        revenue: 2100000,
        cost: 1600000,
        benefit: 500000,
      },
      {
        date: "2025-11-02",
        revenue: 1700000,
        cost: 1200000,
        benefit: 500000,
      },
      {
        date: "2025-11-03",
        revenue: 1950000,
        cost: 1400000,
        benefit: 550000,
      },
      {
        date: "2025-11-04",
        revenue: 2300000,
        cost: 1600000,
        benefit: 700000,
      },
    ];

    setData7Day(fakeDate);
  }, []);

  return (
    <div>
      {data7Day.length === 0 ? (
        <p>Tải data</p>
      ) : (
        <div className="w-full">
        <SummaryCards/>
        <Chart data7Day={data7Day}/>
        <Table data7Day={data7Day}/>
        </div>
      )}
      
    </div>
  );
}
