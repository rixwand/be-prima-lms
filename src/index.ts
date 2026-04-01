import server from "./app/server";
import { initSocket } from "./app/socket";

const PORT = Number(process.env.PORT || 3000);

initSocket(server);

server.listen(PORT, () => {
  console.log(`App listening at ${PORT}`);
});
