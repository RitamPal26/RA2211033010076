
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/layout/Navbar";
import Feed from "./pages/Feed";
import TopUsers from "./pages/TopUsers";
import TrendingPosts from "./pages/TrendingPosts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <DataProvider pollingInterval={30000}>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" closeButton theme="system" />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 pt-16">
                <Routes>
                  <Route path="/" element={<Feed />} />
                  <Route path="/top-users" element={<TopUsers />} />
                  <Route path="/trending" element={<TrendingPosts />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
