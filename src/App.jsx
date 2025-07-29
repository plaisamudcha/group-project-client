import AppRouter from "./routes/AppRouter";
import { Slide, ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        theme="light"
      />
    </>
  );
}

export default App;
