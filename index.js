require('dotenv').config(); // Make sure this is at the top

const express =  require('express')
const cors = require('cors')
const app=express();
const mysql = require('mysql2')

app.use(express.json())
app.use(cors())

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql123@hiba',
    database: 'sys'
});

db.connect((err)=>{
    if(!err){
      console.log("connected to database successfully")  
    }else{
        console.log("connected to database failed");
    }
})
app.post('/new-task',(req,res)=>{
    console.log(req.body)
    const q = 'insert into todos (task,createdAt,status) values (?,?,?)';
    db.query(q,[req.body.task,new Date(),'active'],(err,result)=>{
        if(err){
            console.log("failed to store")
        }else{
            console.log('todo saved');
            const updatedTasks='select * from todos'
            db.query(q,(error,newList)=>{
                res.send(newList)
            })
        }
    })
})
app.get('/read-tasks',(req,res)=>{
    const q='select * from todos';
    db.query(q,(err,result)=>{
        if(err){
            console.log("failed to read tasks")
        }else{
            console.log("got tasks sucessfully from db")
            /* console.log(result)*/
            res.send(result)
        }
    })
})
app.post('/update-task', (req, res) => {
  const { id, task } = req.body;

  console.log('Updating task:', req.body);

  const q = 'UPDATE todos SET task = ? WHERE id = ?';

  db.query(q, [task, id], (err, result) => {
    if (err) {
      console.error('Failed to update task:', err);
      return res.status(500).json({ message: 'Update failed', error: err });
    } else {
      console.log('Task updated successfully');
      return res.status(200).json({ message: 'Task updated successfully' });
    }
  });
});

app.post('/delete-task',(req,res)=>{
const q='delete from todos where id=?';
db.query(q,[req.body.id],(err,result)=>{
if(err){
    console.log('failed to delete');

}else{
    console.log('deleted successfully')
    db.query('select *from todos',(e,newlist)=>{
res.send(newlist);
    })
}
})
})

app.post('/complete-task',(req,res)=>{
const q='update todos set status =? where id=?';
db.query(q,['completed',req.body.id],(err,result)=>{
if(result){
   db.query('select *from todos',(e,newList)=>{
    res.send(newList)
   })


   
}
})
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

 app.get('/', (req, res) => {
    res.status(200).send('<h1 style="color:red;">Server running successfully starting</h1>');
});
  
