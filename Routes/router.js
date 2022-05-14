const express = require('express');
const router = express.Router();
const db = require('../Models');
const bcrypt =  require('bcrypt');
const jwt = require('jsonwebtoken')

//===================== CURRENT LOGGED USER if any
router.get('/current' ,async(req, res, next) => {
    try{
        const token = req.cookies.token;
        if(token){
            const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
            if(verified){
                const user = await db.User.findById(verified.userId)
                .populate({path : "todos", select : "-password"}).exec();
                if(user){
                    console.log("current user logged in")
                    return next({
                        message : user,
                        status : true
                    });
                }else{
                    return next({
                        message : "not logged in",
                        status : false
                    });
                }
            }
            else{
                console.log('no JWT found !');
                res.send(null);
            }
        }
        else{
            console.log('null token');
            res.send(null);
        }
    }catch(error){
        console.log(error.message);
        res.send(null);
    }
});

//==================== LOGIN =============
router.post('/login', async(req, res, next) => {
    try{
        console.log("login request", req.body)
        const { username, password} = req.body;
            const user = await db.User.findOne({username : username});
           if(user){
               console.log(user);
               const correctPassword = await bcrypt.compare(password, user.password);
               if(correctPassword){
                //create jwt authorizatoin
                const token = jwt.sign({
                    userId : user._id,
                 },
                 process.env.JWT_SECRET_KEY 
                 );
                 //send the token to browser cookie
                 console.log('logged in as '+user.username);
                 res.cookie( "token", token, {httpOnly : true}).send({
                    message : `logged in as ${user.name}`,
                    status : true
                });
}
               else return next({message : 'invalid password !', status : false});
}
           else {
               console.log(user, "username not registered, please register first");
               return next({message : 'username not registered, please register first !', status : false});
           }
    }
    catch(error){
        console.log('login error',error);
        return next({message :  error.message, status : false});
    }
});


//=====================SIGNUP===============
router.post('/signup', async(req, res, next) => {
    try{
        console.log('signup route', req.body);
        const {username, password } = req.body;
        const alreadyExists =  await db.User.findOne({username : username});
        if(alreadyExists){
            return next({
                message : "username already exists !",
                status : false
            })
        }
         const userData = {
             username : username,
             password :  await bcrypt.hash(password, 10)
         }

            const newUser = await db.User.create(userData);
        return next({
            message : "Registered successfully",
            status : true
        });

    }catch(error){
        console.log(error);
        return next({
            message : error.message,
            status  : false
        });
    }   
});

//  add new todo
router.post('/:userid/todo/add', async(req, res, next) => {
    try{
        console.log('in add new todo route : '+req.body);
        const {userid} = req.params;
        console.log(userid);
        console.log(typeof(userid))
        const {heading,comments,description} = req.body;
        const newTodo = await db.Todo.create({
            heading,comments,description
        });
        // add todo in user's todos
        const user = await db.User.findById(userid);
        user.todos.push(newTodo);
        await user.save();
        console.log("new todo created ", newTodo);
        return next({message : 'todo added !', status : true})
    }catch(err){
        console.log(err.message);
        return next({message : err.message, status : false})
    }
})

// get a todo by id
router.get('/gettodo/:todoid', async(req, res, next) => {
    try{
        const todo = await db.Todo.findById(req.params.todoid);
        return next({message : todo, status : true})
    }catch(err){
        console.log(err.message);
        return next({message : err.message, status : false})
    }
})
// delete a todo
router.delete('/:todoid/delete', async(req, res, next) => {
    try{const {todoid} = req.params;

    await db.Todo.deleteOne({_id : todoid}, (err, done) => {
        if(err){
            console.log(err.message);
            return next({
                message : err.message,
                status : false
            });
        }else{
            console.log("deleted todo");
            return next({message : "deleted successfully !", status : true})
        }
    })}catch(err){
        console.log(err.message);
        return next({message : err.message, status : false})
    }
})

//update a todo
router.post('/:todoid/todo/update', async(req, res, next) => {
    try{
        const {todoid} = req.params;
        const {heading,comments,description, status} = req.body;
        await db.Todo.findByIdAndUpdate(todoid, 
            {
             heading,comments,description,status
            },
                function (err, docs) {
            if (err){
                console.log(err)
                return next({message : err.message, status : false})
            }
            else{
                console.log("Updated Todo");
                return next({message : 'changes saved', status : true})
            }
        });
    }catch(err){
        console.log(err.message);
        return next({message : err.message, status : false})
    }
})

//fetch todos from userid
router.get('/:userid/todos', async(req, res, next) => {
    try{
    const user = await db.User.findById(req.params.userid).
    populate({path : "todos"})
    // res.send(user.todos);
    return next({message : user.todos.reverse(), status : true});
    }catch(err){
        console.log(err.message);
        return next({message : err.message, status : false})
    }
});

module.exports = router;