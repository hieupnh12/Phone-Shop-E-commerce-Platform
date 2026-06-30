import { useQuery } from "@tanstack/react-query";
import loginApi from "../services/loginService";

const fetchAuth = async () => {
    const res = await loginApi.getAuth(); // axiosClient tự động gắn token    
    return res?.result?.valid;
};

export const useAuth = () => useQuery({
  queryKey: ['auth'],
  queryFn: fetchAuth,
  staleTime: 60000
});