<?php
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
</head>

<body>
    <main>
        <div>
            <div class="container my-5 p-5 rounded-5" style="background-color: grey; width: 30%">
                <div class="text-center">
                    <h2>Add new admin</h2>
                    <img class="d-block mx-auto mb-1" src="assets/icon/people.png" alt="" width="72" height="72">
                </div>

                <div class="row text-center d-flex align-items-center justify-content-center">
                    <div>
                        <div class="needs-validation" novalidate="">
                            <div class="row">
                                <div class="mb-3">
                                    <label for="adminAddress">New Admin Address:</label>
                                    <input type="text" class="form-control" id="adminAddress" placeholder="" value="" required="">
                                </div>
                                <button class="btn btn-primary btn-lg btn-block" type="submit" onclick="addNewAdmin()">Add</button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div class="container" style="width: 40%">
                <h2>Admin List</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Address</th>
                        </tr>
                    </thead>
                    <tbody id="admin_list_table">
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</body>

<?php include 'footer.php' ?>

</html>