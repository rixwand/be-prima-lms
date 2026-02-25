import enrollmentRepository from "./enrollment.repository";

export default {
  async list(userId: number, search?: string) {
    const courses = await enrollmentRepository.listCourseByUser(userId, search);
    return courses.map(({ course: c }) => ({ ...c, metaApproved: c.metaApproved?.payload }));
  },
};
