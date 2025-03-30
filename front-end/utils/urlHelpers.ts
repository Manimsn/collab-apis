import { ReadonlyURLSearchParams } from "next/navigation";

type Params = {
  page: number;
  perPage: number;
  orderBy?: string;
  selectedTags?: string[];
  searchParam?: string;
  searchParams: ReadonlyURLSearchParams;
};

export const buildURLWithParams = ({
  page,
  perPage,
  orderBy = "CREATED_NEW_TO_OLD",
  selectedTags = [],
  searchParam = "",
  searchParams,
}: Params): string => {
  const params = new URLSearchParams(searchParams.toString());

  params.set("page", page.toString());
  params.set("per_page", perPage.toString());
  params.set("order_by", orderBy);

  if (selectedTags.length) {
    params.set("tags", selectedTags.join(","));
  } else {
    params.delete("tags");
  }

  if (searchParam) {
    params.set("search", searchParam);
  } else {
    params.delete("search");
  }

  return params.toString();
};
