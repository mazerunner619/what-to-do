import { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useHistory } from "react-router";
import $ from "jquery";

export default function Exp({ match }) {
  useEffect(() => {
    const init = async () => {
      const { data } = await axios.get("/api/current");
      if (data.status && data.outcome) {
        hist.push("/dashboard");
        console.log("Atif", data);
      }
    };
    init();
  }, []);

  const hist = useHistory();
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function showPass() {
    $(".pass").attr("type", "text");
  }

  function hidePass() {
    $(".pass").attr("type", "password");
  }

  async function handleS(e) {
    e.preventDefault();
    if (username && password) {
      const { data } = await axios.post("/api/login", {
        username: username,
        password: password,
      });
      if (data.status && data.outcome) {
        hist.push("/dashboard");
      } else setLoginError(data.message);
    } else {
      alert(!username.length ? "enter username" : "enter password");
    }
  }

  return (
    <div id="authPage">
      <h1>Signin</h1>

      <Form>
        <Form.Group>
          <Form.Label style={{ float: "left" }}>username</Form.Label>
          <Form.Control
            placeholder="username"
            autoComplete="off"
            name="username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <Form.Label style={{ float: "left" }}>Password</Form.Label>
          <Form.Control
            autoComplete="off"
            className="pass"
            type="password"
            placeholder="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div
            style={{ float: "left" }}
            onMouseLeave={hidePass}
            onMouseEnter={showPass}
          >
            show password
          </div>
        </Form.Group>
        <br />
        <Button
          style={{ display: "inline" }}
          variant="success"
          name="tutor"
          type="submit"
          onClick={handleS}
        >
          Login
        </Button>
      </Form>

      <p style={{ color: "red" }}>{loginError}</p>

      <p>
        not registered ? signup <a href="/signup">here</a>
      </p>
    </div>
  );
}
