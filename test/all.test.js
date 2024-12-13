const request = require("supertest");
const { app, connectDB } = require("../app");
const chai = require("chai");
const { expect } = chai;
const mongoose = require("mongoose");
const { User } = require("../Models");

describe("Test All the routes", function () {
  this.timeout(10000);

  let testuser = {
    username: `testuser${Date.now()}`,
    password: "password",
  };

  let testTodo = {
    heading: "test todo",
    comments: "test todo comments",
    description: "test todo description",
  };

  before(async () => {
    await connectDB();
  });

  after(async () => {
    await User.deleteOne({ username: testuser.username });
    await mongoose.connection.close();
  });

  it("should register a new user", async () => {
    const res = await request(app).post("/api/signup").send(testuser);
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Registered successfully");
  });

  it("should not login for invalid credentials", async () => {
    let res = await request(app)
      .post("/api/login")
      .send({ username: testuser.username, password: "incorrect-password" });
    expect(res.body.message).to.equal("invalid password !");

    res = await request(app)
      .post("/api/login")
      .send({ password: testuser.password, username: "incorrect-username" });
    expect(res.body.message).to.equal("username not registered !");
  });

  it("should login a user if correct credentials", async () => {
    const res = await request(app).post("/api/login").send(testuser);
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal(`logged in as ${testuser.username}`);
    expect(res.headers["set-cookie"]).to.be.an("array");
    const resToken = res.headers["set-cookie"][0].split("=");
    expect(resToken[0]).to.equal("token");
    expect(resToken[1].length).to.be.greaterThan(0);
    testuser.token = resToken[1].split(";")[0];
  });

  it("should get current logged in user via cookie", async () => {
    const res = await request(app)
      .get("/api/current")
      .set("Cookie", [`token=${testuser.token}`])
      .send();
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message");
    expect(res.body.message.username).to.equal(testuser.username);
    expect(res.body.message.todos).to.be.an("array").with.lengthOf(0);
    testuser._id = res.body.message._id;
  });

  it("should let logged user add a new todo", async () => {
    const res = await request(app)
      .post(`/api/${testuser._id}/todo/add`)
      .set("Cookie", [`token=${testuser.token}`])
      .send(testTodo);
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("todo added !");
  });

  it("get all todos for userid", async () => {
    const res = await request(app)
      .get(`/api/${testuser._id}/todos`)
      .set("Cookie", [`token=${testuser.token}`])
      .send();
    expect(res.status, "status not matched").to.equal(200);
    expect(res.body.message, "todos[] length not equal to 1")
      .to.be.an("array")
      .with.lengthOf(1);
    expect(res.body.message[0])
      .to.have.property("heading")
      .to.equal("test todo");
    testTodo._id = res.body.message[0]._id;
  });

  it("fetch todo by id for logged in user", async () => {
    const res = await request(app)
      .get(`/api/${testuser._id}/gettodo/${testTodo._id}`)
      .set("Cookie", [`token=${testuser.token}`])
      .send();
    expect(res.status, "status not matched").to.equal(200);
    expect(res.body).to.have.property("message");
    expect(res.body.message._id).to.equal(testTodo._id);
  });

  it("should update/edit a todo for logged in user", async () => {
    const res = await request(app)
      .post(`/api/${testuser._id}/${testTodo._id}/todo/update`)
      .set("Cookie", [`token=${testuser.token}`])
      .send({ ...testTodo, status: true, heading: "test todo modified" });
    expect(res.status, "status not matched").to.equal(200);
    expect(res.body).to.have.property("message");
    expect(res.body.message).to.equal("changes saved");
  });

  it("should delete a todo for logged in user", async () => {
    const res = await request(app)
      .delete(`/api/${testuser._id}/${testTodo._id}/delete`)
      .set("Cookie", [`token=${testuser.token}`])
      .send();
    expect(res.status, "status not matched").to.equal(200);
    expect(res.body).to.have.property("message");
    expect(res.body.message).to.equal("deleted successfully !");
  });

  it("should verify that todo has been deleted", async () => {
    const res = await request(app)
      .get(`/api/${testuser._id}/todos`)
      .set("Cookie", [`token=${testuser.token}`])
      .send();
    expect(res.status, "status not matched").to.equal(200);
    expect(res.body.message, "todos[] length not equal to 1")
      .to.be.an("array")
      .with.lengthOf(0);
  });
});
