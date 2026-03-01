import enrollmentRepository from "./enrollment.repository";

export default {
  async list(userId: number, { limit, page, search }: { search?: string; page: number; limit: number }) {
    const { count, result } = await enrollmentRepository.listCourseByUser(userId, {
      ...(search && { search }),
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      courses: result,
      meta: {
        total: count,
        page: page,
        limit: limit,
        totalPage: Math.ceil(count / limit),
      },
    };
  },
};
