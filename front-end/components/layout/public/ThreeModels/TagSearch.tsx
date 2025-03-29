"use client";
import Select, {
  components,
  ControlProps,
  MultiValueProps,
  ClearIndicatorProps,
} from "react-select";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export type OptionType = {
  value: string;
  label: string;
};

const MultiSelectTags = ({ handleChange, selectedOptions }: any) => {
  const [mounted, setMounted] = useState(false);
  const { tags } = useSelector((state: RootState) => state.auth);

  // Prepare options for the Select component
  const options: OptionType[] = Array.isArray(tags)
    ? tags.map((tag: any) => ({ value: tag, label: tag }))
    : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Select
      isMulti
      value={selectedOptions}
      onChange={handleChange}
      components={{
        DropdownIndicator: () => (
          <MagnifyingGlassIcon className="w-5 h-5 dark:text-light-2 ml-2 mx-2" />
        ),
        Control,
        IndicatorSeparator: () => null,
        MultiValue,
        ClearIndicator: CustomClearIndicator,
      }}
      options={options}
      placeholder="Search..."
      className="w-[93%] mx-auto select-tags !mt-5"
    />
  );
};

export default MultiSelectTags;

const Control = ({ children, ...props }: ControlProps<any, true>) => (
  <components.Control
    {...props}
    className="!border-none focus:border-none focus:ring-0 focus:outline-none"
  >
    <div className="px-2 mr flex items-center text-sm font-medium text-center dark:text-light-2">
      Tags
    </div>
    {children}
  </components.Control>
);

const MultiValue = (props: MultiValueProps<any, true>) => (
  <components.MultiValue
    {...props}
    className="bg-light-2 text-dark-4 dark:bg-dark-3 dark:text-light-1 rounded-full flex text-sm items-center !py-[1px] justify-center"
  >
    {props.children}
  </components.MultiValue>
);

const CustomClearIndicator = (props: ClearIndicatorProps<any, true>) => {
  return (
    <components.ClearIndicator {...props}>
      <XMarkIcon className="w-4 h-4 dark:text-light-1 text-dark-2" />
    </components.ClearIndicator>
  );
};
