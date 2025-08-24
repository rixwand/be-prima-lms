import web from "./app/web";

const PORT = process.env.PORT || 3000;

web.listen(PORT, () => {
  console.log(`App listening at ${PORT}`);
});
