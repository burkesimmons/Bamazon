var mysql = require("mysql");
var mysqlPassword = require('./password.js')

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: mysqlPassword,
  database: "bamazon"
});

// connection.connect(function(err) {
//   if (err) throw err;
//   console.log("connected as id " + connection.threadId);

//   connection.query("SELECT * FROM products", function(err, res) {
//     if (err) throw err;
//     console.log(res);
//   });
// });

connection.connect(function(err) {
  if (err) throw err;
  // console.log("connected as id " + connection.threadId);
  selectGenre();
  });

function selectGenre() {
  var query = connection.query("SELECT * FROM products", function(err, res) {
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + '$' + res[i].price);
    }
  });

  // logs the actual query being run
  console.log(query.sql);
  wantedItem();
};

var inquirer = require("inquirer");

function wantedItem() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([
        {
          name: "choice",
          type: "input",
          message: "What is the ID number of the item you'd like to buy?"
        },
        {
          name: "bid",
          type: "input",
          message: "How many would you like to purchase?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].id === parseInt(answer.choice)) {
            chosenItem = results[i];
          }
        }

        // console.log(chosenItem);
        // console.log(chosenItem.product_name);

        

        // determine if bid was high enough
        if (chosenItem.stock_quantity >= parseInt(answer.bid)) {
          // console.log(chosenItem.stock_quantity);
          var updateQuantity = chosenItem.stock_quantity-parseInt(answer.bid);
          // console.log(updateQuantity);
          // console.log(chosenItem.id);
          // bid was high enough, so update db, let the user know, and start over
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: updateQuantity
              },
              {
                id: chosenItem.id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log('-------------------------------')
              console.log('-------------------------------')
              console.log("You have purchased " + answer.bid + " " + chosenItem.product_name);
              var totalCost = parseInt(answer.bid)*chosenItem.price;
              console.log('You\'re total cost is $' + totalCost);
              console.log('-------------------------------')
              console.log('-------------------------------')
              selectGenre();
            }
          );
        }
        else {
          // bid wasn't high enough, so apologize and start over
          console.log('-------------------------------')
          console.log('-------------------------------')
          console.log('Insufficient quantity!');
          console.log('-------------------------------')
          console.log('-------------------------------')
          selectGenre();
        }
      });
  });
}

// var wantedItem = function() {
  
//   inquirer.prompt([
//     {
//       name: "chosenItem",
//       message: "What is the ID number of the item you'd like to buy?",
//     }, {
//       name: 'howMany',
//       message: 'How many would you like to purchase?',
//     }
//   ]).then(function(answer) {
//     if(answer.howMany<=){
//       console.log('Insufficient quantity!');
//     } else {
//       bidAuction();
//     }
//   });
// };