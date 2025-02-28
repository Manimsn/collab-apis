"use client";
import Image from "next/image";
import React, { useState } from "react";
// import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/react/24/outline"
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

const HowItWorks = () => {
  const HowItWork = [
    {
      question: "Sign up and set up your account",
      answer:
        "The first step is to sign up and set up your account. It's quick and easy, and you'll be up and running in no time. Once you're logged in, you'll be taken to your dashboard where you can start creating your projects.",
    },
    {
      question: "Create project Dashboards.",
      answer:
        "Creating project dashboards allows you to keep everything in one place, making it easy to stay organized. You can store and categorize your drawings, renderings, panoramas, specifications, and 3D models all in one place. Plus, you can create beautiful mood boards to showcase your ideas and inspiration.",
    },
    {
      question: "Share and discuss with team and clients.",
      answer:
        "IDColab makes it easy to collaborate, share and discuss your work with your team and clients. You can leave real-time comments on ideas, posts, and projects, and get notified when your client or team member likes a post or leaves a comment. No more losing important messages in endless email threads!",
    },
    {
      question: "Keep things organized.",
      answer:
        "Managing approvals, feedback, and notes can be a headache, but IDColab makes it a breeze. You can view team activity and get updates on the project feed, so you know exactly what's happening with your project at all times.",
    },
  ];

  return (
    <section className="relative z-10 bg-gray-2 py-10 dark:bg-dark lg:py-12">
      <div className="container mx-auto md:max-w-none md:px-8 lg:px-12">
        <div className="bg-light-1 dark:bg-dark-2">
          <div className="flex flex-wrap items-center">
            <div className="w-full lg:w-1/2">
              <div className="relative w-full overflow-hidden flex">
                <div className="flex items-center justify-center">
                  <Image
                    src="/images/choose/DesignersPointingAtPlan.svg"
                    alt="image"
                    // className="h-full w-full object-cover object-center"
                    width={1100}
                    height={550}
                  />
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="w-full sm:p-[70px] px-0 md:px-0 lg:px-0 lg:pl-8 xl:px-6 py-14 lg:py-8 pt-10 sm:pt-0 md:pt-10">
                {/* <h2 className="mb-3 text-3xl font-bold text-dark dark:text-white">
                  Welcome to TailGrids
                </h2>
                <p className="mb-14 text-base text-secondary-color dark:text-dark-7 xl:mb-20">
                  <span className="sm:block">
                    We make it easy for everyone to
                  </span>
                  <span>access their account</span>
                </p> */}
                {/* -------------------- */}
                <section className="bg-white pb-10 xl:pb-0 pt-10 dark:bg-dark lg:pb-20 lg:pt-6">
                  <div className="container mx-auto">
                    <div className="-mx-4 flex flex-wrap">
                      <div className="w-full px-4">
                        <div className="mx-auto mb-2 lg:mb-10 max-w-[510px] text-center ">
                          {/* <span className="mb-2 block text-lg font-semibold text-primary">
                            FAQ
                          </span> */}
                          <h2 className="font-clash text-4xl lg:text-5xl font-medium text-dark dark:text-white sm:text-[40px]/[48px]">
                            How does it work?
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="-mx-4 flex flex-wrap justify-center">
                      <div className="w-full px-4 xl:w-10/12">
                        {HowItWork.map((faq, index) => {
                          return (
                            <AccordionItem
                              key={index}
                              header={faq?.question}
                              text={faq?.answer}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>
                {/* -------------------- */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

const AccordionItem = ({ header, text }: any) => {
  const [active, setActive] = useState(false);

  const handleToggle = () => {
    setActive(!active);
  };

  return (
    <div className="mb-10 rounded-lg bg-white px-7 py-6 shadow-[0px_4px_18px_0px_rgba(0,0,0,0.07)] dark:bg-dark-2 md:px-10 md:py-8">
      <button
        className={`faq-btn flex w-full items-center justify-between text-left`}
        onClick={() => handleToggle()}
      >
        <h4 className="mr-2  text-dark dark:text-white sm:text-lg text-xl lg:text-2xl">
          {header}
        </h4>
        <span className="icon inline-flex h-8 w-full max-w-[32px] items-center justify-center rounded-full  border-black text-5xl font-semibold dark:text-white">
          {active ? (
            <MinusIcon className="h-8 w-12 " />
          ) : (
            <PlusIcon className="h-8 w-12 " />
          )}
        </span>
      </button>

      <div className={`${active ? "block" : "hidden"}`}>
        <p className="text-relaxed pt-6 text-xl text-body-color dark:text-dark-6">
          {text}
        </p>
      </div>
    </div>
  );
};
