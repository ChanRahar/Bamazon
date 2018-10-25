var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "password",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    inventory();
});

function inventory() {
    console.log("Showing all products...\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            productList = '';
            productList += 'Item ID: ' + res[i].item_id + '\n';
            productList += 'Product Name: ' + res[i].product_name + '\n';
            productList += 'Department: ' + res[i].department_name + '\n';
            productList += 'Price: $' + res[i].price + '\n';

            console.log(productList);
        }

        console.log("---------------------------------------------------------------------\n");

        purchase();
    });

};

function validateInteger(value) {
    var integer = Number.isInteger(parseFloat(value));
    var sign = Math.sign(value);

    if (integer && (sign === 1)) {
        return true;
    } else {
        return 'Please enter a whole non-zero number.';
    }
}

function purchase() {

    inquirer.prompt([
        {
            type: 'input',
            name: 'item_id',
            message: 'Please enter the Item ID which you would like to purchase.',
            validate: validateInteger,
            filter: Number
        }
    
    ]).then(function (input) {

        var item = input.item_id;

        connection.query('SELECT * FROM products WHERE ?', { item_id: item }, function (err, data) {
            if (err) throw err;

            if (data.length === 0) {
                console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
                setTimeout(inventory, 1000 * 3);

            } else {

                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'quantity',
                        message: 'How many do you need?',
                        validate: validateInteger,
                        filter: Number
                    }
                ]).then(function (input) {
                    var quantity = input.quantity;

                    var productData = data[0];

                    if (quantity <= productData.stock_quantity) {
                        console.log('Congratulations, the product you requested is in stock! Placing order!');

                        var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;

                        connection.query(updateQueryStr, function (err, data) {
                            if (err) throw err;

                            console.log('Your oder has been placed! Your total is $' + productData.price * quantity);
                            console.log('Thank you for shopping with us!');
                            console.log("\n---------------------------------------------------------------------\n");

                            connection.end();
                        })
                    } else {
                        console.log('Sorry, there is not enough product in stock');
                        console.log('Please modify your order.');
                        console.log("\n---------------------------------------------------------------------\n");

                        setTimeout(inventory, 1000 * 3);
                    }
                })
            }
        })
    })
}