import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreatePoll from "./pages/CreatePoll";
import Vote from "./pages/Vote";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/poll/:code" element={<Vote />} />
        <Route path="/join" element={<Join />} /> 
        <Route path="/polls" element={<MyPolls />} /> 
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}