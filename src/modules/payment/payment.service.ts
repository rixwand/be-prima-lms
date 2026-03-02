import { withTransaction } from "../../common/libs/prisma/transaction";
import Invoice from "../../common/libs/xendit/invoice";
import { calculateFinalPrice } from "../../common/utils/currency";
import { CLIENT_URL } from "../../common/utils/env";
import { ApiError } from "../../common/utils/http";
import { courseRepo } from "../courseDomain/course/course.repository";
import { MetaApprovedPayload } from "../courseDomain/course/course.types";
import enrollmentRepository from "../courseDomain/enrollment/enrollment.repository";
import lessonProgressRepository from "../courseDomain/lessonProgress/lessonProgress.repository";
import orderRepository from "../order/order.repository";
import { userRepo } from "../users/user.repository";

export default {
  async createInvoice({ courseId, userId, code }: { userId: number; courseId: number; code?: string }) {
    const course = await courseRepo.findById(courseId, {
      select: { metaApproved: { select: { payload: true } }, discounts: true, publishedAt: true, takenDownAt: true },
    });
    if (!course || !course.publishedAt || course.takenDownAt) throw new ApiError(404, "Course not found");
    const enrollmentExist = await enrollmentRepository.get({ courseId, userId });
    if (enrollmentExist) throw new ApiError(409, "Course has been purchased");
    const { priceAmount } = course.metaApproved?.payload as MetaApprovedPayload;
    const finalPrice = calculateFinalPrice({ basePrice: priceAmount, discounts: course.discounts });
    const user = await userRepo.findById(userId, { select: { fullName: true, email: true } });
    return withTransaction(async tx => {
      const order = await orderRepository.create({ amount: finalPrice, courseId, userId }, tx);
      const invoice = await Invoice.createInvoice({
        data: {
          externalId: order.id,
          amount: finalPrice,
          description: "Test Xendit invoice",
          customer: {
            givenNames: user?.fullName!,
            email: user?.email!,
          },
          successRedirectUrl: CLIENT_URL + "/checkout/payment-success",
          failureRedirectUrl: CLIENT_URL + "/checkout/payment-failed",
        },
      });
      if (invoice.id) await orderRepository.update(order.id, { xenditId: invoice.id }, tx);
      return invoice;
    });
  },

  async paymentSuccess(orderId: string) {
    const order = await orderRepository.get(orderId);
    if (!order) throw new ApiError(404, "Order not found");
    return withTransaction(async tx => {
      await orderRepository.update(orderId, { status: "PAID" }, tx);
      const enrollment = await enrollmentRepository.create({ courseId: order.courseId, userId: order.userId }, tx);
      await lessonProgressRepository.create({ courseId: order.courseId, enrollmentId: enrollment.id }, tx);
      return enrollment;
    });
  },

  async paymentFailed(orderId: string) {
    const order = await orderRepository.get(orderId);
    if (!order) throw new ApiError(404, "Order not found");
    return orderRepository.update(orderId, { status: "FAILED" });
  },
};
