'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const users = [
                {
                  name: 'Tom', 
                  score: '4'
                }
              ];

app.use(bodyParser.json());


app.get('/users/', (req, res) => {

  if (req.query.fields) {
    const fields = req.query.fields.split(',');
    const result = users.map(u => {
      return fields.reduce((memo, el) => {
        memo[el] = u[el];
        return memo;
      }, {});
    });
    res.json(result);
  } else if (req.query.offset && req.query.limit) {
    res.json(users.slice(req.query.offset - 1, req.query.limit));
  } else {
    res.json(users.filter(u => u)); 
  }  
  
});

app.post('/users/', (req, res) => {
    const id = users.length;
    users.push(req.body);
    res.json({ id });
});

app.get('/users/:userId', (req, res) => {
    const user = users[req.params.userId];
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        res.send();
    }
});

app.delete('/users/:userId', (req, res) => {
    users[req.params.userId] = null;
    res.send();
});

app.put('/users/:userId', (req, res) => {
    let user = users[req.params.userId];
    if (user) {
        user = Object.assign(user, req.body);
        users[req.params.userId] = user;
        res.json(user);
    } else {
        res.status(404);
        res.send();
    }
});

app.delete('/users/', (req, res) => {
    users.splice(0, users.length);
    res.send();
});



const RPC = {

  create: (args, callback) => {
    let error = null;
    let result = null;

    if (!Array.isArray(args)) {
      const id = users.length;
      users.push(args);
      result = { id };
    } else {
      error = 400;
    }
           
    callback(error, result)
  },

  read: (args, callback) => {
    let error = null;
    let result = null;

    if (!args) {

      result = users.filter(u => u);

    } else {

      if (users[args]) {
        result = users[args];
      } else {
        error = 400;
      }
      
    }    
    callback(error, result)
  },

  delete: (args, callback) => {
    let error = null;
    let result = null;

    if (Array.isArray(args)) {
      users[args[0]] = null;
    } else {
      error = 400;
    }
    callback(error, result)
  },

  update: (args, callback) => {
    let error = null;
    let result = null;

    if (!Array.isArray(args)) {
      let user = users[args.id];
      if (user) {
          user = Object.assign(user, args.data);
          users[args.id] = user;
          result = user;
      } else {
          error = 404;        
      }
    } else {
      error = 400;
    }

    callback(error, result)
  }
};


app.post('/rpc', function(req, res) {
  const method = RPC[req.body.method];
  method(req.body.params, function(error, result) {

    if (!error) {
      res.json(result);      
    } else {
      res.status(error);
      res.send();
    }

  });
});

app.listen(3000, () => console.log('App started on 3000 port'));