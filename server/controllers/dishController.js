import { Dish } from "../models/dish.js";

export const addDish = async (req, res) => {
  try {
    const { name, category, description, price } = req.body;

    if (!name || !category || !description || !price) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const userId = req.user.id;

    const dish = new Dish({
      user: userId,
      name,
      category,
      description,
      price
    });

    await dish.save();

    res.status(201).json({ msg: "Dish added", dish });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDishes = async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.status(200).json({ dishes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDish = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const dish = await Dish.findOne({ _id: id, user: userId });
    if (!dish) return res.status(404).json({ msg: "Dish not found" });

    await Dish.findByIdAndDelete(id);

    res.json({ msg: "Dish deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
