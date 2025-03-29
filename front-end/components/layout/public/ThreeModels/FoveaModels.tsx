"use client";

import React, { useEffect, useState } from "react";
import Models from "./Models";
import TagSearch from "./TagSearch";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  setSelectedOptions,
  setSelectedTags,
} from "@/redux/slices/foveaAuthSlice";

export type OptionType = {
  value: string;
  label: string;
};

const FoveaModels = () => {
  const dispatch = useDispatch();
  const { tags, selectedOptions } = useSelector(
    (state: RootState) => state.auth
  );

  // Optional: defer render until client mounts (only for debugging)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleChange = (selected: OptionType[]) => {
    const selectedValuesArray = selected.map((option) => option.value);

    dispatch(setSelectedOptions(selected));
    dispatch(setSelectedTags(selectedValuesArray));
  };

  const handleTagClick = (clickedTag: string) => {
    handleChange([
      ...(selectedOptions || []),
      { value: clickedTag, label: clickedTag },
    ]);
  };

  return (
    <section className="bg-gray-2 pb-10 pt-20 dark:bg-dark lg:pb-20 lg:pt-0 overflow-y-scroll">
      <div className="container md:mx-12 md:px-0 md:max-w-[1820px]">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:w-4/12 xl:w-3/12">
            <div className="mb-10 overflow-hidden rounded-[10px] border border-stroke bg-white p-0 shadow-testimonial-6 dark:border-dark-3 dark:bg-dark-2 dark:shadow-box-dark md:h-[1060px] flex flex-col">
              {/* Sticky TagSearch */}
              <div className="mb-4 border-b border-stroke p-8 pt-0 pb-4 dark:border-dark-3 sticky top-0 bg-white dark:bg-dark-2 z-10">
                <TagSearch
                  handleChange={handleChange}
                  selectedOptions={selectedOptions}
                />
              </div>

              {/* Scrollable tag list */}
              {Array.isArray(tags) && tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 overflow-y-auto p-8 pt-0 h-full">
                  {tags.map((tag: string, index: number) => (
                    <BadgesItem
                      key={index}
                      handleTagClick={handleTagClick}
                      tag={tag}
                      roundedFull
                      bgOpacity
                    >
                      {tag}
                    </BadgesItem>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="w-full px-4 lg:w-8/12 xl:w-9/12">
            <div className="mb-10 overflow-hidden rounded-[10px] border border-stroke bg-white px-5 py-8 shadow-testimonial-6 dark:border-dark-3 dark:bg-dark-2 dark:shadow-box-dark xl:p-9">
              <Models />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoveaModels;

const BadgesItem = ({
  children,
  handleTagClick,
  tag,
  outline,
  roundedFull,
  roundedLg,
  roundedNone,
  roundedSm,
  roundedMd,
  bgOpacity,
}: any) => {
  return (
    <span
      onClick={() => handleTagClick(tag)}
      className={`cursor-pointer inline-block rounded py-1 px-2.5 text-xs font-medium ${
        outline
          ? `border ${
              (roundedFull && `rounded-full`) ||
              (roundedLg && `rounded-lg`) ||
              (roundedNone && `rounded-none`) ||
              (roundedSm && `rounded-sm`) ||
              (roundedMd && `rounded-md`) ||
              (bgOpacity && `bg-gray-3/50`)
            } border-light text-dark dark:text-light`
          : `bg-gray-3 ${
              (roundedFull && `rounded-full`) ||
              (roundedLg && `rounded-lg`) ||
              (roundedNone && `rounded-none`) ||
              (roundedSm && `rounded-sm`) ||
              (roundedMd && `rounded-md`) ||
              (bgOpacity && `bg-gray-3/50`)
            } text-dark`
      } ${bgOpacity && "bg-gray-3/50"}
`}
    >
      {children}
    </span>
  );
};
