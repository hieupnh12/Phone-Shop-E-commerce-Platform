import axiosClient from "../api";
import { GET, POST } from "../constants/httpMethod";

const LOGIN_API_ENDPOINT = "/api/statistic";

const statisticApi = {
  // get api info summary
  getInfoSummary: (days) => {
    return axiosClient[GET](`${LOGIN_API_ENDPOINT}?days=${days}`);
  },

  // get api summary card dashboard
  getInfoCardDashboard: () => {
    return axiosClient[GET](`${LOGIN_API_ENDPOINT}/summary_dashboard`);
  },

  getInfoCardOrder: () => {
    return axiosClient[GET](`${LOGIN_API_ENDPOINT}/summary_order`);
  },

  getSummaryRevenue: () => {
    return axiosClient[GET](`${LOGIN_API_ENDPOINT}/summary_revenue`);
  },

  getRevenue: (options = {}) => {
    const {
      startDate,
      endDate,
      categoryId,
      orderStatus,
      paymentMethodId,
      page,
      size,
      search,
      sort,
    } = options;

    const params = new URLSearchParams();

    // chỉ thêm khi có giá trị thật
    params.append(
      "startDate",
      startDate && startDate.trim() !== "" ? startDate : "2000-11-01"
    );
    params.append(
      "endDate",
      endDate && endDate.trim() !== "" ? endDate : "3000-11-01"
    );
    if (categoryId && categoryId !== "all")
      params.append("categoryId", categoryId);
    if (orderStatus && orderStatus !== "all")
      params.append("orderStatus", orderStatus);
    if (paymentMethodId && paymentMethodId !== "all")
      params.append("paymentMethodId", paymentMethodId);

    // page và size luôn gửi

    params.append("page", page ?? 0);
    params.append("size", size ?? 10);

    if (search) params.append("search", search);

    params.append("sort", sort ?? "create_datetime,desc");

    return axiosClient[GET](
      `${LOGIN_API_ENDPOINT}/revenue?${params.toString()}`
    );
  },

  getOrder: (params) => {
    const paramsObj = {
      startDate: params.startDate?.trim() || "",
      endDate: params.endDate?.trim() || "",
      rangeType: params.rangeType?.trim(),
      orderStatus: params.orderStatus?.trim() || "all",
      search: params.searchEmail?.trim(),
      searchStaff: params.searchStaff?.trim(),
    };

    const urlParams = new URLSearchParams();

    for (const [key, value] of Object.entries(paramsObj)) {
      if (value !== undefined && value !== null && value !== "") {
        urlParams.append(key, value);
      }
    }

    // Gửi request với params chỉ có dữ liệu
    return axiosClient.get(
      `${LOGIN_API_ENDPOINT}/order?${urlParams.toString()}`
    );
  },

  getSetting: () => {
    return axiosClient[GET](`/api/report-config`);
  },

  postSetting: (payload) => {
    return axiosClient[POST](`/api/report-config/update`, payload);
  },

  sendMailNow: () => {
    return axiosClient[POST](`/api/report-config/send-now`);
  },

  getProducts: (params) => {
    const paramsObj = {
      startDate: params.startDate?.trim() || "",
      endDate: params.endDate?.trim() || "",
    };

    const urlParams = new URLSearchParams();

    for (const [key, value] of Object.entries(paramsObj)) {
      if (value !== undefined && value !== null && value !== "") {
        urlParams.append(key, value);
      }
    }

    // Gửi request với params chỉ có dữ liệu
    return axiosClient.get(
      `${LOGIN_API_ENDPOINT}/products?${urlParams.toString()}`
    );
  },
};

export default statisticApi;
