<?php
session_start();
$_SESSION["isAdmin"] = true;

include 'header.php';
include 'product_cardgroup/productClass.php';
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AEKI</title>

    <script type="module" src="scripts/admin.js"></script>

    <link href="node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

    <!-- Time picker -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.37/css/bootstrap-datetimepicker-standalone.css" integrity="sha512-wT6IDHpm/cyeR3ASxyJSkBHYt9oAvmL7iqbDNcAScLrFQ9yvmDYGPZm01skZ5+n23oKrJFoYgNrlSqLaoHQG9w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>

<body>
    <main>
        <div class="container" style="width: 80%">
            <h2 class="mt-5">Active Product List</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Category</th>
                        <th>Discontinue Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="active_product_list_table">
                </tbody>
            </table>

            <h2 class="mt-5">Going to Launch Product List</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Category</th>
                        <th>Launch Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="going_to_launch_product_list_table">
                </tbody>
            </table>
            
            <h2 class="mt-5">Discontinue Product List</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Discontinue Date</th>
                    </tr>
                </thead>
                <tbody id="discontinue_product_list_table">
                </tbody>
            </table>
            <div class="text-center">
                <button type="button" class="btn btn-secondary" onclick="updateAdminAccess()">Update Status</button>
            </div>
        </div>
    </main>
</body>

<?php include 'footer.php' ?>

</html>