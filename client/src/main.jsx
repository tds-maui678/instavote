import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Home from "./pages/Home.jsx";
import CreatePoll from "./pages/CreatePoll.jsx";
import JoinPoll from "./pages/JoinPoll.jsx";
import Vote from "./pages/Vote.jsx";
import NotFound from "./pages/NotFound.jsx";
import { ToastProvider } from "./ui/ToastProvider.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreatePoll />} />
          <Route path="/join" element={<JoinPoll />} />
          <Route path="/poll/:code" element={<Vote />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
