"use client";

import React, { useState } from "react";
import { useSidebar } from "@/context/SidebarContext";
import InputContainer from "@/components/Form/InputContainer";
import Link from "next/link";
import { raiseToast } from "@/utils/utilityFuncs";
import { postData } from "@/utils/dbFuncs";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import BlobUpload from "@/components/Form/BlobUpload";
import Loading from "@/components/Loading/Loading";
import ColorPicker from "@/components/Form/ColorPicker";

const AddType = () => {
  const { marginForSidebar } = useSidebar();
  const { loading, startLoading, stopLoading } = useLoading(); // Access loading state and functions

  const router = useRouter();
  const searchParams = useSearchParams();

  const [type, setType] = useState(searchParams.get("encoded_type") ?? "");

  const [color, setColor] = useState("#fffff");

  const [_id, set_id] = useState(searchParams.get("encoded__id") ?? null);

  const submit = async () => {
    try {
      startLoading();
      if (!type) {
        raiseToast("error", "Type is required!!");
        return;
      }
      const data = {
        name: type,
        color: color,
      };

      let METHOD = "POST";
      let api = "/api/type/addtype";

      if (_id) {
        // if it is an update request
        METHOD = "PATCH";
        api = "/api/type/updatetype";
        data._id = _id;
      }

      // All uploads successful, proceed to save data in database
      const response = await postData(METHOD, data, api);
      if (response.success) {
        let message = _id
          ? "Type Updated Successfully!!"
          : "Type Added Successfully!!";
        raiseToast("success", message);
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        raiseToast("info", "Type Already Exists!!");
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
            Add Type
          </h2>
          <p className="text-xs text-gray-600 py-1 tracking-wide">
            Add New Type
          </p>
        </div>
      </div>
      <div className="my-8 brands-card rounded-lg border-2 py-2 pb-4 border-gray-200 border-opacity-70  shadow-sm">
        <div className="inputs grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
          {/* Type Name*/}
          <div className="lg:col-span-2">
            <InputContainer
              label={"Type (Tractor)"}
              value={type}
              onChange={(event) => {
                setType(event.target.value);
              }}
              fullWidth={true}
            />
          </div>

          {/* Color */}
          <div className="lg:col-span-2">
            <ColorPicker color={color} setColor={setColor} label={"Pick A Color"} />
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

export default AddType;
