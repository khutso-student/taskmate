import Task from "../models/Task.js";
import { createNotification } from "../controllers/notificationControl.js";

// Create a new task
export const createTask = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: user not authenticated" });
  }

  try {
    const { name, description, date, time } = req.body;

    if (!name) {
      await createNotification({
        userId: req.user._id,
        type: "error",
        message: "Task creation failed: name is required",
      });
      return res.status(400).json({ message: "Task name is required" });
    }

    if (!date) {
      await createNotification({
        userId: req.user._id,
        type: "error",
        message: "Task creation failed: date is required",
      });
      return res.status(400).json({ message: "Date is required" });
    }

    const newTask = new Task({
      name,
      description: description || "",
      date,
      time: time || "",
      user: req.user._id,
    });

    const savedTask = await newTask.save();

    // SUCCESS
    await createNotification({
      userId: req.user._id,
      type: "success",
      message: `Task "${savedTask.name}" created successfully!`,
    });

    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Task creation failed:", error);

    await createNotification({
      userId: req.user?._id,
      type: "error",
      message: `Failed to create task: ${error.message}`,
    });

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "name email" });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get Tasks Error:", error);

    await createNotification({
      userId: req.user?._id,
      type: "error",
      message: `Failed to fetch tasks: ${error.message}`,
    });

    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate({ path: "user", select: "name email" });

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Fetch Task Error:", error);

    await createNotification({
      userId: req.user?._id,
      type: "error",
      message: `Failed to fetch task: ${error.message}`,
    });

    res.status(500).json({ message: "Failed to fetch task", error: error.message });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { name, description, date, time } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    task.name = name || task.name;
    task.description = description || task.description;
    if (date) task.date = new Date(date);
    if (time) task.time = time;

    const updatedTask = await task.save();

    // UPDATE notification
    await createNotification({
      userId: req.user._id,
      type: "update",
      message: `Task "${updatedTask.name}" updated successfully!`,
    });

    res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Update Task Error:", error);

    await createNotification({
      userId: req.user?._id,
      type: "error",
      message: `Failed to update task: ${error.message}`,
    });

    res.status(500).json({ message: "Failed to update task", error: error.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await task.deleteOne();

    // DELETE notification
    await createNotification({
      userId: req.user._id,
      type: "delete",
      message: `Task "${task.name}" deleted successfully!`,
    });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete Task Error:", error);

    await createNotification({
      userId: req.user?._id,
      type: "error",
      message: `Failed to delete task: ${error.message}`,
    });

    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};
