import { useState } from "react";
import "./App.css";
import SchemesList from "./components/SchemesList/SchemesList.jsx";
import Chatbot from "./components/Chatbot/Chatbot.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 h-[calc(100vh-64px)]">
        
        {/* Left side: Schemes List */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
          <SchemesList />
        </div>

        {/* Right side: Chatbot */}
        <div className="flex-1 lg:max-w-[450px] xl:max-w-[500px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-full">
          <Chatbot />
        </div>

      </div>
    </div>
  );
}

export default App;
