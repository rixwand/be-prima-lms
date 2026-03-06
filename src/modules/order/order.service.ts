import { withTransaction } from "../../common/libs/prisma/transaction";
import Invoice from "../../common/libs/xendit/invoice";
import { calculateFinalPrice } from "../../common/utils/currency";
import { CLIENT_URL } from "../../common/utils/env";
import { ApiError } from "../../common/utils/http";
import { courseRepo } from "../courseDomain/course/course.repository";
import { MetaApprovedPayload } from "../courseDomain/course/course.types";
import enrollmentRepository from "../courseDomain/enrollment/enrollment.repository";
import lessonProgressRepository from "../courseDomain/lessonProgress/lessonProgress.repository";
import invoiceRepository from "../invoice/invoice.repository";
import { userRepo } from "../users/user.repository";
import orderRepository from "./order.repository";
import { ListOrderParams } from "./order.types";

export default {
  async list(params: ListOrderParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    const { count, orders } = await orderRepository.list({
      search: params.search,
      status: params.status,
      startDate: params.startDate,
      endDate: params.endDate,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      orders,
      meta: {
        total: count,
        page,
        limit,
        totalPage: Math.ceil(count / limit),
      },
    };
  },

  async create({ courseId, userId, code }: { userId: number; courseId: number; code?: string }) {
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
      const invoice = await invoiceRepository.create(
        {
          amount: finalPrice,
          orderId: order.id,
          status: "PENDING",
        },
        tx,
      );
      const xenditInvoice = await Invoice.createInvoice({
        data: {
          externalId: invoice.invoiceNumber,
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
      if (!xenditInvoice.id) throw new ApiError(500, "Failed create invoice");
      await invoiceRepository.update(
        invoice.id,
        { xenditId: xenditInvoice.id, expiresAt: xenditInvoice.expiryDate },
        tx,
      );
      return xenditInvoice;
    });
  },

  async paymentSuccess(invoiceNumber: string) {
    const invoice = await invoiceRepository.getByInvoiceNumber(invoiceNumber);
    if (!invoice) throw new ApiError(404, "Invalid invoice");
    return withTransaction(async tx => {
      await invoiceRepository.paid(invoice.invoiceNumber, tx);
      await orderRepository.update(invoice.orderId, { status: "PAID" }, tx);
      const enrollment = await enrollmentRepository.create(
        { courseId: invoice.order.courseId, userId: invoice.order.userId },
        tx,
      );
      await lessonProgressRepository.create({ courseId: invoice.order.courseId, enrollmentId: enrollment.id }, tx);
      return enrollment;
    });
  },

  async paymentFailed(invoiceNumber: string) {
    const invoice = await invoiceRepository.getByInvoiceNumber(invoiceNumber);
    if (!invoice) throw new ApiError(404, "Invalid invoice");
    return withTransaction(async tx => {
      await orderRepository.update(invoice.orderId, { status: "FAILED" }, tx);
      return invoiceRepository.failed(invoice.invoiceNumber, tx);
    });
  },
};
