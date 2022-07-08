import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Accordion, Form, Card } from "react-bootstrap";
import { IoIosAdd } from "react-icons/io";
import EditPage from "./edit";
import { useHistory } from "react-router-dom/cjs/react-router-dom";

import $ from "jquery";

window.onscroll = function () {
  if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
    $("#username").css("display", "none");
  } else {
    $("#username").css("display", "block");
  }
};

export default function Home() {
  const hist = useHistory();
  const [editPage, setEditPage] = useState(false);
  const [todoEdit, setTodoEdit] = useState({});
  const [TodoForm, setTodoForm] = useState({
    heading: "",
    comments: "",
    description: "",
  });

  const [myTodos, setMyTodos] = useState([]);
  const [user, setUser] = useState({
    username: null,
    userid: null,
  });

  const addTodo = async () => {
    // $("#dashboard").css("-webkit-filter", "grayscale(100%) blur(2px)");
    const { data } = await axios.post(`/api/${user.userid}/todo/add`, {
      heading: TodoForm.heading,
      comments: TodoForm.comments,
      description: TodoForm.description,
    });
    // $("#dashboard").css("-webkit-filter", "grayscale(0%) blur(0px)");
    if (data.status === 400) hist.push("/unauthorized");
    if (data.status && data.outcome) {
      setTodoForm({
        heading: "",
        comments: "",
        description: "",
      });
    }
    if (data.status && !data.outcome) alert(data.message);
  };

  const deleteTodo = async (id) => {
    const { data } = await axios.delete(`/api/${user.userid}/${id}/delete`);
    if (data.status === 400) hist.push("/unauthorized");
    alert(data.message);
  };

  const todoMark = async (thisTodo) => {
    const updateURL = `/api/${user.userid}/${thisTodo._id}/todo/update`;
    console.log("Atif", updateURL);
    const { data } = await axios.post(updateURL, {
      heading: thisTodo.heading,
      comments: thisTodo.comments,
      description: thisTodo.description,
      status: !thisTodo.status,
    });
    if (data.status === 400) hist.push("/unauthorized");
    else if (!data.status || !data.outcome) alert(data.message);
  };

  const updateTodo = () => {};

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get("/api/current");
      if (data.status && data.outcome === false) {
        hist.push("/");
      } else {
        setUser({ username: data.message.username, userid: data.message._id });
        setMyTodos(data.message.todos.reverse());
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data, status } = await axios.get(`/api/${user.userid}/todos`);
      if (status === 400) hist.push("/unauthorized");
      else if (data.status && data.outcome) setMyTodos(data.message);
    };
    if (user.userid !== null) fetchData();
  }, [addTodo, deleteTodo, updateTodo]);

  function changeTodoForm(e) {
    const { name, value } = e.target;
    setTodoForm({ ...TodoForm, [name]: value });
  }

  const openEditor = (para) => {
    setTodoEdit(para);
    setEditPage(true);
  };

  const todoList = myTodos.map((todo) => (
    <Card id="todoListCard">
      <Card.Header
        as="h5"
        style={{ backgroundColor: todo.status ? "springgreen" : "tomato" }}
      >
        {todo.heading}
        <Button
          variant="primary"
          style={{ float: "right", marginLeft: "10px" }}
          onClick={() => openEditor(todo)}
        >
          Edit
        </Button>
        <Button
          variant="primary"
          style={{ float: "right" }}
          onClick={() => deleteTodo(todo._id)}
        >
          Delete
        </Button>
      </Card.Header>

      <Card.Body>
        <Card.Title style={{ color: "rgba(0,0,0,0.8)" }}>
          <i>{todo.description}</i>
        </Card.Title>
        <Card.Text>
          <i>{todo.comments}</i>
        </Card.Text>
        <Button variant="primary" onClick={() => todoMark(todo)}>
          {todo.status ? "done" : "mark as done"}
        </Button>
      </Card.Body>
    </Card>
  ));

  const Logout = async () => {
    await axios.get("/logout");
  };

  return (
    <div id="dashboard">
      {/* <center > */}
      <h1 id="top-logo">My Todo List</h1>
      {/* </center> */}
      <p id="username"> {user.username}</p>
      <Accordion defaultActiveKey="1" className="m-3">
        <Card
          className="accor-card"
          style={{ border: "0", background: "beige" }}
        >
          <Card.Header
            style={{ background: "beige", border: "0", textAlign: "start" }}
          >
            <Accordion.Toggle
              variant="none"
              style={{ width: "100%" }}
              as={Button}
              eventKey="0"
              className="p-0 m-0"
            >
              <IoIosAdd
                className="plusButton"
                style={{
                  fontSize: "300%",
                  color: "white",
                  background: "green",
                  borderRadius: "50%",
                }}
              />
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="0">
            <Form id="task-form">
              <Form.Label style={{ float: "left" }}>Heading</Form.Label>
              <Form.Control
                placeholder="give a header"
                autoComplete="off"
                name="heading"
                value={TodoForm.heading}
                onChange={changeTodoForm}
              />
              <Form.Label style={{ float: "left" }}>Description</Form.Label>
              <Form.Control
                placeholder="give a description"
                name="description"
                value={TodoForm.description}
                onChange={changeTodoForm}
              />
              <Form.Label style={{ float: "left" }}>Comments</Form.Label>
              <Form.Control
                placeholder="any comments ?"
                autoComplete="off"
                name="comments"
                value={TodoForm.comments}
                onChange={changeTodoForm}
              />
              <div className="p-3">
                <Button variant="success" onClick={() => addTodo()}>
                  Add
                </Button>
              </div>
            </Form>
          </Accordion.Collapse>
        </Card>
      </Accordion>
      {myTodos.length > 0 ? (
        todoList
      ) : (
        <center>
          <b style={{}}>add a task</b>
        </center>
      )}
      <p id="logout" style={{ float: "right" }} onClick={Logout}>
        <a href="/">
          {" "}
          <Button variant="danger">logout</Button>{" "}
        </a>
      </p>
      <EditPage
        show={editPage}
        onHide={() => setEditPage(false)}
        todo={todoEdit}
        callUpdate={updateTodo}
        userid={user.userid}
      />
    </div>
  );
}
