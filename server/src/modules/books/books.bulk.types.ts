export type BookStatus = "planned" | "reading" | "finished";

export type BulkMutationOperation = "update" | "delete";

export type BulkUpdateBooksRequest = {
  ids: string[];
  patch: {
    status?: BookStatus;
  };
};

export type BulkDeleteBooksRequest = {
  ids: string[];
};

export type BulkMutationResult = {
  ok: true;
  operationId: string;
  operation: BulkMutationOperation;
  affectedCount: number;
  affectedIds: string[];
};
