import axios from 'axios';
import React, { useState , useEffect} from 'react';
import {Modal ,Form} from 'react-bootstrap'
import { Button} from 'react-bootstrap'

export default function MyVerticallyCenteredModal({
  show, onHide, todo, callUpdate
}) {

  const [T,setT] = useState({
    heading : "",
    comments : "",
    description : "",
    status : ""
  })

  useEffect( () => {
    const init = () => {
      setT({
        heading : todo.heading,
        comments : todo.comments,
        description : todo.description,
        status : todo.status
      })
    }
    init();
  }, [show])

  const mofifyForm = (e) => {
    const {name, value} = e.target;
    setT( x => {
      return {...x, [name] : value}
    });
  }

  const saveChanges = async() => {
    const {data} = await axios.post(`/${todo._id}/todo/update`, T);
    if(data.status){
      callUpdate();
      onHide();
    }else{
      alert(data.message);
    }
  }

return (

  <Modal
  show = {show}
  onHide = {onHide}
    size="lg"
    aria-labelledby="contained-modal-title-vcenter"
    centered
  >
    <Modal.Header>

    <Modal.Title id="contained-modal-title-vcenter">
      <h3 style = {{fontFamily :"fantasy", letterSpacing : "1px"}}>
      Edit
      </h3>
      </Modal.Title>
      <Button variant="none" aria-hidden="true" onClick={onHide}>&times;</Button>
    </Modal.Header>
    <Modal.Body  >
<i>
</i>
<Form className="p-3 m-0">
   <Form.Label style = {{float : "left"}}><b>Heading</b></Form.Label>
   <Form.Control placeholder="give a header" name="heading" value = {T.heading} onChange ={mofifyForm} />    
   <Form.Label style = {{float : "left"}}><b>Description</b></Form.Label>
   <Form.Control placeholder="give a description" name="description" value = {T.description} onChange ={mofifyForm} />   
   <Form.Label style = {{float : "left"}}><b>Comments</b></Form.Label>
   <Form.Control placeholder="any comments ?" name="comments" value={T.comments} onChange ={mofifyForm} />  
 </Form>

    </Modal.Body>
    <Modal.Footer>
      <Button color="secondary" block variant = "success" onClick = {saveChanges}>Save Changes</Button>
    </Modal.Footer>
  </Modal>
);

  }

  
  