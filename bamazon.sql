DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
	item_id INT(11) AUTO_INCREMENT NOT NULL,
    
	product_name VARCHAR(30) NOT NULL,
    
    department_name VARCHAR(30) NOT NULL,
    
    price DECIMAL(11,2) NOT NULL,
    
    stock_quantity INT(11) NOT NULL,
    
    PRIMARY KEY(item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Iphone X", "Electronic", 699.99, 10),
("Winter Jacket", "Clothing", 49.99, 100),
("Sun Glasses", "Accessories", 29.99, 200),
("Bottles", "Accessories", 9.99, 500),
("Google Pixel 3", "Electronic", 799.99, 10),
("Smart TV", "Electronic", 399.99, 15),
("Javascript Book", "Education", 19.99, 100),
("Sofa", "Furniture", 499.99, 5),
("Computer Desk", "Furniture", 299.50, 10),
("Air Conditioner", "Electronic", 199.99, 20);

SELECT * FROM products;

