import React from "react";

export default function WelcomeSection() {
  return (
    <section className="bg-gray-2 pb-10 lg:pb-20 pt-8 lg:pt-0 px-4 lg:px-12 dark:bg-dark ">
      <div className="container mx-auto md:max-w-none px-0 md:px-4 lg:px-0">
        <div className="grid gap-8 lg:grid-cols-1 lg:px-0 ">
          <div
            className="lg:flex mx-auto w-full overflow-hidden rounded-xl bg-purple shadow-md  relative before:content-[''] before:absolute before:inset-0 before:bg-idcolab-land-image  before:bg-cover
           before:opacity-10 custom-bg-position before:rounded-3xl"
          >
            <div className="lg:w-1/2 relative bg-purple p-7 px-4 pb-0 sm:p-11 xl:pt-10 sm:pb-0 xl:pr-6  dark:from-dark-2 ">
              <div className="mb-10 overflow-hidden rounded-2xl border border-dark-6">
                <iframe
                  src="https://iframe.mediadelivery.net/embed/211709/2bfe16d2-eb77-4121-bb6d-c5f8e411a2f8?autoplay=false&loop=false&muted=false&preload=true&responsive=true"
                  loading="lazy"
                  className="h-[200px] lg:h-[300px] xl:h-[460px] w-full rounded-lg"
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                  allowFullScreen={true}
                />
              </div>
              <div className="absolute bottom-0 left-0 h-1/2 w-full  dark:to-dark-2"></div>
            </div>
            <div className="flex flex-col justify-center items-center text-justify font-clash lg:w-1/2 bg-purple p-7 px-4 pt-0 lg:p-7 xl:pt-0 sm:p-11 xl:pr-16 sm:pt-0 ">
              <p className="mb-7 text-base xl:text-3xl text-white">
                Welcome to IDCOLAB, the ultimate private hub for interior
                designers to seamlessly connect with their clients and bring
                effective collaboration to life. Our platform boasts a
                user-friendly interface and cutting-edge tools, making interior
                design project collaboration an absolute breeze. Design
                development is mastered here, and collaboration is done right.
              </p>

              <button className="flex w-1/2 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-base xl:text-2xl font-medium text-black hover:bg-yellow sm:text-lg">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
