<header>

  <style>
    nav li {
      font-size: 1.25rem;
    }

    main {
      padding-left: 5rem;
      padding-right: 5rem;
    }

    .form-control::placeholder {
      /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: black !important;
      opacity: 1;
      /* Firefox */
    }

    .form-control:-ms-input-placeholder {
      /* Edge */
      color: black !important;
    }
  </style>


  <!-- <div class="text-center bg-dark text-white" style="font-size: 1.5rem;">
  This site requires a transaction fee for tracking your activity, but we will refund it to you.😃
  </div> -->
  <nav class="navbar navbar-expand-lg" style="background-color: #8c7ae6" data-bs-theme="dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">
        <img src="assets/logo/svg/logo-no-background.svg" alt="Logo" width="50" class="d-inline-block align-text-top">
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <?php if (!$_SESSION["isAdmin"]) { ?>

            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="#">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Promotion</a>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Category
              </a>
              <ul class="dropdown-menu" style="background-color: #353b48">
                <li><a class="dropdown-item" href="#">Furniture</a></li>
                <li><a class="dropdown-item" href="#">Storage</a></li>
                <li><a class="dropdown-item" href="#">Kitchen</a></li>
                <li><a class="dropdown-item" href="#">Decoration</a></li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li><a class="dropdown-item" href="#">Others</a></li>
              </ul>
            </li>

          <?php } else { ?>
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="chairman.php">Staff</a>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Stock Management
              </a>
              <ul class="dropdown-menu" style="background-color: #353b48">
                <li><a class="dropdown-item" href="stockManagement_add.php">Add product</a></li>
                <li><a class="dropdown-item" href="#">Storage</a></li>
                <li><a class="dropdown-item" href="#">Kitchen</a></li>
                <li><a class="dropdown-item" href="#">Decoration</a></li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li><a class="dropdown-item" href="#">Others</a></li>
              </ul>
            </li>
          <?php } ?>
        </ul>

        <?php if (!$_SESSION["isAdmin"]) { ?>

          <form class="d-flex mb-2 mb-lg-0" role="search">
            <input class="form-control me-2 bg-white" type="search" placeholder="Search" aria-label="Search">
            <button class="btn btn-light" type="submit">Search</button>
          </form>

        <?php } ?>

        <button id="metamaskWalletButton" type="button" class="btn ms-3" style="background-color: #718093" id="connectButton"
          onclick="connectToWallet()"><img src="assets/icon/metamask.png" height="20px" alt="metamask icon">Connect</button>
      </div>
    </div>
  </nav>
</header>