import { prisma } from "@/lib/prisma";

/**
 * Config for a simple master table shaped like { id, name, status }.
 * Used to drive both the API routes and the generic admin UI page.
 */
export type SimpleMasterKey =
  | "faculties"
  | "streams"
  | "religions"
  | "caste-categories"
  | "document-types"
  | "course-types";

type SimpleMasterDelegate = {
  findMany: (args?: unknown) => Promise<Array<{ id: bigint; name: string; status: string }>>;
  create: (args: { data: { name: string; status?: string } }) => Promise<unknown>;
  update: (args: { where: { id: bigint }; data: { name?: string; status?: string } }) => Promise<unknown>;
  delete: (args: { where: { id: bigint } }) => Promise<unknown>;
};

export const SIMPLE_MASTERS: Record<
  SimpleMasterKey,
  { label: string; delegate: () => SimpleMasterDelegate }
> = {
  faculties: {
    label: "Faculties",
    delegate: () => prisma.faculty as unknown as SimpleMasterDelegate,
  },
  streams: {
    label: "Streams",
    delegate: () => prisma.stream as unknown as SimpleMasterDelegate,
  },
  religions: {
    label: "Religions",
    delegate: () => prisma.religion as unknown as SimpleMasterDelegate,
  },
  "caste-categories": {
    label: "Caste Categories",
    delegate: () => prisma.casteCategory as unknown as SimpleMasterDelegate,
  },
  "document-types": {
    label: "Document Types",
    delegate: () => prisma.documentType as unknown as SimpleMasterDelegate,
  },
  "course-types": {
    label: "Course Types",
    delegate: () => prisma.courseType as unknown as SimpleMasterDelegate,
  },
};

export function isSimpleMasterKey(key: string): key is SimpleMasterKey {
  return key in SIMPLE_MASTERS;
}
