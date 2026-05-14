import React, { useState } from "react";
import VendorComparisonDashboard from "./components/VendorComparisonDashboard";
import RawInventoryAI from "./components/RawInventoryAI";
import OrdersPage from "./components/OrdersPage";
import LogisticsKanban from "./components/LogisticsKanban";
import ApprovalWorkflowModal from "./components/ApprovalWorkflowModal";
import NotificationCenter from "./components/NotificationCenter";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AIAssistancePanel from "./components/AIAssistancePanel";
import ModulePage from "./components/ModulePage";
import FinishedProducts from "./components/FinishedProducts";

export default function SCMDashboard(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>("AI Assistance");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState<boolean>(false);

  return (
    <div
      className={`transition-colors duration-500 ${darkMode ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" : "bg-gradient-to-br from-slate-50 via-white to-slate-100"}`}
      style={{ height: "100vh", overflow: "hidden" }}
    >
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        .fade-slide-up { animation: fadeSlideUp 0.6s ease-out forwards; }
        .typing-dot { animation: typingBounce 1.4s infinite; }
        @keyframes typingBounce { 0%,60%,100%{transform:translateY(0);} 30%{transform:translateY(-8px);} }
        .scrollbar-thin::-webkit-scrollbar { width:6px; height:6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background:transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background:${darkMode ? "rgba(148,163,184,0.3)" : "rgba(203,213,225,0.5)"}; border-radius:3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background:${darkMode ? "rgba(148,163,184,0.5)" : "rgba(148,163,184,0.7)"}; }
        @media(max-width:768px){
          .mobile-menu-enter { animation:slideInLeft 0.3s ease-out; }
          @keyframes slideInLeft{from{transform:translateX(-100%);}to{transform:translateX(0);}}
        }
      `}</style>

      <NotificationCenter
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        darkMode={darkMode}
      />

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
            height: "100vh",
          }}
        >
          <Header
            activeTab={activeTab}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            setSidebarOpen={setSidebarOpen}
            notifOpen={notifOpen}
            setNotifOpen={setNotifOpen}
            profileOpen={profileOpen}
            setProfileOpen={setProfileOpen}
          />

          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            {activeTab === "AI Assistance" ? (
              <AIAssistancePanel
                darkMode={darkMode}
                setApprovalModalOpen={setApprovalModalOpen}
              />
            ) : (
              <div
                style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
                className="scrollbar-thin"
              >
                {activeTab === "Raw Inventory" ? (
                  <RawInventoryAI darkMode={darkMode} />
                ) : activeTab === "Inventory Vendor" ? (
                  <VendorComparisonDashboard darkMode={darkMode} />
                ) : activeTab === "Finish Product" ? (
                  <FinishedProducts darkMode={darkMode} />
                ) : activeTab === "Orders" ? (
                  <OrdersPage darkMode={darkMode} />
                ) : activeTab === "Logistics" ? (
                  <LogisticsKanban darkMode={darkMode} />
                ) : (
                  <ModulePage tabName={activeTab} darkMode={darkMode} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {approvalModalOpen && (
        <ApprovalWorkflowModal
          darkMode={darkMode}
          onClose={() => setApprovalModalOpen(false)}
        />
      )}
    </div>
  );
}
