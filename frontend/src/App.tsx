import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Contact from "./pages/contact/Contact";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Payment from "./pages/payment/Payment";
import Portal from "./pages/portal/Portal";
import Register from "./pages/register/Register";
import Shop from "./pages/shop/Shop";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
