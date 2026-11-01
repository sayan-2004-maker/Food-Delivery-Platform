import { createContext, useCallback, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

const url = import.meta.env.VITE_API_URL || (
    import.meta.env.DEV
        ? "http://localhost:4000"
        : "https://food-delivery-backend-rbic.onrender.com"
);
    const [food_list, setFoodList] = useState([]);

    const [cartItems, setCartItems] = useState({});
    const [token, setTokenState] = useState(() => localStorage.getItem("token") || "");

    const setToken = useCallback((value) => {
        setTokenState(value);

        if (value) {
            localStorage.setItem("token", value);
        } else {
            localStorage.removeItem("token");
        }
    }, []);

    // ================= ADD TO CART =================

    const addToCart = async (itemId) => {
        const food = food_list.find((item) => String(item._id) === String(itemId));
        if (!food) return;
        const getRestaurantId = (item) => String(item?.restaurantId?._id || item?.restaurantId || "");
        const currentFoodIds = Object.keys(cartItems).filter((id) => cartItems[id] > 0);
        const currentRestaurantIds = new Set(currentFoodIds.map((id) => {
            const currentFood = food_list.find((item) => String(item._id) === String(id));
            return getRestaurantId(currentFood);
        }));
        const newRestaurantId = getRestaurantId(food);
        const hasDifferentRestaurant = currentFoodIds.length > 0 &&
            (currentRestaurantIds.size !== 1 || !currentRestaurantIds.has(newRestaurantId));
        if (hasDifferentRestaurant) {
            const confirmed = window.confirm("Your cart has items from another restaurant. Clear it and add this item?");
            if (!confirmed) return;
            const existingToken = localStorage.getItem("token");
            if (existingToken) {
                try {
                    await axios.post(`${url}/api/cart/clear`, {}, { headers: { token: existingToken } });
                } catch (error) {
                    window.alert(error.response?.data?.message || "Unable to switch restaurants in your cart");
                    return;
                }
            }
            setCartItems({});
        }

        const storedToken = localStorage.getItem("token");

        if (storedToken) {
            try {
                const response = await axios.post(
                    `${url}/api/cart/add`,
                    { itemId },
                    {
                        headers: {
                            token: storedToken
                        }
                    }
                );

                if (!response.data.success) {
                    window.alert(response.data.message || "Unable to update cart");
                    return;
                }
            } catch (error) {
                if (error.response?.status === 409) {
                    window.alert(error.response.data.message);
                    return;
                }
                window.alert(error.response?.data?.message || "Unable to update cart");
                return;
            }
        }

        setCartItems((prev) => ({
            ...prev,
            [itemId]: (hasDifferentRestaurant ? 0 : prev[itemId] || 0) + 1
        }));
    };


    // ================= REMOVE FROM CART =================

    const removeFromCart = async (itemId) => {

        setCartItems((prev) => {

            const updatedCart = { ...prev };

            if (updatedCart[itemId] > 1) {
                updatedCart[itemId] -= 1;
            } else {
                delete updatedCart[itemId];
            }

            return updatedCart;
        });

        const storedToken = localStorage.getItem("token");

        if (storedToken) {
            try {
                const response = await axios.post(
                    `${url}/api/cart/remove`,
                    { itemId },
                    {
                        headers: {
                            token: storedToken
                        }
                    }
                );

                if (!response.data.success) {
                    console.log(response.data.message);
                }

            } catch (error) {
                console.log("Remove from cart server error:", error);
            }
        }
    };


    // ================= LOAD CART FROM DATABASE =================

    const loadCartData = useCallback(async (userToken) => {

        try {

            const response = await axios.post(
                `${url}/api/cart/get`,
                {},
                {
                    headers: {
                        token: userToken
                    }
                }
            );

            if (response.data.success) {
                setCartItems(response.data.cartData || {});
            } else {
                setCartItems({});
            }

        } catch (error) {

            console.log("Load cart error:", error);
            setCartItems({});

        }
    }, [url]);


    // ================= TOTAL CART AMOUNT =================

    const getTotalCartAmount = () => {

        let totalAmount = 0;

        for (const itemId in cartItems) {

            const quantity = cartItems[itemId];

            if (quantity > 0) {

                const itemInfo = food_list.find(
                    (item) => String(item._id) === String(itemId)
                );

                if (itemInfo) {
                    totalAmount += itemInfo.price * quantity;
                }
            }
        }

        return totalAmount;
    };

    const getCartRestaurant = () => {
        const firstItemId = Object.keys(cartItems).find((itemId) => cartItems[itemId] > 0);
        const food = food_list.find((item) => String(item._id) === String(firstItemId));
        return food?.restaurantId && typeof food.restaurantId === "object" ? food.restaurantId : null;
    };


    // ================= INITIAL LOAD =================

    useEffect(() => {
        let isMounted = true;

        const fetchFoodList = async () => {
            try {
                const response = await axios.get(`${url}/api/food/list`);

                if (response.data.success && Array.isArray(response.data.data)) {
                    const foods = response.data.data.map((item) => ({
                        ...item,
                        image: item.image.startsWith("http")
                            ? item.image
                            : `${url}/images/${item.image}`
                    }));

                    if (isMounted) {
                        setFoodList(foods);
                    }
                } else {
                    console.error(response.data.message || "Unable to fetch products");
                }
            } catch (error) {
                console.error("Fetch products error:", error);
            }
        };

        fetchFoodList();

        return () => {
            isMounted = false;
        };
    }, [url, loadCartData]);

    useEffect(() => {
        if (token) loadCartData(token);
    }, [token, loadCartData]);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && localStorage.getItem("token")) {
                    setToken("");
                    setCartItems({});
                    window.alert("Your session has expired. Please sign in again.");
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, [setToken]);


    // ================= CONTEXT VALUE =================

    const contextValue = {
        url,
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        getCartRestaurant,
        getCartItemCount: () => Object.values(cartItems).reduce((total, quantity) => total + Number(quantity || 0), 0),
        token,
        setToken
    };


    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;