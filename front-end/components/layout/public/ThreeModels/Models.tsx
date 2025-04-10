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
import { useRouter, useSearchParams } from "next/navigation";
import { buildURLWithParams } from "@/utils/urlHelpers";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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
  // const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = parseInt(searchParams.get("page") || "1", 10);

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
  const safeSelectedTags = selectedTags ?? [];
  const safeSearchParam = searchParam ?? "";

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
    const queryString = buildURLWithParams({
      page: 1,
      perPage,
      selectedTags: safeSelectedTags,
      searchParam: safeSearchParam,
      searchParams,
    });

    router.replace(`/3d-models-interior-design?${queryString}`, {
      scroll: false,
    });
  }, [safeSelectedTags, safeSearchParam]);

  const totalPages = Math.ceil((data?.filteredTotalModels || 0) / perPage); // Make sure your API returns `total`

  return (
    <>
      <section className="bg-white py-20 lg:py-[10px] dark:bg-dark ">
        <div className="container">
          <ModelSearch />

          <div className="-mx-4 flex flex-wrap min-h-[60vh] h-[60vh]">
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
                  rpcId={model?.rpc_guid}
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
      <div className="min-h-[60px]">
        {!isBusy && data?.filteredTotalModels !== 0 && (
          <Pagination3
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => {
              const queryString = buildURLWithParams({
                page: newPage,
                perPage,
                selectedTags,
                searchParam,
                searchParams,
              });

              router.push(`/3d-models-interior-design?${queryString}`, {
                scroll: false,
              });
            }}
          />
        )}
      </div>
    </>
  );
}

function BlogItem({ title, image, freeKey, rpcId }: any) {
  return (
    <div className="w-full px-4 md:w-1/2 lg:w-1/5">
      <div className="group rounded-lg border border-stroke p-2 dark:border-dark-3">
        <Link href={`/3d-models-interior-design/${rpcId}}`}>
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
              className="max-h-32 min-w-full object-contain duration-200 group-hover:rotate-6 group-hover:scale-125"
            />
          </div>

          <div className="h-6 flex items-center justify-center relative group">
            <h1 className="truncate text-nowrap dark:text-light-3 max-w-full px-2 text-sm">
              {title}
            </h1>
            <div className="absolute left-1/2 top-full z-20 -translate-x-1/2 whitespace-nowrap rounded border border-light bg-white px-3 py-1 text-base font-bold text-body-color opacity-0 group-hover:opacity-100 dark:border-dark-3 dark:bg-dark dark:text-dark-6">
              {title}
            </div>
          </div>
        </Link>
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
            {/* <SearchIcon /> */}
            <MagnifyingGlassIcon className="w-5 h-5 dark:text-light-2 ml-2 mx-2" />
          </button>
        </div>
      </form>
      <div className="flex items-center gap-4 relative min-w-48">
        <p className="dark:text-light-3 text-sm">Powered by </p>
        <Link href="https://archvision.com/fovea/" target="_black">
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
