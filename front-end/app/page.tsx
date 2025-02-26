import Image from "next/image";
import Link from "next/link";
import React from "react";

const Home = () => {
  return (
    <section className="relative z-10 overflow-hidden bg-white py-20 lg:py-12 dark:bg-dark">
      <div className="container xl:max-w-none xl:mx-12">
        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-4 lg:w-1/2 xl:w-5/12">
            <div className="items-center">
              <div className="mb-12 w-full max-w-[752px] font-medium text-center text-2xl sm:text-5xl md:text-4xl lg:text-4xl">
                <h2
                  className={`font-clash w-full mb-5  !leading-[1.2] 
                  text-dark dark:text-white`}
                >
                  "Your Design Development Partner.
                  <span className="md:-ml-48 lg:-ml-0 inline-block pt-2 md:pt-8">
                    Real-Time Collaboration,
                    <Image
                      src="/images/headerLine.svg"
                      width={500}
                      height={40}
                      alt=""
                      className="-mt-2 pt-1 xxs:w-80 md:w-[300px] lg:w-[300px] 2xl:w-[410px] object-contain"
                    />
                  </span>
                  <span className=" md:absolute lg:relative md:pl-2 md:pt-8 ">
                    {/* <span className=" md:absolute md:pl-2md:pt-8 "> */}
                    Real Results."
                  </span>
                </h2>
                <p className=" text-body-color dark:text-dark-6 text-base">
                  Our cloud-based Collaboration tool streamlines the design
                  process for interior designers. <br /> Collaborate seamlessly
                  with clients, share ideas, and make decisions in real-time.
                </p>
              </div>
              <div className="w-full mb-6 md:mx-12 lg:mx-0">
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
                      // onChange={(event) => {
                      //   setInputValue(event.target.value);
                      // }}
                    />
                    <Link href="/signup">
                      <button
                        type="submit"
                        className="bg-dark-3 flex font-clash rounded-lg px-2.5 py-3 2xl:px-3.5 2xl:py-4 text-sm 2xl:text-md font-medium text-light-1 shadow-sm dark:hover:bg-light-4 hover:bg-dark-1 duration-300 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        style={{ whiteSpace: "nowrap" }}
                        // onClick={(event) => {
                        //   sessionStorage.setItem("email", inputValue);
                        // }}
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

          <div className="w-full px-4 lg:px-0 xl:px-4 lg:w-1/2 xl:w-7/12 ">
            <div className="rounded-[20px] bg-white p-0 sm:p-[40px] lg:p-0 xl:ml-16 xl:p-[52px] dark:bg-dark">
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
                width={1000}
                height={1000}
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

export default Home;
