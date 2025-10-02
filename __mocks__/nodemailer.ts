export default {
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: "dummy-message-id" }),
  }),
};
