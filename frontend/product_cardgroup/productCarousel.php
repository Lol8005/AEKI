<div id="<?php echo $category?>" class="carousel carousel-dark slide mt-3 mb-5">
  <div class="ps-4 border-bottom border-2 border-dark-subtle mb-2">
    <h2><?php echo $category ?></h2>
  </div>
  <div class="carousel-inner">

    <?php
    $item_per_slide = 4;

    for ($i = 0; $i < ceil(count($products) / $item_per_slide); $i++) {
    ?>

      <div class="carousel-item <?php echo $i == 0 ? "active" : ""  ?>">

        <div class="row row-cols-1 row-cols-md-4 g-4 mx-3 overflow-hidden">
          <?php for ($j = 0 + ($i * $item_per_slide); $j < count($products) && $j < ($i + 1) * $item_per_slide; $j++) { ?>
            <div class="col">
              <div class="card h-100">
                <img src="<?php echo $products[$j]->imgPath ?>" class="card-img-top border-bottom" alt="...">
                <div class="card-body">
                  <h5 class="card-title"><?php echo $products[$j]->title ?></h5>
                  <p class="card-text" style="font-size: .85rem;"><?php echo $products[$j]->description ?></p>
                </div>
                <div class="card-footer p-0 d-flex flex-row justify-content-between">
                  <p class="h2 my-auto"><?php echo $products[$j]->price ?></p>

                  <!-- changge function inside onclick -->
                  <button onclick="" type="button" class="card-footer text-bg-primary btn py-0 px-5" style="font-size: 1.25rem; border-bottom-left-radius: 0;"><img src="assets/icon/cart.png" height="30px" alt="cart"></button>
                </div>

              </div>
            </div>
          <?php } ?>

        </div>
      </div>

    <?php } ?>

  </div>
  <button class="carousel-control-prev" style="width: 30px" type="button" data-bs-target="#<?php echo $category?>" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" style="width: 30px" type="button" data-bs-target="#<?php echo $category?>" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>