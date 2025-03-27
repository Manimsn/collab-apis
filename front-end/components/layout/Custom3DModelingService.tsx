// app/custom-3d-modeling-service/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetModelsQuery,
  useLoginMutation,
} from "@/redux/services/modelsApi";
import { RootState } from "@/redux/store";
import { setToken } from "@/redux/slices/foveaAuthSlice";
import Checkout2 from "./public/ThreeModels/ModelList";

export default function Custom3DModelingService() {
  const dispatch = useDispatch();
  const { accessToken, expiresIn, tokenCreatedAt } = useSelector(
    (state: RootState) => state.auth
  );

  console.log("accessToken", accessToken);

  const [page, setPage] = useState(1);
  const [canFetch, setCanFetch] = useState(false);
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

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
        console.log("Custom3DModelingService-----------------", data);
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

  const { data, error, isLoading } = useGetModelsQuery(
    { page, per_page: 10 },
    { skip: !canFetch }
  );

  return (
    <>
      <section className="relative z-10  py-0 dark:bg-dark lg:py-20">
        <div className="container mx-auto md:max-w-none xl:max-w-none md:mx-0 px-4 md:px-8 lg:px-12">
          <h1
            className={`font-inter xl:text-sm 2xl:text-6xl text-md dark:text-light-2 font-semibold self-center text-center py-6`}
          >
            3D Models for Interior Design Visualization
          </h1>
          <div className="overflow-hidden rounded-3xl bg-yellow  dark:bg-dark-2 relative before:content-[''] before:absolute before:inset-0 before:bg-idcolab-image before:bg-cover before:bg-center before:opacity-10 custom-bg-position ">
            <div className="-mx-4 flex flex-wrap ">
              <div className="w-full px-4 lg:w-full ">
                <div className="font-clash relative z-10 px-8 pt-4 pb-8 py-10 sm:p-14 lg:px-8 sm:pt-4 sm:pb-8 lg:pt-8">
                  <p className="font-clash text-xl xl:text-2xl text-justify">
                    Welcome to IDcolab's premium 3D model library, where our
                    models revolutionize interior design renderings! Explore our
                    curated selection of 3D models featuring various branded
                    chairs, sofas, tables, and lighting, meticulously crafted to
                    seamlessly integrate with your software, ensuring
                    high-quality rendering production. Elevate your projects
                    with our top-tier 3D models that meet the highest industry
                    standards. Our entire library is exclusively available for
                    our customers through our Idcolab channel on Avail. Have
                    questions or need a custom 3D model? Reach out to us
                    directly for tailored solutions and unlock a superior design
                    experience.
                  </p>
                </div>
                <div className="flex justify-center pb-8 font-clash ">
                  <button className="text-white bg-dark-1 z-10 hover:bg-dark-2 border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base  hover:border-[#1B44C8] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5 active:bg-[#1B44C8] active:border-[#1B44C8]">
                    SUBSCRIBE TO IDCOLAB LIBRARY
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Checkout2 />
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">3D Models</h1>
        {(isLoading || isLoggingIn) && (
          <div className="animate-pulse">Loading models...</div>
        )}
        {error && <div className="text-red-500">Error fetching models</div>}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data?.models?.map((model: any) => (
            <div key={model.rpc_guid} className="border rounded p-4 shadow-sm">
              <h2 className="font-bold text-lg">{model.title}</h2>
              <p>{model.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setPage((prev) => prev + 1)}
          >
            Load More
          </button>
        </div>
      </div>
    </>
  );
}

// // Suggested URL Naming Conventions:
// // Short & Descriptive
// //    /3d-models-interior-design
// // SEO-Optimized
// //    /interior-design-3d-models
// // User-Friendly & Readable
// //    /visualize-interior-3d
// // Category-Based Approach
// //    /interior/3d-models
// // Action-Oriented (If Users Upload or View Models)
// //    /explore-3d-designs /upload-3d-models
// // Industry-Specific
// //    /3d-architecture-models /3d-interior-renders
// // Branding + Purpose (If branding is involved)
// //    /yourbrand-3d-visuals
