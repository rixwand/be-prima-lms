import * as yup from "yup";

const emptyDoc = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      attrs: {
        textAlign: null,
      },
    },
  ],
};

const tiptapContentSchema = yup
  .object({
    type: yup.string().oneOf(["doc"]).required(),
    content: yup.array().required(),
  })
  .default(emptyDoc)
  .optional();

export const updateLessonSchema = yup
  .object({
    summary: yup.string().optional(),
    contentJson: tiptapContentSchema,
  })
  .test(
    "at-least-one-field",
    "At least one field must be provided",
    value => {
      if (value == null || typeof value !== "object" || Array.isArray(value)) return true;
      return Object.keys(value).length > 0;
    },
  )
  .noUnknown()
  .required();

export const publishContentShema = yup
  .object({
    newDraft: yup
      .object({
        type: yup.string().oneOf(["doc"]).required(),
        content: yup.array().required(),
      })
      .nullable()
      .optional(),
  })
  .required()
  .noUnknown();
