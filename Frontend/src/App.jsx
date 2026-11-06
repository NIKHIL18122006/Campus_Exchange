import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import VerifyOtp from './pages/verifyOtp.jsx';
import Home from './pages/Home.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import Sell from './pages/Sell.jsx';
import MyListings from './pages/MyListings.jsx';

function Shell({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

// Most pages sit in a centred container
function PageLayout() {
  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </Shell>
  );
}

// The home page controls its own width so its header band can run edge to edge
function FullWidthLayout() {
  return (
    <Shell>
      <main>
        <Outlet />
      </main>
    </Shell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<FullWidthLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Route>

      <Route element={<PageLayout />}>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<VerifyOtp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/my-listings" element={<MyListings />} />
        </Route>
      </Route>
    </Routes>
  );
}