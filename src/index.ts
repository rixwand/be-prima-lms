import server from "./app/server";
import { initSocket } from "./app/socket";
import { registerDomainEventHandlers } from "./core/events/register-handlers";

const PORT = Number(process.env.PORT || 3000);

const io = initSocket(server);
registerDomainEventHandlers({ io });

server.listen(PORT, () => {
  console.log(`App listening at ${PORT}`);
});
