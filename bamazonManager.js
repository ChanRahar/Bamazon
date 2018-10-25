var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,

    // Your username
    user: 'root',

    // Your password
    password: 'password',
    database: 'bamazon'
});

// promptManagerAction will present menu options to the manager and trigger appropriate logic
function updates() {
    // console.log('___ENTER updates___');

    // Prompt the manager to select an option
    inquirer.prompt([
        {
            type: 'list',
            name: 'option',
            message: 'Please select an option:',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
            filter: function (val) {
                if (val === 'View Products for Sale') {
                    return 'sale';
                } else if (val === 'View Low Inventory') {
                    return 'lowInventory';
                } else if (val === 'Add to Inventory') {
                    return 'addInventory';
                } else if (val === 'Add New Product') {
                    return 'newProduct';
                }
            }
        }
    ]).then(function (input) {
        // console.log('User has selected: ' + JSON.stringify(input));

        // Trigger the appropriate action based on the user input
        if (input.option === 'sale') {
            displayInventory();
        } else if (input.option === 'lowInventory') {
            displayLowInventory();
        } else if (input.option === 'addInventory') {
            addInventory();
        } else if (input.option === 'newProduct') {
            createNewProduct();
        }
    })
}

// displayInventory will retrieve the current inventory from the database and output it to the console
function displayInventory() {

    console.log("Showing existing inventory\n");

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            productList = '';
            productList += 'Item ID: ' + res[i].item_id + '\n';
            productList += 'Product Name: ' + res[i].product_name + '\n';
            productList += 'Department: ' + res[i].department_name + '\n';
            productList += 'Price: $' + res[i].price + '\n';
            productList += 'Quantity: ' + res[i].stock_quantity + '\n';

            console.log(productList);
        }

        console.log("---------------------------------------------------------------------\n");
        connection.end();
    })
}

// displayLowInventory will display a list of products with the available quantity below 100
function displayLowInventory() {

    connection.query('SELECT * FROM products WHERE stock_quantity < 5', function (err, res) {
        if (err) throw err;

        console.log('Low Items (below 5): ');
        console.log('................................\n');

        for (var i = 0; i < res.length; i++) {
            productList = '';
            productList += 'Item ID: ' + res[i].item_id + '\n';
            productList += 'Product Name: ' + res[i].product_name + '\n';
            productList += 'Department: ' + res[i].department_name + '\n';
            productList += 'Price: $' + res[i].price + '\n';
            productList += 'Quantity: ' + res[i].stock_quantity + '\n';

            console.log(productList);
        }

        console.log("---------------------------------------------------------------------\n");

        // End the database connection
        connection.end();
    })
}

// validateInteger makes sure that the user is supplying only positive integers for their inputs
function validateInteger(value) {
    var integer = Number.isInteger(parseFloat(value));
    var sign = Math.sign(value);

    if (integer && (sign === 1)) {
        return true;
    } else {
        return 'Please enter a whole non-zero number.';
    }
}

// validateNumeric makes sure that the user is supplying only positive numbers for their inputs
function validateNumeric(value) {
    // Value must be a positive number
    var number = (typeof parseFloat(value)) === 'number';
    var positive = parseFloat(value) > 0;

    if (number && positive) {
        return true;
    } else {
        return 'Please enter a positive number for the unit price.'
    }
}


function addInventory() {

    inquirer.prompt([
        {
            type: 'input',
            name: 'item_id',
            message: 'Please enter the Item ID for stock_count update.',
            validate: validateInteger,
            filter: Number
        },

    ]).then(function (input) {

        var item = input.item_id;;

        connection.query('SELECT * FROM products WHERE ?', { item_id: item }, function (err, data) {
            if (err) throw err;


            if (data.length === 0) {
                console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
                addInventory();

            } else {
                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'quantity',
                        message: 'How much to add?',
                        validate: validateInteger,
                        filter: Number
                    }
                ]).then(function (input) {

                    var quantity = input.quantity;

                    var productData = data[0];

                    console.log('Updating Inventory...');

                    var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity + quantity) + ' WHERE item_id = ' + item;

                    connection.query(updateQueryStr, function (err, data) {
                        if (err) throw err;

                        console.log('Stock count for Item ID ' + item + ' has been updated to ' + (productData.stock_quantity + quantity) + '.');
                        console.log("\n---------------------------------------------------------------------\n");

                        // End the database connection
                        connection.end();
                    })
                })
            }
        })
    })
}


function createNewProduct() {

    inquirer.prompt([
        {
            type: 'input',
            name: 'product_name',
            message: 'Please enter the new product name.',
        },
        {
            type: 'input',
            name: 'department_name',
            message: 'Which department does the new product belong to?',
        },
        {
            type: 'input',
            name: 'price',
            message: 'What is the price per unit?',
            validate: validateNumeric
        },
        {
            type: 'input',
            name: 'stock_quantity',
            message: 'How many items are in stock?',
            validate: validateInteger
        }
    ]).then(function (input) {

        console.log('Adding New Item: \n    product_name = ' + input.product_name + '\n' +
            '    department_name = ' + input.department_name + '\n' +
            '    price = ' + input.price + '\n' +
            '    stock_quantity = ' + input.stock_quantity);


        connection.query('INSERT INTO products SET ?', input, function (error, res) {
            if (error) throw error;

            console.log('New product has been added to the inventory under Item ID ' + res.insertId + '.');
            console.log("\n---------------------------------------------------------------------\n");

            // End the database connection
            connection.end();
        });
    })
}


updates();

