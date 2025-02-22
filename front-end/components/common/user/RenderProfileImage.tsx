import Image from "next/image";

/**
 * Helper function to render the user profile image or initials.
 */
const RenderProfileImage = (userDetails: any) => {
  const imageUrl = `https://d1re9w76jc5b65.cloudfront.net/7cd94bb4-f126-4250-b562-9c6636e5214c`;

  return userDetails?.fileS3Id ? (
    <Image
      src={imageUrl}
      className="w-[43px] h-[43px] object-cover object-center rounded-full"
      width={200}
      height={200}
      alt="Profile"
    />
  ) : (
    <div className="w-[40px] h-[40px] bg-gray-400 capitalize text-sm text-light font-semibold flex items-center justify-center rounded-full">
      {`${
        userDetails?.firstName?.charAt(0) ||
        userDetails?.emailAddress?.charAt(0)
      } 
          ${userDetails?.lastName ? userDetails?.lastName.charAt(0) : ""}`}
    </div>
  );
};

export default RenderProfileImage;
