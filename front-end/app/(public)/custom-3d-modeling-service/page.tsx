// import React from "react";

// const page = () => {
//   console.log("3D Models for Interior Design Visualizatio");
//   return <div>3D Models for Interior Design Visualization</div>;
// };

// export default page;

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

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLazyGetAccessTokenQuery } from "@/redux/api/authApi";
import { useGetModelsQuery } from "@/redux/api/modelsApi";
import { RootState } from "@/redux/store";
import { setTokens } from "@/redux/slices/authSlice";

const Custom3DModelingService = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const expiresAt = useSelector((state: RootState) => state.auth.expiresAt);
  const [fetchAccessToken] = useLazyGetAccessTokenQuery();

  useEffect(() => {
    if (!accessToken || Date.now() >= expiresAt!) {
      fetchAccessToken()
        .unwrap()
        .then((res) => dispatch(setTokens(res)))
        .catch((err) => console.error("Token fetch failed:", err));
    }
  }, [accessToken]);

  const { data: models, isLoading } = useGetModelsQuery(
    { userId: "123" },
    { skip: !accessToken }
  );

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <pre>{JSON.stringify(models, null, 2)}</pre>
      )}
    </div>
  );
};

export default Custom3DModelingService;
