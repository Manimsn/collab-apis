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
  const [skeletonWidths, setSkeletonWidths] = useState<string[]>([]);
  const {
    tags,
    selectedOptions,
    isLoggingIn,
    isModelsLoading,
    selectedTags = [],
  } = useSelector((state: RootState) => state.auth);

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

  const isBusy = isLoggingIn || isModelsLoading;

  useEffect(() => {
    const values = [44, 52, 64, 72, 80, 96];
    const widths = Array.from({ length: 40 }, () => {
      const randomIndex = Math.floor(Math.random() * values.length);
      return `w-[${values[randomIndex]}%]`;
    });
    setSkeletonWidths(widths);
  }, []);

  return (
    <section className="bg-gray-2 pb-10 pt-20 dark:bg-dark lg:pb-20 lg:pt-0 overflow-y-scroll">      
      <div className="container mx-auto max-w-full px-4 md:px-0 xl:max-w-[1820px]">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:w-4/12 xl:w-3/12">
            <div className="mb-10 overflow-hidden rounded-[10px] border border-stroke bg-white p-0 shadow-testimonial-6 dark:border-dark-3 dark:bg-dark-2 h-[800px] flex flex-col">
              {/* Sticky TagSearch */}
              <div className="mb-4 border-b border-stroke p-8 pt-0 pb-4 dark:border-dark-3 sticky top-0 bg-white dark:bg-dark-2 z-10">
                <TagSearch
                  handleChange={handleChange}
                  selectedOptions={selectedOptions}
                />
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto p-8 pt-0">
                {isBusy ? (
                  <div className="flex flex-wrap gap-4">
                    {skeletonWidths.length > 0 &&
                      skeletonWidths.map((width, index) => (
                        <span
                          key={index}
                          className={`${width} cursor-pointer flex min-w-[100px] mr-3 mb-3 whitespace-nowrap px-4 py-2 bg-gray-200 rounded-full capitalize text-dark-3 dark:text-light-3 text-xs animate-pulse`}
                        >
                          <div className="bg-gray-400 w-full rounded-lg h-4"></div>
                        </span>
                      ))}
                  </div>
                ) : Array.isArray(tags) && tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string, index: number) => {
                      const isDisabled = selectedTags.includes(tag);

                      return (
                        <BadgesItem
                          key={index}
                          handleTagClick={handleTagClick}
                          tag={tag}
                          isDisabled={isDisabled}
                          roundedFull
                          bgOpacity
                        >
                          {tag}
                        </BadgesItem>
                      );
                    })}
                  </div>
                ) : null}
              </div>
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
  isDisabled = false,
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
      // onClick={() => handleTagClick(tag)}
      onClick={() => {
        if (!isDisabled) handleTagClick(tag);
      }}
      className={`cursor-pointer inline-block rounded py-1 px-2.5 text-xs font-medium ${
        isDisabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:opacity-80"
      }
      ${
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
