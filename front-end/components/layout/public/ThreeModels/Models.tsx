import Image from "next/image";
import React from "react";

export default function Blog8() {
  return (
    <section className="bg-white py-20 lg:py-[10px] dark:bg-dark md:h-full">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <BlogItem
            image="https://i.ibb.co/7nd0pdm/image-1.jpg"
            title="How to use Facebook ads to sell online courses"
          />

          <BlogItem
            image="https://i.ibb.co/MhJsVk9/image-2.jpg"
            title="What to do if template do not work properly"
          />

          <BlogItem
            image="https://i.ibb.co/YWCPRHf/image-3.jpg"
            title="Meet AutoManage, the best AI management tools"
          />
          <BlogItem
            image="https://i.ibb.co/7nd0pdm/image-1.jpg"
            title="How to use Facebook ads to sell online courses"
          />

          <BlogItem
            image="https://i.ibb.co/MhJsVk9/image-2.jpg"
            title="What to do if template do not work properly"
          />

          <BlogItem
            image="https://i.ibb.co/YWCPRHf/image-3.jpg"
            title="Meet AutoManage, the best AI management tools"
          />
          <BlogItem
            image="https://i.ibb.co/7nd0pdm/image-1.jpg"
            title="How to use Facebook ads to sell online courses"
          />

          <BlogItem
            image="https://i.ibb.co/MhJsVk9/image-2.jpg"
            title="What to do if template do not work properly"
          />

          <BlogItem
            image="https://i.ibb.co/YWCPRHf/image-3.jpg"
            title="Meet AutoManage, the best AI management tools"
          />
          <BlogItem
            image="https://i.ibb.co/7nd0pdm/image-1.jpg"
            title="How to use Facebook ads to sell online courses"
          />

          <BlogItem
            image="https://i.ibb.co/MhJsVk9/image-2.jpg"
            title="What to do if template do not work properly"
          />

          <BlogItem
            image="https://i.ibb.co/YWCPRHf/image-3.jpg"
            title="Meet AutoManage, the best AI management tools"
          />
          <BlogItem
            image="https://i.ibb.co/7nd0pdm/image-1.jpg"
            title="How to use Facebook ads to sell online courses"
          />

          <BlogItem
            image="https://i.ibb.co/MhJsVk9/image-2.jpg"
            title="What to do if template do not work properly"
          />

          <BlogItem
            image="https://i.ibb.co/YWCPRHf/image-3.jpg"
            title="Meet AutoManage, the best AI management tools"
          />
        </div>
      </div>
    </section>
  );
}

function BlogItem({ title, image, paragraph }: any) {
  return (
    <div className="w-full px-4 md:w-1/2 lg:w-1/5">
      <div className="group mb-8 rounded-lg border border-stroke p-2 dark:border-dark-3">
        <div className="mb-2 overflow-hidden rounded">
          <Image
            src={image}
            alt={title}
            width={200}
            height={200}
            className="w-60 h-60 object-cover object-center duration-200 group-hover:rotate-6 group-hover:scale-125 "
          />
        </div>
        <div>
          <h3 className="mb-0 line-clamp-1 cursor-pointer text-base font-medium text-dark duration-200 hover:text-primary dark:text-white dark:hover:text-primary">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}
