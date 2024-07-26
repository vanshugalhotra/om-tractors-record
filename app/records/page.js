"use client";

import React, { useState, useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { fetchData } from "@/utils/dbFuncs";
import { debounce } from "lodash";

import {
  FaRegEye,
  FaRegTrashAlt,
  FaSearch,
  FaEdit,
  FaPlus,
} from "react-icons/fa";

import { useLoading } from "@/context/LoadingContext";
import Loading from "@/components/Loading/Loading";
import { formatDate, raiseToast } from "@/utils/utilityFuncs";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";

const Records = () => {
  const { marginForSidebar } = useSidebar();
  const { loading, startLoading, stopLoading } = useLoading(); // Access loading state and functions
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProductID, setSelectedProductID] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const router = useRouter();

  // Fetch initial products with limit
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        const api = "/api/product/getproducts?limit=10";
        const initProducts = await fetchData(api);
        setProducts(initProducts); // Set state with fetched data
      } catch (error) {
        console.error("Error fetching initial products:", error);
        // Handle error if needed
      }
    };

    fetchInitialProducts(); // Invoke the async function to fetch data
  }, []); // Empty dependency array ensures it runs only once after initial render

  // Fetch search results if searchQuery is not blank
  useEffect(() => {
    if (searchQuery.trim() === "") {
      // Skip fetching if searchQuery is blank
      return;
    }

    const fetchResults = debounce(async () => {
      try {
        // Fetch results based on search query
        const api = `/api/product/getproducts?search=${searchQuery}`;
        const results = await fetchData(api);
        setProducts(results);
      } catch (error) {
        console.error("Error fetching search results:", error);
        // Handle error if needed
      }
    }, 500); // Adjust the debounce delay as needed

    fetchResults();
  }, [searchQuery]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleUpdate = async (
    _id,
    productName,
    amount,
    partNumber,
    type,
    brand,
    code,
    description
  ) => {
    const data = {
      _id: _id,
      productName: productName,
      partNumber: partNumber,
      amount: amount,
      type: type.name,
      brand: brand.name,
      code: code,
      description: description,
      typeID: type._id,
      brandID: brand._id,
    };
    console.log(data);
    const queryParams = Object.keys(data)
      .map((key) => {
        const encodedKey = `encoded_${encodeURIComponent(key)}`;
        const encodedValue = encodeURIComponent(data[key]);
        return `${encodedKey}=${encodedValue}`;
      })
      .join("&");

    const url = `/addrecord?${queryParams}`;

    router.push(url);
  };

  const handleDelete = async (_id) => {
    setSelectedProductID(_id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `/api/product/deleteproduct?_id=${selectedProductID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        raiseToast("success", "Product Deleted Successfully!!");
        // Optionally, refresh the product list or handle successful deletion
      } else {
        raiseToast(
          "error",
          `Failed to delete the product due to ${response.statusText}`
        );
      }
    } catch (error) {
      raiseToast("error", `Failed to delete the product : ${error}`);
    } finally {
      router.refresh();
    }
  };

  return (
    <section style={{ marginLeft: marginForSidebar }} className="py-8 px-8">
      {loading && <Loading />}
      <div className="top flex items-center justify-between">
        <div className="left">
          <h2 className="text-xl text-gray-900 font-medium tracking-wide leading-snug">
            Records
          </h2>
          <p className="text-sm text-gray-600 py-1 tracking-wide">
            Your Records
          </p>
        </div>
        <Link className="right-btn icon-btn" href={"/addrecord"}>
          <FaPlus className="w-6 h-6 text-white font-medium" />
          <span className="text-white font-medium px-2 text-lg">
            Add Record
          </span>
        </Link>
      </div>
      <div className="my-8 rounded-lg border-2 border-gray-200 border-opacity-70 pb-8 shadow-sm">
        <div className="top-section py-6 px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="search-bar w-full border-gray-300">
            <FaSearch className="inline-flex text-gray-500 rounded-full cursor-pointer mx-2 up-icon" />
            <input
              type="text"
              placeholder="Search..."
              className="search-bar-input"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
          </div>
        </div>
      </div>
      <div className="px-4">
        <div className="relative overflow-x-auto">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="table-heading">
                    Sr No.
                  </th>
                  <th scope="col" className="table-heading">
                    Product Name
                  </th>
                  <th scope="col" className="table-heading">
                    Part Number
                  </th>
                  <th scope="col" className="table-heading">
                    MRP (₹)
                  </th>
                  <th scope="col" className="table-heading">
                    Last Updated
                  </th>
                  <th scope="col" className="table-heading">
                    Code
                  </th>
                  <th scope="col" className="table-heading">
                    Description
                  </th>
                  <th scope="col" className="table-heading">
                    Type
                  </th>
                  <th scope="col" className="table-heading">
                    Brand
                  </th>
                  <th scope="col" className="table-heading">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.length &&
                  products.map(
                    (
                      {
                        _id,
                        productName,
                        partNumber,
                        amount,
                        type,
                        brand,
                        code,
                        description,
                        lastUpdated,
                      },
                      index
                    ) => {
                      return (
                        <tr
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                          style={{ backgroundColor: type.color }}
                          key={_id}
                        >
                          <td className="table-data text-gray-900 font-semibold">
                            {index + 1}.)
                          </td>
                          <td className="table-data">{productName}</td>
                          <td className="table-data">{partNumber}</td>
                          <td className="table-data">{`₹ ${amount}`}</td>
                          <td className="table-data">
                            {formatDate(lastUpdated)}
                          </td>
                          <td className="table-data">{code}</td>
                          <td className="table-data">{description}</td>
                          <td className="table-data">{type.name}</td>
                          <td className="table-data">{brand.name}</td>
                          <td className="table-data space-y-2">
                            <div
                              className="action-icon"
                              onClick={() => {
                                router.push(`/recorddetails?_id=${_id}`);
                              }}
                            >
                              <FaRegEye className="normal-icon" />
                            </div>
                            <div
                              className="action-icon"
                              onClick={() => {
                                handleUpdate(
                                  _id,
                                  productName,
                                  amount,
                                  partNumber,
                                  type,
                                  brand,
                                  code,
                                  description
                                );
                              }}
                            >
                              <FaEdit className="normal-icon mx-1" />
                            </div>
                            <div
                              className="inline-block text-red-500 up-icon hover:text-red-700"
                              onClick={() => {
                                handleDelete(_id);
                              }}
                            >
                              <FaRegTrashAlt className="normal-icon" />
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmationModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete the product, This action cannot be undone."
      />
    </section>
  );
};

export default Records;
