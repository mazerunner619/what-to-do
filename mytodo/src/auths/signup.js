import { useState, useEffect } from 'react'
import axios from 'axios'
import {Form, Button,Row,Col} from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap';
import { useHistory } from 'react-router';
import $ from 'jquery';

export default function Exp({match}) {

  useEffect( ()=> {
    const init = async()=>{
      const {data} = await axios.get('/current');
      if(data.status){
        hist.push('/dashboard');
      }
    }
    init();
  }, [])

    const hist = useHistory();
    const [signupError, setSignupError] = useState("");
    const [info, setInfo] = useState({
      username : "",
      password : "",
      cpassword : ""
    });

    function changeTutorForm(e){
      const {name, value} = e.target;
      setInfo( prev => { return{...prev, [name] : value}});
    }

    function showPass(){
      $(".pass").attr("type", "text");
    }
    
    function hidePass(){
      $(".pass").attr("type", "password");
    }

    async function handleS(e){
      e.preventDefault();
      if(info.username.length && info.password.length && info.cpassword.length){
        if(info.password !== info.cpassword)
          alert("passwords do not match !");
        else{
          const {data} = await axios.post('/signup', {username : info.username, password : info.password});
          alert(data.message);
        }
      }else{
        alert("fill all fields !");
      }
  }

  return (
    <div id="authPage">
      <h1>Signup</h1>
     
    <Form>
 <p>{signupError}</p>
    <Form.Group>
        <Form.Label style = {{float : "left"}}>username</Form.Label>
      <Form.Control placeholder="Name" name="username" onChange ={changeTutorForm} />
      </Form.Group>

    <Form.Label style = {{float : "left"}}>password</Form.Label>
    <Form.Control className="pass" type="password" placeholder="password" name="password" onChange ={changeTutorForm} />
    <div style={{float : "right"}} onMouseLeave = {hidePass} onMouseEnter = {showPass}>show password</div>
      <Form.Label style = {{float : "left"}}>confirm password</Form.Label>
    <Form.Control className="pass" type = "password" placeholder="confirm password" name="cpassword" onChange ={changeTutorForm} />
  <hr/>

  <Button variant = "success" name="tutor"  type="submit" onClick = {handleS}>Signup</Button>
</Form>
<br/>
<p>already have an account ? signin <a href="/">here</a></p>
</div>

  );
}
