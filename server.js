const { connectDB, app, PORT } = require("./app");

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port:` + PORT);
    });
  } catch (error) {
    console.log("could not start server: ", error);
  }
})();
