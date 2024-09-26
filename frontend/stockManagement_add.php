<?php
    session_start();
    $_SESSION["isAdmin"] = true;

    include 'header.php';
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
        <div class="container">
            <div class="row py-5">
                <div class="col-md-4 order-md-2 mb-4">
                    <h4 class="d-flex justify-content-between align-items-center mb-3">
                        <span class="text-muted">Rules: </span>
                        <span class="badge badge-secondary badge-pill">3</span>
                    </h4>
                    <ul class="list-group mb-3">
                        <li class="list-group-item d-flex justify-content-between lh-condensed">
                            <div>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel sagittis sem. Ut sollicitudin imperdiet metus, in aliquet ex sagittis sed. Curabitur rhoncus nisi vitae velit feugiat, vel rutrum arcu facilisis. Proin ullamcorper imperdiet velit non commodo.</p>
                            </div>
                        </li>
                        <li class="list-group-item d-flex justify-content-between lh-condensed">
                            <div>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel sagittis sem. Ut sollicitudin imperdiet metus, in aliquet ex sagittis sed. </p>
                            </div>
                            <span class="text-muted">$8</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between lh-condensed">
                            <div>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel sagittis sem. Ut sollicitudin imperdiet metus, in aliquet ex sagittis sed. </p>
                            </div>
                            <span class="text-muted">$5</span>
                        </li>
                        
                    </ul>
                </div>

                <div class="col-md-8 order-md-1">
                    <h4 class="mb-3">Add New Product</h4>
                    <div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="productName">Product Name*</label>
                                <input type="text" class="form-control" id="productName" placeholder="" value="" required="">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="productImage">Product Image*</label>
                                <input type="file" class="form-control" id="productImage" accept="image/png, image/gif, image/jpeg" placeholder="" value="" required="">
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="price">Price (RM)*</label>
                                <input type="text" class="form-control" id="price" placeholder="RM XXX" required="">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="quantity">Quantity*</label>
                                <input type="text" class="form-control" id="quantity" placeholder="" required="">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="description">Description</label>
                            <input type="text" class="form-control" id="description" placeholder="">
                        </div>

                        <div class="mb-3">
                            <label for="category">Choose product category*</label>
                            <select class="form-control form-control-sm" name="category" id="category">
                                <option value="0">Furniture</option>
                                <option value="1">Storage</option>
                                <option value="2">Kitchen</option>
                                <option value="3">Decoration</option>
                                <option value="4">Others</option>
                            </select>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="launchTime">Launch Date</label>
                                <input id="launchTime" class="form-control" type="date" />
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="discontinueTime">Discontinue Date</label>
                                <input id="discontinueTime" class="form-control" type="date" />
                            </div>
                        </div>

                        <p class="text-danger">Don't leave field with (*) empty!</p>

                        <hr class="mb-4">
                        <button class="btn btn-primary btn-lg btn-block" onclick="addNewProduct()">Add product</button>
                        <button class="btn btn-danger" onclick="clearAddProduct()">Clear</button>
                    </div>
                </div>
            </div>
        </div>
    </main>
</body>

<?php include 'footer.php' ?>

</html>