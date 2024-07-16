// components/Layout.js
"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
