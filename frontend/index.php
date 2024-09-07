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
    <script src="scripts/walletConnection.js" type="text/javascript"></script>
    <link href="node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</head>

<body>
    <main>
        <?php
            include 'product_cardgroup/furniture_cardgroup.php';
            include 'product_cardgroup/storage_cardgroup.php';
            include 'product_cardgroup/kitchen_cardgroup.php';
            include 'product_cardgroup/decoration_cardgroup.php';
        ?>

    </main>
</body>

<?php include 'footer.php' ?>

</html>