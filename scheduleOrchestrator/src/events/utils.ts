import z from "zod";

export const flexDateSchema = z.string().transform((value, ctx) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    ctx.issues.push({
      code: "custom",
      message: "Invalid datetime",
      input: value,
    });
    return z.NEVER;
  }
  return date;
});
