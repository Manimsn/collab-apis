"use client";

import Image from "next/image";
import React, { useState } from "react";

export default function AllInOneSolution() {
  return (
    <>
      <section className="relative z-10 overflow-hidden bg-white dark:bg-black">
        <div className="container md:max-w-none md:px-8">
          <div className="relative">
            <div className="mx-auto w-full max-w-[725px] sm:max-w-[1300px] pt-10 text-center">
              <div className="relative inline-flex">
                <h1 className="font-clash mb-4 text-3xl md:text-4xl lg:text-5xl font-medium leading-tight text-dark  dark:text-white">
                  Everything you need in One Place.
                  {/* <span className="bg-gradient-to-l from-[#f566d5] to-primary bg-clip-text pl-2 text-transparent">
                    AIBot
                  </span> */}
                </h1>
              </div>

              {/* <p className="mb-9 text-base text-body-color sm:text-lg dark:text-dark-6">
                AI content generation website is a platform that utilizes
                artificial intelligegnce technologies, such as natural
              </p> */}

              {/* <a
                href="#"
                className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90"
              >
                Start A Free Trial
              </a> */}

              {/* <p className="mb-10 text-sm text-dark dark:text-white">
                No credit card required. Free 14-days trial
              </p> */}

              <div className="">
                <Image
                  src="/images/EverythingInOnePlace/EverythingInOnePlace.svg"
                  alt="hero image"
                  className="hidden sm:block "
                  width={1300}
                  height={700}
                />
              </div>
              <div className="">
                <Image
                  src="/images/EverythingInOnePlace/idcolabBubbleDiagram.png"
                  alt="hero image"
                  className="sm:hidden w-full"
                  width={900}
                  height={700}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
