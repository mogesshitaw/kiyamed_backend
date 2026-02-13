// controllers/importantDatesController.js
import * as ImportantDatesModel from "../models/importantDatesModel.js";

// Create important date
export const createDate = async (req, res) => {
  try {
    const { intake_name, event_name, event_date, description } = req.body;

    if (!intake_name || !event_name || !event_date) {
      return res.status(400).json({ message: "Intake name, event name, and date are required" });
    }

    const result = await ImportantDatesModel.createImportantDate({
      intake_name,
      event_name,
      event_date,
      description: description || null
    });

    res.status(201).json({
      message: "Important date created successfully",
      id: result.insertId
    });
  } catch (error) {
    console.error("Error creating important date:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all important dates
export const getAllDates = async (req, res) => {
  try {
    const dates = await ImportantDatesModel.getAllImportantDates();
    res.json(dates);
  } catch (error) {
    console.error("Error fetching important dates:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get dates by intake
export const getDatesByIntake = async (req, res) => {
  try {
    const { intake_name } = req.params;
    const dates = await ImportantDatesModel.getDatesByIntake(intake_name);
    res.json(dates);
  } catch (error) {
    console.error("Error fetching dates by intake:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get one date by ID
export const getDateById = async (req, res) => {
  try {
    const { id } = req.params;
    const date = await ImportantDatesModel.getImportantDateById(id);

    if (!date) {
      return res.status(404).json({ message: "Important date not found" });
    }

    res.json(date);
  } catch (error) {
    console.error("Error fetching important date:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update important date
export const updateDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { intake_name, event_name, event_date, description } = req.body;

    const existing = await ImportantDatesModel.getImportantDateById(id);
    if (!existing) {
      return res.status(404).json({ message: "Important date not found" });
    }

    await ImportantDatesModel.updateImportantDate(id, {
      intake_name,
      event_name,
      event_date,
      description: description || null
    });

    res.json({ message: "Important date updated successfully" });
  } catch (error) {
    console.error("Error updating important date:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete important date
export const deleteDate = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await ImportantDatesModel.getImportantDateById(id);
    if (!existing) {
      return res.status(404).json({ message: "Important date not found" });
    }

    await ImportantDatesModel.deleteImportantDate(id);
    res.json({ message: "Important date deleted successfully" });
  } catch (error) {
    console.error("Error deleting important date:", error);
    res.status(500).json({ message: "Server error" });
  }
};
