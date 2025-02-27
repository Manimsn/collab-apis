import React from "react";
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  console.log("HeroSection-----------");
  return (
    <section className="relative w-full bg-white py-8 md:py-12 lg:pt-24 lg:pb-16 dark:bg-dark ">
      <div className="container md:max-w-none xl:max-w-none">
        <div className="-mx-4 flex flex-wrap justify-center items-center space-y-6 md:space-y-6 lg:space-y-12">
          {/* w-full px-4 md:px-12 xl:px-0 lg:w-1/2 xl:w-5/12 */}
          <div className="w-full lg:w-1/2 px-4 md:px-12 xl:px-12">
            <div className="items-center">
              <div className="mb-12 w-full max-w-[752px] font-medium text-left text-xl sm:text-3xl md:text-4xl lg:text-2xl xl:text-5xl">
                <h2
                  className={`font-clash w-full mb-5 !leading-[1.2] 
                  text-dark dark:text-white`}
                >
                  "Your Design Development Partner.
                  <br />
                  <span className="pt-4 inline-block ">
                    Real-Time Collaboration,&nbsp;
                    <Image
                      src="/images/headerLine.svg"
                      width={500}
                      height={40}
                      alt=""
                      className="w-40 lg:w-64 object-contain"
                    />
                  </span>
                  <span className="">Real Results."</span>
                </h2>
                <p className=" text-body-color dark:text-dark-6 text-base">
                  Our cloud-based Collaboration tool streamlines the design
                  process for interior designers. <br /> Collaborate seamlessly
                  with clients, share ideas, and make decisions in real-time.
                </p>
              </div>
              <div className="w-full mb-6 md:mx-0 lg:mx-0">
                <form className="mt-10 sm:mt-5 w-full md:w-5/6 p-1 bg-light-3 rounded-lg dark:bg-dark-4">
                  <div className="flex ">
                    <label htmlFor="email-address" className="sr-only lg:pl-2">
                      Email address
                    </label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="min-w-0  flex-auto focus:placeholder:text-md placeholder:duration-300 ease-in-out outline-none rounded-lg  px-3.5  text-dark-2  dark:placeholder:text-light-4 placeholder:text-dark-2  text-sm sm:leading-6 bg-light-3 dark:bg-dark-4"
                      placeholder="Enter your email"
                    />
                    <Link href="/signup">
                      <button
                        type="submit"
                        className="bg-dark-3 flex font-clash rounded-lg px-2.5 py-3 2xl:px-3.5 2xl:py-4 text-sm 2xl:text-md font-medium text-light-1 shadow-sm dark:hover:bg-light-4 hover:bg-dark-1 duration-300 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        Start Collaborations
                      </button>
                    </Link>
                  </div>
                </form>
                <p className="text-sm 2xl:text-base 4xl:text-lg 5xl:text-xl font-Mulish mt-2  text-dark-5 dark:text-light-4 mb-1 w-full">
                  For teams & individuals-web,mobile
                </p>
                <p className="text-sm  2xl:text-base 4xl:text-lg 5xl:text-xl font-Mulish text-dark-5 dark:text-light-4  mb-8 w-full">
                  *Try our forever free plan.No credit card required
                </p>
              </div>
            </div>
          </div>
          {/* flex justify-center items-centerw-full px-4 md:px-12 lg:pl-0 lg:pr-12 xl:px-4 md:w-full lg:w-1/2  */}
          <div className="w-full lg:w-1/2 flex justify-center items-centerw-full px-4 lg:pl-0 lg:pr-12 xl:px-12 ">
            <div className="rounded-[20px] bg-white p-0 sm:p-[20px] lg:p-0 dark:bg-dark">
              <Image
                className={`object-cover object-center leading-10 dark:hidden animate-float`}
                src="/images/header image.svg"
                width={900}
                height={900}
                alt="Picture of the author"
                priority
              />

              <Image
                className={`object-cover object-center leading-10 hidden dark:block 2xl:py-0 animate-float`}
                src="/images/header image dark.svg"
                width={900}
                height={900}
                alt="Picture of the author"
              />
            </div>
          </div>
        </div>
      </div>

      {/* <!-- graphics --> */}
      {/* <div className="absolute bottom-0 left-0 -z-10">
        <img
          src="https://cdn.tailgrids.com/2.2/assets/applications/images/contact/contact-13/shape-1.svg"
          alt="shape-1"
        />
      </div>

      <div className="absolute right-0 top-0 -z-10">
        <img
          src="https://cdn.tailgrids.com/2.2/assets/application/images/contact/contact-13/shape-2.svg"
          alt="shape-2"
        />
      </div>

      <div className="absolute right-0 top-0 -z-10 max-lg:hidden dark:opacity-40">
        <img
          src="https://cdn.tailgrids.com/2.2/assets/application/images/contact/contact-13/line-1.svg"
          alt="line-1"
        />
      </div>

      <div className="absolute right-0 top-0 -z-10 max-lg:hidden dark:opacity-40">
        <img
          src="https://cdn.tailgrids.com/2.2/assets/application/images/contact/contact-13/line-2.svg"
          alt="line-2"
        />
      </div> */}
    </section>
  );
};

export default HeroSection;
