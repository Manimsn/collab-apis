import React from "react";

const OurMission = () => {
  return (
    <section className="relative z-10 bg-white py-0 dark:bg-dark lg:py-0">
      <div className="container mx-auto md:max-w-none xl:max-w-none md:mx-0 px-4 md:px-8 lg:px-12">
        <div className="overflow-hidden rounded-xl bg-yellow  dark:bg-dark-2 ">
          <div className="-mx-4 flex flex-wrap ">
            <div className="w-full px-4 lg:w-full ">
              <div
                className="relative z-10 px-8 pt-4 pb-8 py-10 sm:p-14 sm:pt-4 sm:pb-8 before:content-[''] before:absolute before:inset-0 before:bg-idcolab-land-image  before:bg-cover
           before:opacity-10 custom-bg-position before:rounded-3xl"
              >
                <div className="flex justify-center item-center">
                  <svg
                    className="w-20 h-20 text-dark-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                    id="quotations"
                  >
                    <path
                      stroke="currentColor"
                      d="M7.998 13.118c0 1.69 1.32 3.06 2.946 3.06.522 0 1.004-.152 1.43-.4-.146 1.636-.97 4.022-3.99 6.454-.422.342-.5.974-.172 1.412.192.256.478.39.766.39a.937.937 0 0 0 .594-.212c3.706-2.99 4.632-6.062 4.756-8.114.212-2.624-.584-4.004-1.312-4.724-.066-.07-.128-.146-.202-.208a3.07 3.07 0 0 0-.466-.33c-.006-.004-.01-.01-.016-.012-.01-.006-.02-.008-.03-.012-.198-.11-.34-.162-.34-.162l.01.024a2.686 2.686 0 0 0-1.028-.226c-1.628 0-2.946 1.37-2.946 3.06zm9.696 0c0 1.69 1.318 3.06 2.946 3.06.522 0 1.004-.152 1.43-.4-.146 1.636-.97 4.022-3.99 6.454-.424.342-.5.974-.172 1.412.192.256.478.39.766.39a.937.937 0 0 0 .594-.212c3.706-2.99 4.632-6.062 4.756-8.114.212-2.624-.586-4.004-1.312-4.724-.068-.07-.13-.146-.204-.208a3.07 3.07 0 0 0-.466-.33l-.016-.012c-.01-.006-.02-.008-.03-.012-.198-.108-.34-.162-.34-.162l.01.024a2.695 2.695 0 0 0-1.028-.226c-1.626 0-2.944 1.37-2.944 3.06z"
                    ></path>
                  </svg>
                </div>
                <p className="font-clash text-xl xl:text-3xl text-justify">
                  At IDCOLAB, we prioritize one core value above all else:
                  fostering strong connections between interior designers and
                  their clients. Our mission is to provide the most effective
                  and efficient support to fuel their creative journeys. We
                  recognize the essential role collaboration plays in successful
                  interior design projects. <br /> <br />
                  That's why we've developed IDCOLAB to enable seamless
                  communication, engaging experience, and nurture the
                  client-designer relationship. Join the IDCOLAB community and
                  experience the power of seamless collaboration, immersive
                  experience, and unwavering support on your design adventure.
                  Let's create together at IDCOLAB. Connect with us today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurMission;
