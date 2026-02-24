export type PageMode = "results" | "loading" | "empty" | "noresults" | "error";

export type PageError = {
  title?: string;
  message: string;
};

export type PageState = {
  mode: PageMode;
  error?: PageError;
};
