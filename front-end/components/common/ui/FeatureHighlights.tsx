import React from "react";
import Image from "next/image";

const FeatureHighlights = () => {
  const FeatureHigh = [
    {
      icon: "/images/WhyIdcolab/effortlessDesignCollaboration.png",
      title: "Effortless Design Collaboration",
      details:
        "Streamline communication, share ideas, and bring visions to life seamlessly. Enhance productivity, foster creativity, and achieve remarkable results together.",
    },
    {
      icon: "/images/WhyIdcolab/streamlineProjectManagement.png",
      title: "Streamline Project Management",
      details:
        "Keep all project information, documents, and project decisions in one place, reducing the time and effort spent managing multiple tools and platforms.",
    },
    {
      icon: "/images/WhyIdcolab/interactiveFeedback.png",
      title: "Interactive Feedback",
      details:
        "Empower your team to provide valuable input, make data-driven decisions, and achieve exceptional outcomes with our intuitive platform.",
    },
    {
      icon: "/images/WhyIdcolab/rapidDecisionMaking.png",
      title: "Rapid Decision Making",
      details:
        "Conveniently mark and save decisions made during discussions, aggregating them in one place for synchronized reference, and achieve milestones faster.",
    },
    {
      icon: "/images/WhyIdcolab/cloudBasedPlatform.png",
      title: "Cloud-based Platform",
      details:
        "Leverages cloud computing technology to provide users with access to applications, data, and resources from anywhere with an internet connection.",
    },
    {
      icon: "/images/WhyIdcolab/idcolabMobileApp.png",
      title: "IDcolab Mobile App",
      details:
        "Our app is thoughtfully designed and tailored for uninterrupted client engagement, ensuring your clients stay connected with just a click, anytime, anywhere.",
    },
  ];

  return (
    <section className="pb-12 sm:pt-20 dark:bg-dark lg:pb-[90px] md:pt-0">
      <div className="container mx-auto">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto mb-[60px] max-w-[510px] text-center lg:mb-[70px]">
              {/* <span className="mb-2 block text-lg font-semibold text-primary">
                Why Choose Us
              </span> */}
              <h2 className="font-clash mb-3 text-3xl font-medium leading-[1.2] text-dark dark:text-white sm:text-4xl md:text-[40px]">
                Why Choose IDCOLAB?
              </h2>
              {/* <p className="text-base text-body-color dark:text-dark-6">
                There are many variations of passages of Lorem Ipsum available
                but the majority have suffered alteration in some form.
              </p> */}
            </div>
          </div>
        </div>

        <div className="-mx-4 flex flex-wrap justify-center">
          {FeatureHigh.map((card, index) => {
            return (
              <ServiceCard
                key={index}
                title={card.title}
                details={card.details}
                icon={card.icon}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;

const ServiceCard = ({ icon, title, details }: any) => {
  return (
    <div className="w-full px-4 md:w-1/2 lg:w-1/2 xl:w-6/12">
      <div className="mb-9 md:h-[280px] rounded-[20px] bg-white p-10 shadow-2 hover:shadow-lg dark:bg-dark-3 md:px-7 xl:px-10">
        <div className="mb-[14px] flex items-center gap-x-4">
          <div className="flex h-[70px] w-[70px] items-center justify-center rounded-2xl bg-white">
            {/* {icon} */}
            <Image src={icon} alt="Icon" width={60} height={60} />
          </div>
          {/* xl:28 */}
          <h4 className="font-clash text-2xl xl:text-3xl font-medium text-dark dark:text-white">
            {title}
          </h4>
        </div>
        {/* <h4 className="mb-[14px] text-2xl font-semibold text-dark dark:text-white">
          {title}
        </h4> */}
        {/* xl:20 */}
        <p className="text-body-color dark:text-dark-6 xl:text-xl">{details}</p>
      </div>
    </div>
  );
};
