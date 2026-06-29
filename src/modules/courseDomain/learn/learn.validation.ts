import * as yup from "yup";
import { validate } from "../../../common/utils/validation";
export type ItemType = "quiz" | "lesson" | "forum";
export const validateSectionItemTypeParams = async (type: any) =>
  validate(
    yup.object({
      type: yup.mixed<ItemType>().defined().oneOf(["quiz", "lesson", "forum"]).required(),
    }),
    { type },
  );

export const submitQuizSchema = yup.object({
  answers: yup
    .array()
    .of(
      yup.object({
        questionId: yup.number().required(),
        selectedOptionIds: yup.array().of(yup.number().required()).min(1).required(),
      }),
    )
    .required(),
});
