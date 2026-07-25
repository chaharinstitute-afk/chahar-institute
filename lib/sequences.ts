import { prisma } from "@/lib/prisma";

/**
 * Generates a unique admission number for a session, e.g. "CI2026-000123".
 * Uses SELECT ... FOR UPDATE inside a transaction so concurrent admissions
 * in the same session never collide (see admin/ADMIN_PANEL_PLAN.md, section 4.4).
 */
export async function generateAdmissionNumber(
  sessionId: bigint,
  sessionLabel: string
): Promise<string> {
  return prisma.$transaction(async (tx) => {
    await tx.admissionNumberSequence.upsert({
      where: { sessionId },
      create: { sessionId, lastNumber: 0 },
      update: {},
    });

    const rows = await tx.$queryRaw<{ last_number: bigint }[]>`
      SELECT last_number FROM admission_number_sequences WHERE session_id = ${sessionId} FOR UPDATE
    `;
    const next = (rows[0]?.last_number ?? BigInt(0)) + BigInt(1);

    await tx.$executeRaw`
      UPDATE admission_number_sequences SET last_number = ${next} WHERE session_id = ${sessionId}
    `;

    const padded = next.toString().padStart(6, "0");
    return `CI${sessionLabel}-${padded}`;
  });
}

/**
 * Generates a unique student code, e.g. "CI-STU-000001".
 * Same SELECT ... FOR UPDATE pattern as admission numbers, keyed on a single row (id = 1).
 */
export async function generateStudentCode(): Promise<string> {
  return prisma.$transaction(async (tx) => {
    await tx.studentCodeSequence.upsert({
      where: { id: 1 },
      create: { id: 1, lastNumber: 0 },
      update: {},
    });

    const rows = await tx.$queryRaw<{ last_number: bigint }[]>`
      SELECT last_number FROM student_code_sequences WHERE id = 1 FOR UPDATE
    `;
    const next = (rows[0]?.last_number ?? BigInt(0)) + BigInt(1);

    await tx.$executeRaw`
      UPDATE student_code_sequences SET last_number = ${next} WHERE id = 1
    `;

    return `CI-STU-${next.toString().padStart(6, "0")}`;
  });
}
