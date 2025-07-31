import { privateApi } from "./baseApi";
const admintoApi = {
    fetchAllholiday: () => {
        return privateApi.get("/holidays")
    },
    deleteHoliday: (id) => {
        return privateApi.delete(`/holidays/${id}`)
    },
    ceateHoliday: (body) => {
        return privateApi.post("/holidays",body)
    },
    updateHoliday: (id, body) => {
    return privateApi.put(`/holidays/${id}`, body);
  },getAllUser:()=>{
    return privateApi.get('/users')
  }
};

export default admintoApi;
