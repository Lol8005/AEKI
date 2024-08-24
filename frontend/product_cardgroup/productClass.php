<?php
class Product
{
    public string $title;
    public string $imgPath;
    public string $price;
    public string $description;

    function __construct($title, $imgPath, $price, $description)
    {
        $this->title = $title;
        $this->imgPath = $imgPath;
        $this->price = $price;
        $this->description = $description;
    }
}
