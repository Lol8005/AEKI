<?php
session_start();
$_SESSION["isAdmin"] = false;

include 'header.php';
include 'product_cardgroup/productClass.php';
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AEKI</title>

    <script type="module" src="scripts/walletConnection.js"></script>
    <script type="module" src="scripts/my_purchase.js"></script>

    <link href="node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</head>

<body>
    <div class="text-center bg-dark text-white px-4" style="font-size: 1.5rem;">
    You are required to return the product that you purchased and the receipt when requesting a refund. Your account will get banned for 7 days when you return a false product. 😗🙃
    </div>

    <main>
    <div class="container" style="width: 80%">
            <h2 class="mt-5">Purchased Product List</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Category</th>
                        <th>Purchased Time</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="purchased_product_list_table">
                </tbody>
            </table>
        </div>
    </main>
</body>

<?php include 'footer.php' ?>

</html>