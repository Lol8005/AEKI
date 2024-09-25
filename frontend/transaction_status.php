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
        <div class="container" style="width: 100%">
            <h2 class="mt-5">Queued List (Product)</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Contract Address</th>
                        <th>Function Call</th>
                        <th>Execute Time</th>
                        <th>Admin Address</th>
                        <th>Affected Product</th>
                    </tr>
                </thead>
                <tbody id="queue_transaction_status_list_table">
                </tbody>
            </table>
            
            <h2 class="mt-5">Executed List (Product)</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Contract Address</th>
                        <th>Function Call</th>
                        <th>Execute Time</th>
                        <th>Admin Address</th>
                        <th>Affected Product</th>
                    </tr>
                </thead>
                <tbody id="executed_transaction_status_list_table">
                </tbody>
            </table>

            <h2 class="mt-5">Cancelled List (Product)</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Contract Address</th>
                        <th>Function Call</th>
                        <th>Execute Time</th>
                        <th>Admin Address</th>
                        <th>Affected Product</th>
                    </tr>
                </thead>
                <tbody id="cancelled_transaction_status_list_table">
                </tbody>
            </table>

            <hr class="bg-danger border-4 border-top border-danger" />

            <h2 class="mt-5">Queued List (Admin)</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Contract Address</th>
                        <th>Function Call</th>
                        <th>Execute Time</th>
                        <th>Affected Admin</th>
                    </tr>
                </thead>
                <tbody id="queue_admin_transaction_status_list_table">
                </tbody>
            </table>

            <h2 class="mt-5">Executed List (Admin)</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Contract Address</th>
                        <th>Function Call</th>
                        <th>Execute Time</th>
                        <th>Affected Admin</th>
                    </tr>
                </thead>
                <tbody id="executed_admin_transaction_status_list_table">
                </tbody>
            </table>

            <h2 class="mt-5">Cancelled List (Admin)</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Contract Address</th>
                        <th>Function Call</th>
                        <th>Execute Time</th>
                        <th>Affected Admin</th>
                    </tr>
                </thead>
                <tbody id="cancelled_admin_transaction_status_list_table">
                </tbody>
            </table>
        </div>
    </main>
</body>

<?php include 'footer.php' ?>

</html>