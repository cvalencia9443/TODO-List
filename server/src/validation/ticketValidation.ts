import Joi from "joi";

export const createTicketSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must not be empty",
    "string.max": "Title must not exceed 255 characters",
  }),
  description: Joi.string().trim().min(1).max(2000).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must not be empty",
    "string.max": "Description must not exceed 2000 characters",
  }),
  status: Joi.string()
    .valid("todo", "in_progress", "done")
    .required()
    .messages({
      "any.only": "Status must be one of: todo, in_progress, done",
      "any.required": "Status is required",
    }),
});

export const updateTicketSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).optional().messages({
    "string.empty": "Title must not be empty",
    "string.min": "Title must not be empty",
    "string.max": "Title must not exceed 255 characters",
  }),
  description: Joi.string().trim().min(1).max(2000).optional().messages({
    "string.empty": "Description must not be empty",
    "string.min": "Description must not be empty",
    "string.max": "Description must not exceed 2000 characters",
  }),
  status: Joi.string()
    .valid("todo", "in_progress", "done")
    .optional()
    .messages({
      "any.only": "Status must be one of: todo, in_progress, done",
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export const ticketIdSchema = Joi.object({
  id: Joi.string().uuid({ version: "uuidv4" }).required().messages({
    "string.guid": "Invalid ticket ID format",
    "any.required": "Ticket ID is required",
  }),
});


