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
                    <div class="mb-3">
                        <label for="adminAddress">New Admin Address:</label>
                        <input type="text" class="form-control" id="adminAddress" placeholder="" value="" required="">
                    </div>
                    <button class="btn btn-primary btn-lg btn-block" type="submit" onclick="addNewAdmin()">Add</button>
                </div>
            </div>

            <div class="container" style="width: 70%">
                <h2>Admin List</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Active Admin</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="admin_list_table">
                    </tbody>
                </table>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Resigned Admin</th>
                            <th>Disable Time</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="resigned_admin_list_table">
                    </tbody>
                </table>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fired Admin</th>
                            <th>Fired Time</th>
                        </tr>
                    </thead>
                    <tbody id="fired_admin_list_table">
                    </tbody>
                </table>
            </div>

            <div class="text-center">
                <button type="button" class="btn btn-secondary" onclick="updateAdminAccess()">Update Status</button>
            </div>
        </div>
    </main>
</body>

<?php include 'footer.php' ?>

</html>