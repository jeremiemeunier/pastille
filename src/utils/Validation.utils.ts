/**
 * Validation utility functions for API routes
 */

/**
 * Check if all required fields are present and of correct type
 * @param fields - Object with field names as keys and their required types as values
 * @param data - Request body or query data to validate
 * @returns true if all fields are valid, false otherwise
 */
export const validateFields = (
  fields: Record<string, 'string' | 'boolean' | 'number' | 'object'>,
  data: any
): boolean => {
  for (const [field, expectedType] of Object.entries(fields)) {
    if (data[field] === undefined || data[field] === null) {
      return false;
    }
    
    const actualType = typeof data[field];
    if (actualType !== expectedType) {
      return false;
    }
  }
  
  return true;
};

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param id - ID string to validate
 * @returns true if valid ObjectId format, false otherwise
 */
export const isValidMongoId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize string input by trimming whitespace
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (input: string): string => {
  return input.trim();
};

/**
 * Check if required query parameters are present
 * @param params - Array of required parameter names
 * @param query - Request query object
 * @returns true if all params present, false otherwise
 */
export const validateQueryParams = (
  params: string[],
  query: any
): boolean => {
  return params.every(param => query[param] !== undefined);
};
