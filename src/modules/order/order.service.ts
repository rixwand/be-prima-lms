import orderRepository from "./order.repository";

export default {
  async list(userId: number) {
    return orderRepository.list(userId);
  },
};
