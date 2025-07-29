import { privateApi } from "./baseApi";
const admintoApi = {
    fetchAllholiday:()=>{
     return    privateApi.get("/holidays")
    },
};

export default admintoApi;
