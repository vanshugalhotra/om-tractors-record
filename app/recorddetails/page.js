"use client";

import React, { useState, useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { useSearchParams } from "next/navigation";
import { fetchData } from "@/utils/dbFuncs";
import { formatDate } from "@/utils/utilityFuncs";
import { useLoading } from "@/context/LoadingContext";
import Loading from "@/components/Loading/Loading";

const RecordDetails = () => {
  const searchParams = useSearchParams();
  const [productdetails, setProductdetails] = useState(null);
  const { marginForSidebar } = useSidebar();
  const { loading, startLoading, stopLoading } = useLoading(); // Access loading state and functions

  useEffect(() => {
    const fetchProductDetails = async () => {
      startLoading();
      try {
        const api = `/api/product/getproductdetails?_id=${searchParams.get(
          "_id"
        )}`;
        const product = await fetchData(api);
        setProductdetails(product.product);
      } catch (error) {
        console.error("Error fetching product details:", error);
        // Handle error if needed
      } finally {
        stopLoading();
      }
    };

    fetchProductDetails(); // Invoke the async function to fetch data
  }, [searchParams]);

  let productFields = [];
  if (productdetails) {
    productFields = [
      {
        title: "Product Name",
        value: productdetails.productName,
      },
      {
        title: "Part Number",
        value: productdetails.partNumber,
      },
      {
        title: "MRP (₹)",
        value: `₹ ${productdetails.amount}`,
      },
      {
        title: "Last Updated",
        value: formatDate(productdetails.lastUpdated),
      },
      {
        title: "Tractor Type",
        value: productdetails.type.name,
      },
      {
        title: "Brand (Company) ",
        value: productdetails.brand.name,
      },
      {
        title: "Purchase Code",
        value: productdetails.code,
      },
      {
        title: "Description",
        value: productdetails.description,
      },
    ];
  }

  return (
    <section style={{ marginLeft: marginForSidebar }} className="py-8 px-8">
      {loading && <Loading />}
      <div className="top flex items-center justify-between">
        <div className="left">
          <h2 className="text-xl text-gray-900 font-medium tracking-wide leading-snug">
            Record Details
          </h2>
          <p className="text-sm text-gray-600 py-1 tracking-wide">
            Full Details of Record
          </p>
        </div>
      </div>
      <div className="my-8 brands-card rounded-lg border border-gray-200 border-opacity-70 pb-8 shadow-sm">
        <div className="product-details outline-none py-8 px-6 border-none flex md:flex-row flex-col">
          <div className="w-full">
            <ul className="w-full border-b">
              {productFields.map(({ title, value }, index) => (
                <li
                  className={`product-details-item ${
                    index % 2 === 1 ? "bg-gray-100" : ""
                  }`}
                  key={index}
                >
                  <h4 className="product-details-title">{title}</h4>
                  <h6 className="product-details-value">{value}</h6>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecordDetails;
