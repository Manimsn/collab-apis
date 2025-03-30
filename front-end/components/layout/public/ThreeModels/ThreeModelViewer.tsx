"use client";
import React from "react";
import PublicModelViewer from "./ModelViewer";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLongLeftIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

const ModelViewer = dynamic(() => import("./ModelViewer"), {
  ssr: false,
});

const tags = ["3D", "Interior Design", "Model", "AR", "VR"];

const ThreeModelViewer = () => {
  return (
    <>
      <section className="pb-10 pt-20 dark:bg-dark lg:pb-20 lg:pt-[40px]">
        <div className="container md:max-w-full md:px-20 ">
          <div className="-mx-4 flex flex-wrap py-10 px-10 bg-light-0">
            <div className="relative w-full px-4 lg:w-7/12 xl:w-8/12">
              <button
                // onClick={toggleFullScreen}
                className="absolute top-4 right-4 z-20 bg-light-2 dark:bg-dark-3 p-2 rounded-lg shadow-lg"
              >
                {true ? (
                  <ArrowsPointingInIcon className="w-6 h-6 text-black dark:text-white" />
                ) : (
                  <ArrowsPointingOutIcon className="w-6 h-6 text-black dark:text-white" />
                )}
              </button>
              <div className="mb-12 lg:mb-0">
                <ModelViewer src="/Astronaut.glb" />
                <div className="mb-8 flex justify-center text-center items-center">
                  {/* <button className="flex w-3/12 items-center justify-center rounded-md bg-purple/75 px-10 py-[13px] text-center text-base font-medium text-white hover:bg-purple lg:px-8 xl:px-10">
                    View in AR
                  </button> */}
                  <button
                    // onClick={() => {
                    //    if (authStatus === "authenticated") {
                    //       activateAR()
                    //    } else {
                    //       setErrorMessage(
                    //          "Please Sign up or Log in to experience AR."
                    //       )
                    //    }
                    // }}
                    // disabled={isPresenting}
                    className="bg-purple/75 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {false ? "Exit AR" : "View in AR"}
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full px-4 lg:w-5/12 xl:w-4/12">
              <Link
                href={`#`}
                className="w-[120px] text-white bg-purple rounded-md flex items-center justify-center gap-2 whitespace-nowrap py-2 px-4 mb-4"
              >
                <ArrowLongLeftIcon className="w-6 h-6" /> Back
              </Link>
              <h3 className="mb-8 text-3xl font-medium text-dark dark:text-white">
                Astoria HB Lounge Chair
              </h3>

              {/* <div className="mb-8 overflow-hidden rounded-[10px] border border-stroke bg-white shadow-testimonial-6 dark:border-dark-3 dark:bg-dark-2 dark:shadow-box-dark">
                <div className="flex items-center justify-between bg-[#f9f9f9] px-6 py-[18px] dark:bg-dark-4 2xl:px-8">
                  <p className="text-base font-medium text-dark dark:text-white">
                    Product
                  </p>
                  <p className="text-right text-base font-medium text-dark dark:text-white">
                    Subtotal
                  </p>
                </div>

                <CartItem
                  img="https://cdn.tailgrids.com/1.0/assets/images/ecommerce/checkout/checkout-01/image-01.jpg"
                  title="Hollow Port"
                  color="Brown"
                  size="XL"
                  price="$36.00"
                />

                <div className="-mx-1 border-b border-stroke p-6 dark:border-dark-3 2xl:px-8">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="px-1">
                      <p className="text-base text-dark dark:text-white">
                        Subtotal
                      </p>
                    </div>
                    <div className="px-1">
                      <p className="text-base font-medium text-dark dark:text-white">
                        $108
                      </p>
                    </div>
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="px-1">
                      <p className="text-base text-dark dark:text-white">
                        Shipping Cost (+)
                      </p>
                    </div>
                    <div className="px-1">
                      <p className="text-base font-medium text-dark dark:text-white">
                        $10.85
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="px-1">
                      <p className="text-base text-dark dark:text-white">
                        Discount (-)
                      </p>
                    </div>
                    <div className="px-1">
                      <p className="text-base font-medium text-dark dark:text-white">
                        $9.00
                      </p>
                    </div>
                  </div>
                </div>

                <div className="-mx-1 p-6 sm:px-7 lg:px-6 2xl:px-7">
                  <div className="flex items-center justify-between">
                    <div className="px-1">
                      <p className="text-base text-dark dark:text-white">
                        Total Payable
                      </p>
                    </div>
                    <div className="px-1">
                      <p className="text-base font-medium text-dark dark:text-white">
                        $88.15
                      </p>
                    </div>
                  </div>
                </div>
              </div> */}

              <div className="mb-8">
                <DefaultSelect />
              </div>

              <div className="mb-8">
                <button className="flex w-full items-center justify-center rounded-md bg-yellow px-10 py-[13px] text-center text-base font-bold text-black hover:bg-yellow/80 lg:px-8 xl:px-10">
                  Download
                </button>
              </div>

              <div className=" mt-3 space-y-2">
                <h1>Tags</h1>
                <div className="flex max-h-[28rem] overflow-y-auto no-scrollbar flex-wrap">
                  {Array.isArray(tags) &&
                    tags.map((tag: any, index: any) => {
                      return (
                        <span
                          key={index}
                          className="flex dark:text-light-2 dark:bg-dark-2 mr-3 mb-3 whitespace-nowrap px-4 py-2 rounded-full  bg-light-2 text-dark-2 text-xs"
                        >
                          {tag}
                        </span>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ThreeModelViewer;

const DefaultSelect = () => {
  return (
    <>
      <div className="relative z-20">
        <select className="relative z-20 w-full appearance-none rounded-lg border border-stroke dark:border-dark-3 bg-transparent py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2">
          <option value="" className="dark:bg-dark-2">
            Option
          </option>
          <option value="" className="dark:bg-dark-2">
            Option
          </option>
          <option value="" className="dark:bg-dark-2">
            Option
          </option>
        </select>
        <span className="absolute right-4 top-1/2 z-10 mt-[-2px] h-[10px] w-[10px] -translate-y-1/2 rotate-45 border-r-2 border-b-2 border-body-color"></span>
      </div>
    </>
  );
};
