import React from "react";
import Chart from "./Chart";
import Table from "./Table";
import SummaryCards from "./SummaryCards";
import { useQuery } from "@tanstack/react-query";
import statisticApi from "../../../../../services/statisticService";
import { useAuth } from "../../../../../reducers";
import Loading from "../../../../../components/common/Loading";

export default function DashboardStatistic() {
  const { data: isAuth, isLoading: authLoading } = useAuth();
  const {data:dataCard, isLoadingCard, errorCard} = useQuery({
    queryKey: ["summaryCard", {days: 7}],
    queryFn: async () => {
      const res = await statisticApi.getInfoCardDashboard();
      
      return res?.result || [];
    },
    enabled: !!isAuth, 
    staleTime: 0, 
    refetchOnWindowFocus: true, 
    refetchInterval: 1000, 
  })
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["summary", 7], 
    queryFn: async () => {
      const res = await statisticApi.getInfoSummary(7);
      console.log(res);
      
      return res?.result || []; 
    },
    enabled: !!isAuth, 
    staleTime: 0, 
    refetchOnWindowFocus: true, 
    refetchInterval: 1000, 
  });


      console.log("dđ",dataCard);

  if (authLoading) return <Loading fullScreen type="dots" />;
  if (error) return <Loading />;
// <p>Error: {error.message}</p> || 
  return (
    <div className="w-full">
      <SummaryCards dataCard={dataCard} isLoadingCard={isLoadingCard} errorCard={errorCard}/>
      <Chart data7Day={data} isLoading={isLoading}/>
      <Table data7Day={data} isLoading={isLoading}/>
    </div>
  );
}
