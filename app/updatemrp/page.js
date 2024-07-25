"use client";

import React, { useState } from "react";
import { useSidebar } from "@/context/SidebarContext";
import InputContainer from "@/components/Form/InputContainer";
import Link from "next/link";
import { raiseToast } from "@/utils/utilityFuncs";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { postData } from "@/utils/dbFuncs";
import Loading from "@/components/Loading/Loading";
import DobPicker from "@/components/Form/DobPicker";

const UpdateMRP = () => {
  const { marginForSidebar } = useSidebar();
  const { loading, startLoading, stopLoading } = useLoading(); // Access loading state and functions

  const router = useRouter();

  const [nameField, setNameField] = useState("");
  const [mrpField, setMrpField] = useState("");
  const [date, setDate] = useState(new Date());
  const [file, setFile] = useState("");

  const handleDateChange = (date) => {
    setDate(date);
  };

  const submit = async () => {
    try {
      startLoading();

      // Ensure all required fields are provided
      if (!nameField || !mrpField || !file || !date) {
        raiseToast("error", "All fields are required!");
        return;
      }

      // Prepare the data to send
      const data = {
        nameField,
        mrpField,
        fileName: file, // Name of the file you placed in the public directory
        date,
      };

      // Use the postData function to submit the data
      const result = await postData("POST", data, "/api/updatemrp");

      // Check if the response was successful
      if (result.success) {
        raiseToast(
          "success",
          `MRP updated successfully!\nTotal Records Updated: ${result.updatedCount}`
        );
        router.push("/");
      } else {
        raiseToast("error", result.error || "Something went wrong!");
      }
    } catch (error) {
      raiseToast("error", error.message);
    } finally {
      stopLoading();
    }
  };

  return (
    <section style={{ marginLeft: marginForSidebar }} className="py-8 px-8">
      {loading && <Loading />}
      <div className="top flex items-center justify-between">
        <div className="left">
          <h2 className="text-xl text-gray-900 font-medium tracking-wide leading-snug">
            Update MRP
          </h2>
          <p className="text-xs text-gray-600 py-1 tracking-wide">
            Update List Price
          </p>
        </div>
      </div>
      <div className="my-8 brands-card rounded-lg border-2 py-2 pb-4 border-gray-200 border-opacity-70  shadow-sm">
        <div className="inputs grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
          {/* Name Field*/}
          <div className="lg:col-span-1">
            <InputContainer
              label={"Part Number Field"}
              value={nameField}
              onChange={(event) => {
                setNameField(event.target.value);
              }}
              fullWidth={true}
            />
          </div>
          {/* MRP Field*/}
          <div className="lg:col-span-1">
            <InputContainer
              label={"MRP Field"}
              value={mrpField}
              onChange={(event) => {
                setMrpField(event.target.value);
              }}
              fullWidth={true}
            />
          </div>

          {/*Last Updated*/}
          <div className="lg:col-span-2">
            <div className="input-item">
              <label htmlFor="dob" className="input-label">
                Last Updated
              </label>
              <div className="relative border rounded-md border-[#919eab52] my-4 flex items-center justify-center flex-col py-2 cursor-pointer  transition-all duration-100 ease-in hover:bg-gray-100">
                <DobPicker selectedDate={date} onChange={handleDateChange} />
              </div>
            </div>
          </div>

          {/* MRP Field*/}
          <div className="lg:col-span-4">
            <InputContainer
              label={"File Name (Must be present in /public/assets/data/ )"}
              value={file}
              onChange={(event) => {
                setFile(event.target.value);
              }}
              fullWidth={true}
            />
          </div>
        </div>
        <div className="control-buttons mx-4 my-4">
          <div
            className="primary-btn bg-orange-400 hover:bg-orange-500"
            onClick={submit}
          >
            Submit
          </div>
          <Link
            href={"/"}
            className="primary-btn bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpdateMRP;
