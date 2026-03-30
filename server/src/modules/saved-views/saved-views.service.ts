import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/client";
import { AppError } from "../../utils/errors";
import type {
  SavedLibraryViewFilters,
  SavedLibraryViewSort,
} from "../../../../shared/types/v2.4";
import type {
  CreateSavedViewInput,
  UpdateSavedViewInput,
} from "./saved-views.schema";

function normalizeStringArray(values?: string[]): string[] | undefined {
  if (!values) return undefined;

  const normalized = [
    ...new Set(values.map((value) => value.trim()).filter(Boolean)),
  ];

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeStatusArray(
  values?: Array<"planned" | "reading" | "finished">,
): Array<"planned" | "reading" | "finished"> | undefined {
  if (!values) return undefined;

  const normalized = [...new Set(values)];

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeFilters(
  filters: SavedLibraryViewFilters,
): SavedLibraryViewFilters {
  const normalized: SavedLibraryViewFilters = {};

  const status = normalizeStatusArray(filters.status);
  const authors = normalizeStringArray(filters.authors);
  const genres = normalizeStringArray(filters.genres);
  const series = normalizeStringArray(filters.series);
  const search = filters.search?.trim();
  const tbrMonth = filters.tbrMonth?.trim();

  if (status) normalized.status = status;
  if (authors) normalized.authors = authors;
  if (genres) normalized.genres = genres;
  if (series) normalized.series = series;
  if (filters.tbrOnly !== undefined) normalized.tbrOnly = filters.tbrOnly;
  if (tbrMonth) normalized.tbrMonth = tbrMonth;
  if (search) normalized.search = search;

  return normalized;
}

function normalizeSort(sort: SavedLibraryViewSort): SavedLibraryViewSort {
  return {
    key: sort.key,
    direction: sort.direction,
  };
}

function toCreateData(
  userId: string,
  input: CreateSavedViewInput,
): Prisma.SavedViewCreateInput {
  const filters = normalizeFilters(input.filters);
  const sort = normalizeSort(input.sort);

  return {
    user: {
      connect: { id: userId },
    },
    name: input.name.trim(),
    filters: filters as Prisma.InputJsonValue,
    sortKey: sort.key,
    sortDir: sort.direction,
    isPinned: input.isPinned ?? false,
    isDefault: input.isDefault ?? false,
  };
}

function toUpdateData(
  input: UpdateSavedViewInput,
): Prisma.SavedViewUpdateInput {
  const data: Prisma.SavedViewUpdateInput = {};

  if (input.name !== undefined) {
    data.name = input.name.trim();
  }

  if (input.filters !== undefined) {
    data.filters = normalizeFilters(input.filters) as Prisma.InputJsonValue;
  }

  if (input.sort !== undefined) {
    const sort = normalizeSort(input.sort);
    data.sortKey = sort.key;
    data.sortDir = sort.direction;
  }

  if (input.isPinned !== undefined) {
    data.isPinned = input.isPinned;
  }

  if (input.isDefault !== undefined) {
    data.isDefault = input.isDefault;
  }

  return data;
}

async function getOwnedSavedView(userId: string, id: string) {
  return prisma.savedView.findFirst({
    where: {
      id,
      userId,
    },
  });
}

async function clearExistingDefault(userId: string, excludeId?: string) {
  await prisma.savedView.updateMany({
    where: {
      userId,
      isDefault: true,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    data: {
      isDefault: false,
    },
  });
}

export async function listSavedViews(userId: string) {
  return prisma.savedView.findMany({
    where: { userId },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }, { name: "asc" }],
  });
}

export async function createSavedView(
  userId: string,
  input: CreateSavedViewInput,
) {
  const data = toCreateData(userId, input);

  return prisma.$transaction(async (tx) => {
    if (input.isDefault === true) {
      await tx.savedView.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return tx.savedView.create({
      data,
    });
  });
}

export async function updateSavedView(
  userId: string,
  id: string,
  input: UpdateSavedViewInput,
) {
  const existing = await getOwnedSavedView(userId, id);

  if (!existing) {
    throw new AppError("Saved view not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  const data = toUpdateData(input);

  return prisma.$transaction(async (tx) => {
    if (input.isDefault === true) {
      await tx.savedView.updateMany({
        where: {
          userId,
          isDefault: true,
          NOT: { id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    return tx.savedView.update({
      where: { id: existing.id },
      data,
    });
  });
}

export async function deleteSavedView(userId: string, id: string) {
  const existing = await getOwnedSavedView(userId, id);

  if (!existing) {
    throw new AppError("Saved view not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await prisma.savedView.delete({
    where: { id: existing.id },
  });
}
