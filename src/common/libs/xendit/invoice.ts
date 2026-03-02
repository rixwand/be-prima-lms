import Xendit from "xendit-node";
import { XENDIT_SECRET_KEY } from "../../utils/env";

const { Invoice } = new Xendit({
  secretKey: XENDIT_SECRET_KEY,
});

export default Invoice;
