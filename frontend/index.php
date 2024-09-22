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
    <script type="module" src="scripts/index.js"></script>

    <link href="node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</head>

<body>
    <main>
        
        <div id="GoingToLaunch" class="carousel carousel-dark slide mt-3 mb-5">
            <div class="ps-4 border-bottom border-2 border-dark-subtle mb-2">
                <h2>Going to Launch</h2>
            </div>
            <div class="carousel-inner" id="GoingToLaunch-slide">

            </div>
            <button class="carousel-control-prev" style="width: 30px" type="button" data-bs-target="#GoingToLaunch" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" style="width: 30px" type="button" data-bs-target="#GoingToLaunch" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>

        <div id="Furniture" class="carousel carousel-dark slide mt-3 mb-5">
            <div class="ps-4 border-bottom border-2 border-dark-subtle mb-2">
                <h2>Furniture</h2>
            </div>
            <div class="carousel-inner" id="Furniture-slide">

            </div>
            <button class="carousel-control-prev" style="width: 30px" type="button" data-bs-target="#Furniture" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" style="width: 30px" type="button" data-bs-target="#Furniture" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>

        <div id="Storage" class="carousel carousel-dark slide mt-3 mb-5">
            <div class="ps-4 border-bottom border-2 border-dark-subtle mb-2">
                <h2>Storage</h2>
            </div>
            <div class="carousel-inner" id="Storage-slide">

            </div>
            <button class="carousel-control-prev" style="width: 30px" type="button" data-bs-target="#Storage" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" style="width: 30px" type="button" data-bs-target="#Storage" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>

        <div id="Kitchen" class="carousel carousel-dark slide mt-3 mb-5">
            <div class="ps-4 border-bottom border-2 border-dark-subtle mb-2">
                <h2>Kitchen</h2>
            </div>
            <div class="carousel-inner" id="Kitchen-slide">

            </div>
            <button class="carousel-control-prev" style="width: 30px" type="button" data-bs-target="#Kitchen" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" style="width: 30px" type="button" data-bs-target="#Kitchen" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>

        <div id="Decoration" class="carousel carousel-dark slide mt-3 mb-5">
            <div class="ps-4 border-bottom border-2 border-dark-subtle mb-2">
                <h2>Decoration</h2>
            </div>
            <div class="carousel-inner" id="Decoration-slide">

            </div>
            <button class="carousel-control-prev" style="width: 30px" type="button" data-bs-target="#Decoration" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" style="width: 30px" type="button" data-bs-target="#Decoration" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>

        <div id="Others" class="carousel carousel-dark slide mt-3 mb-5">
            <div class="ps-4 border-bottom border-2 border-dark-subtle mb-2">
                <h2>Others</h2>
            </div>
            <div class="carousel-inner" id="Others-slide">

            </div>
            <button class="carousel-control-prev" style="width: 30px" type="button" data-bs-target="#Others" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" style="width: 30px" type="button" data-bs-target="#Others" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>


        <?php
        // include 'product_cardgroup/furniture_cardgroup.php';
        // include 'product_cardgroup/storage_cardgroup.php';
        // include 'product_cardgroup/kitchen_cardgroup.php';
        // include 'product_cardgroup/decoration_cardgroup.php';
        ?>
    </main>
</body>

<?php include 'footer.php' ?>

</html>