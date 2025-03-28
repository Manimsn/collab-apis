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
import { setTags, setToken } from "@/redux/slices/foveaAuthSlice";

export default function Blog8() {
  const dispatch = useDispatch();
  const { accessToken, expiresIn, tokenCreatedAt, tags, selectedTags } =
    useSelector((state: RootState) => state.auth);
  const [page, setPage] = useState(1);
  const [canFetch, setCanFetch] = useState(false);
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const perPage = 15;

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
      }
    };

    fetchToken();
  }, [isTokenExpired, dispatch, login]);

  const tagParam =
    selectedTags && selectedTags.length > 0
      ? { tags: selectedTags.join(",") }
      : {};

  const { data, error, isLoading } = useGetModelsQuery(
    { page, per_page: perPage, ...tagParam },
    { skip: !canFetch }
  );

  // console.log("data----------", data);
  // console.log("tags----------tags", tags);
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
      <section className="bg-white py-20 lg:py-[10px] dark:bg-dark md:h-full">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            {isLoading && <p>Loading...</p>}
            {error && <p>Something went wrong.</p>}

            {Array.isArray(data?.models) &&
              data?.models?.map((model: any, index: number) => (
                <BlogItem
                  key={model.id || index} // use model.id if unique, fallback to index
                  image={`https://cdn.archvision.services/public/service.thumbnail-cache/${model?.rpc_guid}.rpc.png`}
                  title={model.title}
                />
              ))}
          </div>
        </div>
      </section>

      <Pagination3
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </>
  );
}

function BlogItem({ title, image }: any) {
  return (
    <div className="w-full px-4 md:w-1/2 lg:w-1/5">
      <div className="group mb-8 rounded-lg border border-stroke p-2 dark:border-dark-3">
        <div className="mb-2 overflow-hidden rounded">
          <Image
            src={image}
            alt={title}
            width={200}
            height={200}
            className="w-60 h-40 object-cover object-center duration-200 group-hover:rotate-6 group-hover:scale-125 "
          />
        </div>
        <div>
          <h3 className="mb-0 line-clamp-1 cursor-pointer text-base font-medium text-dark duration-200 hover:text-primary dark:text-white dark:hover:text-primary">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}
