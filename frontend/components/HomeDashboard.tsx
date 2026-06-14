"use client";

import { useState } from "react";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import { motion, AnimatePresence } from "framer-motion";
import { BoardsGrid } from "./BoardsGrid";
import { GraphAnimation } from "./GraphAnimation";
import { GraphLeft } from "./GraphLeft";
import { NewtonsCradle } from "./NewtonsCradle";

export function HomeDashboard() {
  const [text] = useTypewriter({
    words: [
      "Manage Your Tasks",
      "Organize Your Projects",
      "Boost Your Productivity",
      "Plan,Execute,Succeed",
      "Track Your Progress",
      "Collaborate Effortlessly",
      "Get Things Done",
      "Your Work Simplified",
    ],
    loop: true,
    typeSpeed: 120,
    deleteSpeed: 90,
    delaySpeed: 3000,
  });

  const [arrowRightClicked, setArrowRightClicked] = useState(false);
  const [workSpaceContainer, setWorkspaceContainer] = useState(1);

  const arrowRight = () => {
    setArrowRightClicked(true);
    setWorkspaceContainer((prev) => (prev + 1) % 3);
  };
  const arrowLeft = () => {
    setArrowRightClicked(false);
    setWorkspaceContainer((prev) => (prev - 1 + 3) % 3);
  };

  const enterX = arrowRightClicked
    ? typeof window !== "undefined" && window.innerWidth < 800 ? "100%" : "70%"
    : typeof window !== "undefined" && window.innerWidth < 800 ? "-100%" : "-70%";
  const exitX = arrowRightClicked
    ? typeof window !== "undefined" && window.innerWidth < 800 ? "-100%" : "-70%"
    : typeof window !== "undefined" && window.innerWidth < 800 ? "100%" : "70%";

  return (
    <div className="bg-zinc-800 overflow-x-hidden box-border h-screen flex overflow-y-hidden p-5 justify-center homecontiner">
      <div className="flex sm:w-[100%] mb-2 items-center mt-[40%] sm:shadow-xl max-w-[900px] flex-col sm:mt-[10%]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="white"
          onClick={arrowLeft}
          className="size-9 fixed top-[55%] leftarrow flex self-start ml-.5 cursor-pointer hover:stroke-gray-300 z-10"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="white"
          onClick={arrowRight}
          className="size-9 fixed top-[55%] rightarrow flex self-end mr-.5 cursor-pointer hover:stroke-gray-300 z-10"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>

        <div className="workSpaceContainer">
          <AnimatePresence mode="wait">
            {workSpaceContainer === 0 && (
              <motion.div key="workSpace0" className="Your-Board" initial={{ x: enterX, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: exitX, opacity: 0 }} transition={{ duration: 0.4 }}>
                <BoardsGrid title="Shared Boards" visibility="shareable" />
              </motion.div>
            )}

            {workSpaceContainer === 1 && (
              <motion.div key="yourBoards" className="Your-Board" initial={{ x: enterX, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: exitX, opacity: 0 }} transition={{ duration: 0.4 }}>
                <div className="flex justify-center relative">
                  <h1 className="absolute ml-1.5 text-center text-gray-300 top-[13.8%] sm:top-[13.1%] pointer-events-none text-2xl sm:text-3xl">
                    {text}
                    <Cursor />
                  </h1>
                  <hr className="NewtonsCradleHr" />
                  <GraphAnimation />
                  <GraphLeft />
                  <NewtonsCradle />
                </div>
              </motion.div>
            )}

            {workSpaceContainer === 2 && (
              <motion.div key="workSpace2" className="Your-Board" initial={{ x: enterX, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: exitX, opacity: 0 }} transition={{ duration: 0.4 }}>
                <BoardsGrid title="Your Boards" visibility="private" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
