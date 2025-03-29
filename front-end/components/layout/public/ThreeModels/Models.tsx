"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Pagination3 from "./Pagination";
import {
  useGetModelsQuery,
  useLoginMutation,
} from "@/redux/services/modelsApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  setIsLoggingIn,
  setIsModelsLoading,
  setSearchParam,
  setTags,
  setToken,
} from "@/redux/slices/foveaAuthSlice";
import Link from "next/link";
import Skeleton2 from "./Skeleton";

export default function Models() {
  const dispatch = useDispatch();
  const {
    accessToken,
    expiresIn,
    tokenCreatedAt,
    tags,
    selectedTags,
    searchParam,
  } = useSelector((state: RootState) => state.auth);
  const [page, setPage] = useState(1);
  const [canFetch, setCanFetch] = useState(false);
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  const perPage = 15;
  const tagParam =
    selectedTags && selectedTags.length > 0
      ? { tags: selectedTags.join(",") }
      : {};
  const searchPara = searchParam !== "" ? { search: searchParam } : {};

  const isTokenExpired =
    !accessToken ||
    !tokenCreatedAt ||
    Date.now() > tokenCreatedAt + (expiresIn ?? 0);

  useEffect(() => {
    if (!isTokenExpired) {
      setCanFetch(true);
      return;
    }

    const fetchToken = async () => {
      try {
        dispatch(setIsLoggingIn(true));
        const data = await login().unwrap();
        // console.log("Custom3DModelingService-----------------", data);
        if (data?.access_token && data?.expires_in) {
          dispatch(
            setToken({
              accessToken: data.access_token,
              expiresIn: data.expires_in,
            })
          );
          setCanFetch(true);
        }
      } catch (err) {
        console.error("Login error:", err);
      } finally {
        dispatch(setIsLoggingIn(false));
      }
    };

    fetchToken();
  }, [isTokenExpired, dispatch, login]);

  const { data, error, isLoading } = useGetModelsQuery(
    {
      page,
      per_page: perPage,
      ...tagParam,
      ...searchPara,
      order_by: "CREATED_NEW_TO_OLD",
    },
    { skip: !canFetch }
  );
  const isBusy = isLoading || isLoggingIn;

  useEffect(() => {
    dispatch(setIsModelsLoading(isLoading));
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (
      tags === undefined &&
      Array.isArray(data?.tags) &&
      data?.tags?.length > 0
    ) {
      console.log("rUNNIG----------");
      dispatch(setTags(data?.tags));
    }
  }, [data?.tags, tags, dispatch]);

  useEffect(() => {
    setPage(1);
  }, [selectedTags]);

  const totalPages = Math.ceil((data?.filteredTotalModels || 0) / perPage); // Make sure your API returns `total`

  return (
    <>
      <section className="bg-white py-20 lg:py-[10px] dark:bg-dark ">
        <div className="container">
          <ModelSearch />

          <div className="-mx-4 flex flex-wrap min-h-[60vh]">
            {error && <p>Something went wrong.</p>}

            {isBusy ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 auto-rows-fr xl:h-full">
                {Array(15)
                  .fill(null)
                  .map((model, index) => (
                    <Skeleton2 key={index} />
                  ))}
              </div>
            ) : Array.isArray(data?.models) && data.models.length > 0 ? (
              data.models.map((model: any, index: number) => (
                <BlogItem
                  key={model.id || index}
                  image={`https://cdn.archvision.services/public/service.thumbnail-cache/${model?.rpc_guid}.rpc.png`}
                  title={model.title}
                  freeKey={model.tags?.includes("FREE") ? true : false}
                />
              ))
            ) : (
              <div className="w-screen h-[60vh] flex flex-col justify-center items-center text-center lg:text-xl text-sm text-dark-5 dark:text-light-3">
                <div className="text-[80px] lg:text-[150px] text-dark-4 dark:text-light-3 mt-28 md:mt-0 mb-20">
                  ㋛
                </div>
                <p>
                  Uh-oh! We flipped every digital rock, but no 3D models were
                  found. 🤔
                </p>
                <br />
                <p>
                  Try a different keyword and let’s uncover something awesome!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      {isBusy || data?.filteredTotalModels !== 0 && (
        <Pagination3
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </>
  );
}

function BlogItem({ title, image, freeKey }: any) {
  return (
    <div className="w-full px-4 md:w-1/2 lg:w-1/5">
      <div className="group rounded-lg border border-stroke p-1 dark:border-dark-3">
        <div className=" overflow-hidden rounded relative">
          {freeKey && (
            <span className="absolute top-1 right-2 bg-purple text-light-1 text-[10px] px-1.5 py-0.5 rounded z-10">
              FREE
            </span>
          )}

          <Image
            src={image}
            alt={title}
            width={200}
            height={120}
            className="max-h-32 max-w-full object-contain duration-200 group-hover:rotate-6 group-hover:scale-125"
          />
        </div>

        <div className="h-10 flex items-center justify-center relative group">
          <h1 className="truncate text-nowrap dark:text-light-3 max-w-full px-2 text-sm">
            {title}
          </h1>
          <div className="absolute left-1/2 top-full z-20 -translate-x-1/2 whitespace-nowrap rounded border border-light bg-white px-3 py-1 text-xs font-medium text-body-color opacity-0 group-hover:opacity-100 dark:border-dark-3 dark:bg-dark dark:text-dark-6">
            {title}
          </div>
        </div>
      </div>
    </div>
  );
}

const ModelSearch = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { searchParam } = useSelector((state: RootState) => state.auth);

  return (
    <div className="flex justify-between items-center w-full flex-wrap mb-8">
      <form className="w-2/3 pl-64">
        <label htmlFor="voice-search" className="sr-only">
          Search
        </label>
        <div className="relative w-full">
          <input
            type="text"
            id="voice-search"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search Chair, Tables, Light Models..."
            required
            value={searchParam || ""}
            onChange={(e) => {
              dispatch(setSearchParam(e.target.value));
            }}
          />
          <button
            type="button"
            className="absolute inset-y-0 end-0 flex items-center pe-3"
          >
            <svg
              className="w-4 h-4 me-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </button>
        </div>
      </form>
      <div className="flex items-center gap-4 relative min-w-48">
        <p className="dark:text-light-3 text-sm">Powered by </p>
        <Link
          href="https://archvision.com/fovea/"
          target="_black"
          // className="dark:hidden"
        >
          <Image
            src={
              theme === "light"
                ? "./images/Fovea-Logo.svg"
                : "./images/Fovea-Logo-Dark.svg"
            }
            width={100}
            height={150}
            alt="Fovea Logo"
            unoptimized={true}
          />
        </Link>
      </div>
    </div>
  );
};
