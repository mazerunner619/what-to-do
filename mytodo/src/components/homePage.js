import {useState,useEffect} from 'react'
import axios from 'axios'
import { Button ,Accordion, Form, Card} from 'react-bootstrap'
import {IoIosAdd} from 'react-icons/io';
import EditPage from './edit'
import { useHistory } from 'react-router-dom/cjs/react-router-dom'


export default function Home() {

  const hist = useHistory();
  const [editPage, setEditPage] = useState(false);
  const [todoEdit, setTodoEdit] = useState({});
  const [TodoForm, setTodoForm] = useState({
    heading  :"",
    comments : "",
    description : ""
  });

const [myTodos, setMyTodos] = useState([]);
const [user, setUser] = useState({
  username : null,
  userid : null
});


const addTodo = async() => {
  const {data} = await axios.post(`/${user.userid}/todo/add` , {heading : TodoForm.heading,comments : TodoForm.comments ,description : TodoForm.description});
  // alert(data.message);
  alert(data.message)
  if(data.status)
  setTodoForm({
    heading  :"",
    comments : "",
    description : ""
  })
}

const deleteTodo = async(id) => {
  const {data} = await axios.delete(`/${id}/delete`);
  alert(data.message);
}
const todoMark = async(thisTodo) => {
  const {data} = await axios.post(`/${thisTodo._id}/todo/update`, {heading : thisTodo.heading,comments : thisTodo.comments,description : thisTodo.description,status : !thisTodo.status});
  if(!data.status)
    alert(data.message)
}

const updateTodo = () => {}

  useEffect( () => {
    const fetchData = async() => {
      const {data} = await axios.get('/current');
      if(!data.status){
        console.log('data is null goto login')
        hist.push('/login');
      }else{
        setUser({username : data.message.username, userid : data.message._id})
        setMyTodos(data.message.todos.reverse())
      }
    }
    fetchData();
  }, []);


  useEffect( () => {
    const fetchData = async() => {
      const {data} = await axios.get(`/${user.userid}/todos`);
      if(data.status)
        setMyTodos(data.message)
    }
    fetchData();
  }, [addTodo, deleteTodo, updateTodo]);


function changeTodoForm(e){
  const {name, value} = e.target;
  setTodoForm({...TodoForm, [name] : value});
}

const openEditor = (para) => {
  console.log(para)
  setTodoEdit(para);
  setEditPage(true);
}

const todoList = myTodos.map( todo => 
<Card className="mb-3 ml-3" border = {todo.status ? "success" : "danger"}>
  <Card.Header as="h5" style = {{ backgroundColor : todo.status ? "springgreen" : "tomato"}}>
    {todo.heading}
    <Button variant="primary" style={{float : "right", marginLeft : "10px"}} 
    onClick = { () => openEditor(todo)}
    >Edit</Button>
    <Button variant="primary" style={{float : "right"}} onClick = {() => deleteTodo(todo._id)}>Delete</Button>
  </Card.Header>
  
  <Card.Body>
    <Card.Title style={{color : "rgba(0,0,0,0.8)"}}><i>{todo.description}</i></Card.Title>
    <Card.Text>
      <i>{todo.comments}</i>
    </Card.Text>
    <Button variant="primary" onClick = {() => todoMark(todo)}>{todo.status ? "done" : "mark as done"}</Button>
  </Card.Body>
</Card>
)


const Logout = async()=>{
  await axios.get('/logout');
}

  return (
  <div id="dashboard">
  <p className='p-1' style = {{textAlign : "left", display : "inline", border :"1px solid black", borderRadius : "10px", fontFamily : "cursive"}}> {user.username}</p>
   <p style = {{float : "right"}} onClick = {Logout}><a href="/"> <Button variant='danger'>logout</Button> </a>
  </p>
  <br />
<center><h1>Todo List</h1></center>
<Accordion className="m-3">
<Card className = "accor-card" style={{border : "0"}}>
<Card.Header style={{background : "white", border : "0",textAlign : "start"}}>
<Accordion.Toggle variant ="none" style={{width : "100%"}} as={Button} eventKey="0" className="p-0 m-0">
<IoIosAdd className="plusButton" style={{fontSize : "300%", color : "orange",borderRadius :"50%", border : "1px solid orange"}}/>
</Accordion.Toggle>
    </Card.Header>
  <Accordion.Collapse eventKey="0" >
  <Form className="p-3 m-0" style={{backgroundColor : "rgba(0,0,0,0.05)",border : "1px solid orange", borderRadius : "10px"}}>
   
      <Form.Label style = {{float : "left"}}>Heading</Form.Label>
      <Form.Control placeholder="give a header" name="heading" value={TodoForm.heading} onChange ={changeTodoForm} />    
      <Form.Label style = {{float : "left"}}>Description</Form.Label>
      <Form.Control placeholder="give a description" name="description" value={TodoForm.description} onChange ={changeTodoForm} />   
      <Form.Label style = {{float : "left"}}>Comments</Form.Label>
      <Form.Control placeholder="any comments ?" name="comments" value={TodoForm.comments} onChange ={changeTodoForm} />    
      <div className = "p-3">

<Button variant = "success" onClick = {()=>addTodo()}>
  Add
</Button>
      </div>
    </Form>
      </Accordion.Collapse>
      </Card>
</Accordion>
{myTodos.length ? todoList : <center><b style={{}}>add a task</b></center>}

<EditPage
        show={editPage}
        onHide={() => setEditPage(false)}
        todo={todoEdit}
        callUpdate = {updateTodo}
/>  
</div>
  );
}
