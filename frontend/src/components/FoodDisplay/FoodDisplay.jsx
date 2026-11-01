import React, { useContext } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import { StoreContext } from "../../context/StoreContext";

const FoodDisplay = ({ category }) => {
    const { food_list } = useContext(StoreContext);

    const categoryMap = {
        Salad: ["Salad"],
        "Fast Food": ["Fast Food", "Rolls"],
        Dessert: ["Dessert", "Desserts"],
        "Main Course": ["Main Course", "Pure Veg", "Cake"],
        Sandwich: ["Sandwich"],
        Pasta: ["Pasta"],
        Noodles: ["Noodles"],
    };

    const allowedCategories = categoryMap[category];

    const filteredFood =
        category === "All"
            ? food_list
            : food_list.filter((item) =>
                allowedCategories?.some(
                    (cat) =>
                        cat.toLowerCase() === item.category.toLowerCase()
                )
            );

    return (
        <div className="food-display">

            <h2>Top dishes near you</h2>

            <div className="food-display-list">

                {filteredFood.map((item) => (
                    <FoodItem
                        key={item._id}
                        id={item._id}
                        name={item.name}
                        description={item.description}
                        price={item.price}
                        image={item.image}
                    />
                ))}

            </div>

        </div>
    );
};

export default FoodDisplay;