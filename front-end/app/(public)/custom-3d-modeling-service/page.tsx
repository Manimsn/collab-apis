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
