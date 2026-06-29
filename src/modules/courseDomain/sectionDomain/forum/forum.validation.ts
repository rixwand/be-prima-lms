import * as yup from "yup";
export const threadContentSchema = yup
  .object({
    images: yup.array().of(yup.string()).optional(),
    message: yup.string().optional(),
  })
  .test("message-or-image", "Provide a message or at least one image", value => {
    const hasMessage = !!value?.message?.trim();
    const hasImages = (value?.images?.length ?? 0) > 0;

    return hasMessage || hasImages;
  });

export const createThreadSchema = yup.object({
  title: yup.string().required().max(200),
  content: threadContentSchema.required(),
});

export const replyThreadSchema = yup.object({
  repliedToId: yup.number().integer().positive().optional(),
  content: threadContentSchema.required(),
});
