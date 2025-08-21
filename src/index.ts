import api from "./app/routes";
import web from "./app/web";

const PORT = process.env.PORT || 3000;

web.use(api);

web.listen(PORT, () => {
  console.log(`App listening at ${PORT}`);
});
